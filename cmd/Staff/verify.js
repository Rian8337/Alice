const Discord = require('discord.js');
const config = require("../../config.json");

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.verify_perm; //verify_permission
    eligibleRoleList.forEach((id) => {
        if(member.roles.cache.has(id)) res = 1;
    });
    return res
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not allowed in DMs");
    if (!isEligible(message.member)) return message.channel.send("❎ **| You don't have permission to use this.**");
    const verifying = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(console.error);
    if (!verifying) return message.channel.send("❎ **| Hey, please mention a valid user to verify!**");
    let memberrole = message.guild.roles.cache.find((r) => r.name === 'Member');
    if (!memberrole) return message.channel.send("Role not found");

    if (!verifying.roles.cache.has(memberrole.id)) {
        message.channel.send("✅ **| User has been verified.**");
        verifying.roles.add(memberrole).catch(console.error)
    }
    else message.channel.send("❎ **| User is already verified!**")
};

module.exports.config = {
    name: "verify",
    description: "Verifies a user.",
    usage: "verify <user>",
    detail: "`user`: The user to verify [UserResolvable (mention or user ID)]",
    permission: "Helper"
};
