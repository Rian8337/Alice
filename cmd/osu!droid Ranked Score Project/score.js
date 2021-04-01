const Discord = require('discord.js');
const config = require('../../config.json');
const cd = new Set();
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

/**
 * Calculates the score requirement of reaching a certain level.
 * 
 * @param {number} level The level to calculate.
 */
function scoreRequirement(level) {
    return Math.round(
        level <= 100 ? 
        (5000 / 3 * (4 * Math.pow(level, 3) - 3 * Math.pow(level, 2) - level) + 1.25 * Math.pow(1.8, level - 60)) / 1.128 :
        23875169174 + 15000000000 * (level - 100)
    );
}

/**
 * Calculates the level of a given score.
 * 
 * @param {number} score The score to calculate.
 * @returns {number} The level of the given score.
 */
function calculateLevel(score) {
    let level = 1;
    while (scoreRequirement(level + 1) <= score) {
        ++level;
    }
    const nextLevelReq = scoreRequirement(level + 1) - scoreRequirement(level);
    const curLevelReq = score - scoreRequirement(level);
    level += curLevelReq / nextLevelReq;
    return level;
}

async function scoreApproval(embed, i, submitted, scorelist, playc, playentry, cb) {
    if (!playentry[i]) {
        return cb(false, true);
    }
    let play = playentry[i];
    let mod = play.mod;
    const mapinfo = await osudroid.MapInfo.getInformation({hash: play.hash, file: false});
    if (mapinfo.error) {
        embed.addField(`${submitted}. ${play.title}${mod ? ` +${mod}` : ""}`, `**${play.score.toLocaleString()}** | ${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | **API fetch error**`);
		return cb(true);
	}
    if (!mapinfo.title) {
        embed.addField(`${submitted}. ${play.title}${mod ? ` +${mod}` : ""}`, `**${play.score.toLocaleString()}** | ${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | **Beatmap not found**`);
        return cb(false);
    }
    if (!mapinfo.objects) {
        embed.addField(`${submitted}. ${play.title}${mod ? ` +${mod}` : ""}`, `**${play.score.toLocaleString()}** | ${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | **Beatmap with 0 objects**`);
        return cb(false);
    }
    if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
        embed.addField(`${submitted}. ${play.title}${mod ? ` +${mod}` : ""}`, `**${play.score.toLocaleString()}** | ${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | **Unranked beatmap**`);
        return cb(false);
    }
    let playinfo = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]${mod ? ` +${mod}` : ""}`;
    let dup = false;
    let diff = 0;
    let scoreentry = [play.score, play.hash];
    for (let i in scorelist) {
        if (play.hash === scorelist[i][1]) {
            diff = play.score - scorelist[i][0];
            scorelist[i] = scoreentry;
            dup = true;
            break;
        }
    }
    if (!dup) {
        scorelist.push(scoreentry);
        diff = scoreentry[0];
    }
    playc++;
    embed.addField(`${submitted}. ${playinfo}`, `**${scoreentry[0].toLocaleString()}** | *+${diff.toLocaleString()}*\n${play.combo}x | ${play.accuracy}% | ${play.miss} ❌`);
    cb();
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    // embed stuff
    let rolecheck;
    try {
        rolecheck = message.member.roles.color.hexColor;
    } catch (e) {
        rolecheck = "#000000";
    }
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);

    // actual command
    if (args[0] == 'about') {
        let embed = new Discord.MessageEmbed()
            .setTitle("Ranked Score Project")
            .setColor(rolecheck)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setDescription("This is a ranked score project made by <@386742340968120321> in attempt to bringing a more fair scoring system. Furthermore, this system includes levels similarly to osu! levels.")
            .addField("What kind of scores are accepted?", "Unlike the global scoring system in-game, this system *only accepts ranked, approved, and loved beatmaps*. This is why the system is more fair compared to the global one as you cannot exploit the system.")
            .addField("How do I submit plays?", "Because I don't want to make the bot do heavy work on automatically detecting new plays for each user, you have to submit your scores manually.\nTo submit your scores, simply use the command `a!score`. You can only submit up to 5 scores at once and you can only submit up to 50 of your most recent scores. For more information about the command, you can use `a!help score`.")
            .addField("Why aren't all players available?", "My intention is to make this system restricted to users in the international Discord server.")
            .addField("How do I view my current ranked score stats?", "You can use `a!levelme` or `a!levelid` to view ranked score stats. As usual, for more information, you can use `a!help levelme` or `a!help levelid`.")
            .addField("Are multiaccounts supported?", "Since I built this system based on uid, no, multiaccounts are not supported.")
            .addField("My old scores aren't in the system! How can I add them?", "Fortunately, a complete score calculation exists. Simply DM <@386742340968120321> to request one.")
            .addField("How does score requirement for each level calculated?", "The scoring system uses a specific formula to calculate score requirements for each level.```if n <= 100:\nscore(n) = (5000 / 3 * (4n^3 - 3n^2 - n) + 1.25 * 1.8^(n - 60)) / 1.128\n\nif n > 100:\nscore(n) = 23875169174 + 15000000000 * (n - 100)```Where *n* is level.\n\nYou can see how many scores do you need left to level up each time you submit your scores.");

        return message.channel.send({embed: embed});
    }

    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, can you calm down with the command? I need to rest too, you know.**");
    }
    let channels = config.pp_channel;
    let channel_index = channels.findIndex(id => message.channel.id === id);
    if (!message.isOwner && channel_index === -1) {
        return message.channel.send("❎ **| I'm sorry, this command is not allowed in here!**");
    }

    let ufind = message.author.id;
    let offset = 1;
    let start = 1;
    if (args[0]) offset = parseInt(args[0]);
    if (args[1]) start = parseInt(args[1]);
    if (isNaN(offset)) offset = 1;
    if (isNaN(start)) start = 1;
    if (offset < 1 || offset > 5) {
        return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
    }
    if (offset + start - 1 > 50) {
        return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
    }
    const binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.findOne(query, async (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!userres) {
            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        const uid = userres.uid;
        const discordid = userres.discordid;
        const username = userres.username;
        const player = await osudroid.Player.getInformation({uid: uid});
        if (player.error) {
            return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
        }
        if (!player.username) {
            return message.channel.send("❎ **| I'm sorry, I couldn't find your profile!**");
        }
        if (player.recentPlays.length === 0) {
            return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
        }
        const rplay = player.recentPlays;
        const playentry = [];
        const embed = new Discord.MessageEmbed()
            .setTitle("Score submission info")
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setColor(rolecheck);

        for (let i = start - 1; i < start + offset - 1; i++) {
            if (!rplay[i]) {
                break;
            }
            playentry.push({
                title: rplay[i].title,
                score: rplay[i].score,
                accuracy: rplay[i].accuracy,
                miss: rplay[i].miss,
                combo: rplay[i].combo,
                mod: rplay[i].mods,
                hash: rplay[i].hash
            });
        }

        const scoredb = alicedb.collection("playerscore");
        query = {uid: uid};
        scoredb.findOne(query, async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            const prescore = res?.score ?? 0;
            const scorelist = res?.scorelist ?? [];
            const playc = res?.playc ?? 0;
            const currentlevel = res?.level ?? 1;
            let score = 0;
            let i = 0;
            let submitted = 1;
            let attempt = 0;
            await scoreApproval(embed, i, submitted, scorelist, playc, playentry, async function testResult(error = false, stopSign = false) {
                if (stopSign) {
                    if (submitted === 1) return;
                    for (i of scorelist) score += i[0];
                    let scorediff = score - prescore;
                    const level = calculateLevel(score);
                    let levelremain = (level - Math.floor(level)) * 100;
                        embed.setDescription(`Ranked score: **${score.toLocaleString()}**\nScore gained: **${scorediff.toLocaleString()}**\nCurrent level: **${Math.floor(level)} (${levelremain.toFixed(2)}%)${Math.floor(level) > Math.floor(currentlevel)?"\n🆙 Level up!":""}**\nScore needed to level up: **${(scoreRequirement(Math.floor(level) + 1) - score).toLocaleString()}**${!res ? "\nHey, looks like you are new to the system! You can ask a moderator or helper to enter all of your previous scores, or ignore this message if you want to start new!" : ""}`);
                        message.channel.send('✅ **| <@' + discordid + '>, successfully submitted your play(s). More info in embed.**', {embed: embed});
                        if (res) {
                            const updateVal = {
                                $set: {
                                    level: level,
                                    score: score,
                                    playc: playc,
                                    scorelist: scorelist
                                }
                            };
                            scoredb.updateOne(query, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                            });
                        } else {
                            const insertVal = {
                                uid: uid,
                                username: username,
                                level: level,
                                score: score,
                                playc: playc,
                                scorelist: scorelist
                            };
                            scoredb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                            });
                        }
                    return;
                }
                attempt++;
                if (!error && attempt < 3) {
                    i++;
                }
                submitted++;

                if (error) {
                    attempt++;
                } else {
                    attempt = 0;
                }
                await scoreApproval(embed, i, submitted, scorelist, playc, playentry, testResult);
            });
        });
    });
    cd.add(message.author.id);
    setTimeout(() => {
        cd.delete(message.author.id);
    }, 1000);
};

module.exports.config = {
    name: "score",
    description: "Submits plays from user's profile into the user's ranked score profile.",
    usage: "score [offset] [start]",
    detail: "`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]",
    permission: "None"
};