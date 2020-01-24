let Discord = require('discord.js');
let http = require('http');
let https = require('https');
require('dotenv').config();
let apikey = process.env.OSU_API_KEY;
let droidapikey = process.env.DROID_API_KEY;
let config = require('../config.json');
let cd = new Set();

function isEligible(member) {
    var res = 0;
    var eligibleRoleList = config.mute_perm; //mute_permission but used for this command, practically the same
    eligibleRoleList.forEach((id) => {
        if (member.roles.has(id[0])) res = id[1]
    });
    return res
}

function mapstatus(status) {
    switch (status) {
        case -2: return "Graveyard";
        case -1: return "WIP";
        case 0: return "Pending";
        case 1: return "Ranked";
        case 2: return "Approved";
        case 3: return "Qualified";
        case 4: return "Loved";
        default: return "Unspecified"
    }
}

function mapstatusread(status) {
    switch (status) {
        case -2: return 16711711;
        case -1: return 9442302;
        case 0: return 16312092;
        case 1: return 2483712;
        case 2: return 16741376;
        case 3: return 5301186;
        case 4: return 16711796;
        default: return 0
    }
}

function time(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

function timeconvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
}

function scoreCalc(score, maxscore, accuracy, misscount) {
    let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
    newscore = newscore - (misscount*0.003*newscore);
    return newscore;
}

function modenum(mod) {
    var res = 4;
    if (mod.includes("n") || mod.includes("NF")) res += 1;
    if (mod.includes("e") || mod.includes("EZ")) res += 2;
    if (mod.includes("t") || mod.includes("HT")) res += 256;
    if (mod.includes("h") || mod.includes("HD")) res += 8;
    if (mod.includes("d") || mod.includes("DT")) res += 64;
    if (mod.includes("c") || mod.includes("NC")) res += 576;
    if (mod.includes("r") || mod.includes("HR")) res += 16;
    return res
}

function rankConvert(rank) {
    let res = 0;
    switch (rank.toUpperCase()) {
        case "D": {
            res = 1;
            break
        }
        case "C": {
            res = 2;
            break
        }
        case "B": {
            res = 3;
            break
        }
        case "A": {
            res = 4;
            break
        }
        case "S": {
            res = 5;
            break
        }
        case "X": {
            res = 6;
            break
        }
        case "SH": {
            res = 7;
            break
        }
        case "XH": {
            res = 8;
            break
        }
    }
    return res
}

function spaceFill(s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s
}

