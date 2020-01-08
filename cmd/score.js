var Discord = require('discord.js');
var http = require('http');
var https = require('https');
var droidapikey = process.env.DROID_API_KEY;
var apikey = process.env.OSU_API_KEY;
var config = require('../config.json');

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
    if (lvl <= 100) xp = 5000 / 3 * (4 * Math.pow(lvl, 3) - 3 * Math.pow(lvl, 2) - lvl) + 1.25 * Math.pow(1.8, lvl - 60);
    else xp = 26931190827 + 15000000000 * (lvl - 100);
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
        var newlevel = lvl + ((score - prevlevel) / (nextlevel - prevlevel));
        console.log(newlevel);
        cb(newlevel)
    }
}

function scoreApproval(score, hash, mod, acc, combo, miss, message, objcount, cb) {
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
            objcount.x++;
        });
        res.on("end", () => {
            var obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {
                message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**");
                objcount.x++;
                return
            }
            if (!obj[0]) {
                console.log("Map not found");
                message.channel.send("❎ **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
                objcount.x++;
                return
            }
            var mapinfo = obj[0];
            if (mapinfo.mode != 0) return;
            if (mapinfo.approved == 3 || mapinfo.approved <= 0) {
                message.channel.send("❎ **| I'm sorry, the score system only accepts ranked, approved, and loved maps!**");
                objcount.x++;
                return
            }
            var playinfo = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mod == '')?"": "+") + mod;
            objcount.x++;
            cb(playinfo, score, mod, acc, combo, miss, hash)
        })
    });
    req.end()
}

module.exports.run = (client, message, args, maindb, alicedb) => {
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
                var rolecheck;
                try {
                    rolecheck = message.member.highestRole.hexColor
                } catch (e) {
                    rolecheck = "#000000"
                }
                let footer = config.avatar_list;
                const index = Math.floor(Math.random() * (footer.length - 1) + 1);
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
                    var prescore;
                    var scorelist;
                    var playc;
                    var currentlevel;
                    if (res[0]) {
                        currentlevel = res[0].level;
                        prescore = res[0].score;
                        scorelist = res[0].scorelist;
                        playc = res[0].playc
                    }
                    else {
                        currentlevel = 1;
                        prescore = 0;
                        scorelist = [];
                        playc = 0
                    }
                    var score = 0;
                    var submitted = 0;
                    for (var i = 0; i < playentry.length; i++) {
                        if (playentry[i].title) scoreApproval(playentry[i].score, playentry[i].hash, playentry[i].mod, playentry[i].acc, playentry[i].combo, playentry[i].miss, message, objcount, (playinfo, pscore, pmod, pacc, pcombo, pmiss, hash) => {
                            console.log(objcount);
                            var scoreentry = [pscore, hash];
                            var diff = 0;
                            var dup = false;
                            for (i in scorelist) {
                                if (hash == scorelist[i][1]) {
                                    scorelist[i] = scoreentry;
                                    dup = true;
                                    playc++;
                                    diff = scoreentry[0] - scorelist[i][0];
                                    break
                                }
                            }
                            if (!dup) {
                                scorelist.push(scoreentry);
                                playc++;
                                diff = scoreentry[0]
                            }
                            scorelist.sort((a, b) => {
                                return b[0] - a[0]
                            });
                            submitted++;
                            embed.addField(`${submitted}. ${playinfo}`, `**${scoreentry[0].toLocaleString()}** | *+${diff.toLocaleString()}*\n${pcombo}x | ${pacc}% | ${pmiss} ❌`);
                            if (objcount.x == playentry.length) {
                                for (i in scorelist) {
                                    score += scorelist[i][0]
                                }
                                var scorediff = score - prescore;
                                calculateLevel(Math.floor(currentlevel) - 1, score, level => {
                                    var levelremain = (level - Math.floor(level)) * 100;
                                    embed.setDescription(`Ranked score: **${score.toLocaleString()}**\nScore gained: **${scorediff.toLocaleString()}**\nCurrent level: **${Math.floor(level)} (${levelremain.toFixed(2)}%**)`);
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
                    }
                })
            })
        });
        req.end()
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
