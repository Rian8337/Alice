const Discord = require('discord.js');
const config = require('../config.json');
const cd = new Set();
const osudroid = require('../modules/osu!droid');

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
            cb(newlevel)
        }
        else levelUp(newlevel, score, testcb)
    });
    else {
        nextlevel = xpreq;
        prevlevel = scoreRequirement(lvl);
        let newlevel = lvl + (score - prevlevel) / (nextlevel - prevlevel);
        cb(newlevel)
    }
}

function scoreApproval(message, embed, i, submitted, scorelist, playc, playentry, cb) {
    if (!playentry[i]) return cb(false, false, true);
    let play = playentry[i];
    new osudroid.MapInfo().get({hash: play.hash}, mapinfo => {
        if (!mapinfo.title) {
            message.channel.send("❎ **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
            return cb(false, false)
        }
        if (!mapinfo.objects) {
            message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
            return cb(false, false)
        }
        if (mapinfo.approved == 3 || mapinfo.approved <= 0) {
            message.channel.send("❎ **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
            return cb(false, false)
        }
        let mod = osudroid.mods.droid_to_PC(play.mod);
        let playinfo = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]${mod ? ` +${mod}` : ""}`;
        let dup = false;
        let diff = 0;
        let scoreentry = [play.score, play.hash];
        for (let i in scorelist) {
            if (play.hash == scorelist[i][1]) {
                diff = play.score - scorelist[i][0];
                scorelist[i] = scoreentry;
                dup = true;
                break
            }
        }
        if (!dup) {
            scorelist.push(scoreentry);
            diff = scoreentry[0]
        }
        playc++;
        embed.addField(`${submitted}. ${playinfo}`, `**${scoreentry[0].toLocaleString()}** | *+${diff.toLocaleString()}*\n${play.combo}x | ${play.accuracy}% | ${play.miss} ❌`);
        cb()
    })
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    // embed stuff
    let rolecheck;
    try {
        rolecheck = message.member.roles.highest.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
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

        return message.channel.send({embed: embed})
    }
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, can you calm down with the command? I need to rest too, you know.**");
    let ufind = message.author.id;
    let offset = 1;
    let start = 1;
    if (args[0]) offset = parseInt(args[0]);
    if (args[1]) start = parseInt(args[1]);
    if (isNaN(offset)) offset = 1;
    if (isNaN(start)) start = 1;
    if (offset < 1 || offset > 5) return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
    if (offset + start - 1 > 50) return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres[0].uid;
        let discordid = userres[0].discordid;
        let username = userres[0].username;
        new osudroid.PlayerInfo().get({uid: uid}, player => {
            if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find your profile!**");
            if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
            let rplay = player.recent_plays;
            let playentry = [];
            let embed = new Discord.MessageEmbed()
                .setTitle("PP submission info")
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setColor(rolecheck);

            for (let i = start - 1; i < start + offset - 1; i++) {
                if (!rplay[i]) break;
                let play = {
                    title: "", score: "", accuracy: "", miss: "", combo: "", mod: "", hash: ""
                };
                play.title = rplay[i].filename;
                play.score = parseInt(rplay[i].score);
                play.accuracy = parseFloat((parseInt(rplay[i].accuracy) / 1000).toFixed(2));
                play.miss = rplay[i].miss;
                play.combo = rplay[i].combo;
                play.mod = rplay[i].mode;
                play.hash = rplay[i].hash;
                playentry.push(play)
            }

            let scoredb = alicedb.collection("playerscore");
            query = {uid: uid};
            scoredb.find(query).toArray((err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                let prescore = 0;
                let scorelist = [];
                let playc = 0;
                let currentlevel = 1;
                if (res[0]) {
                    currentlevel = res[0].level;
                    prescore = res[0].score;
                    scorelist = res[0].scorelist;
                    playc = res[0].playc
                }
                let score = 0;
                let i = 0;
                let submitted = 1;
                scoreApproval(message, embed, i, submitted, scorelist, playc, playentry, function testResult(error = false, success = true, stopSign = false) {
                    if (stopSign) {
                        if (submitted === 1) return;
                        scorelist.sort((a, b) => {
                            return b[0] - a[0]
                        });
                        for (i in scorelist) {
                            score += scorelist[i][0]
                        }
                        let scorediff = score - prescore;
                        calculateLevel(Math.floor(currentlevel) - 1, score, level => {
                            let levelremain = (level - Math.floor(level)) * 100;
                            embed.setDescription(`Ranked score: **${score.toLocaleString()}**\nScore gained: **${scorediff.toLocaleString()}**\nCurrent level: **${Math.floor(level)} (${levelremain.toFixed(2)}%)${Math.floor(level) > Math.floor(currentlevel)?"\n🆙 Level up!":""}**\nScore needed to level up: **${(scoreRequirement(Math.floor(level) + 1) - score).toLocaleString()}**${!res[0]?"\nHey, looks like you are new to the system! You can ask <@386742340968120321> to enter all of your previous scores, or ignore this message if you want to start new!":""}`);
                            message.channel.send('✅ **| <@' + discordid + '>, successfully submitted your play(s). More info in embed.**', {embed: embed});
                            if (res[0]) {
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
                    if (!error) i++;
                    if (success) submitted++;
                    scoreApproval(message, embed, i, submitted, scorelist, playc, playentry, testResult)
                })
            })
        });
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 1000)
    })
};

module.exports.config = {
    name: "score",
    description: "Submits plays from user's profile into the user's ranked score profile.",
    usage: "score [offset] [start]",
    detail: "`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]",
    permission: "None"
};
