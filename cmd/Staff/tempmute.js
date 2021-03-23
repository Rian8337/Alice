const Discord = require("discord.js");
const config = require("../../config.json");
const { Db } = require("mongodb");
const currentTempMutes = new Map();

function timeConvert(num) {
    let sec = num;

    let days = Math.floor(sec / 86400);
    sec -= days * 86400;
    
    let hours = Math.floor(sec / 3600);
    sec -= hours * 3600;
    
    let minutes = Math.floor(sec / 60);
    sec -= minutes * 60;

    return [days.toString().padStart(2, "0"), hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), sec.toString().padStart(2, "0")].join(":");
}

/**
 * @param {string} arg 
 * @returns {number}
 */
function getMuteSeconds(arg = "") {
    let mutetime = 0;
    const muteTimeEntry = arg.toLowerCase().split(/[dhms:]/g);
    
    if (muteTimeEntry.length > 1) {
        if (/[dhms]/g.test(arg)) {
            // Contains either "d", "h", "m", or "s",
            // used to prevent duplicate entry
            const usedFormats = [];
            for (let i = 0, mark = 0; i < arg.length; ++i) {
                if (isNaN(mutetime)) {
                    break;
                }
                const str = arg.charAt(i);
                if (/[dhms]/.test(str) && !usedFormats.includes(str)) {
                    if (mark === i) {
                        ++mark;
                        continue;
                    }
                    usedFormats.push(str);
                    const time = parseFloat(arg.slice(mark, i));
                    mark = i + 1;

                    let multiplier = 1;
                    switch (str) {
                        case "d":
                            multiplier = 86400;
                            break;
                        case "h":
                            multiplier = 3600;
                            break;
                        case "m":
                            multiplier = 60;
                            break;
                    }

                    mutetime += time * multiplier;
                }
            }
        } else {
            for (let i = muteTimeEntry.length - 1, multiplier = 1; i >= 0; --i) {
                switch (i) {
                    case muteTimeEntry.length - 4:
                        multiplier *= 24;
                        break;
                    case muteTimeEntry.length - 3:
                    case muteTimeEntry.length - 2:
                        multiplier *= 60;
                        break;
                    default:
                        // Limit up to days
                        multiplier = Number.NaN;
                }
                if (isNaN(multiplier) || isNaN(mutetime)) {
                    break;
                }
                mutetime += parseFloat(muteTimeEntry[i]) * multiplier;
            }
        }
    } else {
        mutetime = parseFloat(arg);
    }
    
    return mutetime;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel.type !== "text") {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    }

    const tomute = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch();
    if (!tomute) {
        return message.channel.send("❎ **| Hey, please enter a valid user to mute!**");
    }
    if (!message.author.bot && (tomute.hasPermission("ADMINISTRATOR") || tomute.user.bot)) {
        return message.channel.send("❎ **| I'm sorry, this user cannot be muted.**");
    }

    const reason = args.slice(2).join(" ");
    if (reason.length > 1800) {
        return message.channel.send("❎ **| I'm sorry, your mute reason must be less than or equal to 1800 characters!**");
    }

    const mutetime = getMuteSeconds(args[1]);

    if (!mutetime) {
        return message.channel.send("❎ **| Hey, at least tell me how long do I need to mute this user!**");
    }
    if (isNaN(mutetime)) {
        return message.channel.send("❎ **| I'm sorry, the time limit is not valid. Please give me a valid one!**");
    }
    if (mutetime < 30) {
        return message.channel.send("❎ **| I'm sorry, you can only mute for at least 30 seconds.**");
    }
    if (mutetime === Number.POSITIVE_INFINITY) {
        return message.channel.send("❎ **| To infinity and beyond! Seriously though, please enter a valid mute time! You can use `a!mute` to permanently mute someone instead.**");
    }

    if (!reason) {
        return message.channel.send("❎ **| Hey, can you give me your reason for muting?**");
    }

    const channelDb = alicedb.collection("punishmentconfig");
    const query = {guildID: message.guild.id};
    channelDb.findOne(query, async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this server doesn't have a log channel configured!**");
        }
        const channel = message.guild.channels.resolve(res.logChannel);
        if (!channel) {
            return message.channel.send("❎ **| I'm sorry, please ask server managers to create a log channel first!**");
        }
        if (!(channel instanceof Discord.TextChannel)) {
            return message.channel.send("❎ **| Hey, log channel must be a text channel!**");
        }

        if (!message.isOwner && !message.author.bot && !message.member.hasPermission("ADMINISTRATOR")) {
            const allowedMuteRoles = res.allowedMuteRoles ?? [];
            const immuneMuteRoles = res.immuneMuteRoles ?? [];

            const allowedRoleEntry = allowedMuteRoles.find(v => message.member.roles.cache.has(v.id));
            if (!allowedRoleEntry) {
                return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
            }

            if (allowedRoleEntry.maxTime > 0 && allowedRoleEntry.maxTime < mutetime) {
                return message.channel.send("❎ **| I'm sorry, you don't have enough permission to mute a user for longer than " + allowedRoleEntry.maxTime.toLocaleString() + " seconds.**");
            }

            const immuneRoleEntry = immuneMuteRoles.find(v => tomute.roles.cache.has(v));
            if (immuneRoleEntry) {
                return message.channel.send("❎ **| I'm sorry, this user cannot be muted.**");
            }
        }

        let muterole = message.guild.roles.cache.find(r => r.name === 'elaina-muted');

        //start of create role
        if (!muterole) {
            muterole = await message.guild.roles.create({data: {name: "elaina-muted", color: "#000000", permissions:[]}})
                .catch(() => {return undefined;});
            if (!muterole) {
                return message.channel.send("❎ **| I'm sorry, I couldn't create the mute role!**");
            }
        }

        if (tomute.roles.cache.has(muterole.id)) {
            return message.channel.send("❎ **| I'm sorry, this user is already muted!**");
        }

        message.guild.channels.cache.forEach(async channel => {
            await channel.updateOverwrite(muterole, {SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false, CONNECT: false}).catch(console.error);
        });
        //end of create role

        message.delete().catch(O_o=>{});

        let string = `**${tomute} in ${message.channel} for ${timeConvert(mutetime)}**\n\n=========================\n\n**Reason**:\n${reason}`;

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const muteembed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setTitle("Mute executed")
            .setColor("#000000")
            .setTimestamp(new Date())
            .setFooter(`User ID: ${tomute.id} | Channel ID: ${message.channel.id}`, footer[index])
            .setDescription(string);

        try {
            await tomute.send(`❗**| Hey, you were muted for \`${timeConvert(mutetime)}\` for \`${reason}\`. Sorry!**`, {embed: muteembed});
        } catch (e) {
            message.channel.send(`❗**| A user has been muted... but their DMs are locked. The user will be muted for ${timeConvert(mutetime)}.**`);
        }

        if (mutetime >= 21600 && message.guild.id === "316545691545501706") {
            const loungedb = alicedb.collection("loungelock");
            loungedb.findOne({discordid: tomute.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    loungedb.insertOne({discordid: tomute.id}, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        channel.send("✅ **| Successfully locked user from lounge.**");
                    });
                }
            });
        }

        if (message.attachments.size > 0) {
            muteembed.attachFiles([message.attachments.first()]);
        }

        channel.send({embed: muteembed}).then(async msg => {
            tomute.roles.add(muterole.id)
                .catch(console.error);

            const currentMutes = res.currentMutes ?? [];
            const muteEnd = Math.floor(Date.now() / 1000) + mutetime;
            currentMutes.push({
                userID: tomute.id,
                logChannelID: channel.id,
                logMessageID: msg.id,
                muteEndTime: muteEnd
            });

            await channelDb.updateOne(query, {$set: {currentMutes}});

            const timeout = setTimeout(async () => {
                tomute.roles.remove(muterole.id);
                muteembed.setFooter(`${muteembed.footer.text} | User unmuted`, footer[index]);
                msg.edit({embed: muteembed});
                currentTempMutes.delete(tomute.id);
                await channelDb.updateOne(query, {$pull: {currentMutes: {id: tomute.id}}});
            }, mutetime * 1000);

            currentTempMutes.set(tomute.id, {muteEndTime: muteEnd, timeout});
        });
    });
};

