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

function challengeRequirements(challengeid, pass, bonus) {
    let pass_string = '';
    let bonus_string = '';
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
            pass_string = `300 hit results (both normal and geki/katu) at least **${pass[1]}**`;
            break;
        case "m100":
            pass_string = `100 hit results (both normal and katu) less than or equal to **${pass[1]}**`;
            break;
        case "m50":
            pass_string = `50 hit results less than or equal to **${pass[1]}**`;
            break;
        case "ur":
            pass_string = `UR (unstable rate) below or equal to **${pass[1]}**`;
            break;
        default: pass_string = 'No pass condition';
    }
    if (challengeid.includes("w")) {
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
                bonus_string += `300 hit results (both normal and geki/katu) at least **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "m100":
                bonus_string += `100 hit results (both normal and katu) less than or equal to **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "m50":
                bonus_string += `50 hit results less than or equal to **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            case "ur":
                bonus_string += `UR (unstable rate) below or equal to **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                break;
            default: bonus_string += "No bonuses available";
        }
    }
    else {
        let difflist = ["Easy", "Normal", "Hard", "Insane"];
        for (let i = 0; i < bonus.length; i++) {
            const bonusEntry = bonus[i];
            bonus_string += `${difflist[i]}: `;
            switch (bonusEntry[0]) {
                case "none":
                    bonus_string += "None";
                    break;
                case "score":
                    bonus_string += `Score V1 at least **${bonusEntry[1].toLocaleString()}** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "acc":
                    bonus_string += `Accuracy at least **${parseFloat(bonusEntry[1]).toFixed(2)}%** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "scorev2":
                    bonus_string += `Score V2 at least **${bonusEntry[1].toLocaleString()}** (__${bonusEntry[3]}__ ${bonusEntry[3] === 1 ? "point" : "points"})`;
                    break;
                case "miss":
                    bonus_string += `${bonusEntry[1] === 0 ? "No misses" : `Miss count below **${bonusEntry[1]}**`} (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "mod":
                    bonus_string += `Usage of **${bonusEntry[1].toUpperCase()}** mod only (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "combo":
                    bonus_string += `Combo at least **${bonusEntry[1]}** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "rank":
                    bonus_string += `**${bonusEntry[1].toUpperCase()}** rank or above (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "dpp":
                    bonus_string += `**${bonusEntry[1]}** dpp or more (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "pp":
                    bonus_string += `**${bonusEntry[1]}** pp or more (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "m300": 
                    bonus_string += `300 hit results (both normal and geki/katu) at least **${bonusEntry[1]}** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "m100":
                    bonus_string += `100 hit results (both normal and katu) less than or equal to **${bonusEntry[1]}** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "m50":
                    bonus_string += `50 hit results less than or equal to **${bonusEntry[1]}** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                case "ur":
                    bonus_string += `UR (unstable rate) below or equal to **${bonusEntry[1]}** (__${bonusEntry[2]}__ ${bonusEntry[2] === 1 ? "point" : "points"})`;
                    break;
                default:
                    bonus_string += "No bonuses available";
            }
            bonus_string += '\n';
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
                    const player = await new osudroid.Player().get({uid: uid});
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
            if (args[1] && (message.author.id == '386742340968120321' || message.author.id == '132783516176875520')) query = {challengeid: args[1]};
            else query = {status: "ongoing"};
            dailydb.findOne(query, async (err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!dailyres) return message.channel.send("❎ **| I'm sorry, there is no ongoing challenge now!**");
                let pass = dailyres.pass;
                let bonus = dailyres.bonus;
                let challengeid = dailyres.challengeid;
                let constrain = dailyres.constrain.toUpperCase();
                let beatmapid = dailyres.beatmapid;
                let featured = dailyres.featured;
                if (!featured) featured = "386742340968120321";
                const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
                if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: constrain});
                let timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                let requirements = challengeRequirements(challengeid, pass, bonus);
                let pass_string = requirements[0];
                let bonus_string = requirements[1];
                let constrain_string = constrain.length > 0 ? `**${constrain}** only` : "Any rankable mod except EZ, NF, and HT is allowed";
                embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapinfo.statusColor())
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit)}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
                    .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                    .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                    .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droid_stars.total)))} ${star.droid_stars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pc_stars.total)))} ${star.pc_stars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

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
                    const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
                    if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                    if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                    let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: constrain});
                    let timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                    let requirements = challengeRequirements(challengeid, pass, bonus);
                    let pass_string = requirements[0];
                    let bonus_string = requirements[1];
                    let constrain_string = constrain.length > 0 ? `**${constrain}** only` : "Any rankable mod except EZ, NF, and HT is allowed";
                    embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                        .setColor(mapinfo.statusColor())
                        .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit)}`, footer[index])
                        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
                        .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                        .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                        .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droid_stars.total)))} ${star.droid_stars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pc_stars.total)))} ${star.pc_stars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

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
                const player = await new osudroid.Player().get({uid: uid});
                if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot your profile!**");
                if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
                let rplay = player.recent_plays;
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
                    const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
                    if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch challenge beatmap info! Perhaps osu! API is down?**");
                    if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I can't find the challenge map!**");
                    if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                    let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
                    let npp = osudroid.ppv2({
                        stars: star.droid_stars,
                        combo: scoreInfo.combo,
                        acc_percent: scoreInfo.accuracy,
                        miss: scoreInfo.miss,
                        mode: osudroid.modes.droid
                    });
                    let pcpp = osudroid.ppv2({
                        stars: star.pc_stars,
                        combo: scoreInfo.combo,
                        acc_percent: scoreInfo.acc,
                        miss: scoreInfo.miss,
                        mode: osudroid.modes.osu
                    });
                    let dpp = parseFloat(npp.total.toFixed(2));
                    let pp = parseFloat(pcpp.total.toFixed(2));
                    let passreq = dailyres.pass;
                    let bonus = dailyres.bonus;
                    
                    let data = new osudroid.ReplayAnalyzer({score_id: scoreInfo.score_id, map: star.droid_stars});
                    let unstableRate = 0;
                    if (["m300", "m100", "m50", "ur"].some(value => value === passreq[1] || value === bonus[0])) {
                        data = await data.analyze();
                        if (!data.fixed_odr) {
                            return message.channel.send("❎ **| I'm sorry, I cannot find your replay file!**");
                        }
                        if (passreq[1] === "ur" || bonus[0] === "ur") {
                            const hit_object_data = data.data.hit_object_data;
                            let hit_error_total = 0;

                            for (const hit_object of hit_object_data) {
                                if (hit_object.result === osudroid.hitResult.RESULT_0) continue;
                                hit_error_total = hit_object.accuracy;
                            }
                            
                            const mean = hit_error_total / hit_object_data.length;

                            let std_deviation = 0;
                            for (const hit_object of hit_object_data)
                                if (hit_object.result !== osudroid.hitResult.RESULT_0) std_deviation += Math.pow(hit_object.accuracy - mean, 2);

                            unstableRate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
                        }
                        if (data.penalty > 1) {
                            npp = osudroid.ppv2({
                                stars: star.droid_stars,
                                combo: scoreInfo.combo,
                                acc_percent: scoreInfo.accuracy,
                                miss: scoreInfo.miss,
                                mode: osudroid.modes.droid,
                                speed_penalty: data.penalty
                            });
                            dpp = parseFloat(npp.total.toFixed(2));
                        }
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
                            if (data.data.hit300 + data.data.hit300k >= parseInt(passreq[1])) pass = true;
                            break;
                        case "m100":
                            if (data.data.hit100 + data.data.hit100k <= parseInt(passreq[1])) pass = true;
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
                    const modFulfilled = !((osudroid.mods.modbits_from_string(mod) & (osudroid.mods.ez | osudroid.mods.nf | osudroid.mods.ht)) || (constrain.length > 0 && osudroid.mods.modbits_from_string(mod) !== osudroid.mods.modbits_from_string(constrain)));
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
                            if (osudroid.mods.modbits_from_string(mod) === osudroid.mods.modbits_from_string(bonus[1])) points += bonus[2];
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
                            if (data.data.hit300 + data.data.hit300k >= parseInt(bonus[1])) points += bonus[2];
                            break;
                        case "m100":
                            if (data.data.hit100 + data.data.hit100k <= parseInt(bonus[1])) points += bonus[2];
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
                            if (!bonuscheck && ((osudroid.mods.modbits_from_string(mod) & (osudroid.mods.ez | osudroid.mods.nf | osudroid.mods.ht)) || (constrain.length > 0 && osudroid.mods.modbits_from_string(mod) !== osudroid.mods.modbits_from_string(constrain)))) pass = false;
                            if (!pass) return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain requirement!**");
                            if (found && bonuscheck) return message.channel.send("❎ **| I'm sorry, you have completed this bounty challenge! Please wait for the next one to start!**");
                            if (!found) {
                                points += dailyres.points;
                                challengelist.push([challengeid, bonuscomplete])
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
                            })
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
            if (!message.isOwner && !message.author.bot) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
            let challengeid = args[1];
            if (!challengeid) return message.channel.send("❎ **| Hey, I don't know which challenge to start!**");

            query = {challengeid: challengeid};
            dailydb.findOne(query, async (err, dailyres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!dailyres) return message.channel.send("❎ **| I'm sorry, I cannot find the challenge!**");
                if (dailyres.status != 'scheduled') return message.channel.send("❎ **| I'm sorry, this challenge is ongoing or has been finished!**");
                let pass = dailyres.pass;
                let bonus = dailyres.bonus;
                let constrain = dailyres.constrain.toUpperCase();
                let timelimit = Math.floor(Date.now() / 1000) + (dailyres.challengeid.includes("w") ? 86400 * 7 : 86400);
                let beatmapid = dailyres.beatmapid;
                let featured = dailyres.featured;
                if (!featured) featured = "386742340968120321";
                const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
                if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: constrain});
                let requirements = challengeRequirements(challengeid, pass, bonus);
                let pass_string = requirements[0];
                let bonus_string = requirements[1];
                let constrain_string = constrain.length == 0 ? "Any rankable mod except EZ, NF, and HT is allowed" : `**${constrain}** only`;
                embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapinfo.statusColor())
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit - Math.floor(Date.now() / 1000))}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
                    .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                    .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                    .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droid_stars.total)))} ${star.droid_stars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pc_stars.total)))} ${star.pc_stars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

                message.channel.send(`✅ **| Successfully started challenge \`${challengeid}\`.**`, {embed: embed}).catch(console.error);
                client.channels.cache.get("669221772083724318").send(`✅ **| Successfully started challenge \`${challengeid}\`.\n<@&674918022116278282>**`, {embed: embed});

                let previous_challenge = challengeid.charAt(0) + (parseInt(dailyres.challengeid.match(/(\d+)$/)[0]) - 1);
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
        case "manual": {
            // manual submission in case submission
            // fails, possibly due to scores not
            // submitting for not surpassing highest score
            // requires helper or above
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
                    let index = 0;
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
                                    bonuslist[index] = bonuscomplete;
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
                            })
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
            break;
        }
        case "checksubmit": {
            // allows users to see who has submitted plays for specific challenge.
            // useful for clan leaders
            const challengeid = args[1];
            if (!challengeid) return message.channel.send("❎ **| Hey, please enter a challenge ID!**");
            const uid = parseInt(args[2]);
            if (isNaN(uid)) return message.channel.send("❎ **| Hey, please enter a valid uid!**");
            query = {uid: uid.toString()};
            pointdb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) return message.channel.send(`❎ **| Uid ${uid} has never played any challenge before.**`);
                const challenges = res.challenges;
                for (const challenge of challenges) {
                    if (challenge[0] !== challengeid) continue;
                    return message.channel.send(`✅ **| Uid ${uid} has played challenge \`${challengeid}\`.**`);
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
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres.uid;
                let username = userres.username;
                let clan = userres.clan;
                const player = await new osudroid.Player().get({uid: uid});

                if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot your profile!**");
                if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
                let rplay = player.recent_plays;
                query = {status: "ongoing"};
                dailydb.findOne(query, (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!dailyres) return message.channel.send("❎ **| I'm sorry, there is no ongoing challenge now!**");
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
                    
                    pointdb.findOne({discordid: message.author.id}, async (err, playerres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        let found = false;
                        let bonuslist = [challengeid, false, false, false, false];
                        let challengelist = [];
                        let k = 0;
                        if (playerres) {
                            challengelist = playerres.challenges;
                            for (k; k < challengelist.length; k++) {
                                if (challengelist[k][0] == challengeid) {
                                    bonuslist = challengelist[k];
                                    found = true;
                                    break;
                                }
                            }
                        }
                        const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
                        const star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
                        let npp = osudroid.ppv2({
                            stars: star.droid_stars,
                            combo: combo,
                            miss: miss,
                            acc_percent: acc,
                            mode: osudroid.modes.droid
                        });
                        let pcpp = osudroid.ppv2({
                            stars: star.pc_stars,
                            combo: combo,
                            miss: miss,
                            acc_percent: acc,
                            mode: osudroid.modes.osu
                        });
                        let dpp = parseFloat(npp.total.toFixed(2));
                        let pp = parseFloat(pcpp.total.toFixed(2));

                        let points = 0;
                        let passreq = dailyres.pass;
                        let bonus = dailyres.bonus;

                        let data = new osudroid.ReplayAnalyzer({score_id: scoreInfo.score_id, map: star.droid_stars});
                        let unstableRate = 0;
                        if (["m300", "m100", "m50", "ur"].some(value => value === passreq[1] || bonus.some(b => value === b[0]))) {
                            data = await data.analyze();
                            if (!data.fixed_odr) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find your replay file!**");
                            }
                            if (passreq[1] === "ur" || bonus.some(b => b[0] === "ur")) {
                                const hit_object_data = data.data.hit_object_data;
                                let hit_error_total = 0;

                                for (const hit_object of hit_object_data) {
                                    if (hit_object.result === osudroid.hitResult.RESULT_0) continue;
                                    hit_error_total = hit_object.accuracy;
                                }
                                
                                const mean = hit_error_total / hit_object_data.length;

                                let std_deviation = 0;
                                for (const hit_object of hit_object_data)
                                    if (hit_object.result !== osudroid.hitResult.RESULT_0) std_deviation += Math.pow(hit_object.accuracy - mean, 2);

                                unstableRate = Math.sqrt(std_deviation / hit_object_data.length) * 10;
                            }
                            if (data.penalty > 1) {
                                npp = osudroid.ppv2({
                                    stars: star.droid_stars,
                                    combo: scoreInfo.combo,
                                    acc_percent: scoreInfo.accuracy,
                                    miss: scoreInfo.miss,
                                    mode: osudroid.modes.droid,
                                    speed_penalty: data.penalty
                                });
                                dpp = parseFloat(npp.total.toFixed(2));
                            }
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
                                if (data.data.hit300 + data.data.hit300k >= parseInt(passreq[1])) pass = true;
                                break;
                            case "m100":
                                if (data.data.hit100 + data.data.hit100k <= parseInt(passreq[1])) pass = true;
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
                        if (
                            !found && 
                            (
                                (osudroid.mods.modbits_from_string(mod) & (osudroid.mods.nf | osudroid.mods.ez | osudroid.mods.ht)) ||
                                (constrain.length > 0 && osudroid.mods.modbits_from_string(mod) !== osudroid.mods.modbits_from_string(constrain))
                            )
                        ) pass = false;
                        if (!pass) return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain requirement!**");
                        if (!found) points += dailyres.points;

                        let bonus_string = '';
                        let mode = ['easy', 'normal', 'hard', 'insane'];
                        const modFulfilled = !((osudroid.mods.modbits_from_string(mod) & (osudroid.mods.ez | osudroid.mods.nf | osudroid.mods.ht)) || (constrain.length > 0 && osudroid.mods.modbits_from_string(mod) !== osudroid.mods.modbits_from_string(constrain)));
                        for (let i = 0; i < bonus.length; i++) {
                            const bonusEntry = bonus[i];
                            if (bonusEntry[0] === 'none') bonuslist[i + 1] = true;
                            if (bonuslist[i + 1]) continue;
                            let complete = false;
                            switch (bonusEntry[0]) {
                                case "score":
                                    if (modFulfilled && score >= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "scorev2":
                                    if (modFulfilled && scoreCalc(score, bonusEntry[2], acc, miss) >= bonusEntry[1]) {
                                        points += bonusEntry[3];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "mod":
                                    if (osudroid.mods.modbits_from_string(mod) === osudroid.mods.modbits_from_string(bonusEntry[1])) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "acc":
                                    if (modFulfilled && acc >= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "combo":
                                    if (modFulfilled && combo >= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "miss":
                                    if (modFulfilled && miss < bonusEntry[1] || !miss) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "rank":
                                    if (modFulfilled && rankConvert(rank) >= rankConvert(bonusEntry[1])) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "dpp":
                                    if (modFulfilled && dpp >= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "pp":
                                    if (modFulfilled && pp >= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "m300":
                                    if (modFulfilled && data.data.hit300 + data.data.hit300k >= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "m100":
                                    if (modFulfilled && data.data.hit100 + data.data.hit100k <= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "m50":
                                    if (modFulfilled && data.data.hit50 <= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                case "mur":
                                    if (modFulfilled && unstableRate <= bonusEntry[1]) {
                                        points += bonusEntry[2];
                                        bonuslist[i + 1] = true;
                                        complete = true;
                                    }
                                    break;
                                
                            }
                            if (complete) bonus_string += `${mode[i]} `;
                        }
                        if (bonus_string) bonus_string = ` and \`${bonus_string.trimRight().split(" ").join(", ")}\` bonus`;
                        if (playerres) {
                            if (found) challengelist[k] = bonuslist;
                            else challengelist.push(bonuslist);
                            let totalpoint = playerres.points + points;
                            let alicecoins = playerres.alicecoins + points * 2;
                            message.channel.send(`✅ **| Congratulations! You have completed challenge \`${challengeid}\`${bonus_string}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
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
                                console.log("Player points updated");
                            })
                        }
                        else {
                            message.channel.send(`✅ **| Congratulations! You have completed challenge \`${challengeid}\`${bonus_string}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins.**`);
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
                            })
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