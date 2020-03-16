const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('../../modules/osu!droid');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
    let ufind = message.author.id;
    if (args[0]) ufind = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res.uid;
        new osudroid.PlayerInfo().get({uid: uid}, player => {
            if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
            if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
            let name = player.name;
            let play = player.recent_plays[0];
            let title = play.filename;
            let score = play.score.toLocaleString();
            let combo = play.combo;
            let rank = osudroid.rankImage.get(play.mark);
            let ptime = new Date(play.date * 1000);
            ptime.setUTCHours(ptime.getUTCHours() + 7);
            let acc = parseFloat((play.accuracy / 1000).toFixed(2));
            let miss = play.miss;
            let mod = play.mode;
            let hash = play.hash;
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            let embed = new Discord.MessageEmbed()
                .setAuthor(`Recent play for ${name}`, rank)
                .setTitle(title)
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setColor(8311585);

            let time = Date.now();
            let entry = [time, message.channel.id, hash];
            let found = false;
            for (let i = 0; i < current_map.length; i++) {
                if (current_map[i][1] != message.channel.id) continue;
                current_map[i] = entry;
                found = true;
                break
            }
            if (!found) current_map.push(entry);

            new osudroid.MapInfo().get({hash: hash}, mapinfo => {
                if (!mapinfo.title || !mapinfo.objects) {
                    embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${osudroid.mods.droid_to_PC(mod, true)}\`\nTime: \`${ptime.toUTCString()}\``);
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

                embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);
                message.channel.send({embed: embed}).catch(console.error)
            })
        })
    })
};

module.exports.config = {
    name: "rs",
    description: "Retrieves a user's most recent play.",
    usage: "rs [user]",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};
