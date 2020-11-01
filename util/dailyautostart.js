const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

function timeConvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":");
}

/**
 * @param {Discord.Client} client 
 * @param {string[]} args 
 * @param {Db} alicedb 
 */
module.exports.run = (client, args, alicedb) => {
    const channel = client.channels.cache.get("546135349533868072");
    const challengeid = args[0];
    if (!challengeid) {
        return channel.send("❎ **| Hey, I don't know which daily challenge to start!**");
    }

    const dailydb = alicedb.collection("dailychallenge");
    const query = {challengeid: challengeid};
    dailydb.findOne(query, async (err, dailyres) => {
        if (err) {
            console.log(err);
            return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!dailyres) {
            return channel.send("❎ **| I'm sorry, I cannot find the challenge!**");
        }
        const pass = dailyres.pass;
        const beatmapid = dailyres.beatmapid;
        let featured = dailyres.featured;
        if (!featured) featured = '386742340968120321';
        const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
        if (!mapinfo.title) {
            return channel.send("❎ **| I'm sorry, I cannot find the daily challenge map!**");
        }
        if (!mapinfo.objects) {
            return channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
        }
        const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile});
        let pass_string = '';
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
                pass_string = pass.value === 0?"No misses":`Miss count below **${pass.value}**`;
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
        const curtime = Math.floor(Date.now() / 1000);
        const timelimit = curtime + (challengeid.includes("w") ? 86400 * 7 : 86400);
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
            .setColor(mapinfo.statusColor())
            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit - curtime)}`, footer[index])
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
            .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
            .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
            .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: Any rankable mod except EZ, NF, and HT\n\nUse \`${challengeid.includes("w") ? "a!daily bounty challenges" : "a!daily challenges"}\` to see bonuses`);

        client.channels.cache.get("669221772083724318").send(`✅ **| Successfully started challenge \`${challengeid}\`.\n<@&674918022116278282>**`, {embed: embed});

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
                return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            console.log("Challenge started");
        });
    });
};

module.exports.config = {
    name: "dailyautostart",
    description: "Used to automatically start a challenge.",
    usage: "None",
    detail: "None",
    permission: "None"
};