/**
 * @param {Discord.GuildMember} user 
 * @param {Db} alicedb 
 * @param {number} durationLeft 
 * @param {string} logChannelID 
 * @param {string} logMessageID 
 */
module.exports.addTemporaryMute = (user, alicedb, durationLeft, logChannelID, logMessageID) => {
    const muteRole = user.guild.roles.cache.find(r => r.name === 'elaina-muted');
    if (!muteRole) {
        return;
    }

    const muteDb = alicedb.collection("punishmentconfig");
    const guildQuery = {guildID: user.guild.id};
    const guildUpdateQuery = {$pull: {currentMutes: {userID: user.id}}};

    const timeout = setTimeout(async () => {
        await user.roles.remove(muteRole);
        currentTempMutes.delete(user.id);

        const logChannel = user.guild.channels.resolve(logChannelID);
        if (!(logChannel instanceof Discord.TextChannel)) {
            await muteDb.updateOne(guildQuery, guildUpdateQuery);
            return;
        }

        const logMessage = await logChannel.messages.fetch(logMessageID).catch(() => {return undefined;});
        if (!logMessage) {
            await muteDb.updateOne(guildQuery, guildUpdateQuery);
            return;
        }

        const muteEmbed = logMessage.embeds[0];
        muteEmbed.setFooter(muteEmbed.footer.text + " | User unmuted", muteEmbed.footer.iconURL);
        logMessage.edit(muteEmbed);
        await muteDb.updateOne(guildQuery, guildUpdateQuery);
    }, durationLeft);

    currentTempMutes.set(user.id, timeout);
};

/**
 * @param {Discord.GuildMember} user 
 */
module.exports.unmuteUser = user => {
    const timeoutInfo = currentTempMutes.get(user.id);
    if (!timeoutInfo) {
        return false;
    }

    const { muteEndTime, timeout } = timeoutInfo;
    currentTempMutes.delete(user.id);
    if (muteEndTime <= Math.floor(Date.now() / 1000)) {
        return false;
    }

    const muteRole = user.guild.roles.cache.find(r => r.name === 'elaina-muted');
    if (!muteRole) {
        return false;
    }

    clearTimeout(timeout);
    user.roles.remove(muteRole);
    return true;
};

module.exports.config = {
    name: "tempmute",
    description: "Temporarily mutes a user.\n\nAn attachment can be put for proof of mute.",
    usage: "tempmute <user> <duration> <reason>",
    detail: "`user`: The user to mute [UserResolvable (mention or user ID)]\n`duration`: Time to mute. Accepted format is in direct seconds, `[<days>d<hours>h<minutes>m<seconds>s]`, or `[days]:[hours]:[minutes]:[seconds]` (partial inputs such as `[<minutes>m<seconds>s]` and `[minutes]:[seconds]` are supported). Minimum mute duration allowed is 30 seconds [Decimal/Time Format]\n`reason`: Reason for muting, maximum length is 1024 characters [String]",
    permission: `Mute Permission (configure with \`${config.prefix}settings\`)`
};