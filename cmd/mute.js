const Discord = require("discord.js");
const config = require("../config.json");

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
    if (timeLimit != -1) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    if (!tomute) return;
    if (isImmuned(tomute) || tomute.user.bot) return message.channel.send("❎ **| I'm sorry, this user cannot be muted.**");

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send("❎ **| Hey, can you give me your reason for muting?**");

    let muterole = message.guild.roles.cache.find(r => r.name === 'elaina-muted');
    //start of create role
    if (!muterole) {
        try {
            muterole = await message.guild.roles.create({data: {name: "elaina-muted", color: "#000000", permissions:[]}});
            message.guild.channels.cache.forEach(channel => {
                channel.overwritePermissions([{id: muterole.id, deny: ["SEND_MESSAGES", "ADD_REACTIONS"]}]).catch(console.error)
            })
        } catch(e) {
            console.log(e.stack)
        }
    }
    //end of create role

    message.delete().catch(O_o=>{});

    try{
        await tomute.send(`Hi! You've been muted permanently. Sorry!`)
    } catch (e) {
        message.channel.send(`A user has been muted... but their DMs are locked. The user will be muted permanently.`)
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);

    let channel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
    if (!channel) return message.reply("Please create a mute log channel first!");

    let muteembed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setTitle("Mute executed")
        .setColor("#000000")
        .setTimestamp(new Date())
        .setFooter("User ID: " + tomute.id, footer[index])
        .addField("Muted User: " + tomute.user.username, "Muted in: " + message.channel)
        .addField("Length: Permanent", "=========================")
        .addField("Reason: ", reason);

    channel.send({embed: muteembed});

    tomute.roles.add(muterole.id)
            .catch(console.error)
};

module.exports.config = {
    name: "mute",
    description: "Permanently mutes a user.",
    usage: "mute <user> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`reason`: Reason for banning [String]",
    permission: "Moderator"
};
