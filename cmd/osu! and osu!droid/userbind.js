const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');



module.exports.run = async (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs!**");
	let inter_server = client.guilds.cache.get("316545691545501706");
	let member = inter_server.member(message.author.id);
	if (!member) return message.channel.send("❎ **| I'm sorry, you must be a verified member of the osu!droid International Discord server to use this command!**");
	let role = member.roles.cache.find(r => r.name === "Member");
	if (!role) {
		if (message.guild.id === '316545691545501706') return message.channel.send("❎ **| I'm sorry, you must be a verified member to use this command!**");
		else return message.channel.send("❎ **| I'm sorry, you must be a verified member in the osu!droid International Discord server to use this command!**");
	}

	let uid = args[0];
	if (!uid) return message.channel.send("❎ **| What am I supposed to bind? Give me a uid!**");
	if (isNaN(uid)) return message.channel.send("❎ **| Invalid uid.**");
	let binddb = maindb.collection("userbind");
	let query = {discordid: message.author.id};
	const player = await new osudroid.PlayerInfo().get({uid: uid}).catch(console.error);
	if (!player.name) return message.channel.send("❎ **| I'm sorry, it looks like the user doesn't exist!**");
	let name = player.name;

	binddb.findOne({uid: uid}, function (err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receivng response from database. Please try again!**")
		}
		if (res && message.author.id !== res.discordid) return message.channel.send("❎ **| I'm sorry, this uid is already binded!**");
		let bind = {
			discordid: message.author.id,
			uid: uid,
			username: name,
			pptotal: 0,
			playc: 0,
			pp: []
		};
		let updatebind = {
			$set: {
				discordid: message.author.id,
				uid: uid,
				username: name
			}
		};
		binddb.findOne(query, function (err, res) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receivng response from database. Please try again!**")
			}
			if (!res) {
				binddb.insertOne(bind, function (err) {
					if (err) {
						console.log(err);
						return message.channel.send("❎ **| I'm sorry, I'm having trouble receivng response from database. Please try again!**")
					}
					console.log("bind added");
					message.channel.send("✅ **| Haii <3, binded <@" + message.author.id + "> to uid " + uid + ".**");
				})
			} else {
				binddb.updateOne(query, updatebind, function (err) {
					if (err) {
						console.log(err);
						return message.channel.send("❎ **| I'm sorry, I'm having trouble receivng response from database. Please try again!**")
					}
					console.log("bind updated");
					message.channel.send("✅ **| Haii <3, binded <@" + message.author.id + "> to uid " + uid + ".**");
				})
			}
		})
	})
};

module.exports.config = {
	name: "userbind",
	description: "Binds a user to a specific uid.",
	usage: "userbind <uid>",
	detail: "`uid`: The uid to bind [Integer]",
	permission: "None"
};