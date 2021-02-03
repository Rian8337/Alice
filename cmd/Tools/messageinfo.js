const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    const channel_id = args[0]?.replace(/[<#!>]/g, "");
    if (!channel_id) {
        return message.channel.send("❎ **| Hey, I don't know the channel to retrieve the message from!**");
    }

    let message_id = args[1];
    if (!message_id) {
        return message.channel.send("❎ **| Hey, I don't know the message to retrieve!**");
    }
    if ([channel_id, message_id].some(isNaN)) {
        return message.channel.send("❎ **| I'm sorry, channel ID or message ID is invalid!**");
    }

    const channel = message.guild.channels.cache.get(channel_id);
    if (!channel) {
        return message.channel.send("❎ **| I'm sorry, I can't find the channel!**");
    }
    if (!(channel instanceof Discord.TextChannel)) {
        return message.channel.send("❎ **| Hey, the channel isn't a valid text channel!**");
    }

    channel.messages.fetch(args[1]).then(msg => {
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setTitle("Message Info")
            .setDescription(`[Go to message](${msg.url})`)
            .setColor(message.member.roles.color?.hexColor || "#000000")
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setThumbnail(msg.author.avatarURL({dynamic: true}))
            .addField("Message Author", `${msg.author} (${msg.author.id})`)
            .addField("Date Sent", new Date(msg.createdTimestamp).toUTCString())
            .addField("Message Content", msg.content.substring(0, 100) + (msg.content.length > 100 ? " ..." : ""));

        message.channel.send({embed: embed}).catch(console.error);
    }).catch(() => message.channel.send("❎ **| I'm sorry, I cannot find the message!**"));
};

module.exports.config = {
    name: "messageinfo",
    description: "Fetches a message in a given channel.",
    usage: "messageinfo <channel ID> <message ID>",
    detail: "`channel ID`: The ID of the channel [ChannelResolvable (channel or channel ID)]\n`message ID`: The ID of the message [Snowflake (String)]",
    permission: "None"
};