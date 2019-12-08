let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not allowed in DMs");
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");

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

    message.guild.ban(toban, {reason: reason}).then (() => {
        message.author.lastMessage.delete();
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        const embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setTitle("Temporary ban executed")
            .addField("Banned user: " + toban.username + "\nUser ID: " + userid, "Length: " + (bantime * 24) + " hour(s)")
            .addField("=========================", "Reason:\n" + reason);

        logchannel.send({embed});

        setTimeout(() => {
            message.guild.unban(toban, "Ban time is over").catch();
        }, bantime * 24 * 3600 * 1000)
    })
};

module.exports.help = {
    name: "tempban"
};
