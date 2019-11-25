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
    if (!isEligible(message.member)) {
        message.channel.send("You don't have permission to use this");
        return;
    }
    if (!args[0]) {
        message.channel.send("Please specify the user to verify");
        return;
    }
    let verifying = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let memberrole = message.guild.roles.find("name", "Member");
    if(!memberrole) {
        message.channel.send("Role not found");
        return;
    }
    console.log(verifying.id);
    verifying.addRole(memberrole.id).catch(console.error);
    if (!verifying.roles.has(memberrole.id)) {
        message.channel.send("User has been verified")
    }
};

module.exports.help = {
    name: "verify"
};