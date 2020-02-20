const Discord = require("discord.js");
const config = require("../config.json");

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mudae_ban; //mute_permission
    eligibleRoleList.forEach((id) => {
        if(member.roles.has(id[0])) res = id[1]
    });
    return res;
}

function isImmuned(member) {
    let res = 0;
    let immunedRoleList = config.mudae_immune;
    immunedRoleList.forEach((id) => {
        if(member.roles.has(id)) {console.log("Immune role found"); res = 1}
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
    if (message.channel instanceof Discord.DMChannel || message.member.roles == null) return;
    if (message.guild.id != "635532651029332000") return;

    let timeLimit = isEligible(message.member);
    if (timeLimit == 0) return message.channel.send("You don't have permission to use this");

    let toban = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!toban) return;
    if (isImmuned(toban)) return message.channel.send("You can't ban this user");
    let reason = args.slice(2).join(" ");

    let bantime = args[1];
    if (!bantime) return message.channel.send("Ban time is not defined");
    if (isNaN(bantime)) return message.channel.send("Invalid time limit, only send number of seconds");
    if (bantime < 1) return message.channel.send("Invalid time limit, minimum ban time is 1 second");
    if (timeLimit != -1 && timeLimit < bantime) return message.channel.send("You don't have enough permission to ban a user for longer than " + timeLimit + "s");

    if (!reason) return message.channel.send("Please add a reason.");

    let banrole = message.guild.roles.find(r => r.name === 'mudae-ban');
    //start of create role
    if (!banrole) {
        try {
            banrole = await message.guild.createRole({
                name: "mudae-ban",
                color: "#000000",
                permissions:[]
            });
            message.guild.channels.forEach(channel => {
                channel.overwritePermissions(banrole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                }).catch(console.error)
            })
        } catch(e) {
            console.log(e.stack);
        }
    }
    //end of create role

    message.delete().catch(O_o=>{});

    try{
        await toban.send(`Hi! You've been Mudae-banned for ${bantime} seconds. Sorry!`)
    } catch (e) {
        message.channel.send(`A user has been Mudae-banned... but their DMs are locked. They will be banned for ${bantime} seconds`)
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
    let banembed = new Discord.RichEmbed()
        .setDescription(`Mudae ban executed by ${message.author}`)
        .setColor("#ffa826")
        .setFooter("Alice Synthesis Thirty", footer[index])
        .addField("Banned User: " + toban.user.username, "Banned in: " + message.channel)
        .addField("Length: " + timeconvert(bantime), "=========================")
        .addField("Reason: ", reason);

    let channel = message.guild.channels.get("648445681551409152");
    if (!channel) return message.reply("Please create a mute log channel first!");
    channel.send(banembed);

    toban.addRole(banrole.id)
        .catch(console.error);

    let mudaerole = message.guild.roles.find(r => r.name === "Mudae Player");
    toban.removeRole(mudaerole.id)
        .catch(console.error);

    setTimeout(function(){
        toban.removeRole(banrole.id);
        toban.addRole(mudaerole.id)
    }, bantime * 1000)
};

module.exports.config = {
    name: "mudae-ban",
    description: "Temporarily bans a user from Mudae (only applies in droid cafe).",
    usage: "mudaeban <user> <duration> <reason>",
    detail: "`user`: The user to ban [UserResolvable (mention or user ID)]\n`duration`: Ban duration in seconds [Float]\n`reason`: Reason for banning [String]",
    permission: "Manager"
};
