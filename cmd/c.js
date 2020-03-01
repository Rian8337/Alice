const Discord = require('discord.js');
const http = require('http');
const droidapikey = process.env.DROID_API_KEY;
const config = require('../config.json');
const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
    if (message.channel instanceof Discord.DMChannel) return;
    let hash;
    for (let i = 0; i < current_map.length; i++) {
        if (Date.now() - current_map[i][0] > 300000 || current_map[i][1] != message.channel.id) continue;
        hash = current_map[i][2];
        break
    }
    if (!hash) return message.channel.send("❎ **| I'm sorry, there is no map being talked in the channel!**");

    let ufind = message.author.id;
    if (args[0]) {
        ufind = args[0];
        ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "")
    }

    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.findOne(query, function(err, res) {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res.uid;

        let options = {
            host: "ops.dgsrz.com",
            port: 80,
            path: `/api/scoresearchv2.php?apiKey=${droidapikey}&uid=${uid}&hash=${hash}`
        };
        let content = '';
        let req = http.request(options, function(res) {
            res.setEncoding("utf8");
            res.setTimeout(10000);
            res.on("data", chunk => {
                content += chunk
            });
            res.on("end", () => {
                let resarr = content.split("<br>");
                if (resarr.length != 2) return message.channel.send("❎ **| I'm sorry, you don't have scores set in the map!**");
                let entry = resarr[1].split(" ");
                let name = entry[2];
                let score = parseInt(entry[3]).toLocaleString();
                let combo = parseInt(entry[4]);
                let rank = osudroid.rankImage.get(entry[5]);
                let mod = entry[6];
                let acc = parseFloat((parseInt(entry[7]) / 1000).toFixed(2));
                let miss = parseInt(entry[8]);
                let date = new Date(parseInt(entry[9]) * 1000);
                date.setUTCHours(date.getUTCHours() + 7);
                let title = entry[10].replace(/_/g, " ").substring(0, entry[10].length - 4);

                let footer = config.avatar_list;
                const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                let embed = new Discord.RichEmbed()
                    .setAuthor(`Comparison play for ${name}`, rank)
                    .setTitle(title)
                    .setFooter("Alice Synthesis Thirty", footer[index])
                    .setColor(8311585);

                new osudroid.MapInfo().get({hash: hash}, mapinfo => {
                    if (!mapinfo.title || !mapinfo.objects) {
                        embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\`x)\nMod: \`${osudroid.mods.droid_to_PC(mod, true)}\`\nTime: \`${date.toUTCString()}\``);
                        return message.channel.send({embed: embed}).catch(console.error)
                    }
                    let mod_string = osudroid.mods.droid_to_PC(mod, true);
                    mod = osudroid.mods.droid_to_PC(mod);
                    let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
                    let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
                    let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
                    let npp = osudroid.ppv2({
                        stars: star.droid_stars,
                        combo: combo,
                        acc_percent: acc,
                        miss: miss,
                        mode: "droid"
                    });
                    let pcpp = osudroid.ppv2({
                        stars: star.pc_stars,
                        combo: combo,
                        acc_percent: acc,
                        miss: miss,
                        mode: "osu"
                    });
                    let ppline = parseFloat(npp.toString().split(" ")[0]);
                    let pcppline = parseFloat(pcpp.toString().split(" ")[0]);

                    embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${date.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`);
                    message.channel.send({embed: embed}).catch(console.error);
                })
            })
        });
        req.end()
    })
};

module.exports.config = {
    name: "c",
    description: "Compare your play amongst others.",
    usage: "c",
    detail: "None",
    permission: "None"
};
