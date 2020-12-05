const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {string} mode 
 * @param {string} score 
 * @param {number} maxscore 
 * @param {number} accuracy 
 * @param {number} misscount 
 */
function scoreCalc(mode, score, maxscore, accuracy, misscount) {
	const hddt = mode === "dt" && score.includes("h");
	let newscore = parseInt(score) / maxscore * 600000 + (Math.pow((accuracy / 100), 4) * 400000);
	newscore -= misscount * 0.005 * newscore;
	if (!hddt) {
		return Math.round(newscore);
	} else {
		return Math.round(newscore / 1.0625);
	}
}

module.exports.run = (client, message, args, maindb, alicedb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'Referee')) {
		return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	}
	const id = args[0];
	if (!id) {
		return message.channel.send("❎ **| Hey, please specify a match ID!**");
	}
	const mapid = args[1];
	if (!mapid) {
		return message.channel.send("❎ **| Hey, please specify a map ID!**");
	}
	const matchdb = maindb.collection("matchinfo");
	const mapdb = maindb.collection("mapinfo");
	const lengthdb = alicedb.collection("mapinfolength");
	const resultdb = alicedb.collection("matchdata");
	const query = { matchid: id };
	const pscore = [];
	let t1score = 0; let t2score = 0;
	let displayRes1 = ""; let displayRes2 = ""; let displayRes3 = ""; let color = 0;
	const poolid = id.split(".")[0];
	const poolquery = { poolid: poolid };
	matchdb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res) {
			return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
		}
		if (args.length - 2 < (res.result.length) * 3) {
			return message.channel.send("❎ **| Hey, I need more data!**");
		}
		lengthdb.findOne(poolquery, function(err, mres) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			if (!mres) {
				return message.channel.send("❎ **| I'm sorry, I cannot find the pool!**");
			}
			mapdb.findOne(poolquery, function(err, poolres) {
				if (err) {
					console.log(err);
					return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");;
				}
				if (!poolres) {
					return message.channel.send("❎ **| I'm sorry, I can't find the pool!**");
				}
				if (mapid > poolres.map.length || mapid < 0) {
					return message.channel.send("❎ **| I'm sorry, I can't find the map!**");
				}
				const pick = mres.map[mapid - 1][0];
				const players = res.player;

				const score_object = {
					pick: pick,
					scores: []
				};
				for (let i = 0; i < players.length; i++) {
					const scorev2 = scoreCalc(poolres.map[mapid-1][0], args[2 + i * 3], parseInt(poolres.map[mapid - 1][2]), parseFloat(args[2 + i * 3 + 1]), parseInt(args[2 + i * 3 + 2]));
					score_object.scores.push({
						player: '',
						scorev1: parseInt(args[2 + i * 3]),
						accuracy: parseFloat(args[2 + i * 3 + 1]),
						mods: poolres.map[mapid - 1][0].toUpperCase(),
						miss: parseInt(args[2 + i * 3 + 2]),
						scorev2: scorev2
					});
					pscore.push(scorev2);
				}
	
				for (let k in pscore) {
					score_object.scores[k].player = players[k][0] === "Score" ? res.team[k][0] : res.player[k][0];
					if (k % 2 == 0) {
						t1score += pscore[k];
						if (pscore[k] == 0) {
							displayRes1 += `${players[k][0] === "Score" ? res.team[k][0] : players[k][0]} (N/A): **0** - Failed\n`;
						} else {
							displayRes1 += `${players[k][0] === "Score" ? res.team[k][0] : players[k][0]} (N/A): **${Math.round(pscore[k])}** - ${args[2+k*3+1]} - ${args[2+k*3+2]} miss\n`
						}
					} else {
						t2score += pscore[k];
						if (pscore[k] == 0) {
							displayRes2 += `${players[k][0] === "Score" ? res.team[k][0] : players[k][0]} (N/A): **0** - Failed\n`;
						} else {
							displayRes2 += `${players[k][0] === "Score" ? res.team[k][0] : players[k][0]} (N/A): **${Math.round(pscore[k])}** - ${args[2+k*3+1]} - ${args[2+k*3+2]} miss\n`
						}
					}
				}
				t1score = Math.round(t1score);
				t2score = Math.round(t2score);
				const score_difference = Math.abs(t1score - t2score);
				if (t1score > t2score) {
					displayRes3 = `${res.team[0][0]} won by ` + score_difference;
					color = 16711680;
				} else if (t1score < t2score) {
					displayRes3 = `${res.team[1][0]} won by ` + score_difference;
					color = 262399;
				} else {
					displayRes3 = "It's a Draw";
				}
				const footer = config.avatar_list;
				const index = Math.floor(Math.random() * footer.length);
				let embed = {
					"title": poolres.map[mapid-1][1],
					"color": color,
					"footer": {
						"icon_url": footer[index],
						"text": "Alice Synthesis Thirty"
					},
					"author": {
						"name": res.name
					},
					"fields": [
						{
							"name": res.team[0][0] + ": " + t1score,
							"value": displayRes1
						},
						{
							"name": res.team[1][0] + ": " + t2score,
							"value": displayRes2
						},
						{
							"name": "=================================",
							"value": "**" + displayRes3 + "**"
						}
					]
				};
				message.channel.send({embed: embed}).catch(console.error);
				const name = res.name;
				const t1name = res.team[0][0];
				const t2name = res.team[1][0];
				const t1win = res.team[0][1] + (t1score > t2score);
				const t2win = res.team[1][1] + (t1score < t2score);
				res.team[0][1] = t1win;
				res.team[1][1] = t2win;
				const result = res.result;
				embed = {
					"title": name,
					"color": 65280,
					"footer": {
						"icon_url": footer[index],
						"text": "Alice Synthesis Thirty"
					},
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
				message.channel.send({embed: embed}).catch(console.error);
				for (let p in pscore) {
					result[p].push(pscore[p]);
				}
				let update = {
					$set: {
						status: "on-going",
						team: res.team,
						result: result
					}
				};
				matchdb.updateOne(query, update, function(err) {
					if (err) {
						console.log(err);
						return message.channel.send("Empty database response");
					}
					console.log("match info updated");
					resultdb.findOne({matchid: id}, function(err, r_res) {
						if (err) {
							return console.log(err);
						}

						if (r_res) {
							const scores_list = r_res.scores;
							const m_result = r_res.result;
							scores_list.push(score_object);

							for (let i = 0; i < players.length; ++i) {
								m_result[i].points += i % 2 === 0 ? (t1score > t2score) : (t2score > t1score);
							}

							update = {
								$set: {
									result: m_result,
									scores: scores_list
								}
							};
							resultdb.updateOne({matchid: id}, update, err => {
								if (err) {
									return console.log(err);
								}
								console.log("Match info updated in database");
							});
						} else {
							const insert_object = {
								matchid: id,
								players: [],
								bans: [],
								result: [],
								scores: [score_object]
							};

							for (const p of score_object.scores) {
								insert_object.players.push(p.player);
							}
							for (const p of insert_object.players) {
								insert_object.result.push({
									player: p,
									points: 0
								});
							}

							for (let i = 0; i < players.length; ++i) {
								insert_object.result[i].points += i % 2 === 0 ? (t1score > t2score) : (t2score > t1score);
							}

							resultdb.insertOne(insert_object, err => {
								if (err) {
									return console.log(err);
								}
								console.log("Match added to database");
							});
						}
					});
				});
			});
		});
	});
};

module.exports.config = {
	name: "manualsubmit",
	description: "Manually submits a match.",
	usage: "manualsubmit <match id> <map sort> <score 1>[h] <acc 1> <miss 1> <score 2>[h] <acc 2> <miss 2> <...>",
	detail: "`match id`: The ID of the match [String]\n`map sort` The order of the map in pool [Integer]\n`score n`: Score achieved by player n [Integer]\n`h`: Means the player played HDDT (applies score penalty, only works if pick is a DT pick) [String]\n`acc n`: Accuracy achieved by player n [Float]\n`miss n`: Amount of misses from player n [Integer]",
	permission: "Referee"
};