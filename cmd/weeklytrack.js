const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message = "", args = {}, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel || message.author != null) return;
    let dailydb = alicedb.collection("dailychallenge");
    let query = {status: "w-ongoing"};
    dailydb.find(query).toArray((err, dailyres) => {
        if (err) return console.log("Cannot access database");
        if (!dailyres[0]) return client.fetchUser("386742340968120321").then(user => user.send("Hey, I need you to start a daily challenge now!")).catch(console.error);
        let timelimit = dailyres[0].timelimit;
        if (Math.floor(Date.now() / 1000) - timelimit < 0) return;
        let pass = dailyres[0].pass;
        let bonus = dailyres[0].bonus;
        let challengeid = dailyres[0].challengeid;
        let constrain = dailyres[0].constrain.toUpperCase();
        let beatmapid = dailyres[0].beatmapid;
        let featured = dailyres[0].featured;
        if (!featured) featured = '386742340968120321';
        new osudroid.MapInfo().get({beatmap_id: beatmapid}, mapinfo => {
            if (!mapinfo.title) return client.fetchUser("386742340968120321").then(user => user.send("❎ **| I'm sorry, I cannot find the daily challenge map!**"));
            if (!mapinfo.objects) return client.fetchUser("386742340968120321").then(user => user.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**"));
            let star = new osudroid.MapStars().calculate({beatmap_id: beatmapid, mods: constrain});
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
                    bonus_string += `Usage of **${bonus[1].toUpperCase()}** mod only (__${bonus[2]}__ ${bonus[2] == 1?"point":"points"})`;
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
                case "dpp": {
                    bonus_string += `**${bonus[1]}** dpp or more (__${bonus[2]}__ ${bonus[2] == 1 ? "point" : "points"})`;
                    break
                }
                case "pp": {
                    bonus_string += `**${bonus[1]}** pp or more (__${bonus[2]}__ ${bonus[2] == 1 ? "point" : "points"})`;
                    break
                }
                default: bonus_string += "No bonuses available"
            }
            let constrain_string = constrain == '' ? "Any rankable mod except EZ, NF, and HT is allowed" : `**${constrain}** only`;

            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * (footer.length - 1) + 1);
            let embed = new Discord.RichEmbed()
                .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
                .setColor(mapinfo.statusColor())
                .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid}`, footer[index])
                .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                .setDescription(`[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**${featured ? `\nFeatured by <@${featured}>` : ""}\nDownload: [Google Drive](${dailyres[0].link[0]}) - [OneDrive](${dailyres[0].link[1]})`)
                .addField("Map Info", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
                .addField(`Star Rating:\n${"★".repeat(Math.min(10, parseInt(star.droid_stars)))} ${parseFloat(star.droid_stars).toFixed(2)} droid stars\n${"★".repeat(Math.min(10, parseInt(star.pc_stars)))} ${parseFloat(star.pc_stars).toFixed(2)} PC stars`, `**${dailyres[0].points == 1?"Point":"Points"}**: ${dailyres[0].points} ${dailyres[0].points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

            client.channels.get("669221772083724318").send("✅ **| Weekly challenge ended!**", {embed: embed});

            let updateVal = {
                $set: {
                    status: "finished"
                }
            };
            dailydb.updateOne(query, updateVal, err => {
                if (err) return console.log("Cannot update challenge status");
                console.log("Challenge status updated")
            });
            let nextchallenge = "w" + (parseInt(dailyres[0].challengeid.match(/(\d+)$/)[0]) + 1);
            client.commands.get("dailyautostart").run(client, message, [nextchallenge], maindb, alicedb);
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
