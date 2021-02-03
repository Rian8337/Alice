const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!message.member.hasPermission("BAN_MEMBERS")) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const user = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch();
    if (!user) {
        return message.channel.send("❎ **| Hey, please specify the correct user to ban!**");
    }
    if (user.id === message.author.id) {
        return message.channel.send("❎ **| Why would you ban yourself?**");
    }
    if (user.user.bot) {
        return message.channel.send("❎ **| I'm sorry, you cannot ban bots!**");
    }
    if (message.member.roles.highest.comparePositionTo(user.roles.highest) < 0) {
        return message.channel.send("❎ **| I'm sorry, you cannot ban this user!**");
    }
    const reason = args.slice(1).join(" ");
    if (!reason) {
        return message.channel.send("❎ **| Hey, please enter your ban reason!**");
    }
    
    const channelDb = alicedb.collection("punishmentconfig");
    channelDb.findOne({guildID: message.guild.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this server doesn't have a log channel configured!**");
        }
        const channel = message.guild.channels.resolve(res.logChannel);
        if (!channel) {
            return message.channel.send(`❎ **| I'm sorry, please ask server managers to create a log channel first!**`);
        }
        if (!(channel instanceof Discord.TextChannel)) {
            return message.channel.send("❎ **| Hey, log channel must be a text channel!**");
        }

        user.ban({reason: reason + ` (banned by ${message.author.username})`}).then(() => {
            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setTimestamp(new Date())
                .setColor(message.member.roles.color.hexColor)
                .setThumbnail(toban.avatarURL({dynamic: true}))
                .setTitle("Ban executed")
                .addField("Banned user: " + toban.username, "User ID: " + userid)
                .addField("=========================", "Reason:\n" + reason);

            if (message.attachments.size > 0) {
                const attachments = [];
                for (const [, attachment] of message.attachments.entries()) {
                    attachments.push(attachment.url);
                }
                channel.send({embed: embed, files: attachments});
            } else {   
                channel.send({embed: embed});
            }

            message.author.lastMessage.delete();
        }).catch(() => message.channel.send("❎ **| I'm sorry, looks like the user is already banned or cannot be banned!**"));
    });
};

module.exports.config = {
    name: "ban",
    description: "Bans a user from the server.",
    usage: "ban <user> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`reason`: Reason for banning [String]",
    permission: "Ban Members"
};