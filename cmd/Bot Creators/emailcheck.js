const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

module.exports.run = async (client, message, args) => {
	if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
	let uid = args[0];
	if (isNaN(uid)) return message.channel.send("❎ **| I'm sorry, that uid is not valid.**");
	const player = await new osudroid.PlayerInfo().get({uid: uid});
	if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
	if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**");
	let name = player.name;
	let email = player.email;

	let rolecheck;
	try {
		rolecheck = message.member.roles.color.hexColor
	} catch (e) {
		rolecheck = "#000000"
	}
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setTitle("User profile")
		.setColor(rolecheck)
		.setFooter("Alice Synthesis Thirty", footer[index])
		.addField("Username", name)
		.addField("Uid", uid)
		.addField("Email", email);

	try {
		message.author.send({embed: embed})
	} catch (e) {
		return message.channel.send(`❎ **| ${message.author}, your DM is locked!**`);
	}
	message.channel.send(`✅ **| ${message.author}, the user info has been sent to you!**`)
};

module.exports.config = {
	name: "emailcheck",
	description: "Retrieves the registered email of an droid account.",
	usage: "emailcheck <uid>",
	detail: "`uid`: Uid to retrieve email from [Integer]`",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};