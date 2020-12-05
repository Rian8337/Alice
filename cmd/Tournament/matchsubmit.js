const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

/**
 * @param {number} score 
 * @param {number} maxscore 
 * @param {number} accuracy 
 * @param {number} misscount 
 */
function scoreCalc(score, maxscore, accuracy, misscount) {
	let new_score = score / maxscore * 600000 + Math.pow(accuracy / 100, 4) * 400000;
	new_score -= misscount * 0.005 * new_score;
	return new_score;
}

/**
 * @param {string} mod 
 * @param {string} requirement 
 */
function playValidation(mod, requirement) {
	mod = mod.toLowerCase();
	if (!mod.includes("nf")) {
		return false;
	}
	switch (requirement) {
		case "nm": return mod === "";
		case "hd": return mod === "hd";
		case "hr": return mod === "hr";
		case "dt": return mod === 'dt' || mod === 'hddt';
		case "fm": return (mod.includes("hd") || mod.includes("hr") || mod.includes("ez")) && (!mod.includes("ht") && !mod.includes("dt") && !mod.includes("nc"));
		case "tb": return !mod.includes("dt") && !mod.includes("nc") && !mod.includes("ht");
		default: return true;
	}
}

async function getPlay(i, uid, cb) {
	const player = await osudroid.Player.getInformation({uid: uid});
	cb([i, player]);
}

