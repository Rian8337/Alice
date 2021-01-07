const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 * @param {[string, string][]} current_map 
 */
module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
    const channelEntry = current_map.find(c => c[0] === message.channel.id);
    if (!channelEntry) {
        return message.channel.send("❎ **| I'm sorry, there is no beatmap being talked in the channel!**");
    }

    const mapinfo = await osudroid.MapInfo.getInformation({hash: channelEntry[1], file: false});
    if (mapinfo.error) {
		return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
	}
	if (!mapinfo.title) {
		return message.channel.send("❎ **| I'm sorry, this beatmap is not available for download!**");
	}
	if (!mapinfo.objects) {
		return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
    }
    
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setColor(message.member?.roles.color?.hexColor || "#000000")
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setAuthor(mapinfo.fullTitle)
        .setDescription(mapinfo.showStatistics('', 1));

    message.channel.send({embed: embed});
};

module.exports.config = {
    name: "downloadlink",
    aliases: "dl",
    description: "Gives download link of the cached beatmap in the channel, if available.",
	usage: "downloadlink",
	detail: "None",
	permission: "None"
};