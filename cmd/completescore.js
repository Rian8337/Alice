var Discord = require('discord.js');
var request = require('request');
require('dotenv').config();
var apikey = process.env.OSU_API_KEY;
var droidapikey = process.env.DROID_API_KEY;

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

function retrievePlay(uid, page, cb) {
    console.log("Current page: " + page);
    var url = "http://ops.dgsrz.com/api/scoresearch.php?apiKey=" + droidapikey + "&uid=" + uid + "&page=" + page;
    request(url, (err, response, data) => {
        if (!data) {
            console.log("Empty response");
            page--;
        }
        else {
            var entries = [];
            var line = data.split("<br>");
            for (var i = 0; i < line.length; i++) {
                entries.push(line[i].split(" "))
            }
            entries.shift();
            if (!entries[0]) cb(entries, true);
            else cb(entries, false)
        }
    })
}

function scoreCheck(scoreentries, score, cb) {
    if (!score) {
        console.log("erm how do we get here");
        return cb()
    }
    if (score[1] == '0') {
        console.log("0 score found");
        return cb()
    }
    var url = "https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + score[8];
    request(url, (err, response, data) => {
        if (!data) {
            console.log("Empty response");
            return cb()
        }
        if (data.includes("<html>")) {
            console.log("JSON error");
            return cb(true)
        }
        var obj;
        try {
            obj = JSON.parse(data)
        } catch (e) {
            console.log("JSON error");
            return cb(true)
        }
        if (!obj[0]) {
            console.log("Map not found");
            return cb()
        }
        var mapinfo = obj[0];
        if (mapinfo.mode != 0) cb();
        if (mapinfo.approved == 3 || mapinfo.approved <= 0) {
            console.log("Map is not ranked, approved, or loved");
            return cb()
        }
        var scoreentry = [parseInt(score[1]), score[8]];
        scoreentries.push(scoreentry);
        cb()
    })
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    if (!args[0]) return message.channel.send("❎ **| Hey, I don't know who to recalculate!**");
    var ufind = args[0];
    ufind = ufind.replace("<@", "");
    ufind = ufind.replace(">", "");
    var page = 0;
    var playc = 0;
    var scoreentries = [];

    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};

    binddb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she needs to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres[0].uid;
        let username = userres[0].username;
        let discordid = userres[0].discordid;

        let scoredb = alicedb.collection("playerscore");
        query = {uid: uid};
        scoredb.find(query).toArray((err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            retrievePlay(uid, page, function testcb(entries, stopSign) {
                if (stopSign) {
                    console.log("COMPLETED!");
                    scoreentries.sort((a, b) => {return b[0] - a[0]});
                    var score = 0;
                    for (i = 0; i < scoreentries.length; i++) {
                        score += scoreentries[i][0]
                    }
                    console.log(score.toLocaleString());
                    message.channel.send(`✅ **| ${message.author}, recalculated <@${discordid}>'s plays: ${score.toLocaleString()}.**`);
                    if (res[0]) {
                        var updateVal = {
                            $set: {
                                score: score.toString(),
                                playc: playc.toString(),
                                scorelist: scoreentries
                            }
                        };
                        scoredb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            console.log("Score updated")
                        })
                    }
                    else {
                        var insertVal = {
                            uid: uid.toString(),
                            username: username,
                            score: score.toString(),
                            playc: playc.toString(),
                            scorelist: scoreentries
                        };
                        scoredb.insertOne(insertVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            console.log("Score added")
                        })
                    }
                    return
                }
                console.table(entries);
                var i = 0;
                scoreCheck(scoreentries, entries[i], function cb(stopFlag = false) {
                    console.log(i);
                    i++;
                    playc++;
                    if (i < entries.length && !stopFlag) scoreCheck(scoreentries, entries[i], cb);
                    else {
                        console.log("Done");
                        scoreentries.sort((a, b) => {return b[0] - a[0]});
                        page++;
                        retrievePlay(uid, page, testcb)
                    }
                })
            })
        })
    })
};

module.exports.config = {
    description: "Recalculates all plays of an account.",
    usage: "completescore <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};

module.exports.help = {
    name: "completescore"
};
