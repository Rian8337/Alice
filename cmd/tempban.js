const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
    if (!message.member.hasPermission("ADMINISTRATOR", {checkAdmin: true, checkOwner: true})) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let logchannel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create ${config.management_channel} first!`);

    let userid = args[0];
    if (!userid) return message.channel.send("❎ **| Hey, can you please specify someone to ban?**");
    userid = userid.replace('<@!','').replace('<@', '').replace('>', '');

    if (isNaN(parseInt(userid))) return message.channel.send("❎ **| Hey, that user is invalid!");

    if (userid === message.author.id) return message.channel.send("❎ **| Why would you ban yourself, you fool?**");

    let banned = await message.guild.fetchBan(userid);
    if (banned) return message.channel.send("❎ **| I'm sorry, this user is already banned!**");

    let toban = await client.users.fetch(userid);
    if (!toban) return message.channel.send("❎ **| I'm sorry, I can't find the user to ban!**");
    if (toban.bot) return message.channel.send("❎ **| I'm sorry, this user is a bot!**");

    let bantime = args[1];
    if (!bantime) return message.channel.send("❎ **| Hey, please specify correct ban time!");
    if (bantime.endsWith("h")) bantime = parseFloat(bantime) / 24;
    else if (bantime.endsWith("d")) bantime = parseFloat(bantime);
    else return message.channel.send("❎ **| Hey, please specify if time is in hours or days!**");
    if (isNaN(bantime) || bantime <= 0) return message.channel.send("❎ **| I'm sorry, that ban time is invalid!**");

    let reason = args.slice(2).join(" ");
    if (!reason) return message.channel.send("❎ **| Hey, please enter your ban reason!**");

    message.guild.members.ban(toban, {reason: reason}).then (() => {
        message.author.lastMessage.delete().catch(console.error);
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
            .setTitle("Temporary ban executed")
            .addField("Banned user: " + toban.username + "\nUser ID: " + userid, "Length: " + (bantime * 24) + " hour(s)")
            .addField("=========================", "Reason:\n" + reason);

        logchannel.send({embed: embed});

        setTimeout(() => {
            message.guild.members.unban(toban, "Ban time is over").then(() => {
                embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                    .setFooter("Alice Synthesis Thirty", footer[index])
                    .setTimestamp(new Date())
                    .setColor(rolecheck)
                    .setTitle("User unbanned")
                    .addField("Unanned user: " + toban.username + "\nUser ID: " + userid, "Ban length: " + (bantime * 24) + " hour(s)")
                    .addField("=========================", "Ban reason:\n" + reason);

                logchannel.send({embed: embed});
            }).catch(console.error)
        }, bantime * 24 * 3600 * 1000)
    }).catch(console.error)
};

module.exports.config = {
    name: "tempban",
    description: "Temporarily bans a user.",
    usage: "tempban <user> <[hours]h / [days]d> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`hours`: Time to ban in hours [Float]\n`days`: Time to ban in days [Float]\n`reason`: Reason for banning [String]",
    permission: "Owner"
};
