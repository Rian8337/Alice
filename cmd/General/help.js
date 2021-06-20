const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {number} page 
 * @param {string[]} footer 
 * @param {number} index 
 * @param {string} color 
 * @returns {Discord.MessageEmbed} 
 */
function generateEmbed(client, page, footer, index, color) {
	const half_page = Math.ceil(client.help.length / 2);
	const sections = client.help.slice((page - 1) * half_page, (page - 1) * half_page + half_page);

	const embed = new Discord.MessageEmbed()
		.setTitle("Alice Synthesis Thirty Help")
		.setDescription(`Made by <@132783516176875520> and <@386742340968120321>.\n\n**Prefix: ${config.prefix}**\n\nFor detailed information about a command, use \`${config.prefix}help [command name]\`.\nIf you found any bugs or issues with the bot, please contact bot creators.`)
		.setThumbnail(client.user.avatarURL({dynamic: true}))
		.setColor(color)
		.setFooter(`Alice Synthesis Thirty | Page ${page}/2`, footer[index]);

	for (const section of sections) {
		embed.addField(section.section, section.commands.map(v => `\`${v}\``).join(" • "));
	}

	return embed;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = (client, message, args) => {
	const color = message.member?.displayHexColor ?? "#000000";
	const footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	if (args[0]) {
		const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);
		if (!cmd) {
			return message.channel.send("❎ **| I'm sorry, I cannot find the command you are looking for!**");
		}
		const help = `${cmd.config.description}\n\n\`<...>\`: required arguments\n\`[...]\`: optional arguments\n\n${cmd.config.aliases ? `**Aliases:** \`${cmd.config.aliases}\`\n\n`: ""}**Permission: **${cmd.config.permission}\n\n**Usage:**\n\`${cmd.config.usage}\`\n\n**Details:**\n${cmd.config.detail}`;
		const embed = new Discord.MessageEmbed()
			.setTitle(config.prefix + cmd.config.name)
			.setColor(color)
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setDescription(help);
		message.channel.send({embed: embed}).catch(console.error)
	} else {
		let page = 1;
		let embed = generateEmbed(client, page, footer, index, color);
		const max_page = 2;

		message.channel.send({embed: embed}).then(msg => {
			msg.react("⬅️").then(() => {
                msg.react("➡️");
            });
            
            const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
            const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});

            back.on("collect", () => {
                if (page === 1) page = max_page;
                else --page;
                embed = generateEmbed(client, page, footer, index, color);
                msg.edit({embed: embed}).catch(console.error);
                if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
				}
            });

            next.on("collect", () => {
                if (page === max_page) page = 1;
                else ++page;
                embed = generateEmbed(client, page, footer, index, color);
                msg.edit({embed: embed}).catch(console.error);
                if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
				}
            });

            back.on("end", () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                if (message.channel.type === "text") {
					msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
				}
            });
		});
	}
};

module.exports.config = {
	name: "help",
	description: "General help command.",
	usage: "help [cmd]",
	detail: "`cmd`: Command name [String]",
	permission: "None"
};