const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('../modules/osu!droid');

function scoreCalc(score, maxscore, accuracy, misscount) {
	let new_score = score / maxscore * 600000 + Math.pow(accuracy / 100, 4) * 400000;
	new_score -= misscount * 0.003 * new_score;
	return new_score
}

function playValidation(mod, requirement) {
	switch (requirement) {
		case "nm": return mod == "-";
		case "hd": return mod == "h";
		case "hr": return mod == "r";
		case "dt": return mod == 'd' || mod == 'hd';
		case "fm": return (mod.includes("h") || mod.includes("r") || mod.includes("e")) && (!mod.includes("t") && !mod.includes("d") && !mod.includes("c"));
		case "tb": return !mod.includes("d") && !mod.includes("c") && !mod.includes("t");
		default: return true
	}
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, I need a match ID!**");
	let matchdb = maindb.collection("matchinfo");
	let mapdb = maindb.collection("mapinfo");
	let query = {matchid: id};
	matchdb.find(query).toArray(function (err, matchres) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!matchres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the match!**");
		let players = matchres[0].player;
		let play_list = [];
		let min_time_diff = 0;
		let hash = '';
		let count = 0;
		let i = -1;
		players.forEach(player => {
			new osudroid.PlayerInfo().get({uid: player[1]}, user => {
				i++;
				let play = user.recent_plays[0];
				play_list.push([i, play]);
				if (min_time_diff > play.date) {
					min_time_diff = play.date;
					hash = play.hash
				}
				count++;
				if (count == player.length) {
					play_list.sort((a, b) => {return a[0] - b[0]});
					query = {poolid: id.split(".")[0]};
					mapdb.find(query).toArray(function (err, poolres) {
						if (err) {
							console.log(err);
							return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
						}
						if (!poolres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the map pool!**");
						let max_score;
						let requirement;
						let title;
						for (let i in poolres[0].map) {
							if (hash == poolres[0].map[i][3]) {
								requirement = poolres[0].map[i][0];
								title = poolres[0].map[i][1];
								max_score = parseInt(poolres[0].map[i][2]);
								break
							}
						}
						if (!max_score || !requirement || !title) return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");

						let team_1_score = 0;
						let team_2_score = 0;
						let team_1_string = '';
						let team_2_string = '';
						let temp_score = 0;
						let score_list = [];

						for (let i in play_list) {
							if (play_list[i].hash == hash && playValidation(play_list[i].mode, requirement)) {
								temp_score = scoreCalc(play_list[i].score, max_score, play_list[i].accuracy, play_list[i].miss);
								if (play_list[i].mode == "hd") temp_score = Math.round(temp_score / 1.0625);
							}
							else temp_score = 0;
							score_list.push(temp_score);

							if (i % 2 == 0) {
								team_1_score += temp_score;
								if (temp_score != 0) team_1_string += `${play_list.length > 2 ? players[i][0] : matchres[0].team[0][0]} - (${osudroid.mods.droid_to_PC(play_list[i].mode, true)}): **${Math.round(temp_score)}** - **${play_list[i].mark}** - ${play_list[i].accuracy}% - ${play_list[i].miss} ❌\n`;
								else team_1_string += `${players[i][0]} (N/A): **0** - Failed`
							}
							else {
								team_2_score += temp_score;
								if (temp_score != 0) team_2_string += `${play_list.length > 2 ? players[i][0] : matchres[0].team[1][0]} - (${osudroid.mods.droid_to_PC(play_list[i].mode, true)}): **${Math.round(temp_score)}** - **${play_list[i].mark}** - ${play_list[i].accuracy}% - ${play_list[i].miss} ❌\n`;
								else team_2_string += `${players[i][0]} (N/A): **0** - Failed`
							}
						}

						team_1_score = Math.round(team_1_score);
						team_2_score = Math.round(team_2_score);

						let description = '';
						let color = 0;
						if (team_1_score > team_2_score) {
							description = `${matchres[0].team[0][0]} won by ${team_1_score - team_2_score}`;
							color = 16711680
						}
						else if (team_1_score < team_2_score) {
							description = `${matchres[0].team[1][0]} won by ${team_2_score - team_1_score}`;
							color = 262399
						}
						else description = "It's a draw";

						let footer = config.avatar_list;
						const index = Math.floor(Math.random() * (footer.length - 1) + 1);
						let embed = new Discord.RichEmbed()
							.setTitle(title)
							.setColor(color)
							.setFooter("Alice Synthesis Thirty", footer[index])
							.setThumbnail("https://cdn.discordapp.com/embed/avatars/0.png")
							.setAuthor(matchres[0].name)
							.addField(`${matchres[0].team[0][0]}: ${team_1_score}`, team_1_string)
							.addField(`${matchres[0].team[1][0]}: ${team_2_score}`, team_2_string)
							.addField("=================================", `**${description}**`);
						message.channel.send({embed: embed}).catch(console.error);

						let name = matchres[0].name;
						let t1name = matchres[0].team[0][0];
						let t2name = matchres[0].team[1][0];
						let t1win = matchres[0].team[0][1] + (team_1_score > team_2_score);
						let t2win = matchres[0].team[1][1] + (team_1_score < team_2_score);
						matchres[0].team[0][1] = t1win;
						matchres[0].team[1][1] = t2win;
						let result = matchres[0].result;

						embed = new Discord.RichEmbed()
							.setTitle(name)
							.setColor(65280)
							.addField(t1name, `**${t1win}**`, true)
							.addField(t2name, `**${t2win}**`, true);

						message.channel.send({embed: embed}).catch(console.error);
						result.push(score_list);
						let updateVal = {
							$set: {
								status: "on-going",
								team: matchres[0].team,
								result: result
							}
						};
						matchdb.updateOne({matchid: id}, updateVal, function(err) {
							if (err) {
								console.log(err);
								return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
							}
							console.log("Match info updated")
						})
					})
				}
			})
		})
	})
};

module.exports.config = {
	name: "matchsubmit",
	description: "Submits recent play for each player in a match.",
	usage: "matchsubmit <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "Referee"
};
