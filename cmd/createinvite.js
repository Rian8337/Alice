let Discord = require('discord.js');
let config = require("../config.json");

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return;
    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) {
        message.channel.send(`Please create ${config.management_channel} first!`);
        return
    }
    let maxage = args[0];
    if (!maxage) {
        message.channel.send("Please enter time (seconds) until invite link expires!");
        return
    }
    if (isNaN(maxage) || maxage < 0 || (maxage > 0 && maxage < 1)) {
        message.channel.send("Invalid time");
        return
    }
    let maxuses = args[1];
    if (!maxuses) {
        message.channel.send("Please enter maximum invite link usage!");
        return
    }
    if (isNaN(maxuses) || maxuses < 0) {
        message.channel.send("Invalid maximum usage");
        return
    }
    let reason = args.slice(2).join(" ");
    if (!reason) {
        message.channel.send("Please enter your reason.");
        return
    }

    message.guild.systemChannel.createInvite({maxAge: maxage, maxUses: maxuses}, reason).then((invite) => {
        let hours = Math.floor(maxage / 3600);
        let minutes = Math.floor((maxage - hours * 3600) / 60);
        let seconds = (maxage - hours * 3600 - minutes * 60);
        let time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        if (maxage == 0) time = 'Never';
        if (maxuses == 0) maxuses = 'Infinite';

        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);

        const embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setTitle("Invite link created")
            .addField("Created in", message.channel)
            .addField("Maximum usage", maxuses)
            .addField("Expiration time", time)
            .addField("Reason", reason)
            .addField("Invite link", invite.url);

        message.channel.send({embed})
    })
};

module.exports.help = {
    name: "createinvite"
};
