const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");
const osudroid = require('osu-droid');

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

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (!message.isOwner) {
        return;
    }

    const bindDb = maindb.collection("userbind");
    const banDb = maindb.collection("ppban");
    const scoreDb = alicedb.collection("playerscore");
    const blacklistDb = maindb.collection("mapblacklist");
    const whitelistDb = maindb.collection("mapwhitelist");

    const count = await bindDb.countDocuments({calcDone: {$ne: true}});

    let i = 0;
    const msg = await message.channel.send(`❗**| Recalculating user accounts... (${i}/${count})**`);

    const blacklists = await blacklistDb.find({}, {projection: {_id: 0, beatmapID: 1}}).toArray();

    while (true) {
        const databaseEntries = await bindDb.find({calcDone: {$ne: true}}).sort({pptotal: -1}).limit(50).toArray();

        if (databaseEntries.length === 0) {
            break;
        }

        for await (const databaseEntry of databaseEntries) {
            const accounts = databaseEntry.previous_bind ?? [databaseEntry.uid];

            let playc = 0;

            const currentPPEntries = [];

            for await (const uid of accounts) {
                console.log(`Now calculating uid ${uid}`);
                const player = await osudroid.Player.getInformation({uid: uid});

                const isBanned = await banDb.findOne({uid: uid});
                if (isBanned) {
                    continue;
                }

                const { username } = player;

                let page = 0;

                if (databaseEntry.calcInfo) {
                    if (uid !== databaseEntry.calcInfo.uid) {
                        continue;
                    }

                    page = databaseEntry.calcInfo.page - 1;
                    currentPPEntries.length = 0;
                    currentPPEntries.push(...databaseEntry.calcInfo.currentPPEntries);
                } else {
                    await scoreDb.deleteOne({uid});
                    await scoreDb.insertOne({
                        uid,
                        username,
                        score: 0,
                        playc: 0,
                        scorelist: []
                    });
                }

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
                            const isWhitelist = await whitelistDb.findOne({hashid: entry.hash});
                            if (!isWhitelist) {
                                console.log("Map is not ranked, approved, or whitelisted");
                                continue;
                            }
                        }
                        score += entry.score;
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
                        await sleep(0.25);
                        ++playc;

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

                        replay.map = star.droidStars;
                        replay.checkFor3Finger();

                        const npp = new osudroid.DroidPerformanceCalculator().calculate({
                            stars: star.droidStars,
                            combo: combo,
                            accPercent: realAcc,
                            tapPenalty: replay.tapPenalty,
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
                            const duplicate = currentPPEntries.findIndex(v => v.hash === ppEntry.hash);
                            if (duplicate === -1) {
                                currentPPEntries.push(ppEntry);
                            } else if (currentPPEntries[duplicate].pp < ppEntry.pp) {
                                currentPPEntries.splice(duplicate, 1);
                                currentPPEntries.push(ppEntry);
                            }
                        }
                        ++playc;
                    }

                    currentPPEntries.sort((a, b) => {
                        return b.pp - a.pp;
                    });

                    if (currentPPEntries.length > 75) {
                        currentPPEntries.splice(75);
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

                    await bindDb.updateOne({discordid: databaseEntry.discordid}, {$set: {
                        calcInfo: {
                            uid: uid,
                            page: page,
                            currentPPEntries: currentPPEntries
                        }
                    }});
                }
                console.log("COMPLETED!");
            }

            const totalPP = currentPPEntries.reduce((acc, value, index) => acc + value.pp * Math.pow(0.95, index), 0);
            const updateVal = {
                $set: {
                    pptotal: totalPP,
                    pp: currentPPEntries,
                    playc,
                    calcDone: true,
                    hasAskedForRecalc: true
                },
                $unset: {
                    calcInfo: ""
                }
            };

            await bindDb.updateOne({discordid: databaseEntry.discordid}, updateVal);
            await msg.edit(`❗**| Recalculating user accounts... (${++i}/${count})**`);
        }
    }

    await bindDb.updateMany({}, {$unset: {calcDone: ""}, $set: {hasAskedForRecalc: false}});

    message.channel.send("✅ **| Calculation done!**");
};

module.exports.config = {
    name: "recalcallcomplete",
    description: "Recalculates all players' scores to be stored in pp database.",
    usage: "recalcallcomplete",
    detail: "None",
    permission: "Bot Creators"
};