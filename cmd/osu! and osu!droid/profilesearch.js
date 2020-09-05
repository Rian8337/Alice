const osudroid = require('osu-droid');
const Discord = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
	let username = args[0];
	if (!username) return message.channel.send("❎ **| Hey, can you at least tell me what username I need to search for?**");
	const player = await new osudroid.Player().getInformation({username: username});
	if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
	if (!player.username) return message.channel.send("❎ **| I'm sorry, I cannot find the user with such username. Please make sure that the name is correct (including upper and lower case).**");
	username = player.username;
	let uid = player.uid;

	maindb.collection("userbind").findOne({previous_bind: {$all: [uid.toString()]}}, (err, res) => {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
		}

		const footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		let rolecheck;
		try {
			rolecheck = message.member.roles.color.hexColor;
		} catch (e) {
			rolecheck = "#000000";
		}
		const embed = new Discord.MessageEmbed()
			.setAuthor(`Player Information for ${username} (click to view profile)`, null, `http://ops.dgsrz.com/profile.php?uid=${uid}`)
			.setThumbnail(player.avatarURL)
			.setColor(rolecheck)
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setDescription(`**Uid**: ${uid}\n**Rank**: ${player.rank.toLocaleString()}\n**Play Count**: ${player.playCount.toLocaleString()}\n**Country**: ${player.location}\n\n**Bind Information**: ${res ? `Binded to <@${res.discordid}> (user ID: ${res.discordid})` : "Not binded"}`);

		message.channel.send({embed: embed});
	});
};

module.exports.config = {
	name: "profilesearch",
	description: "Searches for a user and retrieves the user's uid.",
	usage: "profilesearch <username>",
	detail: "`username`: The username to search (case insensitive) [String]",
	permission: "None"
};