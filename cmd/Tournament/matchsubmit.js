const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

function scoreCalc(score, maxscore, accuracy, misscount) {
	let new_score = score / maxscore * 600000 + Math.pow(accuracy / 100, 4) * 400000;
	new_score -= misscount * 0.003 * new_score;
	return new_score
}

function playValidation(mod, requirement) {
	mod = mod.toLowerCase();
	switch (requirement) {
		case "nm": return mod === "";
		case "hd": return mod === "hd";
		case "hr": return mod === "hr";
		case "dt": return mod === 'dt' || mod === 'hddt';
		case "fm": return (mod.includes("hd") || mod.includes("hr") || mod.includes("ez")) && (!mod.includes("ht") && !mod.includes("dt") && !mod.includes("nc"));
		case "tb": return !mod.includes("dt") && !mod.includes("nc") && !mod.includes("ht");
		default: return true
	}
}

async function getPlay(i, uid, cb) {
	const player = await new osudroid.PlayerInfo().get({uid: uid});
	let play = player.recent_plays[0];
	cb([i, play])
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.cache.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, I need a match ID!**");
	let matchdb = maindb.collection("matchinfo");
	let mapdb = maindb.collection("mapinfo");
	let query = {matchid: id};
	matchdb.findOne(query, function (err, matchres) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!matchres) return message.channel.send("❎ **| I'm sorry, I cannot find the match!**");
		let players = matchres.player;
		let play_list = [];
		let min_time_diff = Number.POSITIVE_INFINITY;
		let hash = '';
		let i = -1;
		players.forEach(async player => {
			i++;
			await getPlay(i, player[1], data => {
				play_list.push(data);
				if (min_time_diff > data[1].date) {
					min_time_diff = data[1].date.getTime();
					hash = data[1].hash
				}
				if (play_list.length !== players.length) return;
				
				play_list.sort((a, b) => {return a[0] - b[0]});
				query = {poolid: id.split(".")[0]};
				mapdb.findOne(query, function (err, poolres) {
					if (err) {
						console.log(err);
						return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
					}
					if (!poolres) return message.channel.send("❎ **| I'm sorry, I cannot find the map pool!**");
					let max_score;
					let requirement;
					let title;
					for (let i in poolres.map) {
						if (hash === poolres.map[i][3]) {
							requirement = poolres.map[i][0];
							title = poolres.map[i][1];
							max_score = parseInt(poolres.map[i][2]);
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
						if (play_list[i][1].hash === hash && playValidation(play_list[i][1].mods, requirement)) {
							temp_score = scoreCalc(play_list[i][1].score, max_score, play_list[i][1].accuracy, play_list[i][1].miss);
							if (play_list[i][1].mode === "hd") temp_score = Math.round(temp_score / 1.0625);
						}
						else temp_score = 0;
						score_list.push(temp_score);

						if (i % 2 === 0) {
							team_1_score += temp_score;
							if (temp_score !== 0) team_1_string += `${play_list.length > 2 ? players[i][0] : matchres.team[0][0]} - (${osudroid.mods.pc_to_detail(play_list[i][1].mods)}): **${Math.round(temp_score)}** - **${play_list[i][1].rank}** - ${play_list[i][1].accuracy}% - ${play_list[i][1].miss} ❌\n`;
							else team_1_string += `${play_list.length > 2 ? players[i][0] : matchres.team[0][0]} (N/A): **0** - Failed\n`
						}
						else {
							team_2_score += temp_score;
							if (temp_score !== 0) team_2_string += `${play_list.length > 2 ? players[i][0] : matchres.team[1][0]} - (${osudroid.mods.pc_to_detail(play_list[i][1].mods)}): **${Math.round(temp_score)}** - **${play_list[i][1].rank}** - ${play_list[i][1].accuracy}% - ${play_list[i][1].miss} ❌\n`;
							else team_2_string += `${play_list.length > 2 ? players[i][0] : matchres.team[1][0]} (N/A): **0** - Failed\n`
						}
					}

					team_1_score = Math.round(team_1_score);
					team_2_score = Math.round(team_2_score);

					let description = '';
					let color = 0;
					if (team_1_score > team_2_score) {
						description = `${matchres.team[0][0]} won by ${team_1_score - team_2_score}`;
						color = 16711680
					}
					else if (team_1_score < team_2_score) {
						description = `${matchres.team[1][0]} won by ${team_2_score - team_1_score}`;
						color = 262399
					}
					else description = "It's a draw";

					let footer = config.avatar_list;
					const index = Math.floor(Math.random() * footer.length);
					let embed = new Discord.MessageEmbed()
						.setTitle(title)
						.setColor(color)
						.setFooter("Alice Synthesis Thirty", footer[index])
						.setThumbnail("https://cdn.discordapp.com/embed/avatars/0.png")
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
					for (let p in score_list) result[p].push(score_list[p]);
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
						console.log("Match info updated")
					})
				})
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
