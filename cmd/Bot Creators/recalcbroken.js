const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");
const osudroid = require('osu-droid');

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
 */
module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) {
        return;
    }
    const bindDb = maindb.collection("userbind");
    const blacklistDb = maindb.collection("mapblacklist");

    bindDb.find({tempCalcDone: true}).toArray(async (err, res) => {
        const blacklists = await blacklistDb.find({}, {projection: {_id: 0, beatmapID: 1}}).toArray();

        for await (const player of res) {
            const uid = player.uid;
            message.channel.send(`✅ **| Now calculating uid ${uid}.**`);

            const pplist = player.pp;
            const ppEntries = [];
            let page = 0;

            while (true) {
                const entries = await retrievePlays(uid, page);
                ++page;
                if (entries.length === 0) {
                    break;
                }

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
    
                    const npp = new osudroid.PerformanceCalculator().calculate({
                        stars: star.droidStars,
                        combo: combo,
                        accPercent: realAcc,
                        mode: osudroid.modes.droid,
                        speedPenalty: replay.penalty,
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
                    if (!isNaN(pp)) {
                        ppEntries.push(ppEntry);
                    }
                }
    
                ppEntries.sort((a, b) => {
                    return b.pp - a.pp;
                });
    
                if (ppEntries.length > 75) {
                    ppEntries.splice(75);
                }
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

            const totalPP = pplist.map(v => {return v.pp;}).reduce((acc, value, index) => acc + value * Math.pow(0.95, index), 0);
            let updateVal = {
                $set: {
                    pptotal: totalPP,
                    pp: pplist,
                    tempCalcDone: false
                }
            };

            await bindDb.updateOne({discordid: player.discordid}, updateVal);
        }

        message.channel.send(`✅ **| ${message.author}, database fix done!**`);
    });
};

module.exports.config = {
    name: "recalcbroken",
    description: "Temporary command to fix broken pp entries.",
    usage: "None",
    detail: "None",
    permission: "Bot Creators"
};