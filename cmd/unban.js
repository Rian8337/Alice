const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!message.member.hasPermission("ADMINISTRATOR", {checkAdmin: true, checkOwner: true})) return message.channel.send("❎  **| I'm sorry, you don't have the permission to use this.**");
    
    let logchannel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`"❎ **| Hey, please create ${config.management_channel} first!**`);
    
    let user = await message.guild.fetchBan(args[0]);
    if (!user) return message.channel.send("❎ **| Hey, please specify the correct user ID to unban!**");
    if (user.user.id == message.author.id) return message.channel.send("❎ **| Hmm yes, you can totally unban yourself.**");

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Hey, please enter your unban reason!**");

    message.guild.members.unban(user.user, reason).then(() => {
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        let rolecheck;
        try {
            rolecheck = message.member.roles.highest.hexColor
        } catch (e) {
            rolecheck = "#000000"
        }

        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(rolecheck)
            .setThumbnail(user.user.avatarURL({dynamic: true}))
            .setTitle("Unban executed")
            .addField("Unbanned user: " + user.user.username, "User ID: " + user.user.id)
            .addField("=================", "Reason:\n" + reason);

        if (message.attachments.size > 0) {
            let attachments = [];
            message.attachments.forEach((attachment) => {
                attachments.push(attachment.proxyURL)
            });
            logchannel.send({embed: embed, files: attachments})
        }
        else logchannel.send({embed: embed});

        message.author.lastMessage.delete();
    }).catch(() => message.channel.send("❎ **| I'm sorry, that user is not banned!**"))
};

module.exports.config = {
    name: "unban",
    description: "Unbans a user.",
    usage: "unban <user> <reason>",
    detail: "`user`: The user to unban [User ID]\n`reason`: Reason for unbanning [String]",
    permission: "Owner"
};
