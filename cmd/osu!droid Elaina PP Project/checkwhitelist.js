const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb
 * @param {[string, string]} current_map
 */
module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
    let beatmapID = args[0];
    let hash;

    if (!beatmapID) {
        const channelEntry = current_map.find(c => c[0] === message.channel.id);
        if (!channelEntry) {
            return message.channel.send("❎ **| I'm sorry, there is no map being talked in the channel!**");
        }
        hash = channelEntry[1];
    } else {
        const a = beatmapLink.split("/");
        beatmapID = parseInt(a[a.length - 1]);

        if (isNaN(beatmapID)) {
            return message.channel.send("❎ **| I'm sorry, that's not a valid beatmap link or ID!**");
        }
    }

    let mapinfo;
    if (beatmapID) {
        mapinfo = await osudroid.MapInfo.getInformation({beatmapID, file: false});
    } else {
        mapinfo = await osudroid.MapInfo.getInformation({hash, file: false});
    }


    if (mapinfo.error) {
		return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
	}
	if (!mapinfo.title) {
		return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
	}
	if (!mapinfo.objects) {
		return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
	}

    if (mapinfo.approved !== osudroid.rankedStatus.QUALIFIED && mapinfo.approved > osudroid.rankedStatus.PENDING) {
        return message.channel.send("❎ **| Hey, this beatmap doesn't need to be whitelisted!**");
    }

    beatmapID = mapinfo.beatmapID;
    hash = mapinfo.hash;

    const whitelistDb = maindb.collection("mapwhitelist");

    whitelistDb.findOne({mapid: beatmapID}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }

        if (!res) {
            return message.channel.send(`✅ **| \`${mapinfo.fullTitle}\` is not whitelisted.**`);
        }

        if (res.hashid === hash) {
            message.channel.send(`✅ **| \`${mapinfo.fullTitle}\` is whitelisted and updated.**`);
        } else {
            message.channel.send(`✅ **| \`${mapinfo.fullTitle}\` is whitelisted, but not updated.**`);
        }
    });
};

module.exports.config = {
    name: "checkwhitelist",
    description: "Checks if a beatmap is whitelisted.",
    usage: "checkwhitelist [beatmap link/ID]",
    detail: "`beatmap link/ID`: The ID or link of the beatmap",
    permission: "None"
};