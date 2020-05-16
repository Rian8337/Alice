const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');

/**
 * Processes entries for each challenge.
 *
 * @param message Discord.Message() instance
 * @param {string} condition The condition of the bonus
 * @param {number|string} value The value of the bonus
 * @param mapinfo osudroid.MapInfo() instance
 * @param {number} dpp Maximum droid pp of the map with constrain mods enabled
 * @param {number} pp Maximum pp of the map with constrain mods enabled
 * @param {number} max_score Maximum score of the map with constrain mods enabled
 * @returns {number|string|*} The processed value
 */
function validateEntry(message, condition, value, mapinfo, dpp, pp, max_score) {
    let rank_constants = ['XH', 'X', 'SH', 'S', 'A', 'B', 'C', 'D'];
    switch (condition) {
        case 'combo': {
            value = parseInt(value);
            if (typeof value !== "number" || value <= 0)
                return message.channel.send("❎ **| I'm sorry, that's an invalid combo count!**");
            if (value > mapinfo.max_combo)
                return message.channel.send(`❎ **| I'm sorry, combo count is above maximum combo (${mapinfo.max_combo})!**`);
            break
        }
        case 'rank': {
            if (typeof value !== "string")
                return message.channel.send("❎ **| I'm sorry, that's an invalid rank!**");
            value = value.toUpperCase();
            if (!rank_constants.includes(value))
                return message.channel.send("❎ **| I'm sorry, that's an invalid rank!**");
            break
        }
        case 'acc': {
            value = parseFloat(value);
            if (typeof value !== "number" || value <= 0 || value > 100)
                return message.channel.send("❎ **| I'm sorry, that's an invalid accuracy!**");
            break
        }
        case 'score': {
            value = parseInt(value);
            if (typeof value !== "number")
                return message.channel.send("❎ **| I'm sorry, that's an invalid score amount!**");
            if (value <= 0 || value > mapinfo.max_score)
                return message.channel.send(`❎ **| I'm sorry, that score amount is above maximum score (${max_score})!**`);
            break
        }
        case 'scorev2': {
            value = parseInt(value);
            // hardcoded limit at 1500000 scorev2
            if (typeof value !== "number" || value <= 0 || value > 1500000)
                return message.channel.send("❎ **| I'm sorry, that's an invalid scorev2 count!**");
            break
        }
        case 'miss': {
            value = parseInt(value);
            if (typeof value !== "number" || value < 0)
                return message.channel.send("❎ **| I'm sorry, that's an invalid miss count!**");
            if (value > mapinfo.max_combo)
                return message.channel.send(`❎ **| I'm sorry, miss count is above maximum combo (${mapinfo.max_combo})!**`);
            break
        }
        case 'dpp': {
            value = parseFloat(value);
            if (typeof value !== "number" || value < 0)
                return message.channel.send("❎ **| I'm sorry, that's an invalid dpp requirement!**");
            if (value > dpp)
                return message.channel.send(`❎ **| I'm sorry, dpp requirement is above maximum dpp (${dpp})!**`);
            break
        }
        case 'pp': {
            value = parseFloat(value);
            if (typeof value !== "number" || value < 0)
                return message.channel.send("❎ **| I'm sorry, that's an invalid pp requirement!**");
            if (value > pp)
                return message.channel.send(`❎ **| I'm sorry, pp requirement is above maximum pp (${pp})!**`);
            break
        }
        case 'mod': {
            if (typeof value !== "string")
                return message.channel.send("❎ **| I'm sorry, the mod combination is invalid!**");
            value = osudroid.mods.modbits_from_string(value);
            if (!value)
                return message.channel.send("❎ **| I'm sorry, that mod combination is invalid!**");
            value = osudroid.mods.modbits_to_string(value);
            break
        }
    }

    return value
}

/**
 * Inserts a bonus to the challenge.
 *
 * @param {Object} entry The main entry object
 * @param {string} condition The condition of the bonus
 * @param {boolean} v2 Whether or not to use ScoreV2
 * @param {number} value The value of the bonus
 * @param {number} points The points of the bonus
 * @param {number} max_score The maximum score of the map with constrain mods enabled
 */
