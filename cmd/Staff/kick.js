const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not avaiable in DMs");
    if (!message.member.roles.cache.find((r) => r.name === 'Moderator')) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let logchannel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create #${config.management_channel} first!`);

    let tokick = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    if (!tokick) return message.channel.send("❎ **| I can't find the user. Can you make sure you have entered a correct one?**");

    let immune = config.mute_immune;
    for (let i = 0; i < immune; i++) if (tokick.roles.cache.has(immune[i])) return message.channel.send("❎ **| I'm sorry, this user cannot be kicked!**");

    let reason = args.slice(1).join(" ");
    if (!reason) reason = 'Not specified.';

    tokick.kick(reason).then(() => {
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setColor(message.member.roles.highest.hexColor)
            .setTimestamp(new Date())
            .setTitle("Kick executed")
            .addField("Kicked user: " + tokick.user.username, "User ID: " + tokick.id)
            .addField("=========================", "Reason:\n" + reason);

        logchannel.send({embed: embed})
    })
};

module.exports.config = {
    name: "kick",
    description: "Kicks a user.",
    usage: "kick <user> [reason]",
    detail: "`user`: The user to kick [UserResolvable (mention or user ID)]\n`reason`: Reason for kicking [String]",
    permission: "Moderator"
};
