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
	try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
	if (message.member.roles.find("name", "Referee")) {
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
					if (res[0].status == "completed") message.channel.send("Match has already ended");
					else {
						var update = {
							$set: {
								status: "completed"
							}
						}
						matchdb.updateOne(query, update, function(err, res2) {
							if (err) throw err;
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
							message.channel.send("Match ended", { embed });
						});
					}
				}
			});
		}
		else message.channel.send("Please specify match id");
		}
	else message.channel.send("You don't have enough permission to use this :3");
};

module.exports.config = {
	description: "Ends a match.",
	usage: "matchend <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "Referee"
};

module.exports.help = {
	name: "matchend"
};
