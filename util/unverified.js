const { Client } = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Client} client 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, alicedb) => {
    const guild = client.guilds.cache.get("316545691545501706");
    const curtime = Date.now();
    const unverified = guild.members.cache.filter((member) => member.roles.cache.size === 0 && !member.roles.cache.find((r) => r.name === 'Member') && !member.user.bot && (member.joinedTimestamp != null || member.joinedAt != null) && curtime - member.joinedTimestamp > 604800000);
    if (unverified.size === 0) {
        return;
    }
    
    for await (const [, member] of unverified.entries()) {
        member.kick(`Unverified prune (user joined at ${member.joinedAt.toUTCString()})`).catch(console.error);
    }
    console.log(`Pruned ${unverified.size} user(s)`);
};

module.exports.config = {
    name: "unverified",
    description: "Kicks users that are unverified for a week or longer after their join time.",
    usage: "None",
    detail: "None",
    permission: "None"
};
