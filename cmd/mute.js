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

module.exports.run = async (client, message, args) => {
    try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
    var timeLimit = isEligible(message.member);
    if (timeLimit != -1) return message.channel.send("❎  **| I'm sorry, you don't have the permission to use this.**");

    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!tomute) return;
    if (isImmuned(tomute)) return message.channel.send("❎  **| I'm sorry, this user cannot be muted.**");

    let reason = args.slice(1).join(" ");

    if (!reason) return message.channel.send("❎  **| Hey, can you give me your reason for muting?**");

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
        await tomute.send(`Hi! You've been muted permanently. Sorry!`)
    } catch (e) {
        message.channel.send(`A user has been muted... but their DMs are locked. The user will be muted permanently.`)
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);

    let channel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!channel) return message.reply("Please create a mute log channel first!");

    let muteembed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setTitle("Mute executed")
        .setColor("#000000")
        .setTimestamp(new Date())
        .setFooter("User ID: " + tomute.id, footer[index])
        .addField("Muted User: " + tomute.user.username, "Muted in: " + message.channel)
        .addField("Length: Permanent", "=========================")
        .addField("Reason: ", reason);

    channel.send(muteembed);

    tomute.addRole(muterole.id)
            .catch(console.error);
};

module.exports.help = {
    name: "mute"
};