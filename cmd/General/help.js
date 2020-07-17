const Discord = require('discord.js');
const config = require('../../config.json');

function generateEmbed(client, page, footer, index, rolecheck) {
	const half_page = Math.ceil(client.help.length / 2);
	const sections = client.help.slice((page - 1) * half_page, (page - 1) * half_page + half_page);

	const embed = new Discord.MessageEmbed()
		.setTitle("Alice Synthesis Thirty Help")
		.setDescription(`Made by <@132783516176875520> and <@386742340968120321>.\n\n[GitHub Repository](https://github.com/Rian8337/Alice)\n\n**Prefix: ${config.prefix}**\n\nFor detailed information about a command, use \`${config.prefix}help [command name]\`.\nIf you found any bugs or issues with the bot, please contact bot creators.`)
		.setThumbnail(client.user.avatarURL({dynamic: true}))
		.setColor(rolecheck)
		.setImage("https://i.imgur.com/6upQHyz.jpg")
		.setFooter(`Alice Synthesis Thirty | Page ${page}/2`, footer[index]);

	for (const section of sections) {
		let string = '';
		for (const command of section.commands) string += `\`${command}\` `;
		string = string.trimEnd();
		embed.addField(section.section, string)
	}

	return embed;
}

module.exports.run = (client, message, args) => {
	let rolecheck;
	try {
		rolecheck = message.member.roles.color.hexColor
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
		let page = 1;
		let embed = generateEmbed(client, page, footer, index, rolecheck);
		const max_page = 2;

		message.channel.send({embed: embed}).then(msg => {
			msg.react("⬅️").then(() => {
                msg.react("➡️")
            });
            
            const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
            const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});

            back.on("collect", () => {
                if (page === 1) page = max_page;
                else --page;
                embed = generateEmbed(client, page, footer, index, rolecheck);
                msg.edit({embed: embed}).catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            next.on("collect", () => {
                if (page === max_page) page = 1;
                else ++page;
                embed = generateEmbed(client, page, footer, index, rolecheck);
                msg.edit({embed: embed}).catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            back.on("end", () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
            })
		})
	}
};

module.exports.config = {
	name: "help",
	description: "General help command.",
	usage: "help [cmd]",
	detail: "`cmd`: Command name [String]",
	permission: "None"
};