var mongodb = require('mongodb');

module.exports.run = (client, message, args, maindb) => {
	if (message.member.roles.find("name", "Referee")) {
		if (args.length > 4) {
			let id = args[0]; var i = 1; let name  = ""; let inName = false;
			for (i; i < args.length; i++) {
				if (args[i].includes("(")) inName = true;
				if (inName) name = name + args[i] + " ";
				if (args[i].includes(")")) break;
			}
			i++;
			var team = [];
			team.push([args[i], 0]);
			team.push([args[i+1], 0]);
			i+=2;
			if ((args.length-i)%4==0 && (args.length-i) > 0) {
				var player = [];
				let nP = 0;
				while (i < args.length) {
					player.push([args[i], args[i+1]]);
					nP++;
					i += 2;
				}
				var maps = [];
				var result = [];
				var status = "scheduled";
				for (var k = 0; k < nP; k++) result.push([]);
				let matchdb = maindb.collection("matchinfo");
				let query = { matchid: id };
				var matchinfo = {
					matchid: id,
					name: name,
					team: team,
					player: player,
					status: status,
					result: result
				}
				matchdb.find(query).toArray(function(err, res) {
					if (err) throw err;
					if (!res[0]) {
						matchdb.insertOne(matchinfo, function(err, res) {
							if (err) throw err;
							console.log("match added");
							message.channel.send("Match added");
						});
					}
					else {
						message.channel.send("A match with the same id has already existed");
					}
				});
			}
			else message.channel.send("Not enough input");
		}
		else message.channel.send("Not enough input");
	}
	else message.channel.send("You don't have enough permission to use this :3");
}

module.exports.help = {
	name: "matchadd"
}