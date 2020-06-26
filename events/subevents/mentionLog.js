const Discord = require('discord.js');

module.exports.run = (client, message) => {
    const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor("#00cb16")
        .setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
        .setTimestamp(new Date())
        .addField("Channel", `${message.channel} | [Go to message](${message.url})`)
        .addField("Content", message.content.substring(0, 1024));

    client.channels.cache.get("683504788272578577").send({embed: embed})
};

module.exports.config = {
    name: "mentionLog"
};