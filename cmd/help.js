var Discord = require('discord.js');
var config = require('../config.json');
var help = require('../help.json');

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
			let help = `**${config.prefix}${args[0]}**\n${cmd.config.description || "No Description"}\n\n**Permission: **${cmd.config.permission}\n**Usage:**\n\`${cmd.config.usage || "No Usage"}\`\n**Details:**\n${cmd.config.detail}`;
			let embed = new Discord.RichEmbed()
				.setColor(rolecheck)
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setThumbnail(footer[index])
				.setDescription(help);
			message.channel.send({embed: embed})
		} else message.channel.send("❎ **| I'm sorry, I cannot find the command you are looking for!**")
	} else {
		let general = help.general;
		let genhelp = '';
		for (var i = 0; i < general.length; i++) {
			genhelp += "`" + general[i] + "` ";
		}
		genhelp = genhelp.slice(0, -1);

		let droid = help.droid;
		let droidhelp = '';
		for (i = 0; i < droid.length; i++) {
			droidhelp += "`" + droid[i] + "` ";
		}
		droidhelp = droidhelp.slice(0, -1);

		let pp = help.dpp;
		let pphelp = 'NOTE: This system does not automatically submit your plays. You have to do it manually using the command provided below. Moreover, you can only submit up to 50 of your recent plays. If you want to submit all your previous plays, contact a helper or moderator.\n\n';
		for (i = 0; i < pp.length; i++) {
			pphelp += "`" + pp[i] + "` ";
		}
		pphelp = pphelp.slice(0, -1);

		let malody = help.malody;
		let malodyhelp = '';
		for (i = 0; i < malody.length; i++) {
			malodyhelp += "`" + malody[i] + "` ";
		}
		malodyhelp = malodyhelp.slice(0, -1);

		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * (footer.length - 1) + 1);
		let embed = new Discord.RichEmbed()
			.setTitle("Alice Synthesis Thirty Help\nUser Commands")
			.setDescription(`**Prefix: ${config.prefix}**\n\nFor detailed information about a command, use \`${config.prefix}help [commamd name]\`.\nFor moderation commands, type \`${config.prefix}modhelp\`.`)
			.setThumbnail(client.user.avatarURL)
			.setColor(rolecheck)
			.setFooter("Alice Synthesis Thirty", footer[index])
			.addField("General", genhelp)
			.addField("osu! and osu!droid", droidhelp)
			.addField("osu!droid Elaina PP Project", pphelp)
			.addField("Malody", malodyhelp);

		message.channel.send({embed: embed}).catch(console.error)
	}
};

module.exports.config = {
	description: "General help command.",
	usage: "help [cmd]",
	detail: "`cmd`: Command name",
	permission: "None"
};

module.exports.help = {
	name: "help"
};
