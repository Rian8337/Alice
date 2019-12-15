let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (!message.member.roles.find(r => r.name === 'Owner')) return message.channel.send("❎  **| I'm sorry, you don't have the permission to use this.**");
    
    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create ${config.management_channel} first!`);
    
    let user = await client.fetchUser(args[0]);
    if (!user) return message.channel.send("❎ **| Please specify the correct user ID to unban!**");
    if (user.id == message.author.id) return message.channel.send("❎ **| You cannot unban yourself!**");

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Please enter your reason.**");

    message.guild.unban(user, reason).then (() => {
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);

        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setThumbnail(user.avatarURL)
            .setTitle("Unban executed")
            .addField("Unbanned user: " + user.username, "User ID: " + user.id)
            .addField("=================", "Reason:\n" + reason);

        if (message.attachments.size > 0) {
            let attachments = [];
            message.attachments.forEach(attachment => {
                attachments.push(attachment.proxyURL)
            });
            logchannel.send({embed: embed, files: attachments})
        }
        else logchannel.send({embed: embed});

        message.author.lastMessage.delete();
    }).catch(() => message.channel.send("❎ **| I'm sorry, that user is not banned!**"))
};

module.exports.help = {
    name: "unban"
};
