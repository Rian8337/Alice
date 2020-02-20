const Discord = require('discord.js');
const config = require("../config.json");

function timeconvert (num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
}

module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (!message.member.hasPermission("ADMINISTRATOR", false, true, true)) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    let logchannel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create ${config.management_channel} first!`);

    let maxage = args[0];
    if (!maxage) return message.channel.send("Please enter time (seconds) until invite link expires!");
    if (isNaN(maxage) || maxage < 0 || (maxage > 0 && maxage < 1)) return message.channel.send("Invalid time");

    let maxuses = args[1];
    if (!maxuses) return message.channel.send("Please enter maximum invite link usage!");
    if (isNaN(maxuses) || maxuses < 0) return message.channel.send("Invalid maximum usage");

    let reason = args.slice(2).join(" ");
    if (!reason) return message.channel.send("Please enter your reason.");

    message.guild.systemChannel.createInvite({maxAge: maxage, maxUses: maxuses}, reason).then((invite) => {
        let time = timeconvert(maxage);
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

        message.channel.send({embed: embed}).catch(console.error)
    })
};

module.exports.config = {
    name: "createinvite",
    description: "Creates an invite link to the server's system channel.",
    usage: "createinvite <duration> <usage>",
    detail: "`duration`: Invite link expiration in seconds, set to 0 for never expire [Integer]\n`usage`: Maximum usage of invite link, set to 0 for infinite [Integer]",
    permission: "Owner"
};
