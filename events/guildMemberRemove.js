module.exports.run = (client, member, maindb, alicedb) => {
    if (member.guild.id !== '316545691545501706') {
        return;
    }
    if (!member.roles.cache.has("353397345636974593")) {
        return;
    }

    // Check if player is in clan
    client.subevents.get("clanCheck").run(client, member, maindb);
};

module.exports.config = {
    name: "guildMemberRemove"
};
