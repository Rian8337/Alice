module.exports.run = client => {
    console.log("Discord API connection established\nAlice Synthesis Thirty is up and running");
    client.user.setActivity("a!help");
	
    // Daily reset and unverified prune
	setInterval(() => {
		client.utils.get("unverified").run(client, alicedb);
		client.utils.get("dailyreset").run(alicedb)
	}, 10000);
	
	// Utilities
	setInterval(() => {
		console.log("Utilities running");
		client.utils.get('birthdaytrack').run(client, maindb, alicedb);
		if (!maintenance) {
			client.utils.get("trackfunc").run(client, maindb);
			client.utils.get("clantrack").run(client, maindb, alicedb);
			client.utils.get("dailytrack").run(client, maindb, alicedb);
			client.utils.get("weeklytrack").run(client, maindb, alicedb);
			client.utils.get("auctiontrack").run(client, maindb, alicedb)
		}
	}, 600000);
	
	// Clan rank update
	setInterval(() => {
		if (!maintenance) client.utils.get("clanrankupdate").run(maindb)
	}, 1200000);

	// Mudae role assignment reaction-based on droid cafe
	client.subevents.get("mudaerolereaction").run(client)

	// Challenge role assignment (reaction-based)
	client.subevents.get("challengerolereaction").run(client)
};

module.exports.config = {
    name: "ready"
};