function editpoint(res, page) {
    var output = '#   | Username         | UID    | Challenges | Points\n';
    for (var i = page * 20; i < page * 20 + 20; i++) {
        if (res[i]) {
            if (res[i].points && res[i].challenges) output += spaceFill((i+1).toString(),4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].challenges.length.toString(), 11) + ' | ' + parseInt(res[i].points).toString() + '\n';
            else {output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 11) + ' | 0\n';}
        }
        else {output += spaceFill("-", 4) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 11) + ' | -\n';}
    }
    output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
    return output
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, this command is still in testing!**");
    //if (message.guild.id != '316545691545501706') return message.channel.send("❎ **| I'm sorry, this command is only allowed in osu!droid (International) Discord server!**");
    // declaration of variables used in switch cases
    let binddb = maindb.collection("userbind");
    let dailydb = alicedb.collection("dailychallenge");
    let pointdb = alicedb.collection("playerpoints");
    let coin = client.emojis.get("669532330980802561");
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
    let embed = new Discord.RichEmbed();

    switch (args[0]) {
        case "about": {
            // introduction to the daily challenge system
            // uses embed for a cleaner look and to override
            // Discord's message limit
            let rolecheck;
            try {
                rolecheck = message.member.highestRole.hexColor
            } catch (e) {
                rolecheck = "#000000"
            }
            embed.setTitle("osu!droid Daily/Weekly Challenges")
                .setThumbnail("https://image.frl/p/beyefgeq5m7tobjg.jpg")
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setColor(rolecheck)
                .setDescription(`This is a system that provides daily and weekly challenges for you to complete. Gain points and ${coin}Alice coins as you complete challenges!`)
                .addField("How does it work?", `Every day, there will be a new daily challenge to complete. Each challenges grant a different amount of points depending on how hard the challenge is. You can get points and ${coin}Alice coins by passing the challenge. There will be 3 bonuses that allows you to gain more points and ${coin}Alice coins, too! Each point converts to ${coin}\`10\` Alice coins.\n\nThe weekly bounty challenge, which is only available once per week, grants more points and ${coin}Alice coins as this challenge is considerably harder than any daily challenges. That's also why you have a week to complete it, too!`)
                .addField("How can I submit challenges?", `There will be a separate beatmap set for you to download in case you have played the original map. In fact, you **must** download the set in order to submit your play.\n\nOnce you complete a challenge, use the \`a!daily\` command to submit your play for daily challenges or \`a!daily bounty\` for weekly challenges. You can also specify the bonus type you want to submit for daily challenges. For more information, use \`a!help daily\`.`)
                .addField("How can I use my points and Alice coins?", `As of now, there is no use for points and ${coin}Alice coins. Originally, ${coin}Alice coins were made for another upcoming project, so stay tuned for that.`)
                .addField("Is there a leaderboard for points and Alice coins?", `There is no leaderboard for ${coin}Alice coins, however there is a leaderboard for points. You can use \`a!daily lb\` to view the leaderboard. For more information, use \`a!help daily\`.`)
                .addField("I have more questions that are not mentioned in here!", "You can ask <@386742340968120321> for more information about daily and weekly challenges.");

            message.channel.send({embed: embed}).catch(console.error);
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 5000);
            break
        }
        case "profile": {
            // checks for a user's profile
            // ===========================
            // if args[1] is not defined,
            // defaults to the message author
            let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]?args[1]:message.author.id));
            if (!user) return message.channel.send("❎ **| Hey, can you give me a valid user?**");

            let query = {discordid: user.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded yet. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres[0].uid;
                let username = userres[0].username;
                pointdb.find(query).toArray((err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    let alicecoins = 0;
                    let points = 0;
                    let challenges = 0;
                    let challengelist = '';
                    if (dailyres[0]) {
                        alicecoins = dailyres[0].alicecoins;
                        points = dailyres[0].points;
                        challenges = dailyres[0].challenges.length;
                        challengelist = dailyres[0].challenges
                    }
                    let options = {
                        host: "ops.dgsrz.com",
                        port: 80,
                        path: "/profile.php?uid=" + uid + ".html"
                    };
                    let content = '';
                    let req = http.request(options, res => {
                        res.setEncoding("utf8");
                        res.on("data", chunk => {
                            content += chunk
                        });
                        res.on("end", () => {
                            let b = content.split('\n');
                            let avalink = "";
                            for (x = 0; x < b.length; x++) {
                                if (b[x].includes('h3 m-t-xs m-b-xs')) {
                                    b[x - 3] = b[x - 3].replace('<img src="', "");
                                    b[x - 3] = b[x - 3].replace('" class="img-circle">', "");
                                    b[x - 3] = b[x - 3].trim();
                                    avalink = b[x - 3];
                                }
                            }
                            let challengestring = '';
                            let i = 0;
                            for (i; i < 10; i++) {
                                if (!challengelist[i]) break;
                                challengestring += `\`${challengelist[i][0]}\` `
                            }
                            if (i == 0) challengestring += "`None`";
                            else if (i == 1) challengestring = challengestring.trimRight();
                            else challengestring = challengestring.trimRight().split(" ").join(", ");
                            if (i == 10) challengestring += `, and ${challenges - i} more...`;

                            let rolecheck;
                            try {
                                rolecheck = message.member.highestRole.hexColor
                            } catch (e) {
                                rolecheck = "#000000"
                            }
                            let footer = config.avatar_list;
                            const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                            embed.setAuthor(`Daily/Weekly Challenge Profile for ${username}`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}`)
                                .setColor(rolecheck)
                                .setFooter("Alice Synthesis Thirty", footer[index])
                                .setThumbnail(avalink)
                                .addField("Statistics", `**Points**: ${points}\n**Alice Coins**: ${coin}${alicecoins}\n**Challenges completed**: ${challengestring} (${challenges})`);

                            message.channel.send({embed: embed}).catch(console.error)
                        })
                    });
                    req.end();
                    cd.add(message.author.id);
                    setTimeout(() => {
                        cd.delete(message.author.id)
                    }, 2000)
                })
            });
            break
        }
        case "lb": {
            // views leaderboard for points
            // ============================
            // alice coins leaderboard is
            // redundant as you can check
            // it using a!daily profile
            let page = 0;
            if (parseInt(args[0]) > 0) page = parseInt(args[0]) - 1;
            let pointsort = {points: -1};
            pointdb.find({}, {projection: {_id: 0, uid: 1, points: 1, username: 1, challenges: 1}}).sort(pointsort).toArray((err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                if (!res[page*20]) return message.channel.send("Nah we don't have that much player :p");
                let output = editpoint(res, page);
                message.channel.send('```' + output + '```').then (msg => {
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(e => console.log(e))
                            })
                        })
                    });

                    let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
                    let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
                    let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
                    let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

                    backward.on('collect', () => {
                        page = 0;
                        output = editpoint(res, page);
                        msg.edit('```' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
                    });

                    back.on('collect', () => {
                        if (page === 0) page = Math.floor(res.length / 20);
                        else page--;
                        output = editpoint(res, page);
                        msg.edit('```' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
                    });

                    next.on('collect', () => {
                        if ((page + 1) * 20 >= res.length) page = 0;
                        else page++;
                        output = editpoint(res, page);
                        msg.edit('```' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
                    });

                    forward.on('collect', () => {
                        page = Math.floor(res.length / 20);
                        output = editpoint(res, page);
                        msg.edit('```' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
                    })
                });
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id)
                }, 10000)
            });
            break
        }
        case "check": {
            // checks current ongoing daily challenge
            // ======================================
            // does not need any extra args as there
            // is only one challenge running per day
            let query = {status: "ongoing"};
            dailydb.find(query).toArray((err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!dailyres[0]) return message.channel.send("❎ **| I'm sorry, there is no ongoing challenge now!**");
                let pass = dailyres[0].pass;
                let bonus = dailyres[0].bonus;
                let constrain = dailyres[0].constrain.toUpperCase();
                let beatmapid = dailyres[0].beatmapid;
                let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${beatmapid}`);
                let content = '';
                let req = https.get(options, res => {
                    res.setEncoding("utf8");
                    res.on("data", chunk => {
                        content += chunk
                    });
                    res.on("end", () => {
                        let obj;
                        try {
                            obj = JSON.parse(content)
                        } catch (e) {
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                        }
                        if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the beatmap!**");
                        let mapinfo = obj[0];
                        let title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                        let hitlength = mapinfo.hit_length;
                        let maplength = mapinfo.total_length;
                        let timelimit = dailyres[0].timelimit - Math.floor(Date.now() / 1000);
                        let pass_string = '';
                        let bonus_string = '';
                        switch (pass[0]) {
                            case "score": {
                                pass_string = `Score V1 above **${pass[1].toLocaleString()}**`;
                                break
                            }
                            case "acc": {
                                pass_string = `Accuracy above **${parseFloat(pass[1])}%**`;
                                break
                            }
                            case "scorev2": {
                                pass_string = `Score V2 above **${pass[1].toLocaleString()}**`;
                                break
                            }
                            case "miss": {
                                pass_string = pass[1] == 0?"No misses":`Miss count below **${pass[1]}**`;
                                break
                            }
                            case "combo": {
                                pass_string = `Combo above **${pass[1]}**`;
                                break
                            }
                            case "rank": {
                                pass_string = `**${pass[1].toUpperCase()}** rank or above`;
                                break
                            }
                            default: pass_string = 'No pass condition'
                        }
                        let difflist = ["Easy", "Normal", "Hard"];
                        for (let i = 0; i < bonus.length; i++) {
                            bonus_string += `${difflist[i]}: `;
                            switch (bonus[i][0]) {
                                case "score": {
                                    bonus_string += `Score V1 above **${bonus[i][1].toLocaleString()}** (__${bonus[i][2]}__ ${bonus[i][2] == 1?"point":"points"})`;
                                    break
                                }
                                case "acc": {
                                    bonus_string += `Accuracy above **${parseFloat(bonus[i][1]).toFixed(2)}%** (__${bonus[i][2]}__ ${bonus[i][2] == 1?"point":"points"})`;
                                    break
                                }
                                case "scorev2": {
                                    bonus_string += `Score V2 above **${bonus[i][1].toLocaleString()}** (__${bonus[i][3]}__ ${bonus[i][3] == 1?"point":"points"})`;
                                    break
                                }
                                case "miss": {
                                    bonus_string += `${bonus[i][1] == 0?"No misses":`Miss count below **${bonus[i][1]}**`} (__${bonus[i][2]}__ ${bonus[i][2] == 1?"point":"points"})`;
                                    break
                                }
                                case "mod": {
                                    bonus_string += `Usage of **${bonus[i][1].toUpperCase()}** mod (__${bonus[i][2]}__ ${bonus[i][2] == 1?"point":"points"})`;
                                    break
                                }
                                case "combo": {
                                    bonus_string += `Combo above **${bonus[i][1]}** (__${bonus[i][2]}__ ${bonus[i][2] == 1?"point":"points"})`;
                                    break
                                }
                                case "rank": {
                                    bonus_string += `**${bonus[i][1].toUpperCase()}** rank or above (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                    break
                                }
                                default: bonus_string += "No bonuses available"
                            }
                            bonus_string += '\n'
                        }
                        let constrain_string = constrain == '' ? "Any mod is allowed" : `**${constrain}** mod only`;
                        embed.setAuthor("osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                            .setColor(mapstatusread(parseInt(mapinfo.approved)))
                            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${dailyres[0].challengeid} | Time left: ${timeconvert(timelimit)}`, footer[index])
                            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                            .setDescription(`**[${title}](https://osu.ppy.sh/b/${beatmapid})**\nDownload: [Google Drive](${dailyres[0].link[0]}) - [OneDrive](${dailyres[0].link[1]})`)
                            .addField(`Map Info`, `CS: ${mapinfo.diff_size} - AR: ${mapinfo.diff_approach} - OD: ${mapinfo.diff_overall} - HP: ${mapinfo.diff_drain}\nBPM: ${mapinfo.bpm} - Length: ${time(hitlength)}/${time(maplength)} - Max Combo: ${mapinfo.max_combo}x\nLast Update: ${mapinfo.last_update} | ${mapstatus(parseInt(mapinfo.approved))}\n❤️ ${mapinfo.favourite_count} - ▶️ ${mapinfo.playcount}`)
                            .addField(`Star Rating: ${"★".repeat(Math.min(10, parseInt(mapinfo.difficultyrating)))} ${parseFloat(mapinfo.difficultyrating).toFixed(2)}`, `**${dailyres[0].points == 1?"Point":"Points"}**: ${dailyres[0].points} ${dailyres[0].points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

                        message.channel.send({embed: embed}).catch(console.error)
                    })
                });
                req.end();
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id)
                }, 2500)
            });
            break
        }
        case "bounty": {
            // main starting point for weekly bounty challenges
            // ================================================
            // if args[1] is 'check', will check the current
            // ongoing weekly bounty, otherwise submits
            // the message author's play for validation
            if (args[1] == "check") {
                let query = {status: "w-ongoing"};
                dailydb.find(query).toArray((err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!dailyres[0]) return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                    let pass = dailyres[0].pass;
                    let bonus = dailyres[0].bonus;
                    let constrain = dailyres[0].constrain.toUpperCase();
                    let beatmapid = dailyres[0].beatmapid;
                    let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${beatmapid}`);
                    let content = '';
                    let req = https.get(options, res => {
                        res.setEncoding("utf8");
                        res.on("data", chunk => {
                            content += chunk
                        });
                        res.on("end", () => {
                            let obj;
                            try {
                                obj = JSON.parse(content)
                            } catch (e) {
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                            }
                            if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the beatmap!**");
                            let mapinfo = obj[0];
                            let title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                            let hitlength = mapinfo.hit_length;
                            let maplength = mapinfo.total_length;
                            let timelimit = dailyres[0].timelimit - Math.floor(Date.now() / 1000);
                            let pass_string = '';
                            let bonus_string = '';
                            switch (pass[0]) {
                                case "score": {
                                    pass_string = `Score V1 above **${pass[1].toLocaleString()}**`;
                                    break
                                }
                                case "acc": {
                                    pass_string = `Accuracy above **${parseFloat(pass[1])}%**`;
                                    break
                                }
                                case "scorev2": {
                                    pass_string = `Score V2 above **${pass[1].toLocaleString()}**`;
                                    break
                                }
                                case "miss": {
                                    pass_string = pass[1] == 0?"No misses":`Miss count below **${pass[1]}**`;
                                    break
                                }
                                case "combo": {
                                    pass_string = `Combo above **${pass[1]}**`;
                                    break
                                }
                                case "rank": {
                                    pass_string = `**${pass[1].toUpperCase()}** rank or above`;
                                    break
                                }
                                default: pass_string = 'No pass condition'
                            }
                            switch (bonus[0]) {
                                case "score": {
                                    bonus_string += `Score V1 above **${bonus[1].toLocaleString()}** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "acc": {
                                    bonus_string += `Accuracy above **${parseFloat(bonus[1]).toFixed(2)}%** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "scorev2": {
                                    bonus_string += `Score V2 above **${bonus[1].toLocaleString()}** (__${bonus[3]}__ ${bonus[3] == 1?"point":"points"})`;
                                    break
                                }
                                case "miss": {
                                    bonus_string += `${bonus[1] == 0?"No misses":`Miss count below **${bonus[1]}**`} (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "mod": {
                                    bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "combo": {
                                    bonus_string += `Combo above **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "rank": {
                                    bonus_string += `**${bonus[1].toUpperCase()}** rank or above (__${bonus[2]}__ ${bonus[2] == 1 ? "point" : "points"})`;
                                    break
                                }
                                default: bonus_string += "No bonuses available"
                            }
                            let constrain_string = constrain == '' ? "Any mod is allowed" : `**${constrain}** only`;
                            embed.setAuthor("osu!droid Weekly Bounty Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                                .setColor(mapstatusread(parseInt(mapinfo.approved)))
                                .setFooter(`Alice Synthesis Thirty | Challenge ID: ${dailyres[0].challengeid} | Time left: ${timeconvert(timelimit)}`, footer[index])
                                .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                                .setDescription(`**[${title}](https://osu.ppy.sh/b/${beatmapid})**\nDownload: [Google Drive](${dailyres[0].link[0]}) - [OneDrive](${dailyres[0].link[1]})`)
                                .addField(`Map Info`, `CS: ${mapinfo.diff_size} - AR: ${mapinfo.diff_approach} - OD: ${mapinfo.diff_overall} - HP: ${mapinfo.diff_drain}\nBPM: ${mapinfo.bpm} - Length: ${time(hitlength)}/${time(maplength)} - Max Combo: ${mapinfo.max_combo}x\nLast Update: ${mapinfo.last_update} | ${mapstatus(parseInt(mapinfo.approved))}\n❤️ ${mapinfo.favourite_count} - ▶️ ${mapinfo.playcount}`)
                                .addField(`Star Rating: ${"★".repeat(Math.min(10, parseInt(mapinfo.difficultyrating)))} ${parseFloat(mapinfo.difficultyrating).toFixed(2)}`, `**${dailyres[0].points == 1?"Point":"Points"}**: ${dailyres[0].points} ${dailyres[0].points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

                            message.channel.send({embed: embed}).catch(console.error)
                        })
                    });
                    req.end();
                    cd.add(message.author.id);
                    setTimeout(() => {
                        cd.delete(message.author.id)
                    }, 2500)
                });
                return
            }
            let query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres[0].uid;
                let username = userres[0].username;
                let options = {
                    host: "ops.dgsrz.com",
                    port: 80,
                    path: `/api/getuserinfo.php?apiKey=${droidapikey}&uid=${uid}`
                };
                let content = '';
                let req = http.request(options, res => {
                    res.setEncoding('utf8');
                    res.on("data", chunk => {
                        content += chunk
                    });
                    res.on("end", () => {
                        let resarr = content.split("<br>");
                        let headerres = resarr[0].split(" ");
                        if (headerres[0] == "FAILED") message.channel.send("❎ **| I'm sorry, I cannot find your user profile!**");
                        let obj;
                        try {
                            obj = JSON.parse(resarr[1])
                        } catch (e) {
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                        }
                        let rplay = obj.recent;
                        query = {status: "w-ongoing"};
                        dailydb.find(query).toArray((err, dailyres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!dailyres[0]) return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                            let challengeid = dailyres[0].challengeid;
                            let hash = dailyres[0].hash;
                            let found = false;
                            let score;
                            let acc;
                            let mod;
                            let miss;
                            let combo;
                            let rank;
                            for (let i = 0; i < rplay.length; i++) {
                                if (rplay[i].hash == hash) {
                                    score = rplay[i].score;
                                    acc = parseFloat((rplay[i].accuracy / 1000).toFixed(2));
                                    mod = rplay[i].mode;
                                    miss = rplay[i].miss;
                                    combo = rplay[i].combo;
                                    rank = rplay[i].mark;
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
                                    if (miss < passreq[1] || miss == 0) pass = true;
                                    break
                                }
                                case "combo": {
                                    if (combo > passreq[1]) pass = true;
                                    break
                                }
                                case "scorev2": {
                                    if (scoreCalc(score, passreq[2], acc, miss) > passreq[1]) pass = true;
                                    break
                                }
                                case "rank": {
                                    if (rankConvert(rank) >= rankConvert(passreq[1])) pass = true;
                                    break
                                }
                                default: return message.channel.send("❎ **| Hey, there doesn't seem to be a pass condition. Please contact an Owner!**")
                            }
                            if (!pass) return message.channel.send("❎ **| I'm sorry, you haven't passed the requirement to complete this challenge!**");
                            let constrain = dailyres[0].constrain.toUpperCase();
                            if (constrain != '' && modenum(mod) != modenum(constrain)) pass = false;
                            if (!pass) return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain requirement!**");

                            let points = 0;
                            let bonus = dailyres[0].bonus;
                            switch (bonus[0]) {
                                case "score": {
                                    if (score > bonus[1]) points += bonus[2];
                                    break
                                }
                                case "acc": {
                                    if (acc > bonus[1]) points += bonus[2];
                                    break
                                }
                                case "miss": {
                                    if (miss < bonus[1] || miss == 0) points += bonus[2];
                                    break
                                }
                                case "combo": {
                                    if (combo > bonus[1]) points += bonus[2];
                                    break
                                }
                                case "scorev2": {
                                    if (scoreCalc(score, bonus[2], acc, miss) > bonus[1]) points += bonus[3];
                                    break
                                }
                                case "mod": {
                                    if (modenum(mod) == modenum(bonus[1].toUpperCase())) points += bonus[2];
                                    break
                                }
                                case "rank": {
                                    if (rankConvert(rank) >= rankConvert(bonus[1])) points += bonus[2]
                                }
                            }
                            let bonuscomplete = points != 0 || bonus.toLowerCase() == 'none';
                            pointdb.find({discordid: message.author.id}).toArray((err, playerres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (playerres[0]) {
                                    let challengelist = playerres[0].challenges;
                                    console.log(challengelist);
                                    found = false;
                                    let bonuscheck = false;
                                    for (let i = 0; i < challengelist.length; i++) {
                                        if (challengelist[i][0] == challengeid) {
                                            bonuscheck = challengelist[i][1];
                                            challengelist[i][1] = bonuscomplete;
                                            found = true;
                                            break
                                        }
                                    }
                                    if (found && bonuscheck) return message.channel.send("❎ **| I'm sorry, you have completed this bounty challenge! Please wait for the next one to start!**");
                                    if (!found) {
                                        points += dailyres[0].points;
                                        challengelist.push([challengeid, bonuscomplete])
                                    }
                                    let totalpoint = playerres[0].points + points;
                                    let alicecoins = playerres[0].alicecoins + points * 10;
                                    message.channel.send(`✅ **| Congratulations! You have completed weekly bounty challenge \`${challengeid}\`${bonuscomplete?` and its bonus`:""}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 10}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
                                    let updateVal = {
                                        $set: {
                                            username: username,
                                            uid: uid,
                                            challenges: challengelist,
                                            points: totalpoint,
                                            alicecoins: alicecoins
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
                                    points += dailyres[0].points;
                                    message.channel.send(`✅ **| Congratulations! You have completed weekly bounty challenge \`${challengeid}\`${bonuscomplete ? ` and its bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins.**`);
                                    let insertVal = {
                                        username: username,
                                        uid: uid,
                                        discordid: message.author.id,
                                        challenges: [[challengeid, bonuscomplete]],
                                        points: points,
                                        dailycooldown: 0,
                                        alicecoins: points * 10
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
                req.end();
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id)
                }, 5000)
            });
            break
        }
        case "start": {
            // starts a challenge, useful if bot somehow
            // fails to start one. Restricted to specific
            // people only
            if (message.author.id != '386742340968120321' && message.author.id != '132783516176875520' && !message.author.bot) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
            let challengeid = args[1];
            if (!challengeid) return message.channel.send("❎ **| Hey, I don't know which challenge to start!**");

            let query = {challengeid: challengeid};
            dailydb.find(query).toArray((err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!dailyres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the challenge!**");
                if (dailyres[0].status != 'scheduled') return message.channel.send("❎ **| I'm sorry, this challenge is ongoing or has been finished!**");
                let pass = dailyres[0].pass;
                let bonus = dailyres[0].bonus;
                let constrain = dailyres[0].constrain.toUpperCase();
                let timelimit = Math.floor(Date.now() / 1000) + (dailyres[0].challengeid.includes("w")?86400 * 7:86400);
                let beatmapid = dailyres[0].beatmapid;
                let options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${beatmapid}`);
                let content = '';
                let req = https.get(options, res => {
                    res.setEncoding("utf8");
                    res.on("data", chunk => {
                        content += chunk
                    });
                    res.on("end", () => {
                        let obj;
                        try {
                            obj = JSON.parse(content)
                        } catch (e) {
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                        }
                        if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the map!");
                        let mapinfo = obj[0];
                        let title = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]`;
                        let hitlength = mapinfo.hit_length;
                        let maplength = mapinfo.total_length;

                        let pass_string = '';
                        let bonus_string = '';
                        switch (pass[0]) {
                            case "score": {
                                pass_string = `Score V1 above **${pass[1].toLocaleString()}**`;
                                break
                            }
                            case "acc": {
                                pass_string = `Accuracy above **${pass[1]}%**`;
                                break
                            }
                            case "scorev2": {
                                pass_string = `Score V2 above **${pass[1].toLocaleString()}**`;
                                break
                            }
                            case "miss": {
                                pass_string = pass[1] == 0?"No misses":`Miss count below **${pass[1]}**`;
                                break
                            }
                            case "combo": {
                                pass_string = `Combo above **${pass[1]}**`;
                                break
                            }
                            case "rank": {
                                pass_string = `**${pass[1].toUpperCase()}** rank or above`;
                                break
                            }
                            default: pass_string = 'No pass condition'
                        }
                        if (challengeid.includes("w")) {
                            switch (bonus[0]) {
                                case "score": {
                                    bonus_string += `Score V1 above **${bonus[1].toLocaleString()}** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "acc": {
                                    bonus_string += `Accuracy above **${parseFloat(bonus[1]).toFixed(2)}%** (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "scorev2": {
                                    bonus_string += `Score V2 above **${bonus[1].toLocaleString()}** (__${bonus[3]}__ ${bonus[3] == 1?"point":"points"})`;
                                    break
                                }
                                case "miss": {
                                    bonus_string += `${bonus[1] == 0?"No misses":`Miss count below **${bonus[1]}**`} (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "mod": {
                                    bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
                                    break
                                }
                                case "combo": {
                                    bonus_string += `Combo above **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] == 1 ? "point" : "points"})`;
                                    break
                                }
                                case "rank": {
                                    bonus_string += `**${bonus[1].toUpperCase()} rank or above (__${bonus[2]}__ ${bonus[2] == 1 ? "point" : "points"})`;
                                    break
                                }
                                default: bonus_string += "No bonuses available"
                            }
                        }
                        else {
                            let difflist = ["Easy", "Normal", "Hard"];
                            for (let i = 0; i < bonus.length; i++) {
                                bonus_string += `${difflist[i]}: `;
                                switch (bonus[i][0]) {
                                    case "score": {
                                        bonus_string += `Score V1 above **${bonus[i][1].toLocaleString()}** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    case "acc": {
                                        bonus_string += `Accuracy above **${parseFloat(bonus[i][1]).toFixed(2)}%** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    case "scorev2": {
                                        bonus_string += `Score V2 above **${bonus[i][1].toLocaleString()}** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    case "miss": {
                                        bonus_string += `${bonus[i][1] == 0 ? "No misses" : `Miss count below **${bonus[i][1]}**`} (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    case "mod": {
                                        bonus_string += `Usage of **${bonus[i][1].toUpperCase()}** mod (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    case "combo": {
                                        bonus_string += `Combo above **${bonus[i][1]}** (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    case "rank": {
                                        bonus_string += `**${bonus[i][1].toUpperCase()}** rank or above (__${bonus[i][2]}__ ${bonus[i][2] == 1 ? "point" : "points"})`;
                                        break
                                    }
                                    default:
                                        bonus_string += "No bonuses available"
                                }
                                bonus_string += '\n'
                            }
                        }
                        let constrain_string = constrain == ''?"Any mod is allowed":`**${constrain}** only`;

                        let footer = config.avatar_list;
                        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                        embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                            .setColor(mapstatusread(parseInt(mapinfo.approved)))
                            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeconvert(timelimit - Math.floor(Date.now() / 1000))}`, footer[index])
                            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                            .setDescription(`**[${title}](https://osu.ppy.sh/b/${beatmapid})**\nDownload: [Google Drive](${dailyres[0].link[0]}) - [OneDrive](${dailyres[0].link[1]})`)
                            .addField(`Map Info`, `CS: ${mapinfo.diff_size} - AR: ${mapinfo.diff_approach} - OD: ${mapinfo.diff_overall} - HP: ${mapinfo.diff_drain}\nBPM: ${mapinfo.bpm} - Length: ${time(hitlength)}/${time(maplength)} - Max Combo: ${mapinfo.max_combo}x\nLast Update: ${mapinfo.last_update} | ${mapstatus(parseInt(mapinfo.approved))}\n❤️ ${mapinfo.favourite_count} - ▶️ ${mapinfo.playcount}`)
                            .addField(`Star Rating: ${"★".repeat(Math.min(10, parseInt(mapinfo.difficultyrating)))} ${parseFloat(mapinfo.difficultyrating).toFixed(2)}`, `**${dailyres[0].points == 1?"Point":"Points"}**: ${dailyres[0].points} ${dailyres[0].points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

                        message.channel.send(`✅ **| Successfully started challenge \`${challengeid}\`.**`, {embed: embed});
                        client.channels.get("669221772083724318").send(`✅ **| Successfully started challenge \`${challengeid}\`.**`, {embed: embed});

                        let updateVal;
                        if (challengeid.includes("w")) updateVal = {
                            $set: {
                                status: "w-ongoing",
                                timelimit: timelimit
                            }
                        };
                        else updateVal = {
                            $set: {
                                status: "ongoing",
                                timelimit: timelimit
                            }
                        };
                        dailydb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            console.log("Challenge started")
                        })
                    })
                });
                req.end()
            });
            break
        }
        case "manual": {
            // manual submission in case submission
            // fails, possibly due to scores not
            // submitting for not surpassing highest score
            // requires helper or above
            let perm = isEligible(message.member);
            if (perm == 0) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this. Please ask a Helper!**");

            let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
            if (!user) return message.channel.send("❎ **| Hey, please enter a valid user!**");
            let challengeid = args[2];
            if (!challengeid) return message.channel.send("❎ **| Hey, please enter a challenge ID!**");
            let bonustype = args[3];
            if (!bonustype) return message.channel.send("❎ **| Hey, please enter a bonus type!**");

            let query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres[0].uid;
                let username = userres[0].username;
                query = {challengeid: challengeid};
                dailydb.find(query).toArray((err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!dailyres[0]) return message.channel.send("❎ **| I'm sorry, that challenge doesn't exist!**");
                    if (dailyres[0].status.includes("ongoing")) return message.channel.send("❎ **| I'm sorry, that challenge is not ongoing now!**");
                    let challengeid = dailyres[0].challengeid;
                    let bonus = false;
                    let index = 0;
                    switch (args[3]) {
                        case "easy": {
                            bonus = dailyres[0].bonus[0];
                            index = 1;
                            break
                        }
                        case "normal": {
                            bonus = dailyres[0].bonus[1];
                            index = 2;
                            break
                        }
                        case "hard": {
                            bonus = dailyres[0].bonus[2];
                            index = 3;
                            break
                        }
                        case "insane": {
                            bonus = dailyres[0].bonus;
                            index = 1;
                            break
                        }
                    }
                    let points = 0;
                    if (!bonus) points = 0;
                    else if (bonus[0] == 'scorev2') points += bonus[3];
                    else points += bonus[2];
                    let bonuscomplete = points != 0;
                    pointdb.find({discordid: message.author.id}).toArray((err, playerres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        let bonuslist;
                        if (playerres[0]) {
                            let challengelist = playerres[0].challenges;
                            let found = false;
                            let bonuscheck = false;
                            for (let i = 0; i < challengelist.length; i++) {
                                if (challengelist[i][0] == challengeid) {
                                    bonuscheck = challengelist[i][index];
                                    challengelist[i][index] = bonuscomplete;
                                    found = true;
                                    break
                                }
                            }
                            if (found && bonuscheck) return message.channel.send("❎ **| I'm sorry, that user has completed this challenge or bonus type! Please wait for the next one to start or submit another bonus type!**");
                            if (!found) {
                                points += dailyres[0].points;
                                if (!challengeid.includes("w")) {
                                    bonuslist = [challengeid, false, false, false];
                                    bonuslist[index] = bonuscomplete
                                }
                                else bonuslist = [challengeid, bonuscomplete];
                                challengelist.push(bonuslist)
                            }
                            let totalpoint = playerres[0].points + points;
                            let alicecoins = playerres[0].alicecoins + points * 10;
                            message.channel.send(`✅ **| ${user}, congratulations! You have completed challenge \`${challengeid}\`${bonuscomplete ? ` and \`${mode}\` bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1 ? "point" : "points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
                            let updateVal = {
                                $set: {
                                    username: username,
                                    uid: uid,
                                    challenges: challengelist,
                                    points: totalpoint,
                                    alicecoins: alicecoins
                                }
                            };
                            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                console.log("Player points updated")
                            })
                        }
                        else {
                            points += dailyres[0].points;
                            if (!challengeid.includes("w")) {
                                bonuslist = [challengeid, false, false, false];
                                bonuslist[index] = bonuscomplete
                            }
                            else bonuslist = [challengeid, bonuscomplete];
                            message.channel.send(`✅ **| ${user}, congratulations! You have completed challenge \`${challengeid}\`${bonuscomplete ? ` and \`${mode}\` bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins.**`);
                            let insertVal = {
                                username: username,
                                uid: uid,
                                discordid: message.author.id,
                                challenges: [bonuslist],
                                points: points,
                                dailycooldown: 0,
                                alicecoins: points * 10
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
                });
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id)
                }, 2500)
            });
            break
        }
        default: {
            // if args[0] is not defined, will
            // submit the message author's play
            // and defaults to "easy" bonus type
            let query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres[0].uid;
                let username = userres[0].username;

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
                            let challengeid = dailyres[0].challengeid;
                            let hash = dailyres[0].hash;
                            let found = false;
                            let score;
                            let acc;
                            let mod;
                            let miss;
                            let combo;
                            for (let i = 0; i < rplay.length; i++) {
                                if (rplay[i].hash == hash) {
                                    score = rplay[i].score;
                                    acc = parseFloat((rplay[i].accuracy / 1000).toFixed(2));
                                    mod = rplay[i].mode;
                                    miss = rplay[i].miss;
                                    combo = rplay[i].combo;
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
                                    if (acc > passreq[1]) pass = true;
                                    break
                                }
                                case "miss": {
                                    if (miss < passreq[1] || miss == 0) pass = true;
                                    break
                                }
                                case "combo": {
                                    if (combo > passreq[1]) pass = true;
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

                            let points = 0;
                            let index = 0;
                            let bonus;
                            let mode = args[0];
                            if (!mode) mode = "easy";
                            else mode = mode.toLowerCase();
                            switch (mode) {
                                case "easy": {
                                    bonus = dailyres[0].bonus[0];
                                    index = 1;
                                    break
                                }
                                case "normal": {
                                    bonus = dailyres[0].bonus[1];
                                    index = 2;
                                    break
                                }
                                case "hard": {
                                    bonus = dailyres[0].bonus[2];
                                    index = 3;
                                    break
                                }
                                default: return message.channel.send("❎ **| I'm sorry, that bonus type is invalid! Accepted arguments are `easy`, `normal`, and `hard`.**")
                            }
                            switch (bonus[0]) {
                                case "score": {
                                    if (score > bonus[1]) points += bonus[2];
                                    break
                                }
                                case "scorev2": {
                                    if (scoreCalc(score, bonus[2], acc, miss) > bonus[1]) points += bonus[3];
                                    break
                                }
                                case "mod": {
                                    if (modenum(mod) == modenum(bonus[1].toUpperCase())) points += bonus[2];
                                    break
                                }
                                case "acc": {
                                    if (acc > bonus[1]) points += bonus[2];
                                    break
                                }
                                case "combo": {
                                    if (combo > bonus[1]) points += bonus[2];
                                    break
                                }
                                case "miss": {
                                    if (miss < bonus[1] || miss == 0) points += bonus[2];
                                    break
                                }
                            }
                            let bonuscomplete = points != 0 || bonus[0].toLowerCase() == 'none';
                            pointdb.find({discordid: message.author.id}).toArray((err, playerres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                let bonuslist = [challengeid, false, false, false];
                                bonuslist[index] = bonuscomplete;
                                if (playerres[0]) {
                                    let challengelist = playerres[0].challenges;
                                    found = false;
                                    let bonuscheck = false;
                                    for (let i = 0; i < challengelist.length; i++) {
                                        if (challengelist[i][0] == challengeid) {
                                            bonuscheck = challengelist[i][index];
                                            challengelist[i][index] = bonuscomplete;
                                            found = true;
                                            break
                                        }
                                    }
                                    if (found && bonuscheck) return message.channel.send("❎ **| I'm sorry, you have completed this challenge or bonus type! Please wait for the next one to start or submit another bonus type!**");
                                    if (!found) {
                                        points += dailyres[0].points;
                                        challengelist.push(bonuslist)
                                    }
                                    let totalpoint = playerres[0].points + points;
                                    let alicecoins = playerres[0].alicecoins + points * 10;
                                    message.channel.send(`✅ **| Congratulations! You have completed challenge \`${challengeid}\`${bonuscomplete?` and \`${mode}\` bonus`:""}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 10}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
                                    let updateVal = {
                                        $set: {
                                            username: username,
                                            uid: uid,
                                            challenges: challengelist,
                                            points: totalpoint,
                                            alicecoins: alicecoins
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
                                    points += dailyres[0].points;
                                    message.channel.send(`✅ **| Congratulations! You have completed challenge \`${challengeid}\`${bonuscomplete ? ` and \`${mode}\` bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 10}\` Alice coins.**`);
                                    let insertVal = {
                                        username: username,
                                        uid: uid,
                                        discordid: message.author.id,
                                        challenges: [bonuslist],
                                        points: points,
                                        dailycooldown: 0,
                                        alicecoins: points * 10
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
                req.end();
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id)
                }, 5000)
            })
        }
    }
};

module.exports.config = {
    description: "Main command for daily challenges.",
    usage: "daily\ndaily [mode]\ndaily about\ndaily bounty [check]\ndaily check\ndaily lb [page]\ndaily manual <user> <challenge ID> [bonus](Helper+)\ndaily profile [user]\ndaily start <challenge ID> (specific person)",
    detail: "`bonus`: Bonus type. If weekly challenge's bonus is fulfilled, use `insane`.\nAccepted arguments are `easy`, `normal`, `hard`, and `insane`. [String]\n`[String]\n`challenge ID`: The ID of the challenge [Strong]\n`mode`: Bonus mode to submit. If not defined, defaults to `easy`. Accepted arguments are `easy`, `normal`, and `hard`. [String]\n`check`: Checks the current ongoing weekly bounty challenge. If not defined, submits the user's plays to validate.[String]\n`page`: Page of leaderboard [Integer]\n`user`: The user to view or give [UserResolvable (mention or user ID)]",
    permission: "None / Helper / Specific person (<@132783516176875520> and <@386742340968120321>)"
};

module.exports.help = {
    name: "daily"
};
