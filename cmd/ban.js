let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (message.member.highestRole.name !== 'Owner') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create ${config.management_channel} first!`);

    let userid = args[0];
    if (!userid) return message.channel.send("❎ **| Please specify the correct user to ban!**");
    userid = userid.replace('<@!','');
    userid = userid.replace('<@','');
    userid = userid.replace('>','');

    if (isNaN(userid)) return message.channel.send("❎ **| Please specify the correct user to ban!**");
    if (userid == message.author.id) return message.channel.send("❎ **| You cannot ban yourself!**");

    let toban = await client.fetchUser(userid);
    if (!toban) return message.channel.send("❎ **| I'm sorry, I cannot find the user!**");
    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Please enter your reason.**");
    reason = reason + " (banned by " + message.author.username + ")";

    message.guild.ban(toban, {reason: reason}).then (() => {
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);

        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setThumbnail(toban.avatarURL)
            .setTitle("Ban executed")
            .addField("Banned user: " + toban.username, "User ID: " + userid)
            .addField("=========================", "Reason:\n" + reason);

        if (message.attachments.size > 0) {
            let attachments = [];
            message.attachments.forEach(attachment => {
                attachments.push(attachment.proxyURL)
            });
            logchannel.send({embed: embed, files: attachments})
        }
        else logchannel.send({embed: embed});

        message.author.lastMessage.delete();
    }).catch(() => message.channel.send("❎ **| I'm sorry, looks like the user is already banned or cannot be banned!**"))
};

module.exports.help = {
    name: "ban"
};
