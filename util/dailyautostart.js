const Discord = require('discord.js');
const config = require('../config.json');
const osudroid = require('osu-droid');

function timeConvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
}

module.exports.run = (client, args, alicedb) => {
    let channel = client.channels.cache.get("546135349533868072");
    let challengeid = args[0];
    if (!challengeid) return channel.send("❎ **| Hey, I don't know which daily challenge to start!**");

    let dailydb = alicedb.collection("dailychallenge");
    let query = {challengeid: challengeid};
    dailydb.findOne(query, async (err, dailyres) => {
        if (err) {
            console.log(err);
            return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!dailyres) return channel.send("❎ **| I'm sorry, I cannot find the challenge!**");
        let pass = dailyres.pass;
        let bonus = dailyres.bonus;
        let constrain = dailyres.constrain.toUpperCase();
        let beatmapid = dailyres.beatmapid;
        let featured = dailyres.featured;
        if (!featured) featured = '386742340968120321';
        const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
        if (!mapinfo.title) return channel.send("❎ **| I'm sorry, I cannot find the daily challenge map!**");
        if (!mapinfo.objects) return channel.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**");
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
                pass_string = `**${pass[1]}** pp or more`;
                break
            }
            default:
                pass_string = 'No pass condition'
        }
        if (challengeid.includes("w")) {
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
        const curtime = Math.floor(Date.now() / 1000);
        let timelimit = curtime + (challengeid.includes("w") ? 86400 * 7 : 86400);
        let constrain_string = constrain.length === 0 ? "Any rankable mod except EZ, NF, and HT is allowed" : `**${constrain}** only`;
        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        let embed = new Discord.MessageEmbed()
            .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
            .setColor(mapinfo.statusColor())
            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid} | Time left: ${timeConvert(timelimit - curtime)}`, footer[index])
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
            .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
            .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
            .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droid_stars.total)))} ${star.droid_stars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pc_stars.total)))} ${star.pc_stars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain_string}\n\n**Bonus**\n${bonus_string}`);

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
                return channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            console.log("Challenge started")
        })
    })
};

module.exports.config = {
    name: "dailyautostart",
    description: "Used to automatically start a challenge.",
    usage: "None",
    detail: "None",
    permission: "None"
};