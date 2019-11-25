var Discord = require('discord.js');

module.exports.run = (client, message, args) => {
    let user = message.author;
    if (args[0]) {
        user = message.guild.member(message.mentions.members.first() || message.guild.members.get(args[0]))
        
        const embed = new Discord.RichEmbed()
            .setDescription(`**${user.user.tag}**`)
            .setColor(message.member.highestRole.hexColor)
            .setTimestamp(new Date())
            .setImage(user.user.avatarURL)
            .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg");

        message.channel.send({embed});
        return;
    }
    const embed = new Discord.RichEmbed()
        .setDescription(`**${user.tag}**`)
        .setColor(message.member.highestRole.hexColor)
        .setTimestamp(new Date())
        .setImage(user.avatarURL)
        .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg");

    message.channel.send({embed})
};

module.exports.help = {
    name: "avatar"
};
