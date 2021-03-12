module.exports.run = (client, oldMember, newMember, alicedb) => {
    // Introduction message
	client.subevents.get("introduction").run(oldMember, newMember);

	// Lounge ban detection
	client.subevents.get("roleAddLoungeBanDetection").run(newMember, alicedb);

	// Member manual unmute detection
	client.subevents.get("memberUnmute").run(oldMember, newMember, alicedb);
};

module.exports.config = {
	name: "guildMemberUpdate"
};
