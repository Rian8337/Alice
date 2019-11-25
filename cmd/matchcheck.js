var mongodb = require('mongodb');

function statusread(status) {
	let code = 0;
	switch (status) {
		case "scheduled": code = 16776960; break;
		case "on-going": code = 65280; break;
		case "completed": code = 16711680; break;
	}
	return code;
}

module.exports.run = (client, message, args, maindb) => {
	let id = args[0];
	if (id) {
		let matchdb = maindb.collection("matchinfo");
		let query = { matchid: id };
		matchdb.find(query).toArray(function(err, res) {
			if (err) throw err;
			if (!res[0]) {
				message.channel.send("Can't found the match");
			}
			else {
				if (err) throw err;
				let name = res[0].name;
				let t1name = res[0].team[0][0];
				let t2name = res[0].team[1][0];
				let t1score = res[0].team[0][1];
				let t2score = res[0].team[1][1];
				let status = statusread(res[0].status);
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
				message.channel.send({ embed });
			}
		});
	}
	else message.channel.send("Please specify match id");
	
}

module.exports.help = {
	name: "matchcheck"
}