const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
	if (!message.isOwner) {
		return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
	}
	const uid = args[0];
	if (isNaN(uid)) {
		return message.channel.send("❎ **| I'm sorry, that uid is not valid.**");
	}
	const player = await osudroid.Player.getInformation({uid: uid});
	if (player.error) {
		return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
	}
	if (!player.username) {
		return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**");
	}
	const footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	const embed = new Discord.MessageEmbed()
		.setTitle("User profile")
		.setColor(message.member?.roles.color?.hexColor || "#000000")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.addField("Username", player.username)
		.addField("Uid", uid)
		.addField("Email", player.email);

	try {
		message.author.send({embed: embed});
	} catch (e) {
		return message.channel.send(`❎ **| ${message.author}, your DM is locked!**`);
	}
	message.channel.send(`✅ **| ${message.author}, the user info has been sent to you!**`);
};

module.exports.config = {
	name: "emailcheck",
	description: "Retrieves the registered email of an droid account.",
	usage: "emailcheck <uid>",
	detail: "`uid`: The uid to retrieve email from [Integer]",
	permission: "Bot Creators"
};