module.exports.run = (client, member, maindb, alicedb) => {
    if (member.guild.id !== '316545691545501706') return;
    if (!member.roles.cache.find(r => r.name === "Member")) return;

    // Check if player is in clan
    client.subevents.get("clanCheck").run(client, member, maindb)

    // Wipe bind
    // client.subevents.get("bindWipe").run(client, member.guild, member.user, maindb, alicedb)
};

module.exports.config = {
    name: "guildMemberRemove"
};
