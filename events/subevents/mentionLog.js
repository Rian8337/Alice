const Discord = require('discord.js');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
module.exports.run = (client, message) => {
    const mentions = message.mentions;
    let mentionString = '';
    if (mentions.users.size > 0) {
        mentionString += 'Mentioned users: ';
        for (const [, user] of mentions.users.entries()) {
            mentionString += `${user.tag}, `;
        }
        mentionString = mentionString.substring(0, mentionString.length - 2);
    }
    if (mentions.roles.size > 0) {
        if (mentions.users.size > 0) {
            mentionString += `\n`;
        }
        mentionString += 'Mentioned roles: ';
        for (const [, role] of mentions.roles.entries()) {
            mentionString += `${role.name}, `;
        }
        mentionString = mentionString.substring(0, mentionString.length - 2);
    }

    const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor("#00cb16")
        .setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
        .setTimestamp(new Date())
        .addField("Mentions", mentionString)
        .addField("Channel", `${message.channel} | [Go to message](${message.url})`)
        .addField("Content", message.content.substring(0, 1024));

    client.channels.cache.get("683504788272578577").send({embed: embed});
};

module.exports.config = {
    name: "mentionLog"
};