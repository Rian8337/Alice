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

module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not allowed in DMs");
    if (!isEligible(message.member)) return message.channel.send("❎ **| You don't have permission to use this.**");
    if (!args[0]) return message.channel.send("❎ **| Please specify the user to verify!**");

    let verifying = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let memberrole = message.guild.roles.find(r => r.name === 'Member');
    if(!memberrole) return message.channel.send("Role not found");
    console.log(verifying.id);

    verifying.addRole(memberrole.id).catch(console.error);
    if (!verifying.roles.has(memberrole.id)) message.channel.send("✅ **| User has been verified.**");
    else message.channel.send("❎ **| User is already verified!**")
};

module.exports.help = {
    name: "verify"
};
