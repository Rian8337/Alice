const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const request = require('request');
const AdmZip = require('adm-zip');
const cd = new Set();

/**
 * @param {Discord.GuildMember} member 
 */
function isEligible(member) {
    if (!member) {
        return 0;
    }
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission
    for (const id of eligibleRoleList) {
        if (res === -1) {
            break;
        }
        if (member.roles.cache.has(id[0])) {
            if (id[1] === -1) {
                res = id[1];
            } else {
                res = Math.max(res, id[1]);
            }
        }
    }
    return res;
}

/**
 * @param {string} url 
 * @returns {Promise<Buffer|null>}
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
                let zip;
                try {
                    zip = new AdmZip(Buffer.concat(dataArray));
                } catch (e) {
                    return resolve(null);
                }
                const odrFile = zip.getEntries().find(v => v.entryName.endsWith(".odr"));
                if (!odrFile) {
                    return resolve(null);
                }
                resolve(odrFile.getData());
            });
    });
}

/**
 * @param {number} num 
 */
function timeConvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":");
}

/**
 * @param {number} score 
 * @param {number} maxscore 
 * @param {number} accuracy 
 * @param {number} misscount 
 */
function scoreCalc(score, maxscore, accuracy, misscount) {
    let newscore = score / maxscore * 600000 + Math.pow((accuracy / 100), 4) * 400000;
    newscore -= (misscount * 0.003 * newscore);
    return newscore;
}

/**
 * @param {string} rank 
 */
function rankConvert(rank) {
    switch (rank.toUpperCase()) {
        case "D": return 1;
        case "C": return 2;
        case "B": return 3;
        case "A": return 4;
        case "S": return 5;
        case "SH": return 6;
        case "X": return 7;
        case "XH": return 8;
        default: return 0;
    }
}

/**
 * @param {string} s 
 * @param {number} l 
 */
