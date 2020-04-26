const Discord = require('discord.js');
const request = require('request');
const droidapikey = process.env.DROID_API_KEY;
const osudroid = require('../../modules/osu!droid');

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
            console.log(newlevel);
            cb(newlevel)
        }
        else levelUp(newlevel, score, testcb)
    });
    else {
        nextlevel = xpreq;
        prevlevel = scoreRequirement(lvl);
        let newlevel = lvl + (score - prevlevel) / (nextlevel - prevlevel);
        console.log(newlevel);
        cb(newlevel)
    }
}

function retrievePlay(uid, page, cb) {
    console.log("Current page: " + page);
    let url = "http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=" + droidapikey + "&uid=" + uid + "&page=" + page;
    request(url, (err, response, data) => {
        if (err || !data) {
            console.log("Empty response");
            return cb([], false)
        }
        let entries = [];
        let line = data.split("<br>");
        for (let i = 0; i < line.length; i++) entries.push(line[i].split(" "));
        entries.shift();
        if (!entries[0]) cb(entries, true);
        else cb(entries, false)
    })
}

async function scoreCheck(scoreentries, score, cb) {
    const mapinfo = await new osudroid.MapInfo().get({hash: score[11], file: false});
    if (!mapinfo.title) {
        console.log("Map not found");
        return cb()
    }
    if (mapinfo.approved === 3 || mapinfo.approved <= 0) {
        console.log("Map is not ranked, approved, or loved");
        return cb()
    }
    let scoreentry = [parseInt(score[3]), score[11]];
    scoreentries.push(scoreentry);
    cb()
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

    if (!args[0]) return message.channel.send("❎ **| Hey, I don't know who to recalculate!**");
    let ufind = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
    let page = 0;
    let playc = 0;
    let scoreentries = [];

    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};

    binddb.findOne(query, (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she needs to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres.uid;
        let username = userres.username;
        let discordid = userres.discordid;

        let scoredb = alicedb.collection("playerscore");
        query = {uid: uid};
        scoredb.find(query).toArray((err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            retrievePlay(uid, page, async function testcb(entries, stopSign) {
                if (stopSign) {
                    console.log("COMPLETED!");
                    scoreentries.sort((a, b) => {
                        return b[0] - a[0]
                    });
                    let score = 0;
                    for (let i = 0; i < scoreentries.length; i++) score += scoreentries[i][0];
                    calculateLevel(0, score, level => {
                        console.log(score.toLocaleString());
                        message.channel.send(`✅ **| ${message.author}, recalculated <@${discordid}>'s plays: ${score.toLocaleString()} (level ${Math.floor(level)}).**`);
                        if (res[0]) {
                            let updateVal = {
                                $set: {
                                    level: level,
                                    score: score,
                                    playc: playc,
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
                        } else {
                            let insertVal = {
                                uid: uid,
                                username: username,
                                level: level,
                                score: score,
                                playc: playc,
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
                    });
                    return
                }
                console.table(entries);
                let i = 0;
                await scoreCheck(scoreentries, entries[i], async function cb(stopFlag = false) {
                    console.log(i);
                    i++;
                    playc++;
                    if (i < entries.length && !stopFlag) await scoreCheck(scoreentries, entries[i], await cb);
                    else {
                        console.log("Done");
                        scoreentries.sort((a, b) => {return b[0] - a[0]});
                        page++;
                        retrievePlay(uid, page, await testcb)
                    }
                })
            })
        })
    })
};

module.exports.config = {
    name: "completescore",
    description: "Recalculates all plays of an account.",
    usage: "completescore <user>",
    detail: "`user`: The user to calculate [UserResolvable (mention or user ID)]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};