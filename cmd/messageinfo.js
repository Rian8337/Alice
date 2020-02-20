const Discord = require('discord.js');
const config = require('../config.json');

module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    let channel_id = args[0];
    if (!channel_id) return message.channel.send("❎ **| Hey, I don't know the channel to retrieve the message from!**");
    channel_id = channel_id.replace("<#!", "").replace("<#", "").replace(">", "");
    let message_id = args[1];
    if (!message_id) return message.channel.send("❎ **| Hey, I don't know the message to retrieve!**");
    if ([parseInt(channel_id), parseInt(message_id)].some(isNaN)) return message.channel.send("❎ **| I'm sorry, channel ID or message ID is invalid!**");

    let channel = message.guild.channels.get(channel_id);
    if (!channel) return message.channel.send("❎ **| I'm sorry, I can't find the channel!**");

    channel.fetchMessage(args[1]).then(msg => {
        let rolecheck;
        try {
            rolecheck = message.member.highestRole.hexColor
        } catch (e) {
            rolecheck = "#000000"
        }
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = new Discord.RichEmbed()
            .setTitle("Message Info")
            .setDescription(`[Go to message](${msg.url})`)
            .setColor(rolecheck)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setThumbnail(msg.author.avatarURL)
            .addField("Message Author", `${msg.author} (${msg.author.id})`)
            .addField("Date Sent", new Date(msg.createdTimestamp).toUTCString())
            .addField("Message Content", msg.content.substring(0, 1024));

        message.channel.send({embed: embed}).catch(console.error)
    }).catch(() => message.channel.send("❎ **| I'm sorry, I cannot find the message!**"))
};

module.exports.config = {
    name: "messageinfo",
    description: "Fetches a message in a given channel.",
    usage: "messageinfo <channel ID> <message ID>",
    detail: "`channel ID`: The ID of the channel [ChannelResolvable (channel or channel ID)]\n`message ID`: The ID of the message [Snowflake (String)]",
    permission: "None"
};