var Discord = require('discord.js');
var config = require("../config.json");

function isEligible(member) {
    var res = 0;
    var eligibleRoleList = config.verify_perm; //verify_permission
    //console.log(eligibleRoleList)
    eligibleRoleList.forEach((id) => {
        if(member.roles.has(id)) res = 1;
    });
    return res;
}

module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not allowed in DMs");
    if (!isEligible(message.member)) return message.channel.send("❎ **| You don't have permission to use this.**");
    let verifying = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!verifying) return message.channel.send("❎ **| Hey, please mention a valid user to verify!**");
    let memberrole = message.guild.roles.find(r => r.name === 'Member');
    if (!memberrole) return message.channel.send("Role not found");
    
    if (!verifying.roles.has(memberrole.id)) {
        message.channel.send("✅ **| User has been verified.**");
        verifying.addRole(memberrole).catch(console.error)
    }
    else message.channel.send("❎ **| User is already verified!**")
};

module.exports.config = {
    description: "Verifies a user.",
    usage: "verify <user>",
    detail: "`user`: The user to verify [UserResolvable (mention or user ID)]",
    permission: "Helper"
};

module.exports.help = {
    name: "verify"
};
