const osudroid = require('osu-droid');

module.exports.run = async (client, message, args) => {
	let username = args[0];
	if (!username) return message.channel.send("❎ **| Hey, can you at least tell me what username I need to search for?**");
	const player = await new osudroid.PlayerInfo().get({username: username});
	if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the user with such username. Please make sure that the name is correct (including upper and lower case), or perhaps osu!droid server is down?**");
	username = player.name;
	let uid = player.uid;
	let embed = {
		"title": username + "'s uid is " + uid,
		"color": 1900288,
		"url": "http://ops.dgsrz.com/profile.php?uid=" + uid
	};
	message.channel.send({embed: embed}).catch(console.error)
};

module.exports.config = {
	name: "profilesearch",
	description: "Searches for a user and retrieves the user's uid.",
	usage: "profilesearch <user>",
	detail: "`user`: The user to search, case sensitive [String]",
	permission: "None"
};