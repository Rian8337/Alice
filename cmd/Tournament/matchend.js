const Discord = require('discord.js');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner && !["316545691545501706", "526214018269184001"].includes(message.guild?.id) && !message.member?.roles.cache.find((r) => r.name === 'Referee')) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, can you give me a match ID?**");
	let matchdb = maindb.collection("matchinfo");
	let query = {matchid: id};
	matchdb.find(query).toArray(function (err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res[0]) return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
		if (res[0].status == "completed") return message.channel.send("❎ **| I'm sorry, the match has ended!**");
		let update = {
			$set: {
				status: "completed"
			}
		};
		matchdb.updateOne(query, update, function (err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			console.log("match ended");
			let name = res[0].name;
			let t1name = res[0].team[0][0];
			let t2name = res[0].team[1][0];
			let t1score = res[0].team[0][1];
			let t2score = res[0].team[1][1];
			const embed = {
				"title": name,
				"color": 16711680,
				"fields": [
					{
						"name": t1name,
						"value": "**" + t1score + "**",
						"inline": true
					},
					{
						"name": t2name,
						"value": "**" + t2score + "**",
						"inline": true
					}
				]
			};
			message.channel.send(`✅ **| Successfully ended match \`${id}\`**`, {embed: embed});
		})
	})
};

module.exports.config = {
	name: "matchend",
	description: "Ends a match.",
	usage: "matchend <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "Referee"
};
