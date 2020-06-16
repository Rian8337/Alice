module.exports.run = (client, guild, user, maindb, alicedb) => {
    // Member lounge ban detection
    client.subevents.get("bannedUserLoungeBan").run(guild, user, alicedb);

    // Userbind wipe
    client.subevents.get("bindWipe").run(client, guild, user, maindb, alicedb)
};

module.exports.config = {
    name: "guildBanAdd"
};