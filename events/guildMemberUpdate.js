module.exports.run = (client, oldMember, newMember, alicedb) => {
    // Introduction message
	client.subevents.get("introduction").run(oldMember, newMember);

	// Lounge ban detection
	client.subevents.get("roleAddLoungeBanDetection").run(newMember, alicedb);
};

module.exports.config = {
	name: "guildMemberUpdate"
};
