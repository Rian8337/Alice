const Discord = require('discord.js');

function scoreCalc(mode, score, maxscore, accuracy, misscount) {
	let hddt = false;
	if (mode == 'dt' && score.includes("h")) hddt = true;
	let newscore = parseInt(score)/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
	newscore -= misscount * 0.003 * newscore;
	if (!hddt) return newscore;
	else return Math.round(newscore/1.0625)
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel || message.member.roles == null || !message.member.roles.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
	let id = args[0];
	if (!id) return message.channel.send("❎ **| Hey, please specify a match ID!**");
	let mapid = args[1];
	if (!mapid) return message.channel.send("❎ **| Hey, please specify a map ID!**");
	let matchdb = maindb.collection("matchinfo");
	let mapdb = maindb.collection("mapinfo");
	let query = { matchid: id };
	let pscore = [];
	let t1score = 0; let t2score = 0;
	let displayRes1 = ""; let displayRes2 = ""; let displayRes3 = ""; let color = 0;
	let poolid = id.split(".")[0];
	let poolquery = { poolid: poolid };
	matchdb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res[0]) return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
		mapdb.find(poolquery).toArray(function(err, poolres) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			if (!poolres[0]) return message.channel.send("❎ **| I'm sorry, I can't find the pool!**");
			if (mapid >= poolres[0].map.length || mapid < 0) return message.channel.send("❎ **| I'm sorry, I can't find the map!**");
			if (args.length - 2 < (res[0].result.length) * 3) return message.channel.send("❎ **| Hey, I need more data!**");

			for (let i = 0; i < res[0].player.length; i++) pscore.push(scoreCalc(poolres[0].map[mapid-1][0], args[2+i*3], parseInt(poolres[0].map[mapid-1][2]), parseFloat(args[2+i*3+1]), parseInt(args[2+i*3+2])));

			for (let k in pscore) {
				if (k % 2 == 0) {
					t1score += pscore[k];
					if (pscore[k] == 0) displayRes1 += `${pscore.length > 2 ? res[0].player[k][0] : res[0].team[k][0]} (N/A): **0** - Failed\n`;
					else displayRes1 += `${pscore.length > 2 ? res[0].player[k][0] : res[0].team[k][0]} (N/A): **${Math.round(pscore[k])}** - ${args[2+k*3+1]} - ${args[2+k*3+2]} miss\n`
				}
				else {
					t2score += pscore[k];
					if (pscore[k] == 0) displayRes2 += `${pscore.length > 2 ? res[0].player[k][0] : res[0].team[k][0]} (N/A): **0** - Failed\n`;
					else displayRes2 += `${pscore.length > 2 ? res[0].player[k][0] : res[0].team[k][0]} (N/A): **${Math.round(pscore[k])}** - ${args[2+k*3+1]} - ${args[2+k*3+2]} miss\n`
				}
			}
			t1score = Math.round(t1score);
			t2score = Math.round(t2score);
			if (t1score > t2score) {displayRes3 = `${res[0].team[0][0]} won by ` + Math.abs(t1score - t2score); color = 16711680;}
			else if (t1score < t2score) {displayRes3 = `${res[0].team[0][0]} won by ` + Math.abs(t1score - t2score); color = 262399;}
			else displayRes3 = "It's a Draw";
			let embed = {
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
						"name": res[0].team[0][0] + ": " + t1score,
						"value": displayRes1
					},
					{
						"name": res[0].team[1][0] + ": " + t2score,
						"value": displayRes2
					},
					{
						"name": "=================================",
						"value": "**" + displayRes3 + "**"
					}
				]
			};
			message.channel.send({embed: embed}).catch(console.error);
			let name = res[0].name;
			let t1name = res[0].team[0][0];
			let t2name = res[0].team[1][0];
			let t1win = res[0].team[0][1] + (t1score > t2score);
			let t2win = res[0].team[1][1] + (t1score < t2score);
			res[0].team[0][1] = t1win;
			res[0].team[1][1] = t2win;
			let result = res[0].result;
			embed = {
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
			message.channel.send({embed: embed}).catch(console.error);
			for (let p in pscore) result[p].push(pscore[p]);
			let update = {
				$set: {
					status: "on-going",
					team: res[0].team,
					result: result
				}
			};
			matchdb.updateOne(query, update, function(err) {
				if (err) {
					console.log(err);
					return message.channel.send("")
				}
				console.log("match info updated");
			})
		})
	})
};

module.exports.config = {
	name: "manualsubmit",
	description: "Manually submits a match.",
	usage: "manualsubmit <match id> <map sort> <score 1>[h] <acc 1> <miss 1> <score 2>[h] <acc 2> <miss 2> <...>",
	detail: "`match id`: The ID of the match [String]\n`map sort` The order of the map in pool [Integer]\n`score n`: Score achieved by player n [Integer]\n`h`: Means the player played HDDT (applies score penalty, only works if pick is a DT pick) [String]\n`acc n`: Accuracy achieved by player n [Float]\n`miss n`: Amount of misses from player n [Integer]",
	permission: "Referee"
};
