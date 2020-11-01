const Discord = require('discord.js');
const config = require('../../config.json');
const cd = new Set();
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function scoreRequirement(lvl) {
    let xp;
    if (lvl <= 100) xp = (5000 / 3 * (4 * Math.pow(lvl, 3) - 3 * Math.pow(lvl, 2) - lvl) + 1.25 * Math.pow(1.8, lvl - 60)) / 1.128;
    else xp = 23875169174 + 15000000000 * (lvl - 100);
    return Math.round(xp)
}

function levelUp(level, score, cb) {
    let nextlevel = scoreRequirement(level + 1);
    if (score < nextlevel) cb(level, true);
    else {
        level++;
        cb(level, false)
    }
}

function calculateLevel(lvl, score, cb) {
    let xpreq = scoreRequirement(lvl + 1);
    let nextlevel = 0;
    let prevlevel = 0;
    if (score >= xpreq) levelUp(lvl, score, function testcb(newlevel, stopSign) {
        if (stopSign) {
            nextlevel = scoreRequirement(newlevel + 1);
            prevlevel = scoreRequirement(newlevel);
            newlevel += (score - prevlevel) / (nextlevel - prevlevel);
            cb(newlevel);
        }
        else levelUp(newlevel, score, testcb);
    });
    else {
        nextlevel = xpreq;
        prevlevel = scoreRequirement(lvl);
        let newlevel = lvl + (score - prevlevel) / (nextlevel - prevlevel);
        cb(newlevel);
    }
}

async function scoreApproval(message, embed, i, submitted, scorelist, playc, playentry, cb) {
    if (!playentry[i]) return cb(false, false, true);
    let play = playentry[i];
    const mapinfo = await osudroid.MapInfo.getInformation({hash: play.hash, file: false});
    if (mapinfo.error) {
		message.channel.send("❎ **| I'm sorry, I couldn't check for beatmap availability! Perhaps osu! API is down?**");
		return cb(false, true);
	}
    if (!mapinfo.title) {
        message.channel.send("❎ **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
        return cb(false, false);
    }
    if (!mapinfo.objects) {
        message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
        return cb(false, false);
    }
    if (mapinfo.approved === 3 || mapinfo.approved <= 0) {
        message.channel.send("❎ **| I'm sorry, the score system only accepts ranked, approved, and loved mapsets!**");
        return cb(false, false);
    }
    let playinfo = mapinfo.showStatistics(osudroid.mods.droidToPC(play.mod), 0);
    let dup = false;
    let diff = 0;
    let scoreentry = [play.score, play.hash];
    for (let i in scorelist) {
        if (play.hash === scorelist[i][0]) {
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
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    // embed stuff
    let rolecheck;
    try {
        rolecheck = message.member.roles.color.hexColor;
    } catch (e) {
        rolecheck = "#000000";
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    // actual command
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, can you calm down with the command? I need to rest too, you know.**");
    let ufind = args[0];
    if (!ufind) return message.channel.send("❎ **| Hey, I don't know who to submit scores for!**");
    ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "");
    let offset = 1;
    let start = 1;
    if (args[1]) offset = parseInt(args[1]);
    if (args[2]) start = parseInt(args[2]);
    if (isNaN(offset)) offset = 1;
    if (isNaN(start)) start = 1;
    if (offset < 1 || offset > 5) return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
    if (offset + start - 1 > 50) return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.findOne(query, async (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres.uid;
        let username = userres.username;
        const player = await osudroid.Player.getInformation({uid: uid});

        if (!player.username) return message.channel.send("❎ **| I'm sorry, I cannot find the user's profile!**");
        if (player.recentPlays.length === 0) return message.channel.send("❎ **| I'm sorry, the player hasn't submitted any play!**");
        let rplay = player.recentPlays;
        let playentry = [];
        let embed = new Discord.MessageEmbed()
            .setTitle("Score submission info")
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setColor(rolecheck);

        for (let i = start - 1; i < start + offset - 1; i++) {
            if (!rplay[i]) break;
            let play = {
                title: rplay[i].title,
                accuracy: rplay[i].accuracy,
                miss: rplay[i].miss,
                combo: rplay[i].combo,
                mod: rplay[i].mods,
                hash: rplay[i].hash
            };
            playentry.push(play)
        }

        let scoredb = alicedb.collection("playerscore");
        query = {uid: uid};
        scoredb.findOne(query, async (err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("Error: Empty database response. Please try again!")
            }
            let prescore = 0;
            let scorelist = [];
            let playc = 0;
            let currentlevel = 1;
            if (res) {
                currentlevel = res.level;
                prescore = res.score;
                scorelist = res.scorelist;
                playc = res.playc
            }
            let score = 0;
            let i = 0;
            let submitted = 1;
            let attempt = 0;
            await scoreApproval(message, embed, i, submitted, scorelist, playc, playentry, async function testResult(error = false, success = true, stopSign = false) {
                if (stopSign) {
                    if (submitted === 1) return;
                    scorelist.sort((a, b) => {
                        return b[0] - a[0]
                    });
                    for (i of scorelist) score += i[0];
                    let scorediff = score - prescore;
                    calculateLevel(Math.floor(currentlevel) - 1, score, level => {
                        let levelremain = (level - Math.floor(level)) * 100;
                        embed.setDescription(`Ranked score: **${score.toLocaleString()}**\nScore gained: **${scorediff.toLocaleString()}**\nCurrent level: **${Math.floor(level)} (${levelremain.toFixed(2)}%)${Math.floor(level) > Math.floor(currentlevel)?"\n🆙 Level up!":""}**\nScore needed to level up: **${(scoreRequirement(Math.floor(level) + 1) - score).toLocaleString()}**${!res?"\nHey, looks like you are new to the system! You can ask <@386742340968120321> to enter all of your previous scores, or ignore this message if you want to start new!":""}`);
                        message.channel.send(`✅ **| ${message.author}, successfully submitted <@${ufind}>'s play(s). More info in embed.**`, {embed: embed});
                        if (res) {
                            let updateVal = {
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
                                    return message.channel.send("Error: Empty database response. Please try again!")
                                }
                                console.log("Score updated")
                            })
                        } else {
                            let insertVal = {
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
                                    return message.channel.send("Error: Empty database response. Please try again!")
                                }
                                console.log("Score updated")
                            })
                        }
                    });
                    return
                }
                attempt++;
                if (!error && attempt < 3) i++;
                if (success) submitted++;
                if (error) attempt++;
                else attempt = 0;
                await scoreApproval(message, embed, i, submitted, scorelist, playc, playentry, testResult);
            });
        });
    });
    cd.add(message.author.id);
    setTimeout(() => {
        cd.delete(message.author.id);
    }, 1000);
};

module.exports.config = {
    name: "scoresubmit",
    description: "Submits plays from user's profile into the user's ranked score profile.",
    usage: "scoresubmit <user> [offset] [start]",
    detail: "`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]\n`user`: The user to submit [UserResolvable (mention or user ID)]",
    permission: "None"
};