let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not allowed in DMs");
    if (message.member.highestRole.name !== 'Owner') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create ${config.management_channel} first!`);

    let userid = args[0];
    if (!userid) return message.channel.send("Please specify the correct user to ban!");
    userid = userid.replace('<@!','');
    userid = userid.replace('<@','');
    userid = userid.replace('>','');

    if (isNaN(Number(userid))) return message.channel.send("Please specify the correct user to ban!");

    if (userid === message.author.id) return message.channel.send("You cannot ban yourself!");

    let banlist = await message.guild.fetchBans();
    let banned = banlist.get(userid);
    if (banned) return message.channel.send("User is already banned!");

    let toban = await client.fetchUser(userid);
    if (!toban) return message.channel.send("User not found!");

    let bantime = args[1];
    if (!bantime) return message.channel.send("Please specify ban time!");
    if (bantime.endsWith("h")) bantime = parseFloat(bantime) / 24;
    else if (bantime.endsWith("d")) bantime = parseFloat(bantime);
    else return message.channel.send("Please specify if time is in hours or days!");
    if (isNaN(bantime) || bantime <= 0) return message.channel.send("Invalid ban time");

    let reason = args.slice(2).join(" ");
    if (!reason) return message.channel.send("Please enter your reason.");
    reason += " (banned by " + message.author.username + ")";

    message.guild.ban(toban, {reason: reason}).then (() => {
        message.author.lastMessage.delete();
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setTitle("Temporary ban executed")
            .addField("Banned user: " + toban.username + "\nUser ID: " + userid, "Length: " + (bantime * 24) + " hour(s)")
            .addField("=========================", "Reason:\n" + reason);

        logchannel.send({embed});

        setTimeout(() => {
            message.guild.unban(toban, "Ban time is over").then (() => {
                embed = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setFooter("Alice Synthesis Thirty", footer[index])
                    .setTimestamp(new Date())
                    .setColor(message.member.highestRole.hexColor)
                    .setTitle("User unbanned")
                    .addField("Unanned user: " + toban.username + "\nUser ID: " + userid, "Ban length: " + (bantime * 24) + " hour(s)")
                    .addField("=========================", "Ban reason:\n" + reason);

                logchannel.send({embed});
            }).catch(e => console.log(e))
        }, bantime * 24 * 3600 * 1000)
    }).catch(e => console.log(e))
};

module.exports.config = {
    description: "Temporarily bans a user.",
    usage: "tempban <user> <[hours]h / [days]d> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`hours`: Time to ban in hours [Float]\n`days`: Time to ban in days [Float]\n`reason`: Reason for banning [String]",
    permission: "Owner"
};

module.exports.help = {
    name: "tempban"
};
