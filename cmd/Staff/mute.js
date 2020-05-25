const Discord = require("discord.js");
const config = require("../../config.json");

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission
    eligibleRoleList.forEach((id) => {
        if(member.roles.cache.has(id[0])) res = id[1]
    });
    return res;
}

function isImmuned(member) {
    let res = 0;
    let immunedRoleList = config.mute_immune;
    immunedRoleList.forEach((id) => {
        if(member.roles.cache.has(id)) {console.log("immune role found"); res = 1}
    });
    return res;
}

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel || message.member.roles == null) return;
    let timeLimit = isEligible(message.member);
    if (!message.isOwner && timeLimit != -1) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    if (!tomute) return message.channel.send("❎ **| Hey, please enter a valid user to mute!**");
    if ((!message.isOwner && isImmuned(tomute)) || tomute.user.bot) return message.channel.send("❎ **| I'm sorry, this user cannot be muted.**");

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Hey, can you give me your reason for muting?**");
    if (reason.length > 1800) return message.channel.send("❎ **| I'm sorry, your mute reason must be less than or equal to 1800 characters!**");

    let channel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
    if (!channel) return message.channel.send(`❎ **| I'm sorry, please ask server managers to create a mute log channel first!**`);

    let muterole = message.guild.roles.cache.find(r => r.name === 'elaina-muted');
    //start of create role
    if (!muterole) {
        try {
            muterole = await message.guild.roles.create({data: {name: "elaina-muted", color: "#000000", permissions:[]}});
            message.guild.channels.cache.forEach((channel) => {
                channel.updateOverwrite(muterole, {"SEND_MESSAGES": false, "ADD_REACTIONS": false}).catch(console.error)
            })
        } catch(e) {
            console.log(e.stack)
        }
    } else {
        message.guild.channels.cache.forEach((channel) => {
            channel.updateOverwrite(muterole, {"SEND_MESSAGES": false, "ADD_REACTIONS": false}).catch(console.error)
        })
    }
    //end of create role

    message.delete().catch(O_o=>{});
    let string = `**${tomute} in ${message.channel} permanently**\n\n=========================\n\n**Reason**: ${reason}`;

    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);

    let muteembed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setTitle("Mute executed")
        .setColor("#000000")
        .setTimestamp(new Date())
        .setFooter("User ID: " + tomute.id, footer[index])
        .setDescription(string);

    try{
        await tomute.send(`❗**| Hey, you were muted permanently for \`${reason}\`. Sorry!**`, {embed: muteembed})
    } catch (e) {
        message.channel.send(`❗**| A user has been muted... but their DMs are locked. The user will be muted permanently.**`)
    }

    const loungedb = alicedb.collection("loungelock");
    loungedb.findOne({discordid: tomute.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) {
            loungedb.insertOne({discordid: tomute.id}, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
            })
        }
    });

    channel.send({embed: muteembed});

    tomute.roles.add(muterole.id)
            .catch(console.error)
};

module.exports.config = {
    name: "mute",
    description: "Permanently mutes a user.",
    usage: "mute <user> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`reason`: Reason for banning, maximum length is 1024 characters [String]",
    permission: "Moderator"
};
