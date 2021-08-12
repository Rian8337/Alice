const {Client} = require('discord.js')
const config = require('../config.json');
const { Db } = require('mongodb');

/**
 * @param {Client} client 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, maindb, alicedb) => {
	console.log("Discord API connection established\nAlice Synthesis Thirty is up and running");
	
	const disabledCommandsAndUtils = await alicedb.collection("channelsettings").find({}, {projection: {_id: 0, channelID: 1, disabledCommands: 1, disabledUtils: 1}}).toArray();
	require('./message').setDisabledCommandsAndUtils(disabledCommandsAndUtils);

	let maintenance = require('./message').maintenance;
	
	const activity_list = [
		["Underworld Console", "PLAYING"],
		["Rulid Village", "WATCHING"],
		[config.prefix + "help", "LISTENING"],
		["Dark Territory", "WATCHNG"],
		["in Axiom church", "PLAYING"],
		["with Integrity Knights", "PLAYING"],
		["flowers from my beloved Fragnant Olive", "WATCHING"],
		["Uncle Bercoulli's orders", "LISTENING"],
		["Centoria", "WATCHING"],
		["Human Empire", "WATCHING"],
		["The Great War of Underworld", "COMPETING"]
	];

	// Custom activity, daily reset, and unverified prune
	setInterval(() => {
		maintenance = require('./message').maintenance;
		client.utils.get("unverified").run(client, alicedb);
		if (maintenance) {
			return;
		}
		client.utils.get("dailyreset").run(client, alicedb);
		client.utils.get('birthdaytrack').run(client, maindb, alicedb);
		const index = Math.floor(Math.random() * activity_list.length);
		client.user.setActivity(activity_list[index][0], {type: activity_list[index][1]});
	}, 10000);
	
	// Utilities
	setInterval(() => {
		maintenance = require('./message').maintenance;
		if (!maintenance) {
			console.log("Utilities running");
			client.utils.get("trackfunc").run(client, maindb);
			// client.utils.get("clantrack").run(client, maindb, alicedb);
			client.utils.get("dailytrack").run(client, maindb, alicedb);
			client.utils.get("weeklytrack").run(client, maindb, alicedb);
			client.utils.get("auctiontrack").run(client, maindb, alicedb);
		}
	}, 600000);
	
	// Clan rank update
	setInterval(() => {
		if (!maintenance) {
			client.utils.get("clanrankupdate").run(maindb);
		}
	}, 1200000);

	// Occasional report command broadcast
	const nextReportBroadcast = (await alicedb.collection("playerpoints").findOne({discordid: "386742340968120321"})).nextReportBroadcast;
	setTimeout(() => {
		if (!maintenance) {
			client.utils.get("reportbroadcast").run(client);
		}
		setInterval(async () => {
			await alicedb.collection("playerpoints").updateOne({discordid: "386742340968120321"}, {$inc: {nextReportBroadcast: 3600}});
			if (!maintenance) {
				client.utils.get("reportbroadcast").run(client);
			}
		}, 3600000);
	}, Math.max(1, nextReportBroadcast * 1000 - Date.now()));
	

	// Mudae role assignment reaction-based on droid cafe
	client.subevents.get("mudaeRoleReaction").run(client);

	// Challenge role assignment (reaction-based)
	client.subevents.get("challengeRoleReaction").run(client);

	// Continue mutes
	client.subevents.get("muteResume").run(client, alicedb);
};

module.exports.config = {
    name: "ready"
};
