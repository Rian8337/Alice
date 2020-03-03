const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message, args, maindb) => {
	let uid = args[0];
	if (!uid) return message.channel.send("❎ **| What am I supposed to bind? Give me a uid!**");
	if (isNaN(uid)) return message.channel.send("❎ **| Invalid uid.**");
	let binddb = maindb.collection("userbind");
	let query = {discordid: message.author.id};
	new osudroid.PlayerInfo().get({uid: uid}, player => {
		if (!player.name) return message.channel.send("❎ **| I'm sorry, it looks like the user doesn't exist!**");
		let name = player.name;
		binddb.find({uid: uid}).toArray(function (err, res) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receivng response from database. Please try again!**")
			}
			if (res[0] && message.author.id != res[0].discordid) return message.channel.send("❎ **| I'm sorry, this uid is already binded!**");
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
			binddb.find(query).toArray(function (err, res) {
				if (err) {
					console.log(err);
					return message.channel.send("❎ **| I'm sorry, I'm having trouble receivng response from database. Please try again!**")
				}
				if (!res[0]) {
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
	})
};

module.exports.config = {
	name: "userbind",
	description: "Binds a user to a specific uid.",
	usage: "userbind <uid>",
	detail: "`uid`: The uid to bind [Integer]",
	permission: "None"
};
