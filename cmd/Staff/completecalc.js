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

function retrievePlays(page, uid, cb) {
    console.log("Current page:", page);
    const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
        .setEndpoint("scoresearchv2.php")
        .addParameter("uid", uid)
        .addParameter("page", page);

    apiRequestBuilder.sendRequest().then(result => {
        if (result.statusCode !== 200) {
            console.log("Empty response from droid API");
            return cb([], true, false);
        }
        const entries = [];
        const lines = result.data.toString("utf-8").split("<br>");
        lines.shift();
        for (const line of lines) entries.push(new osudroid.Score().fillInformation(line));
        if (entries.length === 0) cb(entries, false, true);
        else cb(entries, false, false);
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
        return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
    }
    if (!args[0]) {
        return message.channel.send("❎ **| Hey, please enter a valid user to recalculate!**");
    }
    const ufind = args[0].replace(/[<@!>]/g, "");

    let query = {discordid: ufind};
    const binddb = maindb.collection("userbind");
    const scoredb = alicedb.collection("playerscore");
    const blacklistdb = maindb.collection("mapblacklist");
    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
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
        const uid = res.uid;
        const pplist = res.pp ?? [];
        const ppentries = [];
        const score_list = [];
        let pptotal = 0;
        let playc = 0;
        let page = 0;
        let score = 0;
        let attempts = 0;

        query = {uid: uid};
        scoredb.findOne(query, async (err, s_res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            const blacklists = await blacklistdb.find({}, {projection: {_id: 0, beatmapID: 1}}).toArray();

            retrievePlays(page, uid, async function checkPlays(entries, error, stopSign) {
                if (error && attempts < 3) {
                    return retrievePlays(page, uid, checkPlays);
                }
                if (stopSign) {
                    console.log("COMPLETED!");
                    ppentries.forEach(ppentry => {
                        let dup = false;
                        for (let i in pplist) {
                            if (ppentry.title === pplist[i].title) {
                                if (ppentry.pp >= pplist[i].pp) pplist[i] = ppentry;
                                dup = true;
                                break;
                            }
                        }
                        if (!dup) {
                            pplist.push(ppentry);
                        }
                    });

                    pplist.sort((a, b) => {
                        return b.pp - a.pp;
                    });
                    score_list.sort((a, b) => {
                        return b[0] - a[0];
                    });

                    if (pplist.length > 75) {
                        pplist.splice(75);
                    }
                    console.table(pplist);

                    for (let i in pplist) {
                        pptotal += pplist[i].pp * Math.pow(0.95, i);
                    }

                    const level = calculateLevel(score);
                    console.log(`${pptotal.toFixed(2)} pp, ${score.toLocaleString()} ranked score (level ${Math.floor(level)} (${((level - Math.floor(level)) * 100).toFixed(2)}%))`);
                    
                    let updateVal = {
                        $set: {
                            pptotal: pptotal,
                            pp: pplist,
                            playc: playc,
                            hasAskedForRecalc: true
                        }
                    };

                    binddb.updateOne({discordid: ufind}, updateVal, async err => {
                        if (err) throw err;

                        if (s_res) {
                            updateVal = {
                                $set: {
                                    level: level,
                                    score: score,
                                    playc: playc,
                                    scorelist: score_list
                                }
                            };
                            await scoredb.updateOne(query, updateVal);
                        } else {
                            const insertVal = {
                                uid: uid,
                                username: res.username,
                                level: level,
                                score: score,
                                playc: playc,
                                scorelist: score_list
                            };
                            await scoredb.insertOne(insertVal);
                        }

                        message.channel.send(`✅ **| ${message.author}, recalculated <@${ufind}>'s plays: ${pptotal.toFixed(2)} pp, ${score.toLocaleString()} ranked score (level ${Math.floor(level)} (${((level - Math.floor(level)) * 100).toFixed(2)}%)).**`);
                        queue.shift();
                        if (queue.length > 0) {
                            const nextQueue = queue[0];
                            exports.run(nextQueue.client, nextQueue.message, nextQueue.args, nextQueue.maindb, nextQueue.alicedb, current_map, true);
                        }
                    });
                    return;
                }

                let i = 0;
                console.log(`Checking ${entries.length} plays`);
                for await (const entry of entries) {
                    console.log(i);
                    ++i;
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
                    score_list.push([entry.score, entry.hash]);
                    if (!mapinfo.osuFile) {
                        console.log("No osu file found");
                        continue;
                    }
                    if (blacklists.find(v => v.beatmapID === mapinfo.beatmapID)) {
                        console.log("Map is blacklisted");
                        continue;
                    }
                    const mods = entry.mods;
                    const acc_percent = entry.accuracy;
                    const combo = entry.combo;
                    const miss = entry.miss;

                    const replay = await new osudroid.ReplayAnalyzer({scoreID, map: star.droidStars}).analyze();
                    const { data } = replay;
                    if (!data) {
                        continue;
                    }
                    await sleep(0.2);

                    const stats = new osudroid.MapStats({
                        ar: entry.forcedAR ?? undefined,
                        speedMultiplier: entry.speedMultiplier,
                        isForceAR: !!entry.forcedAR,
                        oldStatistics: data.replayVersion <= 3
                    });

                    const realAcc = new osudroid.Accuracy({
                        n300: data.hit300,
                        n100: data.hit100,
                        n50: data.hit50,
                        nmiss: miss
                    });

                    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods, stats});
                    const scoreID = entry.scoreID;
                    
                    const npp = new osudroid.PerformanceCalculator().calculate({
                        stars: star.droidStars,
                        combo: combo,
                        accPercent: realAcc,
                        mode: osudroid.modes.droid,
                        stats
                    });
                    const pp = parseFloat(npp.total.toFixed(2));
                    if (!isNaN(pp)) {
                        ppentries.push({
                            hash: entry[11],
                            title: mapinfo.fullTitle,
                            mods: mods,
                            pp: pp,
                            combo: combo,
                            accuracy: acc_percent,
                            miss: miss,
                            scoreID: scoreID
                        });
                    }
                    ++playc;
                }

                if (!error) {
                    ++page;
                    attempts = 0;
                } else {
                    ++attempts;
                }
                retrievePlays(page, uid, checkPlays);
            });
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