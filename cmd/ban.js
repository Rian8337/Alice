const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (!message.member.hasPermission("ADMINISTRATOR", false, true, true)) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`"❎ **| Hey, please create ${config.management_channel} first!**`);

    let userid = args[0];
    if (!userid) return message.channel.send("❎ **| Hey, please specify the correct user to ban!**");
    userid = userid.replace('<@!','').replace('<@','').replace('>','');

    if (isNaN(parseInt(userid))) return message.channel.send("❎ **| Hey, please specify the correct user to ban!**");
    if (userid == message.author.id) return message.channel.send("❎ **| Why would you ban yourself?**");

    let toban = await client.fetchUser(userid);
    if (!toban) return message.channel.send("❎ **| I'm sorry, I cannot find the user!**");
    if (toban.bot) return message.channel.send("❎ **| I'm sorry, you cannot ban bots!**");
    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Hey, please enter your ban reason!**");

    message.guild.ban(toban, {reason: reason + ` (banned by ${message.author.username})`}).then (() => {
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
                attachments.push(attachment.proxyURL);
                if (attachments.length === message.attachments.size) logchannel.send({embed: embed, files: attachments})
            });
        }
        else logchannel.send({embed: embed});

        message.author.lastMessage.delete();
    }).catch(() => message.channel.send("❎ **| I'm sorry, looks like the user is already banned or cannot be banned!**"))
};

module.exports.config = {
    name: "ban",
    description: "Bans a user from the server.",
    usage: "ban <user> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`reason`: Reason for banning [String]",
    permission: "Owner"
};
