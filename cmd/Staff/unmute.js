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
    const toUnmute = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch();
    if (!toUnmute) {
        return message.channel.send("❎ **| Hey, please enter a valid user to unmute!**");
    }

    if (toUnmute.hasPermission("ADMINISTRATOR") || toUnmute.user.bot) {
        return message.channel.send("❎ **| Hey, this user couldn't even be muted at the first place!**");
    }

    const muteRole = message.guild.roles.cache.find(r => r.name === "elaina-muted");
    if (!muteRole) {
        return message.channel.send("❎ **| I'm sorry, I cannot find my mute role in this server!**");
    }

    if (!toUnmute.roles.cache.has(muteRole.id)) {
        return message.channel.send("❎ **| I'm sorry, this user is not muted!**");
    }

    const reason = args.slice(1).join(" ");
    if (reason.length > 1800) {
        return message.channel.send("❎ **| I'm sorry, your mute reason must be less than or equal to 1800 characters!**");
    }

    const muteDb = alicedb.collection("punishmentconfig");
    const query = {guildID: message.guild.id};
    muteDb.findOne(query, async (err, res) => {
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

        if (!message.isOwner && !message.member.hasPermission("ADMINISTRATOR")) {
            const allowedMuteRoles = res.allowedMuteRoles ?? [];
            const immuneMuteRoles = res.immuneMuteRoles ?? [];

            const allowedRoleEntry = allowedMuteRoles.find(v => message.member.roles.cache.has(v.id));
            if (!allowedRoleEntry || allowedRoleEntry.maxTime !== -1) {
                return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
            }

            const immuneRoleEntry = immuneMuteRoles.find(v => tomute.roles.cache.has(v));
            if (immuneRoleEntry) {
                return message.channel.send("❎ **| Hey, this user couldn't even be muted at the first place!**");
            }
        }

        if (!client.commands.get("tempmute").unmuteUser(toUnmute)) {
            return message.channel.send("❎ **| I'm sorry, I couldn't unmute the user!**");
        }

        let string = `**${toUnmute} in ${message.channel}**\nUser ID: ${toUnmute.id}\n\n=========================\n\n**Reason**:\n${reason ? reason : "Not specified."}`;

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const unmuteEmbed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setTitle("Unmute executed")
            .setColor("#000000")
            .setTimestamp(new Date())
            .setFooter("User ID: " + toUnmute.id, footer[index])
            .setDescription(string);

        channel.send(unmuteEmbed);

        const { currentMutes } = res;
        if (!currentMutes) {
            return;
        }

        const currentMute = currentMutes.find(v => v.userID === toUnmute.id);
        if (!currentMute) {
            return;
        }

        const logChannel = message.guild.channels.resolve(currentMute.logChannelID);
        if (!(logChannel instanceof Discord.TextChannel)) {
            return;
        }

        const logMessage = await logChannel.messages.fetch(currentMute.logMessageID).catch();
        if (!logMessage) {
            return;
        }

        const muteEmbed = logMessage.embeds[0];
        muteEmbed.setFooter(muteEmbed.footer.text + " | User unmuted", muteEmbed.footer.iconURL);
        logMessage.edit(muteEmbed);
        muteDb.updateOne(query, {$pull: {currentMutes: {userID: toUnmute.id}}});
    });
};

module.exports.config = {
    name: "unmute",
    description: "Unmutes a user.",
    usage: "unmute <user> [reason]",
    detail: "`user`: The user to unmute [UserResolvable (mention or user ID)]\n`reason`: Reason for unmuting, maximum length is 1800 characters [String]",
    permission: `Permanent Mute Permission (configure with \`${config.prefix}settings\`)`
};