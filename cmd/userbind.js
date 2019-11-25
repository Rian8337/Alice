const mongodb = require('mongodb');
const http = require('http');

module.exports.run = (client, message, args, maindb) => {
	let uid = args[0];
	if (!uid) {message.channel.send("Your uid please!"); return;}
	if (!Number.isInteger(uid)) {message.channel.send("Invalid uid")}
	else {
		let name="";
		var options = {
			host: "ops.dgsrz.com",
			port: 80,
			path: "/profile.php?uid="+uid+".html"
		};

		var content = "";

		var req = http.request(options, function(res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
				content += chunk;
			});

			res.on("end", function () {
				const a = content;
				let b = a.split('\n'), c = [];
				for (x = 0; x < b.length; x++) {
					if (b[x].includes('h3 m-t-xs m-b-xs')) {
						b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
						b[x]=b[x].replace('<\/div>',"");
						b[x]=b[x].trim();
						name = b[x]
					}
				}
				let binddb = maindb.collection("userbind");
				let query = { discordid: message.author.id };
				var bind = {
					discordid: message.author.id,
					uid: uid,
					username: name,
					pptotal: 0,
					pp: []
				};
				var updatebind = {
					$set: {
						discordid: message.author.id,
						uid: uid,
						username: name
					}
				};
				binddb.find(query).toArray(function(err, res) {
					if (err) throw err;
					if (!res[0]) {
						binddb.insertOne(bind, function(err, res) {
							if (err) throw err;
							console.log("bind added");
							message.channel.send("Haii <3, binded <@"+message.author.id+"> to uid "+uid);
						});
					}
					else {
						binddb.updateOne(query, updatebind, function(err, res) {
							if (err) throw err;
							console.log("bind updated");
							message.channel.send("Haii <3, binded <@"+message.author.id+"> to uid "+uid);
						});
					}
				});
			});
		});
		req.end();
	}
};

module.exports.help = {
	name: "userbind"
};
