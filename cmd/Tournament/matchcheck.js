const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");

function statusread(status) {
	let code = 0;
	switch (status) {
		case "scheduled": code = 16776960; break;
		case "on-going": code = 65280; break;
		case "completed": code = 16711680
	}
	return code
}

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, can you give me a match ID?**");
	let matchdb = maindb.collection("matchinfo");
	let query = { matchid: id };
	matchdb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
		let name = res.name;
		let t1name = res.team[0][0];
		let t2name = res.team[1][0];
		let t1score = res.team[0][1];
		let t2score = res.team[1][1];
		let status = statusread(res.status);
		const embed = {
			"title": name,
			"color": status,
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
		message.channel.send({embed: embed}).catch(console.error);
	});
};

module.exports.config = {
	name: "matchcheck",
	description: "Checks a match's status.",
	usage: "matchcheck <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "None"
};
