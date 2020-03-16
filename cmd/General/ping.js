const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message) => {
	console.log("Pong!");
	let time = Date.now() - message.createdTimestamp;

	let rolecheck;
	try {
		rolecheck = message.member.roles.highest.hexColor
	} catch (e) {
		rolecheck = "#000000"
	}
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setAuthor("Pong!")
		.setColor(rolecheck)
		.setFooter("Alice Synthesis Thirty", footer[index])
		.addField("Response time: ", `${time} ms`);
	message.channel.send({embed: embed}).catch(console.error);
};

module.exports.config = {
	name: "ping",
	description: "Pong!",
	usage: "ping",
	detail: "None",
	permission: "None"
};
