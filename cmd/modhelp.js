var Discord = require('discord.js');
var modhelp = require('../modhelp.json');
var config = require('../config.json');

module.exports.run = (client, message, args) => {
	var rolecheck;
	try {
		rolecheck = message.member.highestRole.hexColor
	} catch (e) {
		rolecheck = "#000000"
	}
	if (args[0]) {
		let cmd = client.commands.get(args[0]);
		if (cmd) {
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			let help = `${cmd.config.description}\n\n\`<...>\`: required arguments\n\`[...]\`: optional arguments\n\n**Permission: **${cmd.config.permission}\n**Usage:**\n\`${cmd.config.usage}\`\n**Details:**\n${cmd.config.detail}`;
			let embed = new Discord.RichEmbed()
				.setTitle(config.prefix + args[0])
				.setColor(rolecheck)
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setDescription(help);
			message.channel.send({embed: embed})
		}
	} else {
		let helper = modhelp.helper;
		let helperhelp = '';
		for (var i = 0; i < helper.length; i++) {
			helperhelp += "`" + helper[i] + "` "
		}
		helperhelp = helperhelp.slice(0, -1);

		let moderator = modhelp.moderator;
		let moderatorhelp = '';
		for (i = 0; i < moderator.length; i++) {
			moderatorhelp += "`" + moderator[i] + "` "
		}
		moderatorhelp = moderatorhelp.slice(0, -1);

		let owner = modhelp.owner;
		let ownerhelp = '';
		for (i = 0; i < owner.length; i++) {
			ownerhelp += "`" + owner[i] + "` "
		}
		ownerhelp = ownerhelp.slice(0, -1);

		let specific = modhelp.specific;
		let specifichelp = 'These commands are exclusive to <@132783516176875520> and <@386742340968120321>.\n';
		for (i = 0; i < specific.length; i++) {
			specifichelp += "`" + specific[i] + "` "
		}
		specifichelp = specifichelp.slice(0, -1);

		let botowner = modhelp.bot_owner;
		let botownerhelp = '';
		for (i = 0; i < botowner.length; i++) {
			botownerhelp += "`" + botowner[i] + "` "
		}
		botownerhelp = botownerhelp.slice(0, -1);

		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * (footer.length - 1) + 1);
		let embed = new Discord.RichEmbed()
			.setTitle("Alice Synthesis Thirty Help\nModeration Commands")
			.setDescription(`Made by <@132783516176875520> and <@386742340968120321>.\nComplete command list can be found [here](https://github.com/Rian8337/Alice).\n**Prefix: ${config.prefix}**\n\nFor detailed information about a command, use \`${config.prefix}modhelp [command name]\`.\nFor user commands, type \`${config.prefix}help\`.\n\nModerator can use Helper commands unless specified otherwise. Owner can use all commands.`)
			.setThumbnail(client.user.avatarURL)
			.setColor(rolecheck)
			.setFooter("Alice Synthesis Thirty", footer[index])
			.addField("Helper", helperhelp)
			.addField("Moderator", moderatorhelp)
			.addField("Owner", ownerhelp)
			.addField("Specific Person", specifichelp)
			.addField("Bot Owner", botownerhelp);

		message.channel.send({embed: embed}).catch(console.error)
	}
};

module.exports.config = {
	description: "Moderator help command.",
	usage: "modhelp [cmd]",
	detail: "`cmd`: Command name",
	permission: "None"
};

module.exports.help = {
	name: "modhelp"
};
