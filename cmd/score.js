var Discord = require('discord.js');
var http = require('http');
var https = require('https');
var droidapikey = process.env.DROID_API_KEY;
var apikey = process.env.OSU_API_KEY;
var config = require('../config.json');
var cd = new Set();

function modread(input) {
    var res = '';
    if (input.includes('n')) res += 'NF';
    if (input.includes('h')) res += 'HD';
    if (input.includes('r')) res += 'HR';
    if (input.includes('e')) res += 'EZ';
    if (input.includes('t')) res += 'HT';
    if (input.includes('c')) res += 'NC';
    if (input.includes('d')) res += 'DT';
    return res
}

function scoreRequirement(lvl) {
    var xp;
    if (lvl <= 100) xp = (5000 / 3 * (4 * Math.pow(lvl, 3) - 3 * Math.pow(lvl, 2) - lvl) + 1.25 * Math.pow(1.8, lvl - 60)) / 1.128;
    else xp = 23875169174 + 15000000000 * (lvl - 100);
    return Math.round(xp)
}

function levelUp(level, score, cb) {
    var nextlevel = scoreRequirement(level + 1);
    if (score < nextlevel) cb(level, true);
    else {
        level++;
        cb(level, false)
    }
}

function calculateLevel(lvl, score, cb) {
    var xpreq = scoreRequirement(lvl + 1);
    var nextlevel = 0;
    var prevlevel = 0;
    if (score >= xpreq) levelUp(lvl, score, function testcb(newlevel, stopSign) {
        if (stopSign) {
            nextlevel = scoreRequirement(newlevel + 1);
            prevlevel = scoreRequirement(newlevel);
            newlevel += (score - prevlevel) / (nextlevel - prevlevel);
            console.log(newlevel);
            cb(newlevel)
        }
        else levelUp(newlevel, score, testcb)
    });
    else {
        nextlevel = xpreq;
        prevlevel = scoreRequirement(lvl);
        var newlevel = lvl + (score - prevlevel) / (nextlevel - prevlevel);
        console.log(newlevel);
        cb(newlevel)
    }
}

