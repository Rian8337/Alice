var Discord = require("discord.js");
var config = require("../config.json");

function isEligible(member) {
    var res = 0;
    var eligibleRoleList = config.mute_perm; //mute_permission
    //console.log(eligibleRoleList)
    eligibleRoleList.forEach((id) => {
        if(member.roles.has(id[0])) res = id[1]
    });
    return res;
}

function isImmuned(member) {
    var res = 0;
    var immunedRoleList = config.mute_immune;
    immunedRoleList.forEach((id) => {
        if(member.roles.has(id)) {console.log("immune role found"); res = 1}
    });
    return res;
}

function timeconvert (num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
}

module.exports.run = async (client, message, args) => {
    try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
    var timeLimit = isEligible(message.member);
    if (timeLimit == 0) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!tomute) return;
    if (isImmuned(tomute)) return message.channel.send("❎ **| I'm sorry, this user cannot be muted.**");

    let reason = args.slice(2).join(" ");

    let mutetime = args[1];
    if (!mutetime) return message.channel.send("❎ **| Hey, at least tell me how long do I need to mute this user!**");
    if (isNaN(mutetime)) return message.channel.send("❎ **| I'm sorry, the time limit is not valid. Only send number of seconds.**");
    if (mutetime < 1) return message.channel.send("❎ **| I'm sorry, you can only mute for at least 1 second.**");
    if (mutetime == Infinity) return message.channel.send("❎ **| To infinity and beyond! Seriously though, please enter a valid mute time! You can use `a!mute` (Moderator only) to permanently mute someone instead.**");
    if (timeLimit != -1 && timeLimit < mutetime) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to mute a user for longer than " + timeLimit + "seconds.**");

    if (!reason) return message.channel.send("❎ **| Hey, can you give me your reason for muting?**");

    let muterole = message.guild.roles.find(`name`, "elaina-muted");
    //start of create role
    if(!muterole){
        try{
            muterole = await message.guild.createRole({
                name: "elaina-muted",
                color: "#000000",
                permissions:[]
            });
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        }catch(e){
            console.log(e.stack);
        }
    }
    //end of create role

    message.delete().catch(O_o=>{});

    try{
        await tomute.send(`Hi! You've been muted for ${mutetime} seconds. Sorry!`)
    } catch (e) {
        message.channel.send(`A user has been muted... but their DMs are locked. The user will be muted for ${mutetime} seconds`)
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);

    let muteembed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setTitle("Mute executed")
        .setColor("#000000")
        .setTimestamp(new Date())
        .setFooter("User ID: " + tomute.id, footer[index])
        .addField("Muted User: " + tomute.user.username, "Muted in: " + message.channel)
        .addField("Length: " + timeconvert(mutetime), "=========================")
        .addField("Reason: ", reason);

    let channel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!channel) return message.reply("Please create a mute log channel first!");
    channel.send(muteembed).then(msg => {
        tomute.addRole(muterole.id)
            .catch(console.error);

        setTimeout(() => {
            tomute.removeRole(muterole.id);
            muteembed.setFooter("User ID: " + tomute.id + " | User unmuted", footer[index]);
            msg.edit(muteembed)
        }, mutetime * 1000)
    })
};

module.exports.config = {
    description: "Temporarily mutes a user.",
    usage: "tempmute <user> <duration> <reason>",
    detail: "`user`: The user to mute [UserResolvable (mention or user ID)]\n`duration`: Time to mute in seconds [Float]\n`reason`: Reason for muting [String]",
    permission: "Helper"
};

module.exports.help = {
    name: "tempmute"
};
