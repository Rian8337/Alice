const Discord = require('discord.js');
const { Db } = require('mongodb');
const osudroid = require('osu-droid');

function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, 1000 * seconds);
    });
}

/**
 * Deletes a play with specific hash from all players.
 * 
 * @param {import('mongodb').Collection} bindDb 
 * @param {string} hash 
 */
async function deletePlays(bindDb, hash) {
    const toUpdateList = await bindDb.find({ "pp.hash": hash }).toArray();

    for await (const toUpdate of toUpdateList) {
        toUpdate.pp.splice(toUpdate.pp.findIndex(v => v.hash === hash), 1);

        const totalPP = toUpdate.pp.reduce((a, v, i) => a + v.pp * Math.pow(0.95, i), 0);

        await bindDb.updateOne(
            { discordid: toUpdate.discordid },
            {
                $set: {
                    pp: toUpdate.pp,
                    pptotal: totalPP
                },
                $inc: {
                    playc: -1
                }
            }
        );
    }
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const whitelistDb = maindb.collection("mapwhitelist");
    const bindDb = maindb.collection("userbind");

    let outdatedCount = 0;
    let notAvailableCount = 0;
    let deletedCount = 0;
    let i = 0;
    while (true) {
        const entries = await whitelistDb.find({checkDone: {$ne: true}}, {projection: {_id: 0, mapid: 1, hashid: 1}}).sort({mapid: -1}).limit(500).toArray();

        if (entries.length === 0) {
            break;
        }

        for await (const entry of entries) {
            const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: entry.mapid, file: false});
            await sleep(0.05);
            console.log(++i);
            if (mapinfo.error) {
                console.log("API fetch error");
                continue;
            }
            if (!mapinfo.title) {
                console.log("Whitelist entry not available");
                ++notAvailableCount;
                await deletePlays(bindDb, entry.hashid);
                await whitelistDb.deleteOne({mapid: entry.mapid});
                continue;
            }
            if (mapinfo.approved !== osudroid.rankedStatus.GRAVEYARD) {
                console.log("Map not graveyarded");
                ++deletedCount;
                await deletePlays(bindDb, entry.hashid);
                await whitelistDb.deleteOne({mapid: entry.mapid});
                continue;
            }
            if (entry.hashid !== mapinfo.hash) {
                console.log("Hash outdated");
                ++outdatedCount;
                const updateQuery = {
                    $set: {
                        checkDone: true,
                        hashid: mapinfo.hash,
                        diffstat: {
                            cs: mapinfo.cs,
                            ar: mapinfo.ar,
                            od: mapinfo.od,
                            hp: mapinfo.hp,
                            sr: parseFloat(mapinfo.totalDifficulty.toFixed(2)),
                            bpm: mapinfo.bpm
                        }
                    }
                };
                await deletePlays(bindDb, entry.hashid);
                await whitelistDb.updateOne({mapid: entry.mapid}, updateQuery);
            }
        }
    }

    await whitelistDb.updateMany({}, {$unset: {checkDone: ""}});
    message.channel.send(`✅ **| ${message.author}, scan complete! A total of ${outdatedCount} entries were outdated, ${notAvailableCount} entries were not available, and ${deletedCount} entries were deleted.**`);
};

module.exports.config = {
    name: "scanwhitelist",
    description: "Scans whitelist entries and updates the entry if it's outdated.",
    usage: "scanwhitelist",
    detail: "None",
    permission: "Bot Creators"
};