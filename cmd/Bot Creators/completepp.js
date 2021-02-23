const Discord = require('discord.js');
const osudroid = require('old-osu-droid');
const { Db } = require('mongodb');

/**
 * @param {number} seconds 
 */
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

function test(uid, page, cb) {
    console.log("Current page: " + page);
    const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
        .setEndpoint("scoresearchv2.php")
        .addParameter("uid", uid)
        .addParameter("page", page);

    apiRequestBuilder.sendRequest().then(result => {
        if (result.statusCode !== 200) {
            console.log("Empty response from droid API");
            page--;
            return cb([], false);
        }
        const entries = [];
        const lines = result.data.toString("utf-8").split('<br>');
        lines.shift();
        for (const line of lines) {
            entries.push(new osudroid.Score().fillInformation(line));
        }
        cb(entries, !entries[0]);
    });
}

async function calculatePP(ppentries, entry, cb) {
    const mapinfo = await osudroid.MapInfo.getInformation({hash: entry.hash});
    if (mapinfo.error) {
        console.log("API fetch error");
        return cb();
    }
    if (!mapinfo.title) {
        console.log("Map not found");
        return cb();
    }
    if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
        console.log('Error: PP system only accept ranked, approved, whitelisted or loved mapset right now');
        return cb();
    }
    if (!mapinfo.osuFile) {
        console.log("No osu file");
        return cb(true);
    }
    const scoreID = entry.scoreID;
    if (entry.forcedAR !== undefined || entry.speedMultiplier !== 1) {
        return cb();
    }
    const replay = await new osudroid.ReplayAnalyzer({scoreID, map: mapinfo.map}).analyze();
    if (!replay.fixedODR) {
        console.log("Replay not found");
        return cb();
    }
    const { data } = replay;
    const stats = new osudroid.MapStats({
        ar: entry.forcedAR,
        speedMultiplier: entry.speedMultiplier,
        isForceAR: !isNaN(entry.forcedAR),
        oldStatistics: data.replayVersion <= 3
    });
    await sleep(0.2);
    const realAcc = new osudroid.Accuracy({
        n300: data.hit300,
        n100: data.hit100,
        n50: data.hit50,
        nmiss: data.hit0
    });
    const mods = entry.mods;
    const combo = entry.combo;
    const miss = entry.miss;
    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods, stats});
    replay.map = star.droidStars;
    replay.checkFor3Finger();
    const accPercent = entry.accuracy;
    
    const npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: realAcc,
        miss: miss,
        mode: osudroid.modes.droid,
        speedPenalty: replay.penalty,
        stats
    });
    
    const pp = parseFloat(npp.toString().split(" ")[0]);
    const ppentry = {
        hash: mapinfo.hash,
        title: mapinfo.fullTitle,
        pp: pp,
        mods: mods,
        accuracy: accPercent,
        combo: combo,
        miss: miss,
        scoreID: scoreID
    };
    if (stats.isForceAR) {
        ppentry.forcedAR = stats.ar;
    }
    if (entry.speedMultiplier !== 1) {
        ppentry.speedMultiplier = stats.speedMultiplier;
    }
    if (!isNaN(pp)) {
        ppentries.push(ppentry);
    }
    cb();
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    }

    const ppentries = [];
    let page = 0;
    const ufind = args[0]?.replace('<@!','').replace('<@', '').replace('>', '');
    if (!ufind) {
        return message.channel.send("Please mention a user or user ID");
    }

    const binddb = maindb.collection("userbind");
    const query = { discordid: ufind };
	binddb.findOne(query, function(err, userres) {
        if (!userres) {
            return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        const uid = userres.uid;
        const pplist = userres.pp ?? [];
        let playc = 0;
        let pptotal = 0;

        test(uid, page, async function testcb(entries, stopSign = false) {
            if (stopSign) { 
                console.log("COMPLETED!"); 
                console.table(ppentries); 
                ppentries.forEach(ppentry => {
                    let dup = false;
                    for (let i in pplist) {
                        if (ppentry.hash.trim() === pplist[i].hash.trim()) {
                            if (ppentry.pp >= pplist[i].pp) {
                                pplist[i] = ppentry; 
                            }
                            dup = true;
                            playc++;
                            break;
                        }
                    }
                    if (!dup) {
                        pplist.push(ppentry);
                        playc++;
                    }
                });
                pplist.sort(function(a, b) {
                    return b.pp - a.pp;
                });
                if (pplist.length > 75) {
                    pplist.splice(75);
                }
                console.table(pplist);
                let weight = 1;
                for (let i of pplist) {
                    pptotal += weight * i[2];
                    weight *= 0.95;
                }
                message.channel.send('✅ **| <@' + message.author.id + '>, recalculated <@' + ufind + ">'s plays: " + pptotal + ' pp.**');
                let updateVal = { $set: {
                        pptotal: pptotal,
                        pp: pplist,
                        playc: playc
                    }
                };
                binddb.updateOne(query, updateVal, function(err) {
                    if (err) throw err;
                    console.log('pp updated');
                });

                //reset everything if additional uid is added
                return;
            }
            console.table(entries);
            let i = 0;
            let attempt = 0;
            await calculatePP(ppentries, entries[i], async function cb(error = false, stopFlag = false) {
                console.log(i);
                attempt++;
                if (attempt === 3 && error) i++;
                if (!error) {
                    i++;
                    playc++;
                    attempt = 0;
                }
                if (i < entries.length && !stopFlag) {
                    await calculatePP(ppentries, entries[i], cb);
                } else {
                    console.log("done");
                    ppentries.sort(function(a, b) {
                        return b.pp - a.pp;
                    });
                    if (ppentries.length > 75) {
                        ppentries.splice(75);
                    }
                    page++;
                    console.table(ppentries);
                    test(uid, page, testcb);
                }
            });
        });
    });
};

module.exports.config = {
    name: "completepp",
    description: "Recalculates all plays of an account for droid pp.",
    usage: "completepp <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Bot Creators"
};