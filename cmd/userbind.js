const http = require('http');
const droidapikey = process.env.DROID_API_KEY;

module.exports.run = (client, message, args, maindb) => {
	let uid = args[0];
	if (!uid) return message.channel.send("❎ **| What am I supposed to bind? Give me a uid!**");
	if (isNaN(uid)) {message.channel.send("❎ **| Invalid uid.**")}
	else {
		let binddb = maindb.collection("userbind");
		let query = {discordid: message.author.id};
		var options = {
			host: "ops.dgsrz.com",
			port: 80,
			path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
		};

		var content = "";

		var req = http.request(options, function (res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
				content += chunk;
			});
			res.on("error", err => {
				console.log(err);
				return message.channel.send("Error: Unable to retrieve user data. Please try again!")
			});
			res.on("end", function () {
				if (content.includes("<html>")) return message.channel.send("❎ **| Invalid uid.**");
				var headerres = content.split('<br>')[0].split(" ");
				if (headerres[0] == 'FAILED') return message.channel.send("❎ **| I'm sorry, it looks like the user doesn't exist!**");
				let name = headerres[2];
				let uid = headerres[1];
				binddb.find({uid: uid}).toArray(function (err, res) {
					if (err) throw err;
					if (res[0] && message.author.id != res[0].discordid) return message.channel.send("❎ **| I'm sorry, this uid is already binded!**");
					var bind = {
						discordid: message.author.id,
						uid: uid,
						username: name,
						pptotal: 0,
						playc: 0,
						pp: []
					};
					var updatebind = {
						$set: {
							discordid: message.author.id,
							uid: uid,
							username: name
						}
					};
					binddb.find(query).toArray(function (err, res) {
						if (err) {
							console.log(err);
							return message.channel.send("Error: Empty database response. Please try again!")
						}
						if (!res[0]) {
							binddb.insertOne(bind, function (err, res) {
								if (err) {
									console.log(err);
									return message.channel.send("Error: Empty database response. Please try again!")
								}
								console.log("bind added");
								message.channel.send("✅ **| Haii <3, binded <@" + message.author.id + "> to uid " + uid + ".**");
							})
						} else {
							binddb.updateOne(query, updatebind, function (err, res) {
								if (err) {
									console.log(err);
									return message.channel.send("Error: Empty database response. Please try again!")
								}
								console.log("bind updated");
								message.channel.send("✅ **| Haii <3, binded <@" + message.author.id + "> to uid " + uid + ".**");
							})
						}
					})
				})
			})
		});
		req.end()
	}
};

module.exports.config = {
	description: "Binds a user to a specific uid.",
	usage: "userbind <uid>",
	detail: "`uid`: The uid to bind [Integer]",
	permission: "None"
};

module.exports.help = {
	name: "userbind"
};