function insertBonus(entry, condition, v2, value, points, max_score) {
    if (condition === 'none')
        entry.bonus.push([condition]);
    else if (v2)
        entry.bonus.push([condition, value, max_score, points]);
    else
        entry.bonus.push([condition, value, points])
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");

    if (args.length < 10) return message.channel.send("❎ **| Hey, I need more input!**");
    
    let main_entry = {
        challengeid: '',
        beatmapid: 0,
        link: [],
        status: "scheduled",
        hash: '',
        points: 0,
        timelimit: 0,
        featured: '',
        pass: [],
        constrain: '',
        bonus: []
    };

    const req_constants = ['none', 'combo', 'rank', 'acc', 'score', 'scorev2', 'miss', 'dpp', 'pp', 'mod'];

    let pass_v2 = false;
    let easy_v2 = false;
    let normal_v2 = false;
    let hard_v2 = false;
    let insane_v2 = false;

    let dailydb = alicedb.collection("dailychallenge");

    let map = args[0];
    if (!map)
        return message.channel.send("❎ **| Hey, no beatmap means no challenge! Please enter a beatmap!**");
    if (map.includes("/")) {
        let a = map.split("/");
        map = parseInt(a[a.length - 1]);
        if (isNaN(map))
            return message.channel.send("❎ **| I'm sorry, that beatmap is invalid!**")
    }
    map = parseInt(map);
    main_entry.beatmapid = map;

    let query = {beatmapid: map};
    dailydb.findOne(query, (err, beatmapres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (beatmapres) return message.channel.send("❎ **| I'm sorry, that beatmap has been used before. Please pick another map!**");

        let challenge_id = args[1];
        if (!challenge_id)
            return message.channel.send("❎ **| Hey, please mention a challenge ID!**");
        if (!challenge_id.includes("d") && !challenge_id.includes("w"))
            return message.channel.send("❎ **| Hey, that challenge ID is invalid!**");
        main_entry.challengeid = challenge_id;

        query = {challengeid: challenge_id};
        dailydb.findOne(query, async (err, challengeres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (challengeres) return message.channel.send("❎ **| I'm sorry, that challenge ID is a duplicate!**");

            let hash = args[2];
            if (!hash)
                return message.channel.send("❎ **| Hey, please enter the beatmap's MD5 hash of the modified .osu file!**");
            if (hash.length !== 32)
                return message.channel.send("❎ **| Hey, that beatmap's MD5 hash is invalid! It must be 32 characters!**");
            main_entry.hash = hash;

            let featured = args[3];
            if (!featured)
                return message.channel.send("❎ **| Hey, please enter the featured user of the challenge!**");
            featured = featured.replace("<@!", "").replace("<@", "").replace(">", "");
            main_entry.featured = featured;

            let google_link = args[4];
            if (!google_link)
                return message.channel.send("❎ **| I'm sorry, please enter a Google Drive link for the modified challenge beatmap!**");
            main_entry.link.push(google_link);

            let onedrive_link = args[5];
            if (!onedrive_link)
                return message.channel.send("❎ **| I'm sorry, please enter a OneDrive link for the modified challenge beatmap!**");
            main_entry.link.push(onedrive_link);

            let points = args[6];
            if (!points)
                return message.channel.send("❎ **| Hey, please enter a pass point amount!**");
            points = parseInt(points);
            if (isNaN(points))
                return message.channel.send("❎ **| Hey, please enter a valid point amount!**");
            main_entry.points = points;

            let pass = args[7];
            if (!pass)
                return message.channel.send("❎ **| Hey, please enter a pass condition!**");
            if (!pass.includes(":"))
                return message.channel.send("❎ **| Hey, that pass condition format is invalid!**");

            let pass_entry = pass.split(":");
            if (pass_entry.length !== 2)
                return message.channel.send("❎ **| Hey, that pass condition format is invalid!**");
            let pass_condition = pass_entry[0];
            if (!req_constants.includes(pass_condition))
                return message.channel.send("❎ **| I'm sorry, that pass condition is invalid!**");
            if (pass_condition === 'scorev2') pass_v2 = true;
            let pass_value = pass_entry[1];
            if (pass_condition !== 'rank') pass_value = parseInt(pass_value)
            if (!pass_value)
                return message.channel.send("❎ **| I'm sorry, that pass value is invalid!**");

            let constrain = args[8];
            if (!constrain)
                return message.channel.send("❎ **| Hey, please enter a constrain!**");
            constrain = osudroid.mods.modbits_from_string(constrain);
            if (!constrain) constrain = "";
            else constrain = osudroid.mods.modbits_to_string(constrain);
            main_entry.constrain = constrain.toLowerCase();

            let easy_bonus = args[9];
            if (!easy_bonus) return message.channel.send("❎ **| Hey, please enter an easy bonus!**");
            if (!easy_bonus.includes(":"))
                return message.channel.send("❎ **| Hey, that easy condition format is invalid!**");

            let easy_entry = easy_bonus.split(":");
            let easy_condition = easy_entry[0];
            let easy_value = easy_entry[1];
            let easy_points = easy_entry[2];
            if (!req_constants.includes(easy_condition))
                return message.channel.send("❎ **| I'm sorry, that easy condition is invalid!**");
            if (easy_condition !== 'none') {
                if (easy_entry.length !== 3)
                    return message.channel.send("❎ **| Hey, that easy condition format is invalid!**");
                if (easy_condition === 'scorev2') easy_v2 = true;
                easy_value = easy_entry[1];
                easy_points = parseInt(easy_entry[2]);
                if (isNaN(easy_points))
                    return message.channel.send("❎ **| I'm sorry, that easy bonus points is invalid!**");
            }

            let normal_bonus = args[10];
            let normal_entry;
            let normal_condition;
            let normal_value;
            let normal_points;

            let hard_bonus = args[11];
            let hard_entry;
            let hard_condition;
            let hard_value;
            let hard_points;

            let insane_bonus = args[12];
            let insane_entry;
            let insane_condition;
            let insane_value;
            let insane_points;

            if (challenge_id.includes("d")) {
                if (!normal_bonus)
                    return message.channel.send("❎ **| Hey, please enter a normal bonus!**");
                if (!normal_bonus.includes(":"))
                    return message.channel.send("❎ **| Hey, that normal condition format is invalid!**");

                normal_entry = normal_bonus.split(":");
                normal_condition = normal_entry[0];
                normal_value = normal_entry[1];
                normal_points = normal_entry[2];
                if (!req_constants.includes(normal_condition))
                    return message.channel.send("❎ **| I'm sorry, that normal condition is invalid!**");
                if (normal_condition !== 'none') {
                    if (normal_entry.length !== 3)
                        return message.channel.send("❎ **| Hey, that normal condition format is invalid!**");
                    if (normal_condition === 'scorev2') normal_v2 = true;
                    normal_value = normal_entry[1];
                    normal_points = parseInt(normal_entry[2]);
                    if (isNaN(normal_points)) return message.channel.send("❎ **| I'm sorry, that hard bonus points is invalid!**");
                }

                if (!hard_bonus)
                    return message.channel.send("❎ **| Hey, please enter a hard bonus!**");
                if (!hard_bonus.includes(":"))
                    return message.channel.send("❎ **| Hey, that hard condition format is invalid!**");

                hard_entry = hard_bonus.split(":");
                hard_condition = hard_entry[0];
                if (!req_constants.includes(hard_condition))
                    return message.channel.send("❎ **| I'm sorry, that hard condition is invalid!**");
                hard_value = hard_entry[1];
                hard_points = hard_entry[2];
                if (hard_condition !== 'none') {
                    if (hard_entry.length !== 3)
                        return message.channel.send("❎ **| Hey, that hard condition format is invalid!**");
                    if (hard_condition === 'scorev2') hard_v2 = true;
                    hard_value = hard_entry[1];
                    hard_points = parseInt(hard_entry[2]);
                    if (isNaN(hard_points)) return message.channel.send("❎ **| I'm sorry, that hard bonus points is invalid!**");
                }

                if (!insane_bonus)
                    return message.channel.send("❎ **| Hey, please enter a insane bonus!**");
                if (!insane_bonus.includes(":"))
                    return message.channel.send("❎ **| Hey, that insane condition format is invalid!**");
                insane_entry = insane_bonus.split(":");
                insane_condition = insane_entry[0];
                insane_value = insane_entry[1];
                insane_points = insane_entry[2];
                if (!req_constants.includes(insane_condition))
                    return message.channel.send("❎ **| I'm sorry, that insane condition is invalid!**");
                if (insane_condition !== 'none') {
                    if (insane_entry.length !== 3)
                        return message.channel.send("❎ **| Hey, that insane condition format is invalid!**");
                    if (insane_condition === 'scorev2') insane_v2 = true;
                    insane_value = insane_entry[1];
                    insane_points = parseInt(insane_entry[2]);
                    if (isNaN(insane_points))
                        return message.channel.send("❎ **| I'm sorry, that insane bonus points is invalid!**");
                }
            }

            const mapinfo = await new osudroid.MapInfo().get({beatmap_id: map});
            if (mapinfo.error)
                return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap data! Perhaps osu! API is down?**");
            if (!mapinfo.title)
                return message.channel.send("❎ **| I'm sorry, I cannot find the map you are looking for!**");
            if (!mapinfo.objects)
                return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
            if (!mapinfo.osu_file)
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");

            if (mapinfo.hash === hash)
                return message.channel.send("❎ **| Hey, the given MD5 hash value is the same as original MD5 hash value!**");
            let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: constrain});
            let npp = osudroid.ppv2({
                stars: star.droid_stars,
                combo: mapinfo.max_combo,
                acc_percent: 100,
                miss: 0,
                mode: "droid"
            });
            let pcpp = osudroid.ppv2({
                stars: star.pc_stars,
                combo: mapinfo.max_combo,
                acc_percent: 100,
                miss: 0,
                mode: "osu"
            });

            let dpp = parseFloat(npp.toString().split(" ")[0]);
            let pp = parseFloat(pcpp.toString().split(" ")[0]);
            let max_score = mapinfo.max_score(constrain);

            pass_value = validateEntry(message, pass_condition, pass_value, mapinfo, dpp, pp, max_score);
            if (pass_v2)
                main_entry.pass = [pass_condition, pass_value, max_score];
            else
                main_entry.pass = [pass_condition, pass_value];

            if (challenge_id.includes("d")) {
                easy_value = validateEntry(message, easy_condition, easy_value, mapinfo, dpp, pp, max_score);
                insertBonus(main_entry, easy_condition, easy_v2, easy_value, easy_points, max_score);

                normal_value = validateEntry(message, normal_condition, normal_value, mapinfo, dpp, pp, max_score);
                insertBonus(main_entry, normal_condition, normal_v2, normal_value, normal_points, max_score);

                hard_value = validateEntry(message, hard_condition, hard_value, mapinfo, dpp, pp, max_score);
                insertBonus(main_entry, hard_condition, hard_v2, hard_value, hard_points, max_score);

                insane_value = validateEntry(message, insane_condition, insane_value, mapinfo, dpp, pp, max_score);
                insertBonus(main_entry, insane_condition, insane_v2, insane_value, insane_points, max_score)
            } else {
                easy_value = validateEntry(message, easy_condition, easy_value, mapinfo, dpp, pp, max_score);
                if (easy_condition === 'none')
                    main_entry.bonus.push(easy_condition);
                else if (easy_v2)
                    main_entry.bonus.push(easy_condition, easy_value, max_score, easy_points);
                else
                    main_entry.bonus.push(easy_condition, easy_value, easy_points)
            }

            let pass_string;
            let bonus_string = '';
            switch (pass_condition) {
                case "score": {
                    pass_string = `Score V1 at least **${pass_value.toLocaleString()}**`;
                    break
                }
                case "acc": {
                    pass_string = `Accuracy at least **${pass_value}%**`;
                    break
                }
                case "scorev2": {
                    pass_string = `Score V2 at least **${pass_value.toLocaleString()}**`;
                    break
                }
                case "miss": {
                    pass_string = pass_value === 0 ? "No misses" : `Miss count below **${pass_value}**`;
                    break
                }
                case "combo": {
                    pass_string = `Combo at least **${pass_value}**`;
                    break
                }
                case "rank": {
                    pass_string = `**${pass_value.toUpperCase()}** rank or above`;
                    break
                }
                case "dpp": {
                    pass_string = `**${pass_value}** dpp or more`;
                    break
                }
                case "pp": {
                    pass_string = `**${pass_value}** pp or more`;
                    break
                }
                default:
                    pass_string = 'No pass condition'
            }
            let bonus = main_entry.bonus;
            if (challenge_id.includes("w")) {
                switch (bonus[0]) {
                    case "none": {
                        bonus_string += "None";
                        break
                    }
                    case "score": {
                        bonus_string += `Score V1 at least **${bonus[1].toLocaleString()}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "acc": {
                        bonus_string += `Accuracy at least **${parseFloat(bonus[1]).toFixed(2)}%** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "scorev2": {
                        bonus_string += `Score V2 at least **${bonus[1].toLocaleString()}** (__${bonus[3]}__ ${bonus[3] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "miss": {
                        bonus_string += `${bonus[1] === 0 ? "No misses" : `Miss count below **${bonus[1]}**`} (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "mod": {
                        bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod only (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "combo": {
                        bonus_string += `Combo at least **${bonus[1]}** (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "rank": {
                        bonus_string += `**${bonus[1].toUpperCase()}** rank or above (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "dpp": {
                        bonus_string += `**${bonus[1]}** dpp or more (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    case "pp": {
                        bonus_string += `**${bonus[1]}** pp or more (__${bonus[2]}__ ${bonus[2] === 1 ? "point" : "points"})`;
                        break
                    }
                    default:
                        bonus_string += "No bonuses available"
                }
            } else {
                let difflist = ["Easy", "Normal", "Hard", "Insane"];
                for (let i = 0; i < bonus.length; i++) {
                    bonus_string += `${difflist[i]}: `;
                    switch (bonus[i][0]) {
                        case "none": {
                            bonus_string += "None";
                            break
                        }
                        case "score": {
                            bonus_string += `Score V1 at least **${bonus[i][1].toLocaleString()}** (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "acc": {
                            bonus_string += `Accuracy at least **${parseFloat(bonus[i][1]).toFixed(2)}%** (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "scorev2": {
                            bonus_string += `Score V2 at least **${bonus[i][1].toLocaleString()}** (__${bonus[i][3]}__ ${bonus[i][3] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "miss": {
                            bonus_string += `${bonus[i][1] === 0 ? "No misses" : `Miss count below **${bonus[i][1]}**`} (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "mod": {
                            bonus_string += `Usage of **${bonus[i][1].toUpperCase()}** mod only (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "combo": {
                            bonus_string += `Combo at least **${bonus[i][1]}** (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "rank": {
                            bonus_string += `**${bonus[i][1].toUpperCase()}** rank or above (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "dpp": {
                            bonus_string += `**${bonus[i][1]}** dpp or more (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        case "pp": {
                            bonus_string += `**${bonus[i][1]}** pp or more (__${bonus[i][2]}__ ${bonus[i][2] === 1 ? "point" : "points"})`;
                            break
                        }
                        default:
                            bonus_string += "No bonuses available"
                    }
                    bonus_string += '\n'
                }
            }
            let constrain_string = constrain.length === 0 ? "Any rankable mod except EZ, NF, and HT is allowed" : `**${constrain}** only`;

            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);

            let embed = new Discord.MessageEmbed()
                .setAuthor(challenge_id.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                .setColor(mapinfo.statusColor())
                .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challenge_id}`, footer[index])
                .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
                .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${map})**${featured ? `\nFeatured by <@${featured}>` : ""}\nDownload: [Google Drive](${main_entry.link[0]}) - [OneDrive](${main_entry.link[1]})`)
                .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                .addField(`**Star Rating**\n${"★".repeat(Math.min(10, parseInt(star.droid_stars)))} ${parseFloat(star.droid_stars).toFixed(2)} droid stars\n${"★".repeat(Math.min(10, parseInt(star.pc_stars)))} ${parseFloat(star.pc_stars).toFixed(2)} PC stars`, `**${main_entry.points === 1?"Point":"Points"}**: ${main_entry.points} ${main_entry.points === 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

            message.channel.send(`❗**| ${message.author}, are you sure you want to add challenge \`${challenge_id}\`?**`, {embed: embed}).then(msg => {
                msg.react("✅").catch(console.error);
                let confirmation = false;
                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

                confirm.on("collect", () => {
                    msg.delete().catch(console.error);
                    confirmation = true;
                    dailydb.insertOne(main_entry, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        message.channel.send(`✅ **| ${message.author}, successfully added challenge \`${challenge_id}\`.**`, {embed: embed})
                    })
                });
                confirm.on("end", () => {
                    if (!confirmation) {
                        msg.delete().catch(console.error);
                        message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                    }
                })
            })
        })
    })
};

module.exports.config = {
    name: "addchallenge",
    description: "Used to add challenges for daily/weekly challenges.",
    usage: "addchallenge <beatmap ID> <challenge ID> <MD5 hash> <featured> <google drive link> <onedrive link> <points> <pass condition> <constrain> <easy bonus> [normal bonus] [hard bonus]",
    detail: "`beatmap ID`: The ID of the beatmap [Integer]\n`challenge ID`: The ID of the challenge [String]\n`MD5 hash`: MD5 hash of modified challenge map [String]\n`featured`: The user who featured the challenge [UserResolvable (mention or user ID)]\n`google drive link`: Google Drive download link of the modified challenge map [String (URL)]\n`onedrive link`: OneDrive download link of the modified challenge map [String (URL)]\n`points`: Points given if a player passes the challenge [Integer]\n`pass condition`: Pass condition of the challenge, format is `condition:value` [String]\n`constrain`: Mods constrain of the challenge [String]\n`... bonus`: Bonuses for the challenge, format is `condition:value:points`. Normal, hard, and insane bonus may be omitted if inserting a weekly challenge [String]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};