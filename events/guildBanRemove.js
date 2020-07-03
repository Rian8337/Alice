module.exports.run = (client, guild, user) => {
    client.subevents.get("unbanNotification").run(guild, user)
};

module.exports.config = {
    name: "guildBanRemove"
};