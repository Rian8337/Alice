module.exports.run = (client, guild, user, alicedb) => {
    client.subevents.get("unbanNotification").run(guild, user, alicedb);
};

module.exports.config = {
    name: "guildBanRemove"
};