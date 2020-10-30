const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const cd = new Set();

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission
    for (const id of eligibleRoleList) {
        if (res === -1) break;
        if (member.roles.cache.has(id[0])) {
            if (id[1] === -1) res = id[1];
            else res = Math.max(res, id[1]);
        }
    }
    return res;
}

/**
 * @param {string} url 
 */
function downloadReplay(url) {
    return new Promise(resolve => {
        const dataArray = [];
        request(url, {timeout: 10000})
            .on("data", chunk => {
                dataArray.push(Buffer.from(chunk));
            })
            .on("complete", response => {
                if (response.statusCode !== 200) {
                    return resolve(null);
                }
                const zip = new AdmZip(Buffer.concat(dataArray));
                const odrFile = zip.getEntries().find(v => v.entryName.endsWith(".odr"));
                if (!odrFile) {
                    return resolve(null);
                }
                resolve(odrFile.getData());
            });
    });
}

function timeConvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":");
}

function scoreCalc(score, maxscore, accuracy, misscount) {
    let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
    newscore = newscore - (misscount*0.003*newscore);
    return newscore;
}

function rankConvert(rank) {
    switch (rank.toUpperCase()) {
        case "D": return 1;
        case "C": return 2;
        case "B": return 3;
        case "A": return 4;
        case "S": return 5;
        case "X": return 6;
        case "SH": return 7;
        case "XH": return 8;
        default: return 0;
    }
}

function spaceFill(s, l) {
    let a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

function editPoint(res, page) {
    let output = '#   | Username         | UID    | Challenges | Points\n';
    for (let i =  20 * (page - 1); i < 20 + 20 * (page - 1); i++) {
        if (res[i]) output += spaceFill((i+1).toString(),4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].challenges.length.toString(), 11) + ' | ' + parseInt(res[i].points).toString() + '\n';
        else output += spaceFill("-", 4) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 11) + ' | -\n';
    }
    output += `Current Page: ${page}/${Math.ceil(res.length / 20)}`;
    return output;
}

/**
 * @param {Discord.MessageEmbed} embed 
 * @param {number} page 
 * @param {{id: string, bonus: string}[]} bonuses 
 */
function editBonus(embed, page, bonuses) {
    if (embed.fields.length > 0) {
        embed.spliceFields(0, embed.fields.length);
    }
    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
        if (!bonuses[i]) {
            break;
        }
        const bonus = bonuses[i];
        embed.addField(bonus.id, bonus.bonus);
    }
}

