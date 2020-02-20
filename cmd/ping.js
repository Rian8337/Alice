const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = (client, message) => {
	console.log("Pong!");
	let time = (Date.now() - message.createdTimestamp)/10;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * (footer.length - 1) + 1);
	let embed = new Discord.RichEmbed()
		.setAuthor("Pong!")
		.setColor(message.member.highestRole.hexColor)
		.setFooter("Alice Synthesis Thirty", footer[index])
		.addField("Response time: ", `${time} ms`);
	message.channel.send(embed);
};

module.exports.config = {
	name: "ping",
	description: "Pong!",
	usage: "ping",
	detail: "None",
	permission: "None"
};
