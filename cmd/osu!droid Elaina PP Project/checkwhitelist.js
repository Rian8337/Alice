const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
    const beatmapLink = args[0];

    if (!beatmapLink) {
        return message.channel.send("❎ **| Hey, please enter a beatmap link!**");
    }

    const a = beatmapLink.split("/");
    const beatmapID = parseInt(a[a.length - 1]);

    if (isNaN(beatmapID)) {
        return message.channel.send("❎ **| I'm sorry, that's not a valid beatmap link or ID!**");
    }

    const mapinfo = await osudroid.MapInfo.getInformation({beatmapID, file: false});

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

    const whitelistDb = maindb.collection("mapwhitelist");

    whitelistDb.findOne({mapid: beatmapID}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }

        if (!res) {
            return message.channel.send(`✅ **| \`${mapinfo.fullTitle}\` is not whitelisted.**`);
        }

        if (res.hashid === mapinfo.hash) {
            message.channel.send(`✅ **| \`${mapinfo.fullTitle}\` is whitelisted and updated.**`);
        } else {
            message.channel.send(`✅ **| \`${mapinfo.fullTitle}\` is whitelisted, but not updated.**`);
        }
    });
};

module.exports.config = {
    name: "checkwhitelist"
};