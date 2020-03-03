const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.cache.get("381965207427219456")) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	if (args.length <= 4) return message.channel.send("❎ **| I'm sorry, I need more input!**");
	let id = args[0]; let i = 1; let name  = ""; let inName = false;
	for (i; i < args.length; i++) {
		if (args[i].includes("(")) inName = true;
		if (inName) name = name + args[i] + " ";
		if (args[i].includes(")")) break;
	}
	i++;
	let team = [];
	team.push([args[i], 0]);
	team.push([args[i+1], 0]);
	i+=2;
	if ((args.length-i)%4!=0 && (args.length-i) <= 0) return message.channel.send("❎ **| I'm sorry, I need more input!**");
	let player = [];
	let nP = 0;
	while (i < args.length) {
		player.push([args[i], args[i+1]]);
		nP++;
		i += 2;
	}
	let result = [];
	let status = "scheduled";
	for (let k = 0; k < nP; k++) result.push([]);
	let matchdb = maindb.collection("matchinfo");
	let query = { matchid: id };
	let matchinfo = {
		matchid: id,
		name: name,
		team: team,
		player: player,
		status: status,
		result: result
	};
	matchdb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (res[0]) return message.channel.send("❎ **| I'm sorry, a match with the same match ID already exist!**");
		matchdb.insertOne(matchinfo, function(err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			console.log("match added");
			message.channel.send(`✅ **| Successfully added match \`${id}\`.**`)
		})
	})
};

module.exports.config = {
	name: "matchadd",
	description: "Adds a match.",
	usage: "matchadd <match ID> <player/team> <uid> <...>",
	detail: "`match ID`: The match's ID [String]\n`player/team`: Player or team name [String]\n`uid`: The uid of player [Integer]",
	permission: "Referee"
};
