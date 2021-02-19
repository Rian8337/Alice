const osudroid = require('osu-droid');
const config = require('../../config.json');
const { Client, Message } = require('discord.js');
const { Db } = require('mongodb');
const queue = [];

function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, 1000 * seconds);
    });
}

/**
 * @param {number} uid 
 * @param {number} page 
 */
function retrievePlays(uid, page) {
    return new Promise(async resolve => {
        console.log("Current page: " + page);

        const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
            .setEndpoint("scoresearchv2.php")
            .addParameter("uid", uid)
            .addParameter("page", page);

        const result = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            console.log("Empty response from osu!droid API");
            return resolve([]);
        }
        const entries = [];
        const lines = result.data.toString("utf-8").split('<br>');
        lines.shift();
        for (const line of lines) {
            entries.push(new osudroid.Score().fillInformation(line));
        }
        resolve(entries);
    });
}

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission
    for (const id of eligibleRoleList) {
        if (res === -1) break;
        if (member.roles.cache.has(id[0])) res = id[1];
    }
    return res;
}

function calculateLevel(score) {
    function scoreRequirement(level) {
        return Math.round(
            level <= 100 ? 
            (5000 / 3 * (4 * Math.pow(level, 3) - 3 * Math.pow(level, 2) - level) + 1.25 * Math.pow(1.8, level - 60)) / 1.128 :
            23875169174 + 15000000000 * (level - 100)
        );
    }

    let level = 1;
    while (scoreRequirement(level + 1) <= score) ++level;
    let nextLevelReq = scoreRequirement(level + 1) - scoreRequirement(level);
    let curLevelReq = score - scoreRequirement(level);
    level += curLevelReq / nextLevelReq;
    return level;
}

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 * @param {[string, string][]} current_map
 * @param {boolean} repeated
 */