module.exports.run = (client, message, args, maindb, alicedb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles === null || !message.member.roles.cache.find(r => r.name === 'Referee')) {
		return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	}
	const id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, I need a match ID!**");
	const matchdb = maindb.collection("matchinfo");
	const mapdb = maindb.collection("mapinfo");
	const resultdb = alicedb.collection("matchdata");
	const lengthdb = alicedb.collection("mapinfolength");
	const query = {matchid: id};
	matchdb.findOne(query, function (err, matchres) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!matchres) {
			return message.channel.send("❎ **| I'm sorry, I cannot find the match!**");
		}
		const players = matchres.player;
		const play_list = [];
		let min_time_diff = 0;
		let hash = '';
		let i = -1;
		const score_info = []; // array of Player instance
		players.forEach(async player => {
			i++;
			await getPlay(i, player[1], data => {
				const recent_play = data[1].recentPlays[0];
				score_info.push(data[1]);
				play_list.push([data[0], recent_play]);
				if (min_time_diff < recent_play.date.getTime()) {
					min_time_diff = recent_play.date.getTime();
					hash = recent_play.hash;
				}
				if (play_list.length !== players.length) {
					return;
				}
				
				play_list.sort((a, b) => {
					return a[0] - b[0];
				});
				query = {poolid: id.split(".")[0]};
				mapdb.findOne(query, function (err, poolres) {
					if (err) {
						console.log(err);
						return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
					}
					if (!poolres) {
						return message.channel.send("❎ **| I'm sorry, I cannot find the map pool!**");
					}
					let max_score;
					let requirement;
					let title;
					let i = 0;
					for (i; i < poolres.map.length; ++i) {
						if (hash === poolres.map[i][3]) {
							requirement = poolres.map[i][0];
							title = poolres.map[i][1];
							max_score = parseInt(poolres.map[i][2]);
							break;
						}
					}
					if (!max_score || !requirement || !title) {
						return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
					}

					let team_1_score = 0;
					let team_2_score = 0;
					let team_1_string = '';
					let team_2_string = '';
					let temp_score = 0;
					const score_list = [];
					let j = 0;

					for (const play of play_list) {
						if (play[1].hash === hash && playValidation(play[1].mods, requirement)) {
							temp_score = scoreCalc(play[1].score, max_score, play[1].accuracy, play[1].miss);
							if (play[1].mods === "HDDT") {
								temp_score = Math.round(temp_score / 1.0625);
							}
						} else {
							temp_score = 0;
						}
						score_list.push(temp_score);

						if (j % 2 === 0) {
							team_1_score += temp_score;
							if (temp_score !== 0) {
								team_1_string += `${players[j][0] === "Score" ? matchres.team[0][0] : players[j][0]} - (${osudroid.mods.pcToDetail(play[1].mods)}): **${Math.round(temp_score)}** - **${play[1].rank}** - ${play[1].accuracy}% - ${play[1].miss} ❌\n`;
							} else {
								team_1_string += `${players[j][0] === "Score" ? matchres.team[0][0] : players[j][0]} (N/A): **0** - Failed\n`;
							}
						} else {
							team_2_score += temp_score;
							if (temp_score !== 0) {
								team_2_string += `${players[j][0] === "Score" ? matchres.team[1][0] : players[j][0]} - (${osudroid.mods.pcToDetail(play[1].mods)}): **${Math.round(temp_score)}** - **${play[1].rank}** - ${play[1].accuracy}% - ${play[1].miss} ❌\n`;
							} else {
								team_2_string += `${players[j][0] === "Score" ? matchres.team[1][0] : players[j][0]} (N/A): **0** - Failed\n`;
							}
						}
						++j;
					}

					team_1_score = Math.round(team_1_score);
					team_2_score = Math.round(team_2_score);

					let description = '';
					let color = 0;
					if (team_1_score > team_2_score) {
						description = `${matchres.team[0][0]} won by ${team_1_score - team_2_score}`;
						color = 16711680;
					} else if (team_1_score < team_2_score) {
						description = `${matchres.team[1][0]} won by ${team_2_score - team_1_score}`;
						color = 262399;
					} else {
						description = "It's a draw";
					}

					const footer = config.avatar_list;
					const index = Math.floor(Math.random() * footer.length);
					let embed = new Discord.MessageEmbed()
						.setTitle(title)
						.setColor(color)
						.setFooter("Alice Synthesis Thirty", footer[index])
						.setAuthor(matchres.name)
						.addField(`${matchres.team[0][0]}: ${team_1_score}`, team_1_string)
						.addField(`${matchres.team[1][0]}: ${team_2_score}`, team_2_string)
						.addField("=================================", `**${description}**`);
					message.channel.send({embed: embed}).catch(console.error);

					let name = matchres.name;
					let t1name = matchres.team[0][0];
					let t2name = matchres.team[1][0];
					let t1win = matchres.team[0][1] + (team_1_score > team_2_score);
					let t2win = matchres.team[1][1] + (team_1_score < team_2_score);
					matchres.team[0][1] = t1win;
					matchres.team[1][1] = t2win;
					let result = matchres.result;

					embed = new Discord.MessageEmbed()
						.setTitle(name)
						.setColor(65280)
						.setFooter("Alice Synthesis Thirty", footer[index])
						.addField(t1name, `**${t1win}**`, true)
						.addField(t2name, `**${t2win}**`, true);

					message.channel.send({embed: embed}).catch(console.error);
					for (const p in score_list) result[p].push(score_list[p]);
					let updateVal = {
						$set: {
							status: "on-going",
							team: matchres.team,
							result: result
						}
					};
					matchdb.updateOne({matchid: id}, updateVal, function(err) {
						if (err) {
							console.log(err);
							return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
						}
						console.log("Match info updated");
						lengthdb.findOne({poolid: id.split(".")[0]}, (err, mapinfolength) => {
							if (err) {
								return console.log(err);
							}
							const pick = mapinfolength.map[i][0];

							resultdb.findOne({matchid: id}, (err, result_res) => {
								if (err) {
									return console.log(err);
								}

								const score_object = {
									pick: pick,
									scores: []
								};

								for (const p of score_info) {
									const recent_play = p.recentPlays[0];
									let player_name = '';
									if (players[0][0] !== "Score") {
										const player_entry = players.find(e => e[0].includes(p.username));
										player_name = player_entry ? player_entry[0] : p.username;
									} else {
										const player_entry = matchres.team.find(e => e[0].includes(p.username));
										player_name = player_entry ? player_entry[0] : p.username;
									}

									if (recent_play.hash === hash) {
										let scorev2 = scoreCalc(recent_play.score, max_score, recent_play.accuracy, recent_play.miss);
										if (recent_play.mods === "HDDT") {
											scorev2 /= 1.0625;
										}
										scorev2 = Math.round(scorev2);
										score_object.scores.push({
											player: player_name,
											scorev1: recent_play.score,
											accuracy: recent_play.accuracy,
											mods: recent_play.mods,
											miss: recent_play.miss,
											scorev2: scorev2
										});
									} else {
										score_object.scores.push({
											player: player_name,
											scorev1: 0,
											accuracy: 0,
											mods: "",
											miss: 0,
											scorev2: 0
										});
									}
								}

								if (result_res) {
									const scores_list = result_res.scores;
									const m_result = result_res.result;

									for (let i = 0; i < players.length; ++i) {
										m_result[i].points += i % 2 === 0 ? (team_1_score > team_2_score) : (team_2_score > team_1_score);
									}

									scores_list.push(score_object);
									updateVal = {
										$set: {
											result: m_result,
											scores: scores_list
										}
									};
									resultdb.updateOne({matchid: id}, updateVal, err => {
										if (err) {
											return console.log(err);
										}
										console.log("Result added to database");
									});
								} else {
									const insertVal = {
										matchid: id,
										players: [],
										bans: [],
										result: [],
										scores: [score_object]
									};
									const teams = matchres.team;
									if (players[0][0] !== "Score") {
										for (const p of players) {
											insertVal.players.push(p[0]);
										}
									} else {
										for (const p of teams) {
											insertVal.players.push(p[0]);
										}
									}

									for (const p_name of insertVal.players) {
										insertVal.result.push({
											player: p_name,
											points: 0
										});
									}

									for (let i = 0; i < players.length; ++i) {
										insertVal.result[i].points += i % 2 === 0 ? (team_1_score > team_2_score) : (team_2_score > team_1_score);
									}

									resultdb.insertOne(insertVal, err => {
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
		});
	});
};

module.exports.config = {
	name: "matchsubmit",
	description: "Submits recent play for each player in a match.",
	usage: "matchsubmit <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "Referee"
};
