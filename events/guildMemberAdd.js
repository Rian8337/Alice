module.exports.run = (client, member, alicedb) => {
    // Welcome message for international server
	client.subevents.get("joinMessage").run(member);

	// Lounge ban detection
	client.subevents.get("newMemberLoungeBan").run(client, member, alicedb);

	// Mute continuation
	client.subevents.get("newMemberMute").run(member, alicedb);
}

module.exports.config = {
    name: "guildMemberAdd"
};