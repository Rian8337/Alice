const Discord = require('discord.js');
const config = require('../config.json');
const request = require('request');
const apikey = process.env.DROID_API_KEY;
const osudroid = require('osu-droid');

async function fetchScores(hash, page) {
    return new Promise(resolve => {
        let url = `http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=${apikey}&hash=${hash}&page=${page}&order=score`;
        request(url, (err, response, data) => {
            if (err || !data) {
                console.log("Empty response from droid API");
                page--;
                resolve(null)
            }
            let entries = [];
            let line = data.split('<br>');
            line.shift();
            for (let i of line) entries.push(i);
            if (!line[0]) resolve(null);
            else resolve(entries)
        })
    })
}

module.exports.run = (client, maindb, alicedb) => {
    const binddb = maindb.collection("userbind");
    const pointdb = alicedb.collection("playerpoints");
    const dailydb = alicedb.collection("dailychallenge");
    const clandb = maindb.collection("clandb");
    let query = {status: "w-ongoing"};
    dailydb.findOne(query, async (err, dailyres) => {
        if (err) return console.log("Cannot access database");
        if (!dailyres) return client.users.fetch("386742340968120321").then((user) => user.send("Hey dear, I need you to start a weekly challenge now!")).catch(console.error);
        let timelimit = dailyres.timelimit;
        if (Math.floor(Date.now() / 1000) - timelimit < 0) return;
        let pass = dailyres.pass;
        let bonus = dailyres.bonus;
        let challengeid = dailyres.challengeid;
        let constrain = dailyres.constrain.toUpperCase();
        let beatmapid = dailyres.beatmapid;
        let featured = dailyres.featured;
        let hash = dailyres.hash;
        if (!featured) featured = '386742340968120321';

        const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
        if (!mapinfo.title) return client.users.fetch("386742340968120321").then((user) => user.send("❎ **| I'm sorry, I cannot find the daily challenge map!**"));
        if (!mapinfo.objects) return client.users.fetch("386742340968120321").then((user) => user.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**"));
        let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: constrain});
        let pass_string = '';
        let bonus_string = '';
        switch (pass[0]) {
            case "score": {
                pass_string = `Score V1 at least **${pass[1].toLocaleString()}**`;
                break
            }
            case "acc": {
                pass_string = `Accuracy at least **${pass[1]}%**`;
                break
            }
            case "scorev2": {
                pass_string = `Score V2 at least **${pass[1].toLocaleString()}**`;
                break
            }
            case "miss": {
                pass_string = pass[1] === 0 ? "No misses" : `Miss count below **${pass[1]}**`;
                break
            }
            case "combo": {
                pass_string = `Combo at least **${pass[1]}**`;
                break
            }
            case "rank": {
                pass_string = `**${pass[1].toUpperCase()}** rank or above`;
                break
            }
            case "dpp": {
                pass_string = `**${pass[1]}** dpp or more`;
                break
            }
            case "pp": {
                pass_string = `*${pass[1]}** pp or more`;
                break
            }
            default: pass_string = 'No pass condition'
        }
        switch (bonus[0]) {
            case "none": {
                bonus_string += "None";
                break
            }
            case "score": {
                bonus_string += `Score V1 at least **${bonus[1].toLocaleString()}** (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break
            }
            case "acc": {
                bonus_string += `Accuracy at least **${parseFloat(bonus[1]).toFixed(2)}%** (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break
            }
            case "scorev2": {
                bonus_string += `Score V2 at least **${bonus[1].toLocaleString()}** (__${bonus[3]}__ ${bonus[3] === 1?"point":"points"})`;
                break
            }
            case "miss": {
                bonus_string += `${bonus[1] === 0 ? "No misses" : `Miss count below **${bonus[1]}**`} (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
                break
            }
            case "mod": {
                bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod only (__${bonus[2]}__ ${bonus[2] === 1?"point":"points"})`;
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
            default: bonus_string += "No bonuses available"
        }
        let constrain_string = constrain.length === 0 ? "Any rankable mod except EZ, NF, and HT is allowed" : `**${constrain}** only`;

        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        let embed = new Discord.MessageEmbed()
            .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
            .setColor(mapinfo.statusColor())
            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid}`, footer[index])
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
            .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
            .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
            .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droid_stars.total)))} ${star.droid_stars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pc_stars.total)))} ${star.pc_stars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

        client.channels.cache.get("669221772083724318").send("✅ **| Weekly challenge ended!**", {embed: embed});

        let updateVal = {
            $set: {
                status: "finished"
            }
        };
        dailydb.updateOne(query, updateVal, err => {
            if (err) return console.log("Cannot update challenge status");
            console.log("Challenge status updated")
        });
        let nextchallenge = "w" + (parseInt(dailyres.challengeid.match(/(\d+)$/)[0]) + 1);
        client.utils.get("dailyautostart").run(client, [nextchallenge], alicedb);

        let entries = await fetchScores(hash, 0);
        if (!entries) return;
        let bonus_winner_uid = entries[0].split(" ")[1];
        let coin = client.emojis.cache.get("669532330980802561");
        binddb.findOne({uid: bonus_winner_uid}, (err, userres) => {
            if (err) console.log("Cannot access database");
            if (!userres) return;
            let discordid = userres.discordid;
            let username = userres.username;
            pointdb.findOne({uid: bonus_winner_uid}, (err, res) => {
                if (err) return console.log("Cannot access database");
                if (userres.clan) {
                    clandb.findOne({name: userres.clan}, (err, clanres) => {
                        if (err) return console.log(err);
                        let updateVal = {
                            $set: {
                                power: 50 + clanres.power
                            }
                        };
                        clandb.updateOne({name: userres.clan}, updateVal, err => {
                            if (err) return console.log(err);
                            console.log("Clan data updated")
                        })
                    })
                }
                if (res) {
                    let updateVal = {
                        $set: {
                            points: res.points + 15,
                            alicecoins: res.alicecoins + 30
                        }
                    };
                    pointdb.updateOne({uid: bonus_winner_uid}, updateVal, err => {
                        if (err) return console.log("Cannot access database");
                        client.channels.cache.get("669221772083724318").send(`✅ **| Congratulations to <@${discordid}> for achieving first place in challenge \`${challengeid}\`, earning him/her \`5\` points and ${coin} \`10\` Alice coins!**`)
                    })
                } else {
                    let insertVal = {
                        username: username,
                        uid: bonus_winner_uid,
                        discordid: message.author.id,
                        challenges: [],
                        points: 15,
                        transferred: 0,
                        dailycooldown: 0,
                        alicecoins: 30
                    };
                    pointdb.insertOne(insertVal, err => {
                        if (err) return console.log("Cannot access database");
                        client.channels.cache.get("669221772083724318").send(`✅ **| Congratulations to <@${discordid}> for achieving first place in challenge \`${challengeid}\`, earning him/her \`5\` points and ${coin} \`10\` Alice coins!**`)
                    })
                }
            })
        })
    })
};

module.exports.config = {
    name: "weeklytrack",
	description: "Used to track weekly challenge time limit.",
	usage: "None",
	detail: "None",
	permission: "None"
};