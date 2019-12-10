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
    var timeLimit = isEligible(message.member);
    if (timeLimit == 0) return message.channel.send("You don't have permission to use this");

    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!tomute) return;
    if (isImmuned(tomute)) return message.channel.send("You can't mute this user");

    let reason = args.slice(2).join(" ");

    let mutetime = args[1];
    if (!mutetime) return message.channel.send("Mute time is not defined");
    if (isNaN(mutetime)) return message.channel.send("Invalid time limit, only send number of seconds");
    if (mutetime < 1) return message.channel.send("Invalid time limit, minimum mute time is 1 second");
    if (timeLimit != -1 && timeLimit < mutetime) return message.channel.send("You don't have enough permission to mute an user for longer than " + timeLimit + "s");

    if (!reason) return message.channel.send("Please add a reason.");

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
        .addField("Length: " + mutetime + "s", "=========================")
        .addField("Reason: ", reason);

    let channel = message.guild.channels.find(c => c.name === config.management_channel);
    if (!channel) return message.reply("Please create a mute log channel first!");
    channel.send(muteembed);

    tomute.addRole(muterole.id)
        .catch(console.error);

    setTimeout(() => {
        tomute.removeRole(muterole.id);
        muteembed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setTitle("User unmuted")
            .setColor("#000000")
            .setTimestamp(new Date())
            .setFooter("User ID: " + tomute.id, footer[index])
            .addField("Unmuted user: " + tomute.user.username, "Muted in: " + message.channel)
            .addField("Mute length: " + mutetime + "s", "=========================")
            .addField("Mute reason: ", reason);
        channel.send(muteembed)
    }, mutetime * 1000)
};

module.exports.help = {
    name: "tempmute"
};
