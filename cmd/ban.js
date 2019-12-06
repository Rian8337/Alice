let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");

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

    if (isNaN(userid)) {
        message.channel.send("Please specify the correct user to ban!");
        return;
    }
    if (userid == message.author.id) {
        message.channel.send("You cannot ban yourself!");
        return;
    }

    let banlist = await message.guild.fetchBans();
    let banned = banlist.get(userid);
    if (banned) {
        message.channel.send("User is already banned!");
        return;
    }

    let toban = await client.fetchUser(userid);
    if (!toban) {
        message.channel.send("User not found!");
        return;
    }
    
    let reason = args.slice(1).join(" ");
    if (!reason) {
        message.channel.send("Please enter your reason.");
        return;
    }
    
    message.guild.ban(toban, {reason: reason}).then (() => {
        message.author.lastMessage.delete();

        const embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setDescription("**Ban executed**")
            .addField("Banned user: " + toban.username, "User ID: " + userid)
            .addField("=========================", "Reason:\n" + reason);

        logchannel.send({embed})
    })
};

module.exports.help = {
    name: "ban"
};
