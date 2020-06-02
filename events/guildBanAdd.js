module.exports.run = (client, guild, user, alicedb) => {
    // Member lounge ban detection
	client.subevents.get("banneduserloungeban").run(guild, user, alicedb)
};

module.exports.config = {
    name: "guildBanAdd"
};