var Discord = require('discord.js');
var fs = require('fs');
var config = require('../config.json');

module.exports.run = (client, message, args) => {
	if (args[0]) {
		let cmd = client.commands.get(args[0]);
		if (cmd) {
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			let help = `**${config.prefix}${args[0]}**\n${cmd.config.description || "No Description"}\n\n**Permission:** ${cmd.config.permission}\n**Usage:**\n\`${cmd.config.usage || "No Usage"}\`\n**Details:**\n${cmd.config.detail}`;
			let embed = new Discord.RichEmbed()
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setThumbnail(client.user.avatarURL)
				.setDescription(help);
			message.channel.send({embed: embed})
		} else message.channel.send("❎ **| I'm sorry, I cannot find the command you are looking for!**")
	} else {
		fs.readFile("help.txt", function (err, data1) {
			if (err) {
				console.log(err);
				return message.channel.send("Error retrieving data. Please try again!")
			}
			message.channel.send("Complete command list can be found at https://github.com/Rian8337/Alice\n```" + data1 + "```")
		})
	}
};

module.exports.config = {
	description: "General help command.",
	usage: "help [cmd]",
	detail: "`cmd`: Command name [String]",
	permission: "None"
};

module.exports.help = {
	name: "help"
};
