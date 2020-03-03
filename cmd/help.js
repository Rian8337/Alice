// done rewriting
const Discord = require('discord.js');
const config = require('../config.json');
const help = require('../help.json');

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
		let cmd = client.commands.get(args[0]);
		if (!cmd) return message.channel.send("❎ **| I'm sorry, I cannot find the command you are looking for!**");
		let help = `${cmd.config.description}\n\n\`<...>\`: required arguments\n\`[...]\`: optional arguments\n\n**Permission: **${cmd.config.permission}\n**Usage:**\n\`${cmd.config.usage}\`\n**Details:**\n${cmd.config.detail}`;
		let embed = new Discord.MessageEmbed()
			.setTitle(config.prefix + args[0])
			.setColor(rolecheck)
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setDescription(help);
		message.channel.send({embed: embed}).catch(console.error)
	} else {
		let general = help.general;
		let genhelp = '';
		for (let i = 0; i < general.length; i++) {
			genhelp += "`" + general[i] + "` ";
		}
		genhelp = genhelp.slice(0, -1);

		let droid = help.droid;
		let droidhelp = '';
		for (let i = 0; i < droid.length; i++) {
			droidhelp += "`" + droid[i] + "` ";
		}
		droidhelp = droidhelp.slice(0, -1);

		let pp = help.dpp;
		let pphelp = 'NOTE: This system does not automatically submit your plays. You have to do it manually using the command provided below. Moreover, you can only submit up to 50 of your recent plays. If you want to submit all your previous plays, contact a helper or moderator.\n';
		for (let i = 0; i < pp.length; i++) {
			pphelp += "`" + pp[i] + "` ";
		}
		pphelp = pphelp.slice(0, -1);

		let malody = help.malody;
		let malodyhelp = '';
		for (let i = 0; i < malody.length; i++) {
			malodyhelp += "`" + malody[i] + "` ";
		}
		malodyhelp = malodyhelp.slice(0, -1);

		let embed = new Discord.MessageEmbed()
			.setTitle("Alice Synthesis Thirty Help\nUser Commands")
			.setDescription(`Made by <@132783516176875520> and <@386742340968120321>.\nComplete command list can be found [here](https://github.com/Rian8337/Alice).\n**Prefix: ${config.prefix}**\n\nFor detailed information about a command, use \`${config.prefix}help [command name]\`.\nFor moderation commands, type \`${config.prefix}modhelp\`.`)
			.setThumbnail(client.user.avatarURL({dynamic: true}))
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
	name: "help",
	description: "General help command.",
	usage: "help [cmd]",
	detail: "`cmd`: Command name",
	permission: "None"
};