function challengeRequirements(challengeid, pass, bonus) {
    let pass_string = '';
    let bonus_string = '';
    if (challengeid.includes("w")) {
        switch (pass[0]) {
            case "score": 
                pass_string = `Score V1 at least **${pass[1].toLocaleString()}**`;
                break;
            case "acc": 
                pass_string = `Accuracy at least **${pass[1]}%**`;
                break;
            case "scorev2": 
                pass_string = `Score V2 at least **${pass[1].toLocaleString()}**`;
                break;
            case "miss": 
                pass_string = pass[1] === 0?"No misses":`Miss count below **${pass[1]}**`;
                break;
            case "combo": 
                pass_string = `Combo at least **${pass[1]}**`;
                break;
            case "rank": 
                pass_string = `**${pass[1].toUpperCase()}** rank or above`;
                break;
            case "dpp": 
                pass_string = `**${pass[1]}** dpp or more`;
                break;
            case "pp": 
                pass_string = `**${pass[1]}** pp or more`;
                break;
            case "m300": 
                pass_string = `300 hit result at least **${pass[1]}**`;
                break;
            case "m100":
                pass_string = `100 hit result less than or equal to **${pass[1]}**`;
                break;
            case "m50":
                pass_string = `50 hit result less than or equal to **${pass[1]}**`;
                break;
            case "ur":
                pass_string = `UR (unstable rate) below or equal to **${pass[1]}**`;
                break;
            default: pass_string = 'No pass condition';
        }
        switch (bonus[0]) {
            case "none":
                bonus_string += "None";
                break;
            case "score":
                bonus_string += `Score V1 at least **${bonus[1].toLocaleString()}** (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break;
            case "acc":
                bonus_string += `Accuracy at least **${parseFloat(bonus[1]).toFixed(2)}%** (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break;
            case "scorev2":
                bonus_string += `Score V2 at least **${bonus[1].toLocaleString()}** (__${bonus[3]}__ ${bonus[3] === 1?"point":"points"})`;
                break;
            case "miss":
                bonus_string += `${bonus[1] === 0?"No misses":`Miss count below **${bonus[1]}**`} (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break;
            case "mod":
                bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod only (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break;
            case "combo":
                bonus_string += `Combo at least **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "rank":
                bonus_string += `**${bonus[1].toUpperCase()}** rank or above (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "dpp":
                bonus_string += `**${bonus[1]}** dpp or more (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "pp":
                bonus_string += `**${bonus[1]}** pp or more (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "m300": 
                bonus_string += `300 hit result at least **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "m100":
                bonus_string += `100 hit result less than or equal to **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "m50":
                bonus_string += `50 hit result less than or equal to **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "ur":
                bonus_string += `UR (unstable rate) below or equal to **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            default: bonus_string += "No bonuses available";
        }
    } else {
        bonus_string = [];
        switch (pass.id) {
            case "score": 
                pass_string = `Score V1 at least **${pass.value.toLocaleString()}**`;
                break;
            case "acc": 
                pass_string = `Accuracy at least **${pass.value}%**`;
                break;
            case "scorev2": 
                pass_string = `Score V2 at least **${pass.value.toLocaleString()}**`;
                break;
            case "miss": 
                pass_string = pass.value === 0 ? "No misses" : `Miss count below **${pass.value}**`;
                break;
            case "combo": 
                pass_string = `Combo at least **${pass.value}**`;
                break;
            case "rank": 
                pass_string = `**${pass.value.toUpperCase()}** rank or above`;
                break;
            case "dpp": 
                pass_string = `**${pass.value}** dpp or more`;
                break;
            case "pp": 
                pass_string = `**${pass.value}** pp or more`;
                break;
            case "m300": 
                pass_string = `300 hit result at least **${pass.value}**`;
                break;
            case "m100":
                pass_string = `100 hit result less than or equal to **${pass.value}**`;
                break;
            case "m50":
                pass_string = `50 hit result less than or equal to **${pass.value}**`;
                break;
            case "ur":
                pass_string = `UR (unstable rate) below or equal to **${pass.value}**`;
                break;
            default: pass_string = 'No pass condition';
        }
    
        for (let i = 0; i < bonus.length; ++i) {
            const id = bonus[i].id;
            let id_string = "__";
            switch (id) {
                case "score": 
                    id_string += "ScoreV1";
                    break;
                case "acc": 
                    id_string += "Accuracy";
                    break;
                case "scorev2": 
                    id_string += "ScoreV2";
                    break;
                case "miss": 
                    id_string += "Miss Count";
                    break;
                case "combo": 
                    id_string += "Combo";
                    break;
                case "rank": 
                    id_string += "Rank";
                    break;
                case "mod":
                    id_string += "Mods";
                    break;
                case "dpp": 
                    id_string += "Droid PP";
                    break;
                case "pp": 
                    id_string += "PC PP";
                    break;
                case "m300": 
                    id_string += "Minimum 300";
                    break;
                case "m100":
                    id_string += "Maximum 100";
                    break;
                case "m50":
                    id_string += "Maximum 50";
                    break;
                case "ur":
                    id_string += "Maximum Unstable Rate";
                    break;
            }
            id_string += "__";
            let bonusString = "";
            for (let j = 0; j < bonus[i].list.length; ++j) {
                const b = bonus[i].list[j];
                bonusString += `**Level ${b.level}**: `;
                switch (id) {
                    case "none":
                        bonusString += "None";
                        break;
                    case "score":
                        bonusString += `Score V1 at least **${b.value.toLocaleString()}**`;
                        break;
                    case "acc":
                        bonusString += `Accuracy at least **${b.value}**`;
                        break;
                    case "scorev2":
                        bonusString += `Score V2 at least **${b.value.toLocaleString()}**`;
                        break;
                    case "miss":
                        bonusString += `${b.value === 0 ? "No misses" : `Miss count below **${b.value}**`}`;
                        break;
                    case "mod":
                        bonusString += `Usage of **${b.value.toUpperCase()}** mod only`;
                        break;
                    case "combo":
                        bonusString += `Combo at least **${b.value}**`;
                        break;
                    case "rank":
                        bonusString += `**${b.value.toUpperCase()}** rank or above`;
                        break;
                    case "dpp":
                        bonusString += `**${b.value}** dpp or more`;
                        break;
                    case "pp":
                        bonusString += `**${b.value}** pp or more`;
                        break;
                    case "m300":
                        bonusString += `300 hit result at least **${b.value}**`;
                        break;
                    case "m100":
                        bonusString += `100 hit result less than or equal to **${b.value}**`;
                        break;
                    case "m50":
                        bonusString += `50 hit result less than or equal to **${b.value}**`;
                        break;
                    case "ur":
                        bonusString += `UR (unstable rate) below or equal to **${b.value}**`;
                        break;
                }
                bonusString += "\n";
            }
            bonus_string.push({
                id: id_string,
                bonus: bonusString
            });
        }
    }
    return [pass_string, bonus_string];
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel.type !== "text") return;
    if (!message.isOwner && message.guild.id !== '316545691545501706' && message.guild.id !== '635532651029332000') return message.channel.send("❎ **| I'm sorry, this command is only allowed in osu!droid (International) Discord server and droid café server!**");;
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    // declaration of variables used in switch cases
    const binddb = maindb.collection("userbind");
    const dailydb = alicedb.collection("dailychallenge");
    const pointdb = alicedb.collection("playerpoints");
    const clandb = maindb.collection("clandb");
    const coin = client.emojis.cache.get("669532330980802561");
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let rolecheck;
    try {
        rolecheck = message.member.roles.color.hexColor;
    } catch (e) {
        rolecheck = "#000000";
    }
    let embed = new Discord.MessageEmbed();
    let query = {};
    let updateVal = {};
    let insertVal = {};

    switch (args[0]) {
        case "about": {
            // introduction to the daily challenge system
            // uses embed for a cleaner look and to override
            // Discord's message limit
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
                cd.delete(message.author.id);
            }, 5000);
            break;
        }
        case "profile": {
            // checks for a user's profile
            // ===========================
            // if args[1] is not defined,
            // defaults to the message author
            let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]?args[1]:message.author.id));
            if (!user) return message.channel.send("❎ **| Hey, can you give me a valid user?**");

            query = {discordid: user.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    if (args[1]) message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");	
                    else message.channel.send("❎ **| I'm sorry, your account is not binded yet. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");	
                    return;
                }
                let uid = userres.uid;
                let username = userres.username;
                pointdb.findOne(query, async (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    let alicecoins = 0;
                    let points = 0;
                    let challenges = 0;
                    if (dailyres) {
                        alicecoins = dailyres.alicecoins;
                        points = dailyres.points;
                        challenges = dailyres.challenges.length;
                    }
                    const player = await new osudroid.Player().getInformation({uid: uid});
                    embed.setAuthor(`Daily/Weekly Challenge Profile for ${username}`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}.html`)
                        .setColor(rolecheck)
                        .setFooter("Alice Synthesis Thirty", footer[index])
                        .setThumbnail(player.avatarURL)
                        .addField("Statistics", `**Points**: ${points}\n**Alice Coins**: ${coin}${alicecoins}\n**Challenges completed**: ${challenges}`);

                    message.channel.send({embed: embed}).catch(console.error);
                    cd.add(message.author.id);
                    setTimeout(() => {
                        cd.delete(message.author.id);
                    }, 2000);
                });
            });
            break;
        }
        case "lb": {
            // views leaderboard for points
            // ============================
            // alice coins leaderboard is
            // redundant as you can check
            // it using a!daily profile
            let page = 1;
            if (parseInt(args[0]) > 1) page = parseInt(args[0]);
            let pointsort = {points: -1};
            pointdb.find({}, {projection: {_id: 0, uid: 1, points: 1, username: 1, challenges: 1}}).sort(pointsort).toArray((err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res[(page-1)*20]) return message.channel.send("❎ **| Eh, we don't have that many players.**");
                let output = editPoint(res, page);
                message.channel.send('```c\n' + output + '```').then(msg => {
                    const max_page = Math.ceil(res.length / 20);
                    if (page === max_page) return;
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error);
                            });
                        });
                    });

                    let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
                    let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
                    let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
                    let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

                    backward.on('collect', () => {
                        page = Math.max(1, page - 10);
                        output = editPoint(res, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    back.on('collect', () => {
                        if (page === 1) page = max_page;
                        else page--;
                        output = editPoint(res, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    next.on('collect', () => {
                        if (page === max_page) page = 1;
                        else page++;
                        output = editPoint(res, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    forward.on('collect', () => {
                        page = Math.min(page + 10, max_page);
                        output = editPoint(res, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    backward.on("end", () => {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                    });
                });
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 10000);
            });
            break;
        }
        case "check": {
            // checks current ongoing daily challenge
            // ======================================
            // server owners can specify challenge ID
            // to see upcoming/past challenges
            query = {status: "ongoing"};
            dailydb.findOne(query, async (err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!dailyres) {
                    return message.channel.send("❎ **| I'm sorry, there is no ongoing challenge now!**");
                }
                const pass = dailyres.pass;
                const bonus = dailyres.bonus;
                const challengeid = dailyres.challengeid;
                const beatmapid = dailyres.beatmapid;
                let featured = dailyres.featured;
                if (!featured) featured = "386742340968120321";
                const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmapid});
                if (!mapinfo.title) {
                    return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                }
                if (!mapinfo.objects) {
                    return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                }
                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile});
                const timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                const pass_string = challengeRequirements(challengeid, pass, bonus)[0];
                embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapinfo.statusColor())
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit)}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                    .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                    .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                    .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: Any rankable mods except EZ, NF, and HT\n\nUse \`a!daily challenges\` to check bonuses.`);

                message.channel.send({embed: embed}).catch(console.error);
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 2500);
            });
            break;
        }
        case "bounty": {
            // main starting point for weekly bounty challenges
            // ================================================
            // if args[1] is 'check', will check the current
            // ongoing weekly bounty, otherwise submits
            // the message author's play for validation
            if (args[1] == "check") {
                if (args[2] && (message.author.id == '386742340968120321' || message.author.id == '132783516176875520')) query = {challengeid: args[2]};
                else query = {status: "w-ongoing"};
                dailydb.findOne(query, async (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!dailyres) return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                    let pass = dailyres.pass;
                    let bonus = dailyres.bonus;
                    let challengeid = dailyres.challengeid;
                    let constrain = dailyres.constrain.toUpperCase();
                    let beatmapid = dailyres.beatmapid;
                    let featured = dailyres.featured;
                    if (!featured) featured = "386742340968120321";
                    const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmapid});
                    if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                    if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                    let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: constrain});
                    let timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                    let requirements = challengeRequirements(challengeid, pass, bonus);
                    let pass_string = requirements[0];
                    let bonus_string = requirements[1];
                    let constrain_string = constrain.length > 0 ? `**${constrain}** only` : "Any rankable mod except EZ, NF, and HT is allowed";
                    embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                        .setColor(mapinfo.statusColor())
                        .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit)}`, footer[index])
                        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                        .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                        .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                        .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

                    message.channel.send({embed: embed}).catch(console.error);
                    cd.add(message.author.id);
                    setTimeout(() => {
                        cd.delete(message.author.id);
                    }, 2500);
                });
                return;
            }
            query = {discordid: message.author.id};
            binddb.findOne(query, async (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres.uid;
                let username = userres.username;
                let clan = userres.clan;
                const player = await new osudroid.Player().getInformation({uid: uid});
                if (!player.username) return message.channel.send("❎ **| I'm sorry, I cannot your profile!**");
                if (player.recentPlays.length === 0) return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
                let rplay = player.recentPlays;
                query = {status: "w-ongoing"};
                dailydb.findOne(query, async (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!dailyres) return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                    let timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                    if (timelimit < 0) return message.channel.send("❎ **| I'm sorry, this challenge is over! Please wait for the next one to start!**");
                    let challengeid = dailyres.challengeid;
                    let beatmapid = dailyres.beatmapid;
                    let constrain = dailyres.constrain.toUpperCase();
                    let hash = dailyres.hash;
                    const scoreInfo = rplay.find(play => play.hash === hash);
                    if (!scoreInfo) return message.channel.send("❎ **| I'm sorry, you haven't played the challenge map!**");
                    const score = scoreInfo.score;
                    const acc = scoreInfo.accuracy;
                    const combo = scoreInfo.combo;
                    const miss = scoreInfo.miss;
                    const mod = scoreInfo.mods;
                    const rank = scoreInfo.rank;
                    const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmapid});
                    if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch challenge beatmap info! Perhaps osu! API is down?**");
                    if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I can't find the challenge map!**");
                    if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                    let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod});
                    let npp = new osudroid.PerformanceCalculator().calculate({
                        stars: star.droidStars,
                        combo: combo,
                        accPercent: acc,
                        miss: miss,
                        mode: osudroid.modes.droid
                    });
                    let pcpp = new osudroid.PerformanceCalculator().calculate({
                        stars: star.pcStars,
                        combo: combo,
                        accPercent: acc,
                        miss: miss,
                        mode: osudroid.modes.osu
                    });
                    let dpp = parseFloat(npp.total.toFixed(2));
                    let pp = parseFloat(pcpp.total.toFixed(2));
                    let passreq = dailyres.pass;
                    let bonus = dailyres.bonus;
                    
                    let data = new osudroid.ReplayAnalyzer({scoreID: scoreInfo.scoreID, map: star.droidStars});
                    let unstableRate = 0;
                    if (["m300", "m100", "m50", "ur"].some(value => value === passreq[0] || value === bonus[0])) {
                        data = await data.analyze();
                        if (!data.fixedODR) {
                            return message.channel.send("❎ **| I'm sorry, I cannot find your replay file!**");
                        }
                        if (passreq[1] === "ur" || bonus[0] === "ur") {
                            const hit_object_data = data.data.hitObjectData;
                            let hit_error_total = 0;

                            for (const hit_object of hit_object_data) {
                                if (hit_object.result === osudroid.hitResult.RESULT_0) continue;
                                hit_error_total += hit_object.accuracy;
                            }
                            
                            const mean = hit_error_total / hit_object_data.length;

                            let std_deviation = 0;
                            for (const hit_object of hit_object_data)
                                if (hit_object.result !== osudroid.hitResult.RESULT_0) std_deviation += Math.pow(hit_object.accuracy - mean, 2);

                            unstableRate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
                        }
                        // if (data.penalty > 1) {
                        //     npp = new osudroid.PerformanceCalculator().calculate({
                        //         stars: star.droidStars,
                        //         combo: combo,
                        //         accPercent: acc,
                        //         miss: miss,
                        //         mode: osudroid.modes.droid
                        //     });
                        //     dpp = parseFloat(npp.total.toFixed(2));
                        // }
                    }
                    let pass = false;
                    switch (passreq[0]) {
                        case "score":
                            if (score >= passreq[1]) pass = true;
                            break;
                        case "acc":
                            if (acc >= parseFloat(passreq[1])) pass = true;
                            break;
                        case "miss":
                            if (miss < passreq[1] || !miss) pass = true;
                            break;
                        case "combo":
                            if (combo >= passreq[1]) pass = true;
                            break;
                        case "scorev2":
                            if (scoreCalc(score, passreq[2], acc, miss) >= passreq[1]) pass = true;
                            break;
                        case "rank":
                            if (rankConvert(rank) >= rankConvert(passreq[1])) pass = true;
                            break;
                        case "dpp":
                            if (dpp >= parseFloat(passreq[1])) pass = true;
                            break;
                        case "pp":
                            if (pp >= parseFloat(passreq[1])) pass = true;
                            break;
                        case "m300":
                            if (data.data.hit300 >= parseInt(passreq[1])) pass = true;
                            break;
                        case "m100":
                            if (data.data.hit100 <= parseInt(passreq[1])) pass = true;
                            break;
                        case "m50":
                            if (data.data.hit50 <= parseInt(passreq[1])) pass = true;
                            break;
                        case "ur":
                            if (unstableRate <= parseFloat(passreq[1])) pass = true;
                            break;
                        default: return message.channel.send("❎ **| Hey, there doesn't seem to be a pass condition. Please contact an Owner!**");
                    }
                    if (!pass) return message.channel.send("❎ **| I'm sorry, you haven't passed the requirement to complete this challenge!**");
                    let points = 0;
                    const modFulfilled = !((osudroid.mods.modbitsFromString(mod) & (osudroid.mods.osuMods.ez | osudroid.mods.osuMods.nf | osudroid.mods.osuMods.ht)) || (constrain.length > 0 && osudroid.mods.modbitsFromString(mod) !== osudroid.mods.modbitsFromString(constrain)));
                    switch (bonus[0]) {
                        case "score":
                            if (modFulfilled && score >= bonus[1]) points += bonus[2];
                            break;
                        case "acc":
                            if (modFulfilled && acc >= bonus[1]) points += bonus[2];
                            break;
                        case "miss":
                            if (modFulfilled && miss < bonus[1] || !miss) points += bonus[2];
                            break;
                        case "combo":
                            if (modFulfilled && combo >= bonus[1]) points += bonus[2];
                            break;
                        case "scorev2":
                            if (modFulfilled && scoreCalc(score, bonus[2], acc, miss) >= bonus[1]) points += bonus[3];
                            break;
                        case "mod":
                            if (osudroid.mods.modbitsFromString(mod) === osudroid.mods.modbitsFromString(bonus[1])) points += bonus[2];
                            break;
                        case "rank":
                            if (modFulfilled && rankConvert(rank) >= rankConvert(bonus[1])) points += bonus[2];
                            break;
                        case "dpp":
                            if (modFulfilled && dpp >= bonus[1]) points += bonus[2];
                            break;
                        case "pp":
                            if (modFulfilled && pp >= bonus[1]) points += bonus[2];
                        case "m300":
                            if (data.data.hit300 >= parseInt(bonus[1])) points += bonus[2];
                            break;
                        case "m100":
                            if (data.data.hit100 <= parseInt(bonus[1])) points += bonus[2];
                            break;
                        case "m50":
                            if (data.data.hit50 <= parseInt(bonus[1])) points += bonus[2];
                            break;
                        case "ur":
                            if (unstableRate <= parseFloat(bonus[1])) points += bonus[2];
                            break;
                    }
                    let bonuscomplete = points !== 0 || bonus[0].toLowerCase() === 'none';
                    pointdb.findOne({discordid: message.author.id}, (err, playerres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (playerres) {
                            let challengelist = playerres.challenges;
                            let found = false;
                            let bonuscheck = false;
                            for (let i = 0; i < challengelist.length; i++) {
                                if (challengelist[i][0] == challengeid) {
                                    bonuscheck = challengelist[i][1];
                                    challengelist[i][1] = bonuscomplete;
                                    found = true;
                                    break;
                                }
                            }
                            if (!bonuscheck && !modFulfilled) pass = false;
                            if (!pass) return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain requirement!**");
                            if (found && bonuscheck) return message.channel.send("❎ **| I'm sorry, you have completed this bounty challenge! Please wait for the next one to start!**");
                            if (!found) {
                                points += dailyres.points;
                                challengelist.push([challengeid, bonuscomplete]);
                            }
                            let totalpoint = playerres.points + points;
                            let alicecoins = playerres.alicecoins + points * 2;
                            message.channel.send(`✅ **| Congratulations! You have completed weekly bounty challenge \`${challengeid}\`${bonuscomplete?` and its bonus`:""}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
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
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                console.log("Player points updated");
                            });
                        } else {
                            points += dailyres.points;
                            message.channel.send(`✅ **| Congratulations! You have completed weekly bounty challenge \`${challengeid}\`${bonuscomplete ? ` and its bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins.**`);
                            let insertVal = {
                                username: username,
                                uid: uid,
                                discordid: message.author.id,
                                challenges: [[challengeid, bonuscomplete]],
                                points: points,
                                transferred: 0,
                                hasSubmittedMapShare: false,
                                isBannedFromMapShare: false,
                                hasClaimedDaily: false,
                                chatcooldown: Math.floor(Date.now() / 1000),
                                alicecoins: points * 2
                            };
                            pointdb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                console.log("Player points added");
                            });
                        }
                        if (clan) {
                            clandb.findOne({name: clan}, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                updateVal = {
                                    $set: {
                                        power: clanres.power + points
                                    }
                                };
                                clandb.updateOne({name: clan}, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    console.log("Clan power points updated");
                                });
                            });
                        }
                    });
                });
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 5000);
            });
            break;
        }
        case "start": {
            // starts a challenge, useful if bot somehow
            // fails to start one. Restricted to specific
            // people only
            if (!message.isOwner) {
                return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
            }
            const challengeid = args[1];
            if (!challengeid) {
                return message.channel.send("❎ **| Hey, I don't know which challenge to start!**");
            }

            query = {challengeid: challengeid};
            dailydb.findOne(query, async (err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!dailyres) {
                    return message.channel.send("❎ **| I'm sorry, I cannot find the challenge!**");
                }
                if (dailyres.status !== 'scheduled') {
                    return message.channel.send("❎ **| I'm sorry, this challenge is ongoing or has been finished!**");
                }
                const pass = dailyres.pass;
                const bonus = dailyres.bonus;
                const timelimit = Math.floor(Date.now() / 1000) + (dailyres.challengeid.includes("w") ? 86400 * 7 : 86400);
                const beatmapid = dailyres.beatmapid;
                let featured = dailyres.featured;
                if (!featured) featured = "386742340968120321";
                const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmapid});
                if (!mapinfo.title) {
                    return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                }
                if (!mapinfo.objects) {
                    return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                }
                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile});
                const pass_string = challengeRequirements(challengeid, pass, bonus)[0];
                embed.setAuthor(challengeid.includes("w") ? "osu!droid Weekly Bounty Challenge" : "osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapinfo.statusColor())
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit - Math.floor(Date.now() / 1000))}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                    .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                    .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                    .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: Any rankable mods except EZ, NF, and HT\n\nUse \`a!daily challenges\` to see bonuses.`);

                message.channel.send(`✅ **| Successfully started challenge \`${challengeid}\`.**`, {embed: embed}).catch(console.error);
                client.channels.cache.get("669221772083724318").send(`✅ **| Successfully started challenge \`${challengeid}\`.\n<@&674918022116278282>**`, {embed: embed});

                const previous_challenge = challengeid.charAt(0) + (parseInt(dailyres.challengeid.match(/(\d+)$/)[0]) - 1);
                updateVal = {
                    $set: {
                        status: "finished"
                    }
                };
                dailydb.updateOne({challengeid: previous_challenge}, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    console.log("Challenge data updated");
                });

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
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    console.log("Challenge started");
                });
            });
            break;
        }
        case "challenges": {
            let page = 1;
            dailydb.findOne({status: "ongoing"}, (err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!dailyres) {
                    return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                }
                const bonuses = challengeRequirements(dailyres.challengeid, dailyres.pass, dailyres.bonus)[1];

                embed.setAuthor("osu!droid Daily Challenge: Challenges", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(rolecheck)
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${dailyres.challengeid} | Page ${page}/${Math.ceil(dailyres.bonus.length / 5)}`, footer[index]);

                editBonus(embed, page, bonuses);

                message.channel.send({embed: embed}).then(msg => {
                    const max_page = Math.ceil(dailyres.bonus.length / 5);
                    if (page === max_page) {
                        return;
                    }
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error);
                            });
                        });
                    });

                    const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
                    const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
                    const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
                    const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

                    backward.on('collect', () => {
                        page = Math.max(1, page - 10);
                        editBonus(embed, page, bonuses);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    back.on('collect', () => {
                        if (page === 1) page = max_page;
                        else page--;
                        editBonus(embed, page, bonuses);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    next.on('collect', () => {
                        if (page === max_page) page = 1;
                        else page++;
                        editBonus(embed, page, bonuses);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    forward.on('collect', () => {
                        page = Math.min(page + 10, max_page);
                        editBonus(embed, page, bonuses);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    backward.on("end", () => {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                    });
                });
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 10000);
            });
            break;
        }
        case "manual": {
            // manual submission in case submission
            // fails, possibly due to scores not
            // submitting for not surpassing highest score
            // requires helper or above
            if (args.length > 1) {
                // weekly
                if (isEligible(message.member) == 0) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this. Please ask a Helper!**");
                let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
                if (!user) return message.channel.send("❎ **| Hey, please enter a valid user!**");
                let challengeid = args[2];
                if (!challengeid) return message.channel.send("❎ **| Hey, please enter a challenge ID!**");

                query = {discordid: user.id};
                binddb.findOne(query, (err, userres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                    let uid = userres.uid;
                    let username = userres.username;
                    let clan = userres.clan;
                    query = {challengeid: challengeid};
                    dailydb.findOne(query, (err, dailyres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!dailyres) return message.channel.send("❎ **| I'm sorry, that challenge doesn't exist!**");
                        if (!dailyres.status.includes("ongoing")) return message.channel.send("❎ **| I'm sorry, that challenge is not ongoing now!**");
                        let challengeid = dailyres.challengeid;
                        let bonus = false;
                        let index = -1;
                        let mode = args[3];
                        if (mode) mode.toLowerCase();
                        switch (mode) {
                            case "easy":
                                bonus = dailyres.bonus[0];
                                index = 1;
                                break;
                            case "normal":
                                bonus = dailyres.bonus[1];
                                index = 2;
                                break;
                            case "hard":
                                bonus = dailyres.bonus[2];
                                index = 3;
                                break;
                            case "insane":
                                if (challengeid.includes("w")) bonus = dailyres.bonus;
                                else bonus = dailyres.bonus[3];
                                if (challengeid.includes("d")) {
                                    if (!bonus) {
                                        return message.channel.send("❎ **| I'm sorry, `insane` bonus type is only available for weekly challenges!**");
                                    }
                                    index = 4;
                                }
                                else index = 1;
                                break;
                        }
                        let points = 0;
                        if (!bonus) points = 0;
                        else if (bonus[0] === 'scorev2') points += bonus[3];
                        else points += bonus[2];
                        let bonuscomplete = points !== 0;
                        pointdb.findOne({discordid: user.id}, (err, playerres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            let bonuslist;
                            if (playerres) {
                                let challengelist = playerres.challenges;
                                let found = false;
                                let bonuscheck = false;
                                for (let i = 0; i < challengelist.length; i++) {
                                    if (challengelist[i][0] === challengeid) {
                                        bonuscheck = challengelist[i][index];
                                        challengelist[i][index] = bonuscomplete;
                                        found = true;
                                        break;
                                    }
                                }
                                if (found && bonuscheck) return message.channel.send("❎ **| I'm sorry, that user has completed this challenge or bonus type! Please wait for the next one to start or submit another bonus type!**");
                                if (!found) {
                                    points += dailyres.points;
                                    if (!challengeid.includes("w")) {
                                        bonuslist = [challengeid];
                                        for (let i = 0; i < dailyres.bonus.length; i++) {
                                            bonuslist.push(false);
                                        }
                                        if (index !== -1) {
                                            bonuslist[index] = bonuscomplete;
                                        }
                                    }
                                    else bonuslist = [challengeid, bonuscomplete];
                                    challengelist.push(bonuslist);
                                }
                                let totalpoint = playerres.points + points;
                                let alicecoins = playerres.alicecoins + points * 2;
                                message.channel.send(`✅ **| ${user}, congratulations! You have completed challenge \`${challengeid}\`${bonuscomplete ? ` and \`${mode}\` bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1 ? "point" : "points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
                                updateVal = {
                                    $set: {
                                        username: username,
                                        uid: uid,
                                        challenges: challengelist,
                                        points: totalpoint,
                                        alicecoins: alicecoins
                                    }
                                };
                                pointdb.updateOne({discordid: user.id}, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    console.log("Player points updated");
                                });
                            }
                            else {
                                points += dailyres.points;
                                if (!challengeid.includes("w")) {
                                    bonuslist = [challengeid];
                                    for (let i = 0; i < dailyres.bonus.length; i++) {
                                        bonuslist.push(false);
                                    }
                                    bonuslist[index] = bonuscomplete;
                                }
                                else bonuslist = [challengeid, bonuscomplete];
                                message.channel.send(`✅ **| ${user}, congratulations! You have completed challenge \`${challengeid}\`${bonuscomplete ? ` and \`${mode}\` bonus` : ""}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins.**`);
                                insertVal = {
                                    username: username,
                                    uid: uid,
                                    discordid: message.author.id,
                                    challenges: [bonuslist],
                                    points: points,
                                    transferred: 0,
                                    hasSubmittedMapShare: false,
                                    isBannedFromMapShare: false,
                                    hasClaimedDaily: false,
                                    chatcooldown: Math.floor(Date.now() / 1000),
                                    alicecoins: points * 2,
                                    streak: 0
                                };
                                pointdb.insertOne(insertVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    console.log("Player points added");
                                });
                            }
                            if (clan) {
                                clandb.findOne({name: clan}, (err, clanres) => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    updateVal = {
                                        $set: {
                                            power: clanres.power + points
                                        }
                                    };
                                    clandb.updateOne({name: clan}, updateVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                        }
                                        console.log("Clan power points updated");
                                    });
                                });
                            }
                        });
                    });
                    cd.add(message.author.id);
                    setTimeout(() => {
                        cd.delete(message.author.id);
                    }, 2500);
                });
            } else {
                if (message.attachments.size !== 1) {
                    return message.channel.send("❎ **| Hey, please attach a replay file!**");
                }
                const attachment = message.attachments.first();
                if (!attachment.proxyURL.endsWith(".edr")) {
                    return message.channel.send("❎ **| Hey, please attach a valid replay file!**");
                }
    
                query = {discordid: message.author.id};
                binddb.findOne(query, async (err, userres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!userres) {
                        return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                    }
                    const uid = userres.uid;
                    const username = userres.username;
                    const clan = userres.clan;
                    const replay = new osudroid.ReplayAnalyzer({scoreID: 0});
                    const odrFile = await downloadReplay(attachment.url);
                    if (!odrFile) {
                        return message.channel.send("❎ **| Hey, the replay file that you have attached is invalid!**");
                    }
                    replay.originalODR = odrFile;
                    await replay.analyze();
    
                    const data = replay.data;
                    if (data.playerName !== username) {
                        return message.channel.send("❎ **| I'm sorry, that replay file does not contain the same username as your binded osu!droid account!**");
                    }
    
                    query = {hash: data.hash};
                    dailydb.findOne(query, async (err, dailyres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!dailyres) {
                            return message.channel.send("❎ **| I'm sorry, there are no challenges that meet with the provided replay!**");
                        }
                        if (!dailyres.status.includes("ongoing")) {
                            return message.channel.send("❎ **| I'm sorry, that challenge is not ongoing now!**");
                        }
    
                        const challengeid = dailyres.challengeid;
                        const passreq = dailyres.pass;
                        const bonus = dailyres.bonus;
    
                        const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: dailyres.beatmapid});
                        if (!mapinfo.title) {
                            return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                        }
                        if (!mapinfo.objects) {
                            return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                        }
    
                        const score = data.score;
                        const combo = data.maxCombo;
                        const acc = parseFloat((data.accuracy * 100).toFixed(2));
                        const miss = data.hit0;
                        const mod = data.convertedMods;
                        
                        const osuMods = osudroid.mods.osuMods;
                        if (mod & (osuMods.ez | osuMods.nf | osuMods.ht)) {
                            return message.channel.send("❎ **| I'm sorry, EZ, NF, and HT is not allowed in challenges!**");
                        }
    
                        // analyze hit object data
                        const modbits = osudroid.mods.modbitsFromString(mod);
                        const modWithoutSpeedChanging = osudroid.mods.modbitsToString(modbits - (modbits & osuMods.speed_changing));
                        const od = new osudroid.MapStats({od: mapinfo.od, mods: modWithoutSpeedChanging}).calculate({mode: osudroid.modes.droid}).od;
                        const isPrecise = mod.includes("PR");
                        
                        const hitWindow = new osudroid.DroidHitWindow(od);
                        const hitWindow300 = hitWindow.hitWindowFor300(isPrecise);
                        const hitWindow100 = hitWindow.hitWindowFor100(isPrecise);
                        const hitWindow50 = hitWindow.hitWindowFor50(isPrecise);
                        for (const hitData of data.hitObjectData) {
                            if (hitData.result === osudroid.hitResult.RESULT_0) {
                                continue;
                            }
                            
                            let isEdited = false;
                            const accuracyAbsolute = Math.abs(hitData.accuracy);
                            switch (hitData.result) {
                                case osudroid.hitResult.RESULT_50:
                                    isEdited = accuracyAbsolute > hitWindow50;
                                    break;
                                case osudroid.hitResult.RESULT_100:
                                    isEdited = accuracyAbsolute > hitWindow100;
                                    break;
                                case osudroid.hitResult.RESULT_300:
                                    isEdited = accuracyAbsolute > hitWindow300;
                                    break;
                            }
    
                            if (isEdited) {
                                return message.channel.send("❎ **| I'm sorry, it appears that your replay file is edited!**");
                            }
                        }
                        
                        const h300 = data.hit300;
                        const h100 = data.hit100;
                        const h50 = data.hit50;
    
                        // determine score grade
                        let rank = "";
                        const totalHits = h300 + h100 + h50 + miss;
                        const isHidden = !!(mod & (osudroid.mods.osuMods.hd | osudroid.mods.osuMods.fl));
                        const h300Ratio = h300 / totalHits;
                        switch (true) {
                            case acc === 100:
                                if (isHidden) {
                                    rank = "XH"; // SSH
                                } else {
                                    rank = "X"; // SS
                                }
                                break;
                            case h300Ratio > 0.9 && h50 / totalHits < 0.01 && !miss:
                                if (isHidden) {
                                    rank = "SH";
                                } else {
                                    rank = "S";
                                }
                                break;
                            case (h300Ratio > 0.8 && !miss) || h300Ratio > 0.9:
                                rank = "A";
                                break;
                            case (h300Ratio > 0.7 && !miss) || h300Ratio > 0.8:
                                rank = "B";
                                break;
                            case h300Ratio > 0.6:
                                rank = "C";
                                break;
                            default:
                                rank = "D";
                        }
    
                        const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod});
                        replay.map = star.droidStars;
    
                        let unstableRate = 0;
                        let speedPenalty = 1;
                        const requiresReplay = ["m300", "m100", "m50", "ur"];
                        if (requiresReplay.some(v => v === passreq.id) || bonus.some(v => requiresReplay.includes(v.id))) {
                            replay.analyzeReplay();
                            const hit_object_data = data.data.hitObjectData;
                            let hit_error_total = 0;
    
                            for (const hit_object of hit_object_data) {
                                if (hit_object.result === osudroid.hitResult.RESULT_0) {
                                    continue;
                                }
                                hit_error_total += hit_object.accuracy;
                            }
                            
                            const mean = hit_error_total / hit_object_data.length;
    
                            let std_deviation = 0;
                            for (const hit_object of hit_object_data)
                                if (hit_object.result !== osudroid.hitResult.RESULT_0) std_deviation += Math.pow(hit_object.accuracy - mean, 2);
    
                            unstableRate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
                            // speedPenalty = replay.penalty;
                        }
    
                        const dpp = new osudroid.PerformanceCalculator().calculate({
                            stars: star.droidStars,
                            combo: combo,
                            accPercent: acc,
                            miss: miss,
                            mode: osudroid.modes.droid,
                            speedPenalty: speedPenalty
                        }).total;
    
                        const pp = new osudroid.PerformanceCalculator().calculate({
                            stars: star.pcStars,
                            combo: combo,
                            accPercent: acc,
                            miss: miss,
                            mode: osudroid.modes.osu
                        }).total;
    
                        let pass = false;
                        const maxScore = mapinfo.maxScore(new osudroid.MapStats({mods: mod}));
                        const scorev2 = scoreCalc(score, maxScore, acc, miss);
                        switch (passreq.id) {
                            case "score":
                                pass = score >= passreq.value;
                                break;
                            case "acc":
                                pass = acc >= passreq.value;
                                break;
                            case "miss":
                                pass = miss < passreq.value || !miss;
                                break;
                            case "combo":
                                pass = combo >= passreq.value;
                                break;
                            case "scorev2":
                                pass = scorev2 >= passreq.value;
                                break;
                            case "rank":
                                pass = rankConvert(rank) >= rankConvert(passreq.value);
                                break;
                            case "dpp":
                                pass = dpp >= passreq.value;
                                break;
                            case "pp":
                                pass = pp >= passreq.value;
                                break;
                            case "m300":
                                pass = h300 >= passreq.value;
                                break;
                            case "m100":
                                pass = h100 <= passreq.value;
                                break;
                            case "m50":
                                pass = h50 <= passreq.value;
                                break;
                            case "ur":
                                pass = unstableRate <= passreq.value;
                                break;
                            default: return message.channel.send("❎ **| Hey, there doesn't seem to be a pass condition. Please contact an Owner!**");
                        }
                        if (!pass) {
                            return message.channel.send("❎ **| I'm sorry, you haven't passed the requirement to complete this challenge!**");
                        }
                        let completedLevel = 0;
                        for (let i = 0; i < bonus.length; ++i) {
                            const b = bonus[i];
                            let highestLevel = 0;
                            for (let j = 0; j < b.list.length; ++j) {
                                let bonusComplete = false;
                                const c = b.list[j];
                                switch (b.id) {
                                    case "score":
                                        bonusComplete = score >= c.value;
                                        break;
                                    case "acc":
                                        bonusComplete = acc >= c.value;
                                        break;
                                    case "miss":
                                        bonusComplete = miss < c.value || !miss;
                                        break;
                                    case "combo":
                                        bonusComplete = combo >= c.value;
                                        break;
                                    case "scorev2":
                                        bonusComplete = scorev2 >= c.value;
                                        break;
                                    case "mod":
                                        bonusComplete = osudroid.mods.modbitsFromString(mod) === osudroid.mods.modbitsFromString(c.value);
                                        break;
                                    case "rank":
                                        bonusComplete = rankConvert(rank) >= rankConvert(c.value);
                                        break;
                                    case "dpp":
                                        bonusComplete = dpp >= c.value;
                                        break;
                                    case "pp":
                                        bonusComplete = pp >= c.value;
                                        break;
                                    case "m300":
                                        bonusComplete = h300 >= c.value;
                                        break;
                                    case "m100":
                                        bonusComplete = h100 <= c.value;
                                        break;
                                    case "m50":
                                        bonusComplete = h50 <= c.value;
                                        break;
                                    case "ur":
                                        bonusComplete = unstableRate <= c.value;
                                        break;
                                }
    
                                if (bonusComplete) {
                                    highestLevel = Math.max(highestLevel, c.level);
                                }
                            }
                            completedLevel += highestLevel;
                        }
                        pointdb.findOne({discordid: message.author.id}, (err, playerres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            let points = 0;
                            const bonusentry = {
                                id: challengeid,
                                highestLevel: completedLevel
                            };
                            const statsMessage = `**Total score**: ${data.score.toLocaleString()}\n**Combo**: ${data.maxCombo}x\n**Accuracy**: ${(data.accuracy * 100).toFixed(2)}%\n**Time**: ${new Date(data.time).toUTCString()}\n\n**Hit great (300)**: ${data.hit300} (${data.hit300k} geki and katu)\n**Hit good (100)**: ${data.hit100} (${data.hit100k} katu)\n**Hit meh (50)**: ${data.hit50}\n**Misses**: ${data.hit0}\n\n**Level reached**: ${completedLevel}`;
                            embed.setAuthor("Score Statistics", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
                                .setDescription(statsMessage)
                                .setColor(rolecheck);
                            
                            message.channel.send({embed: embed});
                            if (playerres) {
                                const challengelist = playerres.challenges;
                                let found = false;
                                for (let i = 0; i < challengelist.length; i++) {
                                    // legacy challenges
                                    if (Array.isArray(challengelist[i])) {
                                        continue;
                                    }
                                    if (challengelist[i].id !== challengeid) {
                                        continue;
                                    }
                                    found = true;
                                    points += Math.max(0, completedLevel - challengelist[i].highestLevel) * 2;
                                    challengelist[i].highestLevel = Math.max(challengelist[i].highestLevel, completedLevel);
                                    break;
                                }
                                if (!found) {
                                    points += dailyres.points + completedLevel * 2;
                                    challengelist.push(bonusentry);
                                }
                                const totalpoint = playerres.points + points;
                                const alicecoins = playerres.alicecoins + points * 2;
                                message.channel.send(`❗**| ${message.author}, you have 1 minute to ask a moderator or helper to react to this message to submit your play!**`).then(msg => {
                                    msg.react("✅");
    
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && isEligible(message.guild.member(user)), {time: 60000});
    
                                    confirm.on('collect', () => {
                                        msg.delete();
                                        confirmation = true;
    
                                        updateVal = {
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
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| Congratulations! You have completed challenge ${challengeid} with challenge bonus level ${completedLevel}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`)
                                        });
    
                                        if (clan) {
                                            clandb.findOne({name: clan}, (err, clanres) => {
                                                if (err) {
                                                    console.log(err);
                                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                                }
                                                updateVal = {
                                                    $set: {
                                                        power: clanres.power + points
                                                    }
                                                };
                                                clandb.updateOne({name: clan}, updateVal, err => {
                                                    if (err) {
                                                        console.log(err);
                                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                                    }
                                                    console.log("Clan power points updated");
                                                });
                                            });
                                        }
                                    });
    
                                    confirm.on('end', () => {
                                        if (!confirmation) {
                                            msg.delete();
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                                        }
                                    });
                                });
                            } else {
                                points += dailyres.points + completedLevel * 2;
                                message.channel.send(`❗**| ${message.author}, you have 1 minute to ask a moderator or helper to react to this message to submit your play!**`).then(msg => {
                                    msg.react("✅");
    
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && isEligible(message.guild.member(user)), {time: 60000});
    
                                    confirm.on('collect', () => {
                                        msg.delete();
                                        confirmation = true;
    
                                        insertVal = {
                                            username: username,
                                            uid: uid,
                                            discordid: message.author.id,
                                            challenges: [bonusentry],
                                            points: points,
                                            transferred: 0,
                                            hasSubmittedMapShare: false,
                                            isBannedFromMapShare: false,
                                            hasClaimedDaily: false,
                                            chatcooldown: Math.floor(Date.now() / 1000),
                                            alicecoins: points * 2
                                        };
    
                                        pointdb.insertOne(insertVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| Congratulations! You have completed challenge ${challengeid} with challenge bonus level ${completedLevel}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins.**`)
                                        });
    
                                        if (clan) {
                                            clandb.findOne({name: clan}, (err, clanres) => {
                                                if (err) {
                                                    console.log(err);
                                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                                }
                                                updateVal = {
                                                    $set: {
                                                        power: clanres.power + points
                                                    }
                                                };
                                                clandb.updateOne({name: clan}, updateVal, err => {
                                                    if (err) {
                                                        console.log(err);
                                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                                    }
                                                    console.log("Clan power points updated");
                                                });
                                            });
                                        }
                                    });
    
                                    confirm.on('end', () => {
                                        if (!confirmation) {
                                            msg.delete();
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }
            break;
        }
        case "checksubmit": {
            // allows users to see who has submitted plays for specific challenge.
            // useful for clan leaders
            const challengeid = args[1];
            if (!challengeid) {
                return message.channel.send("❎ **| Hey, please enter a challenge ID!**");
            }
            const uid = parseInt(args[2]);
            if (isNaN(uid)) {
                return message.channel.send("❎ **| Hey, please enter a valid uid!**");
            }
            query = {uid: uid.toString()};
            pointdb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send(`❎ **| Uid ${uid} has never played any challenge before.**`);
                }
                const challenges = res.challenges;
                for (const challenge of challenges) {
                    if (Array.isArray(challenge) && challenge[0] !== challengeid) {
                        continue;
                    }
                    if (challenge.id !== challengeid) {
                        continue;
                    }
                    if (Array.isArray(challenge)) {
                        // legacy challenges
                        message.channel.send(`✅ **| Uid ${uid} has played challenge \`${challengeid}\`.**`);
                    } else {
                        message.channel.send(`✅ **| Uid ${uid} has played challenge \`${challengeid}\` with highest bonus level achieved \`${challenge.highestLevel}\`.**`);
                    }
                    return;
                }
                message.channel.send(`❎ **| Uid ${uid} has not played challenge \`${challengeid}\` or a challenge with that challenge ID does not exist.**`);
            });
            break;
        }
        default: {
            // if args[0] is not defined, will
            // submit the message author's play
            query = {discordid: message.author.id};
            binddb.findOne(query, async (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                const uid = userres.uid;
                const username = userres.username;
                const clan = userres.clan;
                const player = await new osudroid.Player().getInformation({uid: uid});

                if (!player.username) {
                    return message.channel.send("❎ **| I'm sorry, I cannot your profile!**");
                }
                if (player.recentPlays.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
                }
                const rplay = player.recentPlays;
                query = {status: "ongoing"};
                dailydb.findOne(query, (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!dailyres) {
                        return message.channel.send("❎ **| I'm sorry, there is no ongoing challenge now!**");
                    }
                    const challengeid = dailyres.challengeid;
                    const beatmapid = dailyres.beatmapid;
                    const hash = dailyres.hash;
                    const scoreInfo = rplay.find(play => play.hash === hash);
                    if (!scoreInfo) {
                        return message.channel.send("❎ **| I'm sorry, you haven't played the challenge map!**");
                    }
                    const score = scoreInfo.score;
                    const acc = scoreInfo.accuracy;
                    const combo = scoreInfo.combo;
                    const miss = scoreInfo.miss;
                    const mod = scoreInfo.mods;
                    const rank = scoreInfo.rank;

                    const osuMods = osudroid.mods.osuMods;
                    if (mod & (osuMods.ez | osuMods.nf | osuMods.ht)) {
                        return message.channel.send("❎ **| I'm sorry, EZ, NF, and HT is not allowed in challenges!**");
                    }
                    
                    pointdb.findOne({discordid: message.author.id}, async (err, playerres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        const challengelist = playerres?.challenges || [];
                        const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmapid});
                        const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod});
                        const passreq = dailyres.pass;
                        const bonus = dailyres.bonus;

                        const data = new osudroid.ReplayAnalyzer({scoreID: scoreInfo.scoreID, map: star.droidStars});
                        let unstableRate = 0;
                        let speedPenalty = 1;
                        const requiresReplay = ["m300", "m100", "m50", "ur"];
                        if (requiresReplay.some(value => value === passreq.id) || bonus.some(v => requiresReplay.includes(v.id))) {
                            await data.analyze();
                            if (!data.fixedODR) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find your replay file!**");
                            }
                            const hit_object_data = data.data.hitObjectData;
                            let hit_error_total = 0;

                            for (const hit_object of hit_object_data) {
                                if (hit_object.result === osudroid.hitResult.RESULT_0) {
                                    continue;
                                }
                                hit_error_total += hit_object.accuracy;
                            }
                            
                            const mean = hit_error_total / hit_object_data.length;

                            let std_deviation = 0;
                            for (const hit_object of hit_object_data)
                                if (hit_object.result !== osudroid.hitResult.RESULT_0) std_deviation += Math.pow(hit_object.accuracy - mean, 2);

                            unstableRate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
                            // speedPenalty = data.penalty;
                        }

                        const npp = new osudroid.PerformanceCalculator().calculate({
                            stars: star.droidStars,
                            combo: combo,
                            accPercent: acc,
                            miss: miss,
                            mode: osudroid.modes.droid,
                            speedPenalty: speedPenalty
                        });
                        const pcpp = new osudroid.PerformanceCalculator().calculate({
                            stars: star.pcStars,
                            combo: combo,
                            accPercent: acc,
                            miss: miss,
                            mode: osudroid.modes.osu
                        });
                        const dpp = parseFloat(npp.total.toFixed(2));
                        const pp = parseFloat(pcpp.total.toFixed(2));
                        let pass = false;
                        const maxScore = mapinfo.maxScore(new osudroid.MapStats({mods: mod}));
                        const scorev2 = scoreCalc(score, maxScore, acc, miss);
                        switch (passreq.id) {
                            case "score":
                                pass = score >= passreq.value;
                                break;
                            case "acc":
                                pass = acc >= passreq.value;
                                break;
                            case "miss":
                                pass = miss < passreq.value || !miss;
                                break;
                            case "combo":
                                pass = combo >= passreq.value;
                                break;
                            case "scorev2":
                                pass = scorev2 >= passreq.value;
                                break;
                            case "rank":
                                pass = rankConvert(rank) >= rankConvert(passreq.value);
                                break;
                            case "dpp":
                                pass = dpp >= passreq.value;
                                break;
                            case "pp":
                                pass = pp >= passreq.value;
                                break;
                            case "m300":
                                pass = data.data.hit300 >= passreq.value;
                                break;
                            case "m100":
                                pass = data.data.hit100 <= passreq.value;
                                break;
                            case "m50":
                                pass = data.data.hit50 <= passreq.value;
                                break;
                            case "ur":
                                pass = unstableRate <= passreq.value;
                                break;
                            default: return message.channel.send("❎ **| Hey, there doesn't seem to be a pass condition. Please contact an Owner!**");
                        }
                        if (!pass) {
                            return message.channel.send("❎ **| I'm sorry, you haven't passed the requirement to complete this challenge!**");
                        }
                        let completedLevel = 0;
                        for (let i = 0; i < bonus.length; ++i) {
                            const b = bonus[i];
                            let highestLevel = 0;
                            for (let j = 0; j < b.list.length; ++j) {
                                let bonusComplete = false;
                                const c = b.list[j];
                                switch (b.id) {
                                    case "score":
                                        bonusComplete = score >= c.value;
                                        break;
                                    case "acc":
                                        bonusComplete = acc >= c.value;
                                        break;
                                    case "miss":
                                        bonusComplete = miss < c.value || !miss;
                                        break;
                                    case "combo":
                                        bonusComplete = combo >= c.value;
                                        break;
                                    case "scorev2":
                                        bonusComplete = scorev2 >= c.value;
                                        break;
                                    case "mod":
                                        bonusComplete = osudroid.mods.modbitsFromString(mod) === osudroid.mods.modbitsFromString(c.value);
                                        break;
                                    case "rank":
                                        bonusComplete = rankConvert(rank) >= rankConvert(c.value);
                                        break;
                                    case "dpp":
                                        bonusComplete = dpp >= c.value;
                                        break;
                                    case "pp":
                                        bonusComplete = pp >= c.value;
                                        break;
                                    case "m300":
                                        bonusComplete = data.data.hit300 >= c.value;
                                        break;
                                    case "m100":
                                        bonusComplete = data.data.hit100 <= c.value;
                                        break;
                                    case "m50":
                                        bonusComplete = data.data.hit50 <= c.value;
                                        break;
                                    case "ur":
                                        bonusComplete = unstableRate <= c.value;
                                        break;
                                }

                                if (bonusComplete) {
                                    highestLevel = Math.max(highestLevel, c.level);
                                }
                            }
                            completedLevel += highestLevel;
                        }
                        const bonusentry = {
                            id: challengeid,
                            highestLevel: completedLevel
                        };
                        let points = 0;
                        if (playerres) {
                            let found = false;
                            for (let i = 0; i < challengelist.length; i++) {
                                // legacy challenges
                                if (Array.isArray(challengelist[i])) {
                                    continue;
                                }
                                if (challengelist[i].id !== challengeid) {
                                    continue;
                                }
                                found = true;
                                points += Math.max(0, completedLevel - challengelist[i].highestLevel) * 2;
                                challengelist[i].highestLevel = Math.max(challengelist[i].highestLevel, completedLevel);
                                break;
                            }
                            if (!found) {
                                points += dailyres.points + completedLevel * 2;
                                challengelist.push(bonusentry);
                            }
                            const totalpoint = playerres.points + points;
                            const alicecoins = playerres.alicecoins + points * 2;
                            updateVal = {
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
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send(`✅ **| Congratulations! You have completed challenge \`${challengeid}\` with challenge bonus level ${completedLevel}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
                            });
                        } else {
                            insertVal = {
                                username: username,
                                uid: uid,
                                discordid: message.author.id,
                                challenges: [bonusentry],
                                points: points,
                                transferred: 0,
                                hasSubmittedMapShare: false,
                                isBannedFromMapShare: false,
                                hasClaimedDaily: false,
                                chatcooldown: Math.floor(Date.now() / 1000),
                                alicecoins: points * 2,
                                streak: 0
                            };
                            pointdb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send(`✅ **| Congratulations! You have completed challenge \`${challengeid}\` with challenge bonus level ${completedLevel}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins.**`);
                            });
                        }
                        if (clan) {
                            clandb.findOne({name: clan}, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                updateVal = {
                                    $set: {
                                        power: clanres.power + points
                                    }
                                };
                                clandb.updateOne({name: clan}, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    console.log("Clan power points updated");
                                });
                            });
                        }
                    });
                });
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 10000);
            });
        }
    }
};

module.exports.config = {
    name: "daily",
    description: "Main command for daily challenges.",
    usage: "daily\ndaily about\ndaily bounty [check [challenge ID]]\ndaily check [challenge ID]\ndaily checksubmit <challenge ID> <uid>\ndaily lb [page]\ndaily manual <user> <challenge ID> [bonus](Helper+)\ndaily profile [user]\ndaily start <challenge ID> (specific person)",
    detail: "`bonus`: Bonus type. If weekly challenge's bonus is fulfilled, use `insane`.\nAccepted arguments are `easy`, `normal`, `hard`, and `insane` [String]\n`challenge ID`: The ID of the challenge [String]\n`check`: Checks the current ongoing weekly bounty challenge. If not defined, submits the user's plays to validate [String]\n`page`: Page of leaderboard [Integer]\n`uid`: The uid to check submission for [Integer]\n`user`: The user to view or give [UserResolvable (mention or user ID)]",
    permission: "None | Helper | Specific person (<@132783516176875520> and <@386742340968120321>)"
};