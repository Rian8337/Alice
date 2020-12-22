const Discord = require("discord.js");
const { Db } = require("mongodb");
const config = require("../../config.json");

/**
 * @param {Discord.GuildMember} member 
 */
function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission
    for (const id of eligibleRoleList) {
        if (res === -1) {
            break;
        }
        if (member.roles.cache.has(id[0])) {
            if (id[1] === -1) {
                res = id[1];
            } else {
                res = Math.max(res, id[1]);
            }
        }
    }
    return res;
}

/**
 * @param {Discord.GuildMember} member 
 */
function isImmuned(member) {
    let res = 0;
    let immunedRoleList = config.mute_immune;
    for (const id of immunedRoleList) {
        if (member.roles.cache.has(id)) {
            res = 1;
            break;
        }
    }
    return res;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return;
    }
    const timeLimit = isEligible(message.member);
    if (timeLimit != -1) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    }

    const tomute = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(console.error);
    if (!tomute) {
        return message.channel.send("❎ **| Hey, please enter a valid user to mute!**");
    }
    if (isImmuned(tomute) || tomute.user.bot) {
        return message.channel.send("❎ **| I'm sorry, this user cannot be muted.**");
    }

    const reason = args.slice(1).join(" ");
    if (!reason) {
        return message.channel.send("❎ **| Hey, can you give me your reason for muting?**");
    }
    if (reason.length > 1800) {
        return message.channel.send("❎ **| I'm sorry, your mute reason must be less than or equal to 1800 characters!**");
    }

    const channelDb = alicedb.collection("mutelogchannel");
    channelDb.findOne({guildID: message.guild.id}, async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this server doesn't have a mute log configured!**");
        }
        const channel = message.guild.channels.resolve(res.channelID);
        if (!channel) {
            return message.channel.send(`❎ **| I'm sorry, please ask server managers to create a mute log channel first!**`);
        }
        if (!(channel instanceof Discord.TextChannel)) {
            return message.channel.send("❎ **| Hey, mute log channel must be a text channel!**");
        }
        let muterole = message.guild.roles.cache.find(r => r.name === 'elaina-muted');

        //start of create role
        if (!muterole) {
            try {
                muterole = await message.guild.roles.create({data: {name: "elaina-muted", color: "#000000", permissions:[]}});
                message.guild.channels.cache.forEach((channel) => {
                    channel.updateOverwrite(muterole, {"SEND_MESSAGES": false, "ADD_REACTIONS": false, "SPEAK": false, "CONNECT": false}).catch(console.error);
                });
            } catch(e) {
                console.log(e.stack);
            }
        } else {
            message.guild.channels.cache.forEach((channel) => {
                channel.updateOverwrite(muterole, {"SEND_MESSAGES": false, "ADD_REACTIONS": false, "SPEAK": false, "CONNECT": false}).catch(console.error);
            });
        }
        //end of create role

        message.delete().catch(O_o=>{});

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);

        const muteembed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
            .setTitle("Mute executed")
            .setColor("#000000")
            .setTimestamp(new Date())
            .setFooter("User ID: " + tomute.id, footer[index])
            .setDescription(`**${tomute} in ${message.channel} permanently**\n\n=========================\n\n**Reason**: ${reason}`);

        try{
            await tomute.send(`❗**| Hey, you were muted permanently for \`${reason}\`. Sorry!**`, {embed: muteembed});
        } catch (e) {
            message.channel.send(`❗**| A user has been muted... but their DMs are locked. The user will be muted permanently.**`);
        }

        channel.send({embed: muteembed});

        tomute.roles.add(muterole.id).catch(console.error);

        if (message.guild.id === "316545691545501706") {
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
                    });
                }
            });
        }
    });
};

module.exports.config = {
    name: "mute",
    description: "Permanently mutes a user.",
    usage: "mute <user> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`reason`: Reason for banning, maximum length is 1024 characters [String]",
    permission: "Moderator"
};