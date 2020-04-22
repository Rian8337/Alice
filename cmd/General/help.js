const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message, args) => {
	let rolecheck;
	try {
		rolecheck = message.member.roles.highest.hexColor
	} catch (e) {
		rolecheck = "#000000"
	}
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	if (args[0]) {
		let cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);
		if (!cmd) return message.channel.send("❎ **| I'm sorry, I cannot find the command you are looking for!**");
		let help = `${cmd.config.description}\n\n\`<...>\`: required arguments\n\`[...]\`: optional arguments\n\n${cmd.config.aliases ? `**Aliases:** \`${cmd.config.aliases}\`\n\n`: ""}**Permission: **${cmd.config.permission}\n\n**Usage:**\n\`${cmd.config.usage}\`\n\n**Details:**\n${cmd.config.detail}`;
		let embed = new Discord.MessageEmbed()
			.setTitle(config.prefix + cmd.config.name)
			.setColor(rolecheck)
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setDescription(help);
		message.channel.send({embed: embed}).catch(console.error)
	} else {
		let embed = new Discord.MessageEmbed()
			.setTitle("Alice Synthesis Thirty Help\nUser Commands")
			.setDescription(`Made by <@132783516176875520> and <@386742340968120321>.\n[GitHub Repository](https://github.com/Rian8337/Alice).\n\n**Prefix: ${config.prefix}**\n\nFor detailed information about a command, use \`${config.prefix}help [command name]\`.\nIf you found any bugs or issues with the bot, please contact bot creators.`)
			.setThumbnail(client.user.avatarURL({dynamic: true}))
			.setColor(rolecheck)
			.setFooter("Alice Synthesis Thirty", footer[index]);

		for (const section of client.help) {
			let string = '';
			for (const command of section.commands) string += `\`${command}\` `;
			string = string.trimEnd();
			embed.addField(section.section, string)
		}

		message.channel.send({embed: embed})
	}
};

module.exports.config = {
	name: "help",
	description: "General help command.",
	usage: "help [cmd]",
	detail: "`cmd`: Command name [String]",
	permission: "None"
};
