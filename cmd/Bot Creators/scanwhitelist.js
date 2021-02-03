const Discord = require('discord.js');
const { Db } = require('mongodb');
const osudroid = require('osu-droid');

function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, 1000 * seconds);
    });
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const whitelistdb = maindb.collection("mapwhitelist");
    whitelistdb.find({}, {projection: {_id: 0, mapid: 1, hashid: 1}}).toArray(async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }

        let outdatedCount = 0;
        let notAvailableCount = 0;
        let deletedCount = 0;
        let i = 0;
        for await (const entry of res) {
            const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: entry.mapid});
            await sleep(0.05);
            console.log(++i);
            if (mapinfo.error) {
                console.log("API fetch error");
                continue;
            }
            if (!mapinfo.title) {
                console.log("Whitelist entry not available");
                ++notAvailableCount;
                await whitelistdb.deleteOne({mapid: entry.mapid});
                continue;
            }
            if (mapinfo.approved !== osudroid.rankedStatus.GRAVEYARD) {
                console.log("Map not graveyarded");
                ++deletedCount;
                await whitelistdb.deleteOne({mapid: entry.mapid});
                continue;
            }
            if (entry.hashid !== mapinfo.hash) {
                console.log("Hash outdated");
                ++outdatedCount;
                await whitelistdb.updateOne({mapid: entry.mapid}, {$set: {hashid: mapinfo.hash}});
            }
        }
        message.channel.send(`✅ **| ${message.author}, scan complete! A total of ${outdatedCount} entries were outdated, ${notAvailableCount} entries were not available, and ${deletedCount} entries were deleted.**`);
    });
};

module.exports.config = {
    name: "scanwhitelist",
    description: "Scans whitelist entries and updates the entry if it's outdated.",
    usage: "scanwhitelist",
    detail: "None",
    permission: "Bot Creators"
};