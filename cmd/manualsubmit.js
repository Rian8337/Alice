var mongodb = require('mongodb');

function modValid(input, required) {
	input = input.trim();
	if (required == "nm") return input == "None";
	if (required == "hr") return input == "HardRock";
	if (required == "hd") return input == "Hidden";
	if (required == "ez") return input == "Easy";
	if (required == "dt") return (input == "DoubleTime" || input == "Hidden, DoubleTime");
	if (required == "fm") return ((input.includes("HardRock") || input.includes("Hidden") || input.includes("Easy"))&&(!(input.includes("DoubleTime") || input.includes("HalfTime"))))
	else return true;
}

function scoreCalc(score, maxscore, accuracy, misscount) {
	let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
	newscore = newscore - (misscount*0.003*newscore);
	return newscore;
}

module.exports.run = (client, message, args, maindb) => {
	if (!message.member.roles.find("name", "Referee")) {
		message.channel.send("You don't have enough permission to use this :3");
		return;
	}
	let id = args[0];
	if (id) {
		let matchdb = maindb.collection("matchinfo");
		let mapdb = maindb.collection("mapinfo");
		let query = { matchid: id };
		let pscore = [];
		let t1score = 0; let t2score = 0;
		let displayRes1 = ""; let displayRes2 = ""; let displayRes3 = ""; let color = 0;
		let poolid = id.split(".")[0];
		let poolquery = { poolid: poolid };
		matchdb.find(query).toArray(function(err, res) {
			if (err) throw err;
			if (!res[0]) {
				message.channel.send("Can't found the match");
				return;
			}
			let mapid = args[1];
			if (!mapid) {
				message.channel.send("Please specify map id");
				return;
			}
			mapdb.find(poolquery).toArray(function(err, poolres) {
				if (err) throw err;
				if (!poolres[0]) {
					message.channel.send("Can't found the pool");
					return;
				}
				if (mapid >= poolres[0].map.length || mapid < 0) {
					message.channel.send("Can't found the map");
					return;
				}
				if (args.length-2 < (res[0].result.length)*3) {
					message.channel.send("Not enough data");
					return;
				}
				for (var i = 0; i < res[0].player.length; i++) {
					pscore.push(scoreCalc(parseInt(args[2+i*3]),parseInt(poolres[0].map[mapid-1][2]),parseFloat(args[2+i*3+1]),parseInt(args[2+i*3+2])))
				}
				for (k in pscore) {
					if (k % 2 == 0) {
						t1score += pscore[k]
						if (pscore[k] == 0) displayRes1 += res[0].player[k][0] + " (N/A):\t0 - Failed\n"
						else displayRes1 += res[0].player[k][0] + " (N/A):\t" + Math.round(pscore[k]) + " - " + args[2+k*3+1] + " - " + args[2+k*3+2] + " miss\n"
					}
					else {
						t2score += pscore[k]
						if (pscore[k] == 0) displayRes2 += res[0].player[k][0] + " (N/A):\t0 - Failed\n"
						else displayRes2 += res[0].player[k][0] + " (N/A):\t" + Math.round(pscore[k]) + " - " + args[2+k*3+1] + " - " + args[2+k*3+2] + " miss\n"
					}
				}
				t1score = Math.round(t1score);
				t2score = Math.round(t2score);
				if (t1score > t2score) {displayRes3 = "Red Team won by " + Math.abs(t1score - t2score); color = 16711680;}
				else if (t1score < t2score) {displayRes3 = "Blue Team won by " + Math.abs(t1score - t2score); color = 262399;}
				else displayRes3 = "It's a Draw";
				var embed = {
					"title": poolres[0].map[mapid-1][1],
					"color": color,
					"thumbnail": {
						"url": "https://cdn.discordapp.com/embed/avatars/0.png"
					},
					"author": {
						"name": res[0].name
					},
					"fields": [
						{
							"name": "Red Team: " + t1score,
							"value": displayRes1
						},
						{
							"name": "Blue Team: " + t2score,
							"value": displayRes2
						},
						{
							"name": "=================================",
							"value": "**" + displayRes3 + "**"
						}
					]
				};
				message.channel.send({ embed });
				let name = res[0].name;
				let t1name = res[0].team[0][0];
				let t2name = res[0].team[1][0];
				let t1win = res[0].team[0][1] + (t1score > t2score);
				let t2win = res[0].team[1][1] + (t1score < t2score);
				res[0].team[0][1] = t1win;
				res[0].team[1][1] = t2win;
				let result = res[0].result;
				var embed = {
					"title": name,
					"color": 65280,
					"fields": [
						{
							"name": t1name,
							"value": "**" + t1win + "**",
							"inline": true
						},
						{
							"name": t2name,
							"value": "**" + t2win + "**",
							"inline": true
						}
					]
				};
				message.channel.send({ embed });
				for (p in pscore) result[p].push(pscore[p])
				let update = {
					$set: {
						status: "on-going",
						team: res[0].team,
						result: result
					}
				}
				matchdb.updateOne(query, update, function(err, res) {
					if (err) throw err;
					console.log("match info updated");
				});
			});
		});
	}
	else message.channel.send("Please specify match id");
}

module.exports.help = {
	name: "manualsubmit"
}