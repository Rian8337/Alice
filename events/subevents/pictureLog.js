const Discord = require('discord.js');

module.exports.run = (client, message) => {
    const attachments = [];
    for (const [, attachment] of message.attachments.entries()) {
        let url = attachment.url;
        let length = url.length;
        if (url.indexOf("png", length - 3) === -1 && url.indexOf("jpg", length - 3) === -1 && url.indexOf("jpeg", length - 4) === -1 && url.indexOf("gif", length - 3) === -1) continue;
        attachments.push(attachment)
    }
    if (attachments.length === 0) return;
    let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor('#cb8900')
        .setTimestamp(new Date())
        .attachFiles(attachments)
        .setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
        .addField("Channel", `${message.channel} | [Go to message](${message.url})`);

    if (message.content) embed.addField("Content", message.content);
    client.channels.cache.get("684630015538626570").send({embed: embed});
};

module.exports.config = {
    name: "pictureLog"
};