module.exports.run = (guild, user, alicedb) => {
    client.subevents.get("unbanNotification").run(guild, user, alicedb);
};

module.exports.config = {
    name: "guildBanRemove"
};