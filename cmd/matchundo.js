const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, can you give me a match ID?**");
	let matchdb = maindb.collection("matchinfo");
	let query = {matchid: id};
	matchdb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res[0]) return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
		let t1score = 0;
		let t2score = 0;
		let result = res[0].result;
		if (!result[0]) return message.channel.send("❎ **| I'm sorry, this match doesn't have any result yet!**");
		for (let i in result) {
			if (i % 2 == 0) t1score += result[i].pop();
			else t2score += result[i].pop();
		}
		res[0].team[0][1] -= (t1score > t2score);
		res[0].team[1][1] -= (t2score > t1score);
		let update = {
			$set: {
				team: res[0].team,
				result: result
			}
		};
		matchdb.updateOne(query, update, function(err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			message.channel.send(`✅ **| Successfully reverted match \`${id}\`'s result.**`);
		})
	})
};

module.exports.config = {
	name: "matchundo",
	description: "Undo recent result in a match.",
	usage: "matchundo <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "Referee"
};
