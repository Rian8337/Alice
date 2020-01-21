let Discord = require('discord.js');
let http = require('http');
require('dotenv').config();
let droidapikey = process.env.DROID_API_KEY;

function scoreCalc(score, maxscore, accuracy, misscount) {
    let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
    newscore = newscore - (misscount*0.003*newscore);
    return newscore;
}

function modenum(mod) {
    var res = 4;
    if (mod.includes("r") || mod.includes("HR")) res += 16;
    if (mod.includes("h") || mod.includes("HD")) res += 8;
    if (mod.includes("d") || mod.includes("DT")) res += 64;
    if (mod.includes("c") || mod.includes("NC")) res += 576;
    if (mod.includes("n") || mod.includes("NF")) res += 1;
    if (mod.includes("e") || mod.includes("EZ")) res += 2;
    if (mod.includes("t") || mod.includes("HT")) res += 256;
    return res
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    let binddb = maindb.collection("userbind");
    let dailydb = alicedb.collection("dailychallenge");
    let pointdb = alicedb.collection("playerpoints");
    let query = {discordid: message.author.id};
    binddb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres[0].uid;

        let options = {
            host: "ops.dgsrz.com",
            port: 80,
            path: `/api/getuserinfo.php?apiKey=${droidapikey}&uid=${uid}`
        };
        let content = '';
        let req = http.request(options, res => {
            res.setEncoding("utf8");
            res.on("data", chunk => {
                content += chunk
            });
            res.on("end", () => {
                let resarr = content.split("<br>");
                let headerres = resarr[0].split(" ");
                if (headerres[0] == 'FAILED') return message.channel.send("❎ **| I'm sorry, I cannot find your user profile!**");
                let obj;
                try {
                    obj = JSON.parse(resarr[1])
                } catch (e) {
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                }
                let rplay = obj.recent;
                query = {status: "ongoing"};
                dailydb.find(query).toArray((err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!dailyres[0]) return message.channel.send("❎ **| I'm sorry, there is no ongoing challenge now!**");
                    let hash = dailyres[0].hash;
                    let found = false;
                    let score;
                    let acc;
                    let mod;
                    let miss;
                    for (let i = 0; i < rplay.length; i++) {
                        if (rplay[i].hash == hash) {
                            score = rplay[i].score;
                            acc = (rplay[i].accuracy / 1000).toFixed(2);
                            mod = rplay[i].mode;
                            miss = rplay[i].miss;
                            found = true;
                            break
                        }
                    }
                    if (!found) return message.channel.send("❎ **| I'm sorry, you haven't played the challenge map!**");
                    let passreq = dailyres[0].pass;
                    let pass = false;
                    switch (passreq[0]) {
                        case "score": {
                            if (score > passreq[1]) pass = true;
                            break
                        }
                        case "acc": {
                            if (acc > parseFloat(passreq[1])) pass = true;
                            break
                        }
                        case "miss": {
                            if (miss > passreq[1] || miss == 0) pass = true;
                            break
                        }
                        case "scorev2": {
                            if (scoreCalc(score, passreq[2], acc, miss) > passreq[1]) pass = true;
                            break
                        }
                        default: return message.channel.send("❎ **| Hey, there doesn't seem to be a pass condition. Please contact an Owner!**")
                    }
                    if (!pass) return message.channel.send("❎ **| I'm sorry, you haven't passed the requirement to complete this challenge!**");
                    let constrain = dailyres[0].constrain.toUpperCase();
                    if (constrain != '' && modenum(mod) != modenum(constrain)) pass = false;
                    if (!pass) return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain requirement!**");
                    pointdb.find({discordid: message.author.id}).toArray((err, playerres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (playerres[0]) {
                            if (playerres[0].challenges.includes(dailyres[0].challengeid)) return message.channel.send("❎ **| I'm sorry, you have completed this challenge! Please wait for the next one to start!**");
                            message.channel.send(`✅ **| Congratulations! You have completed challenge \`${dailyres[0].challengeid}\`, earning you \`${dailyres[0].points}\` points!**`);
                            let updateVal = {
                                $set: {
                                    challenges: playerres[0].challenges.push(dailyres[0].challengeid),
                                    points: playerres[0].points + dailyres[0].points
                                }
                            };
                            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                console.log("Player points updated")
                            })
                        } else {
                            message.channel.send(`✅ **| Congratulations! You have completed challenge \`${dailyres[0].challengeid}\`, earning you \`${dailyres[0].points}\` points!**`);
                            let insertVal = {
                                discordid: message.author.id,
                                challenges: [dailyres[0].challengeid],
                                points: dailyres[0].points
                            };
                            pointdb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                console.log("Player points added")
                            })
                        }
                    })
                })
            })
        });
        req.end()
    })
};

module.exports.config = {
    description: "Submits your play for a daily challenge.",
    usage: "daily",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "daily"
};