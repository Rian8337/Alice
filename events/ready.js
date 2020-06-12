module.exports.run = (client, maindb, alicedb) => {
    console.log("Discord API connection established\nAlice Synthesis Thirty is up and running");
	let maintenance = require('./message').maintenance;
	
	const activity_list = [
		["Underworld Console", "PLAYING"],
		["Rulid Village", "WATCHING"],
		["a!help", "LISTENING"],
		["Dark Territory", "WATCHNG"],
		["in Axiom church", "PLAYING"],
		["with Integrity Knights", "PLAYING"],
		["flowers from my beloved Fragnant Olive", "WATCHING"],
		["Uncle Bercoulli's orders", "LISTENING"],
		["Centoria", "WATCHING"],
		["Human Empire", "WATCHING"]
	];

	// Custom activity
	setInterval(() => {
		maintenance = require('./message').maintenance;
		if (maintenance) return;
		const index = Math.floor(Math.random() * activity_list.length);
		client.user.setActivity(activity_list[index][0], {type: activity_list[index][1]})
	}, 10000);
	
    // Daily reset, unverified prune, birthday tracking
	setInterval(() => {
		client.utils.get("unverified").run(client, alicedb);
		client.utils.get("dailyreset").run(alicedb);
                client.utils.get('birthdaytrack').run(client, maindb, alicedb);
	}, 10000);
	
	// Utilities
	setInterval(() => {
		maintenance = require('./message').maintenance;
		console.log("Utilities running");
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
