const Discord = require('discord.js');
const config = require("../../config.json");

function isEligible(member) {
    let res = 0;
    const eligibleRoleList = config.verify_perm; //verify_permission
    eligibleRoleList.forEach((id) => {
        if (member.roles.cache.has(id)) {
            res = 1;
        }
    });
    return res;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (!isEligible(message.member)) {
        return message.channel.send("❎ **| You don't have permission to use this.**");
    }
    const verifying = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch();
    if (!verifying) {
        return message.channel.send("❎ **| Hey, please mention a valid user to verify!**");
    }
    const memberrole = message.guild.roles.cache.find((r) => r.name === 'Member');
    if (!memberrole) {
        return message.channel.send("❎ **| I'm sorry, I couldn't find the member role!**");
    }

    if (!verifying.roles.cache.has(memberrole.id)) {
        message.channel.send("✅ **| User has been verified.**");
        verifying.roles.add(memberrole).catch(console.error);
    } else {
        message.channel.send("❎ **| User is already verified!**");
    }
};

module.exports.config = {
    name: "verify",
    description: "Verifies a user in the international server.",
    usage: "verify <user>",
    detail: "`user`: The user to verify [UserResolvable (mention or user ID)]",
    permission: "Helper"
};