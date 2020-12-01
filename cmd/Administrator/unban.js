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
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return message.channel.send("❎  **| I'm sorry, you don't have the permission to use this.**");
    }
    
    const user = await message.guild.fetchBan(message.mentions.users.first() || args[0]).catch(console.error);
    if (!user) {
        return message.channel.send("❎ **| Hey, please specify the correct user ID to unban!**");
    }
    if (user.user.id == message.author.id) {
        return message.channel.send("❎ **| Hmm yes, you can totally unban yourself.**");
    }

    const reason = args.slice(1).join(" ");
    if (!reason) {
        return message.channel.send("❎ **| Hey, please enter your unban reason!**");
    }

    const channelDb = alicedb.collection("mutelogchannel");
    channelDb.findOne({guildID: message.guild.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this server doesn't have a mute log configured!**");
        }
        const channel = message.guild.channels.resolve(res.channelID);
        if (!channel) {
            return message.channel.send(`❎ **| I'm sorry, please ask server managers to create a ban log channel first!**`);
        }
        if (!(channel instanceof Discord.TextChannel)) {
            return message.channel.send("❎ **| Hey, ban log channel must be a text channel!**");
        }

        message.guild.members.unban(user.user, reason).then(() => {
            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            const color = message.member.roles.color?.hexColor || "#000000";

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setTimestamp(new Date())
                .setColor(color)
                .setThumbnail(user.user.avatarURL({dynamic: true}))
                .setTitle("Unban executed")
                .addField("Unbanned user: " + user.user.username, "User ID: " + user.user.id)
                .addField("=================", "Reason:\n" + reason);
    
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
        }).catch(() => message.channel.send("❎ **| I'm sorry, that user is not banned!**"));
    });
};

module.exports.config = {
    name: "unban",
    description: "Unbans a user.",
    usage: "unban <user> <reason>",
    detail: "`user`: The user to unban [User ID]\n`reason`: Reason for unbanning [String]",
    permission: "Owner"
};