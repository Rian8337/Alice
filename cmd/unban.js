let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel || message.author.id != '386742340968120321') return;
    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) {
        message.channel.send(`Please create ${config.management_channel} first!`);
        return;
    }
    let userid = await client.fetchUser(args[0]);
    if (!userid) {
        message.channel.send("Please specify the correct user ID to unban!");
        return;
    }
    if (userid.id == message.author.id) {
        message.channel.send("You cannot unban yourself!");
        return;
    }
    let reason = args.slice(1).join(" ");
    if (!reason) {
        message.channel.send("Please enter your reason.");
        return;
    }
    message.guild.unban(userid, reason).then (() => {
        message.author.lastMessage.delete().catch();
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);

        const embed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .setColor(message.member.highestRole.hexColor)
            .setDescription("**Unban executed**")
            .addField("Unbanned user: " + userid.username, "User ID: " + userid.id)
            .addField("=================", "Reason:\n" + reason);

        logchannel.send({embed})
    }).catch(() => {
        message.channel.send("User is not banned!")
    })
};

module.exports.help = {
    name: "unban"
};
