const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');

/**
 * @param {number} score 
 * @param {number} maxscore 
 * @param {number} accuracy 
 * @param {number} misscount 
 * @param {number} comboPortion
 * @param {number} accPortion
 */
function scoreCalc(score, maxscore, accuracy, misscount, comboPortion, accPortion) {
	let newScore = score / maxscore * 100000 * comboPortion + Math.pow(accuracy / 100, 4) * 100000 * accPortion;
    newScore -= misscount * 0.005 * newScore;
    return newScore;
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
    mod = mod.replace("nf", "");
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

/**
 * @param {string} input 
 */
function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return;
	}
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (!message.member?.roles.cache.find(r => r.name === 'Referee')) {
        return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
    }
    const id = args[0];
    if (!id) {
        return message.channel.send("❎ **| Hey, I need a match ID!**");
    }

    const matchDb = maindb.collection("matchinfo");
	const mapDb = maindb.collection("mapinfo");
	const resultDb = alicedb.collection("matchdata");
    const lengthDb = alicedb.collection("mapinfolength");
    
    const query = {matchid: id};
    const matchres = await matchDb.findOne(query);
    if (!matchres) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the match!**");
    }
    delete query.matchid;
    query.poolid = id.split(".")[0];
    const poolres = await mapDb.findOne(query);
    if (!poolres) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the map pool!**");
    }

    const mapinfolength = await lengthDb.findOne(query);
    
    const maps = poolres.map;
    const players = matchres.player;
    const teams = matchres.team;
    const result = matchres.result;
    const playerList = [];
    const scoreList = [];

    for await (const p of players) {
        const player = await osudroid.Player.getInformation({uid: parseInt(p[1])});
        if (player.error || !player.username) {
            return message.channel.send(`❎ **| I'm sorry, I couldn't fetch profile for uid ${uid}!**`);
        }
        playerList.push(player);
    }

    let hash = "";
    let minTime = Number.NEGATIVE_INFINITY;

    for (const player of playerList) {
        const recentPlay = player.recentPlays[0];
        if (minTime >= recentPlay.date.getTime()) {
            continue;
        }
        hash = recentPlay.hash;
        minTime = recentPlay.date.getTime();
    }

    const index = maps.findIndex(p => p[3] === hash);
    if (index === -1) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
    }
    const pick = mapinfolength.map[index][0];
    const scoreObject = {
        pick: pick,
        scores: []
    };

    const maxScore = parseInt(maps[index][2]);
    const requirement = maps[index][0];
    const title = maps[index][1];
    const comboPortion = maps[index][3] ?? 0.6;
    const accPortion = maps[index][4] ?? 0.4;

    let team_1_score = 0;
    let team_2_score = 0;
    let team_1_string = "";
    let team_2_string = "";

    for (let i = 0; i < playerList.length; ++i) {
        const score = playerList[i].recentPlays[0];
        let scorev2 = 0;
        if (score.hash === hash && playValidation(score.mods, requirement)) {
            scorev2 = scoreCalc(score.score, maxScore, score.accuracy, score.miss, comboPortion, accPortion);
            if (score.mods === "HDDT") {
                scorev2 /= 1.0625;
            }
			scorev2 = Math.round(scorev2);
        }
        scoreList.push(scorev2);

        const remainder = i % 2;
        const playerName = players[i][0] === "Score" ? teams[remainder][0] : players[i][0];

        const scoreString = `${playerName} - (${osudroid.mods.pcToDetail(score.mods)}): **${scorev2}** - ${client.emojis.cache.get(rankEmote(score.rank))} - ${score.accuracy}% - ${score.miss} ❌\n`;
        const failString = `${playerName} - (N/A): **${scorev2}** - Failed`;
        
        if (remainder === 0) {
            team_1_score += scorev2;
            if (scorev2) {
                team_1_string += scoreString;
            } else {
                team_1_string += failString;
            }
        } else {
            team_2_score += scorev2;
            if (scorev2) {
                team_2_string += scoreString;
            } else {
                team_2_string += failString;
            }
        }

        if (scorev2) {
            scoreObject.scores.push({
                player: playerName,
                scorev1: score.score,
                accuracy: score.accuracy,
                mods: score.mods,
                miss: score.miss,
                scorev2: scorev2
            });
        } else {
            scoreObject.scores.push({
                player: playerName,
                scorev1: 0,
                accuracy: 0,
                mods: "",
                miss: 0,
                scorev2: 0
            });
        }
    }

    if (!team_1_string) {
        team_1_string = "None";
    }
    if (!team_2_string) {
        team_2_string = "None";
    }

    let description = `${team_1_score > team_2_score ? teams[0][0] : teams[1][0]} won by ${Math.abs(team_1_score - team_2_score)}`;
    let color = 0;

    if (team_1_score > team_2_score) {
        color = 16711680;
    } else if (team_1_score < team_2_score) {
        color = 262399;
    } else {
        description = "It's a draw";
    }

    const footer = config.avatar_list;
    const footer_index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setAuthor(matchres.name)
        .setTitle(title)
        .setColor(color)
        .setFooter("Alice Synthesis Thirty", footer[footer_index])
        .setTimestamp(new Date())
        .addField(`${teams[0][0]}: ${team_1_score}`, team_1_string)
        .addField(`${teams[1][0]}: ${team_2_score}`, team_2_string)
        .addField("=================================", `**${description}**`);

    message.channel.send({embed: embed}).catch(console.error);

    // red team wins
    teams[0][1] += team_1_score > team_2_score;
    // blue team wins
    teams[1][1] += team_2_score > team_1_score;

    embed.spliceFields(0, embed.fields.length)
        .setColor(65280)
        .addField(teams[0][0], `**${teams[0][1]}**`, true)
        .addField(teams[1][0], `**${teams[1][1]}**`, true);

    message.channel.send({embed: embed}).catch(console.error);
    for (const p in scoreList) result[p].push(scoreList[p]);
    const updateVal = {
        $set: {
            status: "on-going",
            team: teams,
            result: result
        }
    };

    await matchDb.updateOne({matchid: id}, updateVal);

    const result_res = await resultDb.findOne({matchid: id});
    if (result_res) {
        const scoresList = result_res.scores;
        const matchResult = result_res.result;

        for (let i = 0; i < matchResult.length; ++i) {
            matchResult[i].points += i % 2 === 0 ? team_1_score > team_2_score : team_2_score > team_1_score;
        }

        scoresList.push(scoreObject);

        updateVal.$set = {
            scores: scoresList,
            result: matchResult
        };

        await resultDb.updateOne({matchid: id}, updateVal);
        message.channel.send(`✅ **| Successfully updated match data.**`);
    } else {
        const insertVal = {
            matchid: id,
            players: [],
            bans: [],
            result: [],
            scores: [scoreObject]
        };

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

        for (let i = 0; i < insertVal.players.length; ++i) {
            insertVal.result[i].points += i % 2 === 0 ? team_1_score > team_2_score : team_2_score > team_1_score;
        }

        await resultDb.insertOne(insertVal);
        message.channel.send(`✅ **| Successfully inserted match data.**`);
    }
};

module.exports.config = {
	name: "matchsubmit",
	description: "Submits recent play for each player in a match.",
	usage: "matchsubmit <match ID>",
	detail: "`match ID`: The match's ID [String]",
	permission: "Referee"
};