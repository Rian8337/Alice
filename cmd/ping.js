const Discord = require('discord.js');

module.exports.run = (client, message) => {
	console.log("Pong!");
	let time = (Date.now() - message.createdTimestamp)/10;
	let embed = new Discord.RichEmbed()
		.setAuthor("Pong!")
		.setColor(message.member.highestRole.hexColor)
		.setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
		.addField("Response time: ", `${time} ms`);
	message.channel.send(embed);
};

module.exports.help = {
	name: "ping"
};
