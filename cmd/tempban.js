let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel || message.author.id != '386742340968120321') return;
    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) {
        message.channel.send(`Please create ${config.management_channel} first!`);
        return;
    }
    let userid = args[0];
    if (!userid) {
        message.channel.send("Please specify the correct user to ban!");
        return;
    }
    userid = userid.replace('<@!','');
    userid = userid.replace('<@','');
    userid = userid.replace('>','');
    if (userid == message.author.id) {
        message.channel.send("You cannot ban yourself!");
        return;
    }
    let toban = message.guild.members.get(userid);
    if (!toban) toban = await client.fetchUser(userid);







    let bantime = args[1];
    if (!bantime) {
        message.channel.send("Please specify ban time!");
        return;
    }
    if (bantime.endsWith("h")) bantime = parseFloat(bantime) / 24;
    else if (bantime.endsWith("d")) bantime = parseFloat(bantime);
    else {
        message.channel.send("Please specify if time is in hours or days!");
        return;
    }
    if (isNaN(bantime) || bantime <= 0) {
        message.channel.send("Invalid ban time");
        return;
    }




    let reason = args.slice(2).join(" ");
    if (!reason) {
        message.channel.send("Please enter your reason.");
        return;
    }
    message.guild.ban(toban, {days: bantime, reason: reason}).then (() => {
        message.author.lastMessage.delete();

        const embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setDescription("**Temporary ban executed**")
            .addField("Banned user: " + userid.user.username + "\nUser ID: " + userid.id, "Time: " + (bantime * 24) + "hours")
            .addField("=================", "Reason:\n" + reason);

        logchannel.send({embed})
       
        setTimeout(() => {
            message.guild.unban(toban, "Ban time is over").catch();
        }, bantime * 24 * 3600 * 1000)
    }).catch(() => {
        message.channel.send("User is already banned or cannot be banned!")
    })
};

module.exports.help = {
    name: "tempban"
};
