const Discord = require('discord.js');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
module.exports.run = (client, message) => {
    const mentions = message.mentions;
    let userMentionString = '';
    let roleMentionString = '';
    if (mentions.users.size > 0) {
        for (const [, user] of mentions.users.entries()) {
            userMentionString += `${user.tag}, `;
        }
        userMentionString = userMentionString.substring(0, userMentionString.length - 2);
    }
    if (mentions.roles.size > 0) {
        for (const [, role] of mentions.roles.entries()) {
            roleMentionString += `${role.name}, `;
        }
        roleMentionString = roleMentionString.substring(0, roleMentionString.length - 2);
    }

    const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor("#00cb16")
        .setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
        .setTimestamp(new Date())
        .addField("Channel", `${message.channel} | [Go to message](${message.url})`);

    if (userMentionString) {
        embed.addField("Mentioned Users", userMentionString);
    }
    if (roleMentionString) {
        embed.addField("Mentioned Roles", roleMentionString);
    }
    const content = message.content.substring(0, 1024);
    embed.addField("Content", content.length > 0 ? content : "No content");

    client.channels.cache.get("683504788272578577").send(embed);
};

module.exports.config = {
    name: "mentionLog"
};