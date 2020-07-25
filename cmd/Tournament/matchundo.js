const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb, alicedb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, can you give me a match ID?**");
	let matchdb = maindb.collection("matchinfo");
	let resultdb = alicedb.collection("matchdata");
	let query = {matchid: id};
	matchdb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
		let t1score = 0;
		let t2score = 0;
		let result = res.result;
		if (!result[0]) return message.channel.send("❎ **| I'm sorry, this match doesn't have any result yet!**");
		for (let i in result) {
			if (i % 2 == 0) t1score += result[i].pop();
			else t2score += result[i].pop();
		}
		res.team[0][1] -= (t1score > t2score);
		res.team[1][1] -= (t2score > t1score);
		let update = {
			$set: {
				team: res.team,
				result: result
			}
		};
		matchdb.updateOne(query, update, function(err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			message.channel.send(`✅ **| Successfully reverted match \`${id}\`'s result.**`);

			resultdb.findOne(query, (err, r_res) => {
				if (err) return console.log(err);
				if (!r_res) return;
				
				const scores = r_res.scores;
				scores.pop();
				const match_result = r_res.result;
				match_result[0].points -= (t1score > t2score);
				if (match_result[1]) match_result[1].points -= (t2score > t1score);

				update = {
					$set: {
						result: match_result,
						scores: scores
					}
				};
				resultdb.updateOne(query, update, err => {
					if (err) return console.log(err);
				})
			})
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