module.exports.run = (client, message, args, maindb, alicedb, current_map, repeated = false) => {
    if (message.channel.type !== "text") {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!isEligible(message.member) && !message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }
    if (!args[0]) {
        return message.channel.send("❎ **| Hey, please enter a valid user to recalculate!**");
    }
    const ufind = args[0].replace(/[<@!>]/g, "");
    const query = {discordid: ufind};
    const bindDb = maindb.collection("userbind");
    const banDb = maindb.collection("ppban");
    const scoreDb = alicedb.collection("playerscore");
    const blacklistDb = maindb.collection("mapblacklist");
    bindDb.findOne(query, async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        }

        const uid = res.uid;
        const username = res.username;
        const isBanned = await banDb.findOne({uid: uid});
        if (isBanned) {
            return message.channel.send(`❎ **| I'm sorry, your currently binded account has been disallowed from submitting pp due to \`${isBanned.reason}\`**`);
        }

        const hasRequestedIndex = queue.findIndex(q => q.args.includes(ufind)) + 1;
        if (hasRequestedIndex) {
            return message.channel.send(`❎ **| I'm sorry, this user is already in queue! Please wait for ${hasRequestedIndex} more ${hasRequestedIndex === 1 ? "player" : "players"} to be recalculated!**`);
        }
        if (res.hasAskedForRecalc) {
            queue.shift();
            message.channel.send(`❎ **| ${message.author}, <@${ufind}> has requested a recalculation before!**`);
            if (queue.length > 0) {
                const nextQueue = queue[0];
                this.run(nextQueue.client, nextQueue.message, nextQueue.args, nextQueue.maindb, nextQueue.alicedb, current_map, true);
            }
            return;
        }
        if (!repeated) {
            queue.push({
                client: client,
                message: message,
                args: args,
                maindb: maindb,
                alicedb: alicedb
            });
            if (queue.length > 1) {
                return message.channel.send(`✅ **| ${message.author}, successfully queued <@${ufind}> for calculation. There are currently ${queue.length} ${queue.length === 1 ? "user" : "users"} awaiting for calculation.**`);
            }
            message.channel.send(`✅ **| Calculating <@${ufind}>'s account...**`);
        }
        
        const pplist = res.pp ?? [];
        let page = 0;

        const blacklists = await blacklistDb.find({}, {projection: {_id: 0, beatmapID: 1}}).toArray();

        await scoreDb.deleteOne({uid});
        await scoreDb.insertOne({
            uid,
            username,
            score: 0,
            playc: 0,
            scorelist: []
        });

        const ppEntries = [];
        let totalScore = 0;
        let playc = 0;
        while (true) {
            const entries = await retrievePlays(uid, page);
            ++page;
            if (entries.length === 0) {
                break;
            }

            const scoreEntries = [];
            let score = 0;
            for await (const entry of entries) {
                const mapinfo = await osudroid.MapInfo.getInformation({hash: entry.hash});
                if (mapinfo.error) {
                    console.log("osu! API fetch error");
                    continue;
                }
                if (!mapinfo.title) {
                    continue;
                }
                if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                    console.log("Map is not ranked, approved, or loved");
                    continue;
                }
                score += entry.score;
                totalScore += entry.score;
                scoreEntries.push([entry.score, entry.hash]);
                if (!mapinfo.osuFile) {
                    console.log("No osu file found");
                    continue;
                }
                if (blacklists.find(v => v.beatmapID === mapinfo.beatmapID)) {
                    console.log("Map is blacklisted");
                    continue;
                }
                if (entry.forcedAR !== undefined || entry.speedMultiplier !== 1) {
                    continue;
                }
                const { mods, combo, miss, scoreID, accuracy } = entry;

                const replay = await new osudroid.ReplayAnalyzer({scoreID, map: mapinfo.map}).analyze();
                const { data } = replay;
                if (!data) {
                    continue;
                }
                await sleep(0.2);

                const stats = new osudroid.MapStats({
                    ar: entry.forcedAR,
                    speedMultiplier: entry.speedMultiplier,
                    isForceAR: !isNaN(entry.forcedAR),
                    oldStatistics: data.replayVersion <= 3
                });

                const realAcc = new osudroid.Accuracy({
                    n300: data.hit300,
                    n100: data.hit100,
                    n50: data.hit50,
                    nmiss: miss
                });

                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods, stats});
                const npp = new osudroid.PerformanceCalculator().calculate({
                    stars: star.droidStars,
                    combo: combo,
                    accPercent: realAcc,
                    mode: osudroid.modes.droid,
                    stats
                });
                const pp = parseFloat(npp.total.toFixed(2));
                const ppEntry = {
                    hash: entry.hash,
                    title: mapinfo.fullTitle,
                    mods,
                    pp,
                    combo,
                    accuracy,
                    miss,
                    scoreID
                };
                if (stats.isForceAR) {
                    ppEntry.forcedAR = stats.ar;
                }
                if (entry.speedMultiplier !== 1) {
                    ppEntry.speedMultiplier = stats.speedMultiplier;
                }
                if (!isNaN(pp)) {
                    ppEntries.push(ppEntry);
                }
                ++playc;
            }

            ppEntries.sort((a, b) => {
                return b.pp - a.pp;
            });

            if (ppEntries.length > 75) {
                ppEntries.splice(75);
            }

            await scoreDb.updateOne({uid}, {
                $inc: {
                    score,
                    playc: scoreEntries.length
                },
                $addToSet: {
                    scorelist: {
                        $each: scoreEntries
                    }
                }
            });
        }

        console.log("COMPLETED!");
        ppEntries.forEach(ppEntry => {
            const index = pplist.findIndex(v => v.title === ppEntry.title);
            const duplicate = index !== -1;

            if (duplicate) {
                pplist[index] = ppEntry;
            } else {
                pplist.push(ppEntry);
            }
        });

        pplist.sort((a, b) => {
            return b.pp - a.pp;
        });

        if (pplist.length > 75) {
            pplist.splice(75);
        }
        
        const level = calculateLevel(totalScore);
        const totalPP = pplist.map(v => {return v.pp;}).reduce((acc, value, index) => acc + value * Math.pow(0.95, index), 0);

        console.log(`${totalPP.toFixed(2)} pp, ${totalScore.toLocaleString()} ranked score (level ${Math.floor(level)} (${((level - Math.floor(level)) * 100).toFixed(2)}%))`);
                
        let updateVal = {
            $set: {
                pptotal: totalPP,
                pp: pplist,
                playc,
                hasAskedForRecalc: true
            }
        };

        bindDb.updateOne(query, updateVal, async err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            message.channel.send(`✅ **| ${message.author}, recalculated <@${ufind}>'s plays: ${totalPP.toFixed(2)} pp, ${totalScore.toLocaleString()} ranked score (level ${Math.floor(level)} (${((level - Math.floor(level)) * 100).toFixed(2)}%)).**`);
            queue.shift();
            if (queue.length > 0) {
                const nextQueue = queue[0];
                this.run(nextQueue.client, nextQueue.message, nextQueue.args, nextQueue.maindb, nextQueue.alicedb, current_map, true);
            }
        });
    });
};

module.exports.config = {
    name: "completecalc",
    description: "Recalculates all plays of an account for droid pp and ranked score.\n\nOne user can only request a recalculation once.",
    usage: "completecalc <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Helper"
};