const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

/**
 * @param {string} mode 
 * @param {string} score 
 * @param {number} maxscore 
 * @param {number} accuracy 
 * @param {number} misscount 
 * @param {number} comboPortion 
 * @param {number} accPortion 
 */
function scoreCalc(mode, score, maxscore, accuracy, misscount, comboPortion, accPortion) {
	const hddt = mode === 'dt' && score.includes("h");
	let newScore = parseInt(score) / maxscore * 1000000 * comboPortion + Math.pow((accuracy / 100), 4) * 1000000 * accPortion;
	newScore -= misscount * 0.005 * newScore;
	if (!hddt) {
        return Math.round(newScore);
    } else {
        return Math.round(newScore/1.0625);
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
    if (!message.member?.roles.cache.find((r) => r.name === 'Referee')) {
        return message.channel.send("❎ **| I'm sorry, you don't have enough permission to do this.**");
    }

    const id = args[0];
    if (!id) {
        return message.channel.send("❎ **| Hey, please specify a match ID!**");
    }

    const mapid = parseInt(args[1]);
    if (isNaN(mapid)) {
        return message.channel.send("❎ **| Hey, please specify a valid map ID!**");
    }

    const matchDb = maindb.collection("matchinfo");
	const mapDb = maindb.collection("mapinfo");
	const lengthDb = alicedb.collection("mapinfolength");
	const resultDb = alicedb.collection("matchdata");
    let query = { matchid: id };
    let poolquery = { poolid: id.split(".")[0] };
    
    const res = await matchDb.findOne(query);
    if (!res) {
        return message.channel.send("❎ **| I'm sorry, I can't find the match!**");
    }

    const result = res.result;
    if (args.length - 2 < result.length * 3) {
        return message.channel.send(`❎ **| Hey, I need more arguments! There are ${result.length} ${result.length === 1 ? "player" : "players"} in the match, therefore please enter at least ${result.length * 3 + 2} arguments!**`);
    }

    const map_res = await lengthDb.findOne(poolquery);
    if (!map_res) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the pool!**");
    }

    const pool_res = await mapDb.findOne(poolquery);
    if (!pool_res) {
        return message.channel.send("❎ **| I'm sorry, I cannot find the pool!**");
    }

    const pick = map_res.map[mapid - 1][0];
    const players = res.player;
    const teams = res.team;
    const mode = pool_res.map[mapid - 1][0];
    const scoreObject = {
        pick: pick,
        scores: []
    };
    const scoreList = [];

    for (let i = 0; i < players.length; ++i) {
        const scorev2 = scoreCalc(
            mode, args[2 + i * 3],
            parseInt(pool_res.map[mapid - 1][2]),
            parseFloat(args[2 + i * 3 + 1]),
            parseInt(args[2 + i * 3 + 2]),
            pool_res.map[mapid - 1][4] ?? 0.6,
            pool_res.map[mapid - 1][5] ?? 0.4
        );
        scoreObject.scores.push({
            player: '',
            scorev1: parseInt(args[2 + i * 3]),
            accuracy: parseFloat(args[2 + i * 3 + 1]),
            mods: mode !== "fm" && mode !== "tb" ? mode.toUpperCase() : "",
            miss: parseInt(args[2 + i * 3 + 2]),
            scorev2: scorev2
        });
        scoreList.push(scorev2);
    }

    let team_1_score = 0;
    let team_2_score = 0;
    let team_1_string = '';
    let team_2_string = '';

    for (let i = 0; i < scoreObject.scores.length; ++i) {
        scoreObject.scores[i].player = players[i][0] === "Score" ? teams[i][0] : players[i][0];
        const score = scoreObject.scores[i];

        const scoreString = `${score.player} - (${mode === "fm" || mode === "tb" ? "N/A" : osudroid.mods.pcToDetail(mode)}): **${score.scorev2}** - ${score.accuracy}% - ${score.miss} ❌\n`;
        const failString = `${score.player} - (N/A): **0** - Failed\n`;

        if (i % 2 === 0) {
            team_1_score += score.scorev2;
            team_1_string += score.scorev2 ? scoreString : failString;
        } else {
            team_2_score += score.scorev2;
            team_2_string += score.scorev2 ? scoreString : failString;
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
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setTitle(pool_res.map[mapid - 1][1])
        .setColor(color)
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setTimestamp(new Date())
        .setAuthor(res.name)
        .addField(`${teams[0][0]}: ${team_1_score}`, team_1_string)
        .addField(`${teams[1][0]}: ${team_2_score}`, team_2_string)
        .addField("=================================", `**${description}**`);

    message.channel.send({embed: embed}).catch(console.error);

    // red team wins
    teams[0][1] += team_1_score > team_2_score;
    // blue team wins
    teams[1][1] += team_2_score > team_1_score;

    embed.spliceFields(0, embed.fields.length)
        .setTitle(null)
        .setColor(65280)
        .addField(teams[0][0], `**${teams[0][1]}**`, true)
        .addField(teams[1][0], `**${teams[1][1]}**`, true);

    message.channel.send({embed: embed}).catch(console.error);

    for (const p in scoreList) {
        result[p].push(scoreList[p]);
    }

    const updateVal = {
        $set: {
            status: "on-going",
            team: teams,
            result: result
        }
    };

    await matchDb.updateOne(query, updateVal);

    const result_res = await resultDb.findOne(query);
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
        message.channel.send("✅ **| Successfully updated match data.**");
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
        message.channel.send("✅ **| Successfully inserted match data.**");
    }
};

module.exports.config = {
	name: "manualsubmit",
	description: "Manually submits a match.",
	usage: "manualsubmit <match id> <map sort> <score 1>[h] <acc 1> <miss 1> <score 2>[h] <acc 2> <miss 2> <...>",
	detail: "`match id`: The ID of the match [String]\n`map sort` The order of the map in pool [Integer]\n`score n`: Score achieved by player n [Integer]\n`h`: Means the player played HDDT (applies score penalty, only works if pick is a DT pick) [String]\n`acc n`: Accuracy achieved by player n [Float]\n`miss n`: Amount of misses from player n [Integer]",
	permission: "Referee"
};