function spaceFill(s, l) {
    let a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

/**
 * @param {string} str 
 */
function sortAlphabet(str) {
    return [...str].sort((a, b) => a.localeCompare(b)).join("");
}

function editPoint(res, page) {
    let output = '#   | Username         | UID    | Challenges | Points\n';
    for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); i++) {
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

/**
 * 
 * @param {{id: string, value: string|number}} pass 
 * @param {{id: string, list: {level: number, value: number}[]}[]} bonus 
 */
function challengeRequirements(pass, bonus) {
    let pass_string = '';
    let bonusString = [];

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
        let bonus_string = "";
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
        for (let j = 0; j < bonus[i].list.length; ++j) {
            const b = bonus[i].list[j];
            bonus_string += `**Level ${b.level}**: `;
            switch (id) {
                case "none":
                    bonus_string += "None";
                    break;
                case "score":
                    bonus_string += `Score V1 at least **${b.value.toLocaleString()}**`;
                    break;
                case "acc":
                    bonus_string += `Accuracy at least **${b.value}%**`;
                    break;
                case "scorev2":
                    bonus_string += `Score V2 at least **${b.value.toLocaleString()}**`;
                    break;
                case "miss":
                    bonus_string += `${b.value === 0 ? "No misses" : `Miss count below **${b.value}**`}`;
                    break;
                case "mod":
                    bonus_string += `Usage of **${b.value.toUpperCase()}** mod only`;
                    break;
                case "combo":
                    bonus_string += `Combo at least **${b.value}**`;
                    break;
                case "rank":
                    bonus_string += `**${b.value.toUpperCase()}** rank or above`;
                    break;
                case "dpp":
                    bonus_string += `**${b.value}** dpp or more`;
                    break;
                case "pp":
                    bonus_string += `**${b.value}** pp or more`;
                    break;
                case "m300":
                    bonus_string += `300 hit result at least **${b.value}**`;
                    break;
                case "m100":
                    bonus_string += `100 hit result less than or equal to **${b.value}**`;
                    break;
                case "m50":
                    bonus_string += `50 hit result less than or equal to **${b.value}**`;
                    break;
                case "ur":
                    bonus_string += `UR (unstable rate) below or equal to **${b.value}**`;
                    break;
            }
            bonus_string += "\n";
        }
        bonusString.push({
            id: id_string,
            bonus: bonus_string
        });
    }

    return [pass_string, bonusString];
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (!message.isOwner) {
        if (message.channel.type !== "text") {
            return;
        }

        if (message.guild.id !== '316545691545501706' && message.guild.id !== '635532651029332000') {
            return message.channel.send("❎ **| I'm sorry, this command is only allowed in osu!droid (International) Discord server and droid café server!**");;
        }
    }
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }
    // declaration of variables used in switch cases
    const binddb = maindb.collection("userbind");
    const dailydb = alicedb.collection("dailychallenge");
    const pointdb = alicedb.collection("playerpoints");
    const clandb = maindb.collection("clandb");
    const coin = client.emojis.cache.get("669532330980802561");
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const color = message.member?.roles.color?.hexColor || "#000000";
    const embed = new Discord.MessageEmbed().setColor(color);
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
                .setColor(color)
                .setDescription(`This is a system that provides daily and weekly challenges for you to complete. Gain points and ${coin}Alice coins as you complete challenges!`)
                .addField("How does it work?", `Every day, there will be a new daily challenge to complete. Each challenges grant a different amount of points depending on how hard the challenge is. You can get points and ${coin}Alice coins by passing the challenge. There will be a few bonuses that allows you to gain more points and ${coin}Alice coins, too! Each challenge bonus level converts to 2 challenge points, which also converts to ${coin}\`4\` Alice coins.\n\nThe weekly bounty challenge, which is only available once per week, grants more points and ${coin}Alice coins as this challenge is considerably harder than any daily challenges. That's also why you have a week to complete it, too!`)
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
            const user = await message.guild.members.fetch(message.mentions.users.first() || (args[1] ? args[1] : message.author.id)).catch(console.error);
            if (!user) {
                return message.channel.send("❎ **| Hey, can you give me a valid user?**");
            }

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
                const uid = userres.uid;
                const username = userres.username;
                pointdb.findOne(query, async (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    let alicecoins = dailyres?.alicecoins || 0;
                    let points = dailyres?.points || 0;
                    let challenges = dailyres?.challenges.length || 0;
                    const player = await osudroid.Player.getInformation({uid: uid});
                    embed.setAuthor(`Daily/Weekly Challenge Profile for ${username}`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}.html`)
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
            if (parseInt(args[0]) > 1) {
                page = parseInt(args[0]);
            }
            pointdb.find({}, {projection: {_id: 0, uid: 1, points: 1, username: 1, challenges: 1}}).sort({points: -1}).toArray((err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res[(page-1)*20]) {
                    return message.channel.send("❎ **| Eh, we don't have that many players.**");
                }
                let output = editPoint(res, page);
                message.channel.send('```c\n' + output + '```').then(msg => {
                    const max_page = Math.ceil(res.length / 20);
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
                const featured = dailyres.featured ? dailyres.featured : "386742340968120321";
                const constrain = dailyres.constrain?.toUpperCase() ?? "";
                const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
                if (!mapinfo.title) {
                    return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                }
                if (!mapinfo.objects) {
                    return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                }
                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: constrain});
                const timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                const pass_string = challengeRequirements(pass, bonus)[0];
                embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapinfo.statusColor())
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit)}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                    .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                    .addField("**Map Info**", `${mapinfo.showStatistics(constrain, 2)}\n${mapinfo.showStatistics(constrain, 3)}\n${mapinfo.showStatistics(constrain, 4)}\n${mapinfo.showStatistics(constrain, 5)}`)
                    .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain ? `${constrain} mod only` : "Any rankable mod except EZ, NF, and HT"}\n\nUse \`a!daily challenges\` to check bonuses.`);

                const graph = await star.pcStars.getStrainChart(mapinfo.beatmapsetID, message.member?.displayHexColor || "#000000");

                if (graph) {
                    embed.attachFiles([new Discord.MessageAttachment(graph, "chart.png")])
                        .setImage("attachment://chart.png");
                }

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
            switch (args[1]) {
                case "check": {
                    query = {status: "w-ongoing"};
                    dailydb.findOne(query, async (err, dailyres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!dailyres) {
                            return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                        }
                        const pass = dailyres.pass;
                        const bonus = dailyres.bonus;
                        const challengeid = dailyres.challengeid;
                        const beatmapid = dailyres.beatmapid;
                        const featured = dailyres.featured ? dailyres.featured : "386742340968120321";
                        const constrain = dailyres.constrain?.toUpperCase() ?? "";
                        const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
                        if (!mapinfo.title) {
                            return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                        }
                        if (!mapinfo.objects) {
                            return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                        }
                        const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: constrain});
                        const timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                        const pass_string = challengeRequirements(pass, bonus)[0];
                        embed.setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                            .setColor(mapinfo.statusColor())
                            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit)}`, footer[index])
                            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                            .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                            .addField("**Map Info**", `${mapinfo.showStatistics(constrain, 2)}\n${mapinfo.showStatistics(constrain, 3)}\n${mapinfo.showStatistics(constrain, 4)}\n${mapinfo.showStatistics(constrain, 5)}`)
                            .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain ? `${constrain} mod only` : "Any rankable mod except EZ, NF, and HT"}\n\nUse \`a!daily bounty challenges\` to check bonuses.`);

                        const graph = await star.pcStars.getStrainChart(mapinfo.beatmapsetID, message.member?.displayHexColor || "#000000");

                        if (graph) {
                            embed.attachFiles([new Discord.MessageAttachment(graph, "chart.png")])
                                .setImage("attachment://chart.png");
                        }

                        message.channel.send({embed: embed}).catch(console.error);
                        cd.add(message.author.id);
                        setTimeout(() => {
                            cd.delete(message.author.id);
                        }, 2500);
                    });
                    break;
                }
                case "challenges": {
                    let page = 1;
                    dailydb.findOne({status: "w-ongoing"}, (err, dailyres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!dailyres) {
                            return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                        }
                        const bonuses = challengeRequirements(dailyres.pass, dailyres.bonus)[1];

                        embed.setAuthor("osu!droid Weekly Bounty Challenge: Challenges", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
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
                default: {
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
                        const player = await osudroid.Player.getInformation({uid: uid});
                        if (!player.username) {
                            return message.channel.send("❎ **| I'm sorry, I cannot your profile!**");
                        }
                        if (player.recentPlays.length === 0) {
                            return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
                        }
                        const rplay = player.recentPlays;
                        query = {status: "w-ongoing"};
                        dailydb.findOne(query, async (err, dailyres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!dailyres) {
                                return message.channel.send("❎ **| I'm sorry, there is no ongoing bounty now!**");
                            }
                            const timelimit = Math.max(0, dailyres.timelimit - Math.floor(Date.now() / 1000));
                            if (timelimit < 0) {
                                return message.channel.send("❎ **| I'm sorry, this challenge is over! Please wait for the next one to start!**");
                            }
                            const challengeid = dailyres.challengeid;
                            const beatmapid = dailyres.beatmapid;
                            const hash = dailyres.hash;
                            const constrain = dailyres.constrain?.toUpperCase() ?? "";
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
                            if (constrain && sortAlphabet(mod) !== sortAlphabet(constrain)) {
                                return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain of this challenge!**");
                            }
                            if (mod & (osuMods.ez | osuMods.nf | osuMods.ht)) {
                                return message.channel.send("❎ **| I'm sorry, EZ, NF, and HT are not allowed in challenges!**");
                            }

                            const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
                            if (mapinfo.error) {
                                return message.channel.send("❎ **| I'm sorry, I couldn't fetch challenge beatmap info! Perhaps osu! API is down?**");
                            }
                            if (!mapinfo.title) {
                                return message.channel.send("❎ **| I'm sorry, I can't find the challenge map!**");
                            }
                            if (!mapinfo.objects) {
                                return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                            }
                            const passreq = dailyres.pass;
                            const bonus = dailyres.bonus;
                            const replay = await new osudroid.ReplayAnalyzer({scoreID: scoreInfo.scoreID, map: mapinfo.map}).analyze();
                            if (!replay.fixedODR) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find your replay file!**");
                            }
                            const { data } = replay;
                            const stats = new osudroid.MapStats({
                                ar: scoreInfo.forcedAR,
                                speedMultiplier: scoreInfo.speedMultiplier,
                                isForceAR: !isNaN(scoreInfo.forcedAR),
                                oldStatistics: data.replayVersion <= 3
                            });
                            const realAcc = new osudroid.Accuracy({
                                n300: data.hit300,
                                n100: data.hit100,
                                n50: data.hit50,
                                nmiss: miss
                            });
                            const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
                            replay.map = star.droidStars;
                            replay.checkFor3Finger();
                            let unstableRate = 0;
                            const requiresReplay = ["ur"];
                            if (requiresReplay.some(value => value === passreq.id) || bonus.some(v => requiresReplay.includes(v.id))) {
                                const hit_object_data = data.hitObjectData;
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
                            }
                            const npp = new osudroid.DroidPerformanceCalculator().calculate({
                                stars: star.droidStars,
                                combo: combo,
                                accPercent: realAcc,
                                tapPenalty: replay.tapPenalty,
                                stats
                            });
                            const pcpp = new osudroid.OsuPerformanceCalculator().calculate({
                                stars: star.pcStars,
                                combo: combo,
                                accPercent: realAcc,
                                miss: miss,
                                stats
                            });
                            const dpp = parseFloat(npp.total.toFixed(2));
                            const pp = parseFloat(pcpp.total.toFixed(2));
                            let pass = false;
                            const maxScore = mapinfo.maxScore({mods: mod});
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
                                    pass = replay.data.hit300 >= passreq.value;
                                    break;
                                case "m100":
                                    pass = replay.data.hit100 <= passreq.value;
                                    break;
                                case "m50":
                                    pass = replay.data.hit50 <= passreq.value;
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
                                            bonusComplete = sortAlphabet(mod) === sortAlphabet(c.value);
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
                                            bonusComplete = replay.data.hit300 >= c.value;
                                            break;
                                        case "m100":
                                            bonusComplete = replay.data.hit100 <= c.value;
                                            break;
                                        case "m50":
                                            bonusComplete = replay.data.hit50 <= c.value;
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
                                const bonusentry = {
                                    id: challengeid,
                                    highestLevel: completedLevel
                                };
                                let points = 0;
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
                                        message.channel.send(`✅ **| Congratulations! You have completed weekly bounty challenge \`${challengeid}\` with challenge bonus level ${completedLevel}, earning \`${points}\` ${points == 1?"point":"points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${totalpoint}\` ${totalpoint == 1?"point":"points"} and ${coin}\`${alicecoins}\` Alice coins.**`);
                                    });
                                } else {
                                    points += dailyres.points + completedLevel * 2;
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
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                        }
                                        message.channel.send(`✅ **| Congratulations! You have completed weekly bounty challenge \`${challengeid}\` with challenge bonus level ${completedLevel}, earning \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins! You now have \`${points}\` ${points == 1 ? "point" : "points"} and ${coin}\`${points * 2}\` Alice coins.**`);
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
                }
            }
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
                const featured = dailyres.featured ? dailyres.featured : "386742340968120321";
                const constrain = dailyres.constrain?.toUpperCase() ?? "";
                const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
                if (!mapinfo.title) {
                    return message.channel.send("❎ **| I'm sorry, I cannot find the challenge map!**");
                }
                if (!mapinfo.objects) {
                    return message.channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
                }
                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: constrain});
                const pass_string = challengeRequirements(pass, bonus)[0];
                embed.setAuthor(challengeid.includes("w") ? "osu!droid Weekly Bounty Challenge" : "osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(mapinfo.statusColor())
                    .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit - Math.floor(Date.now() / 1000))}`, footer[index])
                    .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                    .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
                    .addField("**Map Info**", `${mapinfo.showStatistics(constrain, 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                    .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain ? `${constrain} mod must be used` : "Any rankable mod except EZ, NF, and HT"}\n\nUse  \`${challengeid.includes("w") ? "a!daily bounty challenges" : "a!daily challenges"}\` to check bonuses.`);

                const graph = await star.pcStars.getStrainChart(mapinfo.beatmapsetID, message.member?.displayHexColor || "#000000");

                if (graph) {
                    embed.attachFiles([new Discord.MessageAttachment(graph, "chart.png")])
                        .setImage("attachment://chart.png");
                }

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
                const bonuses = challengeRequirements(dailyres.pass, dailyres.bonus)[1];

                embed.setAuthor("osu!droid Daily Challenge: Challenges", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                    .setColor(color)
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
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
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
                if (data.replayVersion < 3) {
                    return message.channel.send("❎ **| I'm sorry, that replay file is too old!**");
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
                    const constrain = dailyres.constrain?.toUpperCase() ?? "";
                    const bonus = dailyres.bonus;

                    const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: dailyres.beatmapid});
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
                    const mod = osudroid.mods.modbitsFromString(data.convertedMods);
                    
                    const osuMods = osudroid.mods.osuMods;
                    if (constrain && sortAlphabet(data.convertedMods) !== sortAlphabet(constrain)) {
                        return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain of this challenge!**");
                    }
                    if (mod & (osuMods.ez | osuMods.nf | osuMods.ht)) {
                        return message.channel.send("❎ **| I'm sorry, EZ, NF, and HT is not allowed in challenges!**");
                    }

                    // analyze hit object data
                    const modWithoutSpeedChanging = osudroid.mods.modbitsToString(mod - (mod & osuMods.speed_changing));
                    const od = new osudroid.MapStats({od: mapinfo.od, mods: modWithoutSpeedChanging}).calculate({mode: osudroid.modes.droid}).od;
                    const isPrecise = data.convertedMods.includes("PR");
                    
                    const hitWindow = new osudroid.DroidHitWindow(od);
                    const hitWindow300 = hitWindow.hitWindowFor300(isPrecise);
                    const hitWindow100 = hitWindow.hitWindowFor100(isPrecise);
                    const hitWindow50 = hitWindow.hitWindowFor50(isPrecise);

                    const stats = new osudroid.MapStats({
                        ar: data.forcedAR,
                        speedMultiplier: data.speedModification,
                        isForceAR: !isNaN(data.forcedAR),
                        oldStatistics: data.replayVersion <= 3
                    });
                    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: data.convertedMods, stats});
                    replay.map = star.droidStars;

                    for (let i = 0; i < star.droidStars.objects.length; ++i) {
                        const object = star.droidStars.objects[i];
                        const hitData = data.hitObjectData[i];

                        if (!(object.type & osudroid.objectTypes.circle) || hitData.result === osudroid.hitResult.RESULT_0) {
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

                    replay.checkFor3Finger();
                    
                    const h300 = data.hit300;
                    const h100 = data.hit100;
                    const h50 = data.hit50;

                    // determine score grade
                    let rank;
                    const totalHits = h300 + h100 + h50 + miss;
                    const isHidden = !!(mod & (osuMods.hd | osuMods.fl));
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

                    let unstableRate = 0;
                    const requiresReplay = ["ur"];
                    if (requiresReplay.some(v => v === passreq.id) || bonus.some(v => requiresReplay.includes(v.id))) {
                        const hit_object_data = replay.data.hitObjectData;
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
                    }
                    const realAcc = new osudroid.Accuracy({
                        n300: h300,
                        n100: h100,
                        n50: h50,
                        nmiss: miss
                    });
                    const dpp = new osudroid.DroidPerformanceCalculator().calculate({
                        stars: star.droidStars,
                        combo: combo,
                        accPercent: realAcc,
                        tapPenalty: replay.tapPenalty,
                        stats
                    }).total;

                    const pp = new osudroid.OsuPerformanceCalculator().calculate({
                        stars: star.pcStars,
                        combo: combo,
                        accPercent: realAcc,
                        stats
                    }).total;

                    let pass = false;
                    const maxScore = mapinfo.maxScore(new osudroid.MapStats({mods: data.convertedMods}));
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
                                    bonusComplete = sortAlphabet(data.convertedMods) === sortAlphabet(c.value);
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
                        const statsMessage = `**Total score**: ${data.score.toLocaleString()}\n**Combo**: ${data.maxCombo}x\n**Accuracy**: ${(data.accuracy * 100).toFixed(2)}%\n**Rank**: ${rank}\n**Time**: ${new Date(data.time).toUTCString()}\n\n**Hit great (300)**: ${data.hit300} (${data.hit300k} geki and katu)\n**Hit good (100)**: ${data.hit100} (${data.hit100k} katu)\n**Hit meh (50)**: ${data.hit50}\n**Misses**: ${data.hit0}\n\n**Level reached**: ${completedLevel}`;
                        embed.setAuthor("Score Statistics", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
                            .setDescription(statsMessage)
                            .setColor(color);
                        
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
                                points += dailyres.points + completedLevel;
                                challengelist.push(bonusentry);
                            }
                            const totalpoint = playerres.points + points;
                            const alicecoins = playerres.alicecoins + points * 2;
                            message.channel.send(`❗**| ${message.author}, you have 1 minute to ask a moderator or helper to react to this message to submit your play!**`).then(msg => {
                                msg.react("✅");

                                let confirmation = false;
                                const confirm = msg.createReactionCollector(async (reaction, user) => reaction.emoji.name === "✅" && isEligible(await message.guild.members.fetch(user).catch(console.error)), {time: 60000});

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
                                const confirm = msg.createReactionCollector(async (reaction, user) => reaction.emoji.name === "✅" && isEligible(await message.guild.members.fetch(user).catch(console.error)), {time: 60000});

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
                const player = await osudroid.Player.getInformation({uid: uid});

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
                    const constrain = dailyres.constrain?.toUpperCase() ?? "";
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
                    if (constrain && sortAlphabet(mod) !== sortAlphabet(constrain)) {
                        return message.channel.send("❎ **| I'm sorry, you didn't fulfill the constrain of this challenge!**");
                    }
                    if (mod & (osuMods.ez | osuMods.nf | osuMods.ht)) {
                        return message.channel.send("❎ **| I'm sorry, EZ, NF, and HT are not allowed in challenges!**");
                    }
                    
                    pointdb.findOne({discordid: message.author.id}, async (err, playerres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        const challengelist = playerres?.challenges || [];
                        const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
                        const replay = await new osudroid.ReplayAnalyzer({scoreID: scoreInfo.scoreID, map: mapinfo.map}).analyze();
                        if (!replay.fixedODR) {
                            return message.channel.send("❎ **| I'm sorry, I cannot find your replay file!**");
                        }
                        const { data } = replay;
                        const stats = new osudroid.MapStats({
                            ar: scoreInfo.forcedAR,
                            speedMultiplier: scoreInfo.speedMultiplier,
                            isForceAR: !isNaN(scoreInfo.forcedAR),
                            oldStatistics: data.replayVersion <= 3
                        });
                        const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mod, stats});
                        replay.map = star.droidStars;
                        replay.checkFor3Finger();
                        const passreq = dailyres.pass;
                        const bonus = dailyres.bonus;

                        let unstableRate = 0;
                        const realAcc = new osudroid.Accuracy({
                            n300: data.hit300,
                            n100: data.hit100,
                            n50: data.hit50,
                            nmiss: miss
                        });
                        const requiresReplay = ["ur"];
                        if (requiresReplay.some(value => value === passreq.id) || bonus.some(v => requiresReplay.includes(v.id))) {
                            const hit_object_data = data.hitObjectData;
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
                        }

                        const npp = new osudroid.DroidPerformanceCalculator().calculate({
                            stars: star.droidStars,
                            combo: combo,
                            accPercent: realAcc,
                            tapPenalty: replay.tapPenalty,
                            stats
                        });
                        const pcpp = new osudroid.OsuPerformanceCalculator().calculate({
                            stars: star.pcStars,
                            combo: combo,
                            accPercent: realAcc,
                            stats
                        });
                        const dpp = parseFloat(npp.total.toFixed(2));
                        const pp = parseFloat(pcpp.total.toFixed(2));
                        let pass = false;
                        const maxScore = mapinfo.maxScore({mods: mod});
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
                                pass = replay.data.hit300 >= passreq.value;
                                break;
                            case "m100":
                                pass = replay.data.hit100 <= passreq.value;
                                break;
                            case "m50":
                                pass = replay.data.hit50 <= passreq.value;
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
                                        bonusComplete = sortAlphabet(mod) === sortAlphabet(c.value);
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
                                        bonusComplete = data.hit300 >= c.value;
                                        break;
                                    case "m100":
                                        bonusComplete = replay.data.hit100 <= c.value;
                                        break;
                                    case "m50":
                                        bonusComplete = replay.data.hit50 <= c.value;
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
                            points += dailyres.points + completedLevel * 2;
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
    usage: "daily\ndaily about\ndaily bounty [check|challenges]\ndaily challenges\ndaily check\ndaily checksubmit <challenge ID> <uid>\ndaily lb [page]\ndaily manual\ndaily profile [user]\ndaily start <challenge ID> (specific person)",
    detail: "`challenge ID`: The ID of the challenge [String]\n`check`: Checks the current ongoing weekly bounty challenge. If not defined, submits the user's plays to validate [String]\n`page`: Page of leaderboard [Integer]\n`uid`: The uid to check submission for [Integer]\n`user`: The user to view or give [UserResolvable (mention or user ID)]",
    permission: "None | Bot Creators"
};