function scoreApproval(hash, mod, message, objcount, cb) {
    var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + hash);
    var content = '';

    var req = https.get(options, res => {
        res.setEncoding("utf8");
        res.on("data", chunk => {
            content += chunk
        });
        res.on("error", err => {
            console.log(err);
            message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**");
        });
        res.on("end", () => {
            var obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {
                message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**");
                objcount.x++;
                return cb()
            }
            if (!obj || !obj[0]) {
                console.log("Map not found");
                message.channel.send("❎ **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
                objcount.x++;
                return cb()
            }
            var mapinfo = obj[0];
            if (mapinfo.mode != 0) {
                objcount.x++;
                return cb()
            }
            if (mapinfo.approved == 3 || mapinfo.approved <= 0) {
                message.channel.send("❎ **| I'm sorry, the score system only accepts ranked, approved, and loved maps!**");
                objcount.x++;
                return cb()
            }
            var playinfo = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mod == '')?"": "+") + mod;
            objcount.x++;
            cb(true, playinfo, hash)
        })
    });
    req.end()
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    // embed stuff
    var rolecheck;
    try {
        rolecheck = message.member.highestRole.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);

    // actual command
    if (args[0] == 'about') {
        let embed = new Discord.RichEmbed()
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
            .addField("How does score requirement for each level calculated?", "The scoring system uses a specific formula to calculate score requirements for each level.```if n <= 100:\nscore(n) = (5000 / 3 * (4n^3 - 3n^2 - n) + 1.25 * 1.8^(n - 60)) / 1.128\n\nif n > 100:\nscore(n) = 26931190827 + 15000000000 * (n - 100)```Where *n* is level.\n\nYou can see how many scores do you need left to level up each time you submit your scores.");

        return message.channel.send({embed: embed})
    }
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, can you calm down with the command? I need to rest too, you know.**");
    var ufind = message.author.id;
    var offset = 1;
    var start = 1;
    let objcount = {x: 0};
    if (args[0]) offset = parseInt(args[0]);
    if (args[1]) start = parseInt(args[1]);
    if (isNaN(offset)) offset = 1;
    if (isNaN(start)) start = 1;
    if (offset < 1 || offset > 5) return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
    if (offset + start - 1 > 50) return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
    console.log(ufind);

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

        var options = {
            host: "ops.dgsrz.com",
            port: 80,
            path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
        };
        var content = '';

        var req = http.request(options, res => {
            res.setEncoding("utf8");
            res.on("data", chunk => {
                content += chunk
            });
            res.on("error", err1 => {
                console.log(err1);
                return message.channel.send("Error: Empty API response. Please try again!")
            });
            res.on("end", () => {
                var resarr = content.split("<br>");
                var headerres = resarr[0].split(" ");
                if (headerres[0] == "FAILED") return message.channel.send("❎ **| I'm sorry, I cannot find the username!**");
                var obj;
                try {
                    obj = JSON.parse(resarr[1])
                } catch (e) {
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                }
                var rplay = obj.recent;
                var playentry = [];
                let embed = new Discord.RichEmbed()
                    .setTitle("Score submission info")
                    .setFooter("Alice Synthesis Thirty", footer[index])
                    .setColor(rolecheck);

                for (var i = start - 1; i < offset + start - 1; i++) {
                    if (!rplay[i]) break;
                    var play = {
                        title: "", score: "", mod: "", combo: "", acc: "", miss: "", hash: ""
                    };
                    play.title = rplay[i].filename;
                    play.mod = modread(rplay[i].mode);
                    play.score = parseInt(rplay[i].score);
                    play.combo = rplay[i].combo;
                    play.acc = rplay[i].accuracy.toPrecision(4) / 1000;
                    play.miss = rplay[i].miss;
                    play.hash = rplay[i].hash;
                    playentry.push(play)
                }
                console.log(playentry);

                let scoredb = alicedb.collection("playerscore");
                query = {uid: uid};
                scoredb.find(query).toArray((err, res) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("Error: Empty database response. Please try again!")
                    }
                    var prescore = 0;
                    var scorelist = [];
                    var playc = 0;
                    var currentlevel = 1;
                    if (res[0]) {
                        currentlevel = res[0].level;
                        prescore = res[0].score;
                        scorelist = res[0].scorelist;
                        playc = res[0].playc
                    }
                    var score = 0;
                    var submitted = 0;
                    playentry.forEach(x => {
                        if (x.title) scoreApproval(x.hash, x.mod, message, objcount, (valid = false, playinfo, hash) => {
                            console.log(objcount);
                            if (valid) {
                                var scoreentry = [x.score, hash];
                                var diff = 0;
                                var dup = false;
                                for (i in scorelist) {
                                    if (hash == scorelist[i][1]) {
                                        diff = scoreentry[0] - scorelist[i][0];
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
                                submitted++;
                                embed.addField(`${submitted}. ${playinfo}`, `**${scoreentry[0].toLocaleString()}** | *+${diff.toLocaleString()}*\n${x.combo}x | ${x.acc}% | ${x.miss} ❌`)
                            }
                            if (objcount.x == playentry.length && submitted != 0) {
                                scorelist.sort((a, b) => {
                                    return b[0] - a[0]
                                });
                                for (i in scorelist) {
                                    score += scorelist[i][0]
                                }
                                var scorediff = score - prescore;
                                calculateLevel(Math.floor(currentlevel) - 1, score, level => {
                                    var levelremain = (level - Math.floor(level)) * 100;
                                    embed.setDescription(`Ranked score: **${score.toLocaleString()}**\nScore gained: **${scorediff.toLocaleString()}**\nCurrent level: **${Math.floor(level)} (${levelremain.toFixed(2)}%)${Math.floor(level) > Math.floor(currentlevel)?"\n🆙 Level up!":""}**\nScore needed to level up: **${(scoreRequirement(Math.floor(level) + 1) - score).toLocaleString()}**${!res[0]?"\n\nHey, looks like you are new to the system! You can ask <@386742340968120321> to enter all of your previous scores, or ignore this message if you want to start fresh!":""}`);
                                    message.channel.send('✅ **| <@' + discordid + '> successfully submitted your play(s). More info in embed.**', {embed: embed});
                                    if (res[0]) {
                                        var updateVal = {
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
                                        var insertVal = {
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
                                })
                            }
                        })
                    })
                })
            })
        });
        req.end();
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 1000)
    })
};

module.exports.config = {
    description: "Submits plays from user's profile into the user's ranked score profile.",
    usage: "score [offset] [start]",
    detail: "`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]",
    permission: "None"
};

module.exports.help = {
    name: "score"
};
