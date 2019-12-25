var Discord = require('discord.js');
var config = require('../config.json');

module.exports.run = (client, message, args) => {
    try {
		let rolecheck = message.member.roles;
	} catch (e) {
		return
	}
    let user = message.author;
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
    if (args[0]) {
        try {
            user = message.guild.member(message.mentions.members.first() || message.guild.members.get(args[0]))
        } catch (e) {
            message.channel.send("Unable to find user");
            return;
        }
        const embed = new Discord.RichEmbed()
            .setDescription(`**${user.user.tag}**`)
            .setColor(message.member.highestRole.hexColor)
            .setTimestamp(new Date())
            .setImage(user.user.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index]);

        message.channel.send({embed});
        return;
    }
    const embed = new Discord.RichEmbed()
        .setDescription(`**${user.tag}**`)
        .setColor(message.member.highestRole.hexColor)
        .setTimestamp(new Date())
        .setImage(user.avatarURL)
        .setFooter("Alice Synthesis Thirty", footer[index]);

    message.channel.send({embed})
};

module.exports.config = {
    description: "Retrieves a user's avatar.",
    usage: "avatar [user]",
    detail: "`user`: UserResolvable (mention or user ID)",
    permission: "None"
};

module.exports.help = {
    name: "avatar"
};
