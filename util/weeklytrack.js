const Discord = require('discord.js');
const config = require('../config.json');
const request = require('request');
const apikey = process.env.DROID_API_KEY;
const osudroid = require('osu-droid');
const {Db} = require('mongodb');

function fetchScores(hash, page) {
    return new Promise(resolve => {
        let url = `http://ops.dgsrz.com/api/scoresearchv2.php?apiKey=${apikey}&hash=${hash}&page=${page}&order=score`;
        request(url, (err, response, data) => {
            if (err || !data) {
                console.log("Empty response from droid API");
                page--;
                resolve(null);
            }
            let entries = [];
            let line = data.split('<br>');
            line.shift();
            for (let i of line) entries.push(i);
            if (!line[0]) resolve(null);
            else resolve(entries);
        });
    });
}

/**
 * @param {Discord.Client} client 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, maindb, alicedb) => {
    const binddb = maindb.collection("userbind");
    const pointdb = alicedb.collection("playerpoints");
    const dailydb = alicedb.collection("dailychallenge");
    const clandb = maindb.collection("clandb");
    const query = {status: "w-ongoing"};
    dailydb.findOne(query, async (err, dailyres) => {
        if (err) {
            return console.log("Cannot access database");
        }
        if (!dailyres) {
            return client.users.fetch("386742340968120321").then((user) => user.send("Hey dear, I need you to start a weekly challenge now!")).catch(console.error);
        }
        if (Math.floor(Date.now() / 1000) - dailyres.timelimit < 0) {
            return;
        }
        const pass = dailyres.pass;
        const challengeid = dailyres.challengeid;
        const beatmapid = dailyres.beatmapid;
        const featured = dailyres.featured ? dailyres.featured : "386742340968120321";
        const constrain = dailyres.constrain ?? "";
        const hash = dailyres.hash;

        const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmapid});
        if (!mapinfo.title) {
            return client.users.fetch("386742340968120321").then((user) => user.send("❎ **| I'm sorry, I cannot find the daily challenge map!**"));
        }
        if (!mapinfo.objects) {
            return client.users.fetch("386742340968120321").then((user) => user.send("❎ **| I'm sorry, it seems like the challenge map is invalid!**"));
        }
        const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile});
        let pass_string;
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
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(challengeid.includes("w")?"osu!droid Weekly Bounty Challenge":"osu!droid Daily Challenge", "https://image.frl/p/beyefgeq5m7tobjg.jpg")
            .setColor(mapinfo.statusColor())
            .setFooter(`Alice Synthesis Thirty | Challenge ID: ${challengeid}`, footer[index])
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
            .setDescription(`**[${mapinfo.showStatistics("", 0)}](https://osu.ppy.sh/b/${beatmapid})**\nFeatured by <@${featured}>\nDownload: [Google Drive](${dailyres.link[0]})${dailyres.link[1] ? `- [OneDrive](${dailyres.link[1]})` : ""}`)
            .addField("**Map Info**", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`)
            .addField(`**Star Rating**\n${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`, `**${dailyres.points == 1?"Point":"Points"}**: ${dailyres.points} ${dailyres.points == 1?"point":"points"}\n**Pass Condition**: ${pass_string}\n**Constrain**: ${constrain ? `${constrain} mod only` : "Any rankable mod except EZ, NF, and HT"}`);

        client.channels.cache.get("669221772083724318").send("✅ **| Weekly challenge ended!**", {embed: embed});

        const updateVal = {
            $set: {
                status: "finished"
            }
        };
        dailydb.updateOne(query, updateVal, err => {
            if (err) {
                return console.log("Cannot update challenge status");
            }
            console.log("Challenge status updated");
        });
        let nextchallenge = "w" + (parseInt(dailyres.challengeid.match(/(\d+)$/)[0]) + 1);
        client.utils.get("dailyautostart").run(client, [nextchallenge], alicedb);

        let entries = await fetchScores(hash, 0);
        if (!entries) {
            return;
        }
        let bonus_winner_uid = entries[0].split(" ")[1];
        let coin = client.emojis.cache.get("669532330980802561");
        binddb.findOne({uid: bonus_winner_uid}, (err, userres) => {
            if (err) {
                return console.log("Cannot access database");
            }
            if (!userres) {
                return;
            }
            const discordid = userres.discordid;
            const username = userres.username;
            pointdb.findOne({uid: bonus_winner_uid}, (err, res) => {
                if (err) {
                    return console.log("Cannot access database");
                }
                if (userres.clan) {
                    const updateVal = {
                        $inc: {
                            power: 50
                        }
                    };
                    clandb.updateOne({name: userres.clan}, updateVal, err => {
                        if (err) {
                            return console.log(err);   
                        }
                        console.log("Clan data updated");
                    });
                }
                if (res) {
                    const updateVal = {
                        $inc: {
                            points: 15,
                            alicecoins: 30
                        }
                    };
                    pointdb.updateOne({uid: bonus_winner_uid}, updateVal, err => {
                        if (err) {
                            return console.log("Cannot access database");
                        }
                        client.channels.cache.get("669221772083724318").send(`✅ **| Congratulations to <@${discordid}> for achieving first place in challenge \`${challengeid}\`, earning him/her \`15\` points and ${coin} \`30\` Alice coins!**`);
                    });
                } else {
                    const insertVal = {
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
                        if (err) {
                            return console.log("Cannot access database");
                        }
                        client.channels.cache.get("669221772083724318").send(`✅ **| Congratulations to <@${discordid}> for achieving first place in challenge \`${challengeid}\`, earning him/her \`15\` points and ${coin} \`30\` Alice coins!**`);
                    });
                }
            });
        });
    });
};

module.exports.config = {
    name: "weeklytrack",
	description: "Used to track weekly challenge time limit.",
	usage: "None",
	detail: "None",
	permission: "None"
};
