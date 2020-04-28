const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let ufind = message.author.id;
    if (args[0]) ufind = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};

    binddb.findOne(query, async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res.uid;
        const player = await new osudroid.PlayerInfo().get({uid: uid});
        if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
        if (player.recent_plays.length === 0) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");

        let name = player.name;
        let play = player.recent_plays[0];
        let title = play.title;
        let score = play.score.toLocaleString();
        let combo = play.combo;
        let rank = osudroid.rankImage.get(play.rank);
        let ptime = play.date;
        let acc = play.accuracy;
        let miss = play.miss;
        let mod = play.mods;
        let hash = play.hash;

        const score_data = await play.getFromHash({uid: player.uid, hash: hash});
        const data = await new osudroid.ReplayAnalyzer(score_data.score_id).analyze();
        
        const n300 = data.data.hit300;
        const n100 = data.data.hit100;
        const n50 = data.data.hit50;
        const nmiss = data.data.hit0;

        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        let embed = new Discord.MessageEmbed()
            .setAuthor(`Recent play for ${name}`, rank)
            .setTitle(title)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setColor(8311585);

        let entry = [message.channel.id, hash];
        let map_index = current_map.findIndex(map => map[0] === message.channel.id);
        if (map_index === -1) current_map.push(entry);
        else current_map[map_index][1] = hash;
        let mod_string = osudroid.mods.pc_to_detail(mod);

        const mapinfo = await new osudroid.MapInfo().get({hash: hash});
        if (!mapinfo.title || !mapinfo.objects || !mapinfo.osu_file) {
            embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n\`(${n300}/${n100}/${n50}/${nmiss})\`\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\``);
            return message.channel.send({embed: embed}).catch(console.error)
        }

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

        if (nmiss > 0 || combo < mapinfo.max_combo) {
            let fc_acc = new osudroid.Accuracy({
                n300: n300 + nmiss,
                n100: n100,
                n50: n50,
                nmiss: 0,
                nobjects: mapinfo.objects
            }).value() * 100;

            let fc_dpp = osudroid.ppv2({
                stars: star.droid_stars,
                combo: mapinfo.max_combo,
                acc_percent: fc_acc,
                miss: 0,
                mode: "droid"
            });

            let fc_pp = osudroid.ppv2({
                stars: star.pc_stars,
                combo: mapinfo.max_combo,
                acc_percent: fc_acc,
                miss: 0,
                mode: "osu"
            });

            let dline = parseFloat(fc_dpp.toString().split(" ")[0]);
            let pline = parseFloat(fc_pp.toString().split(" ")[0]);

            embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n\`(${n300}/${n100}/${n50}/${nmiss})\`\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\`\n\`If FC (${mapinfo.max_combo}x, ${fc_acc.toFixed(2)}%): ${dline} droid pp - ${pline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);
        } else embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n\`(${n300}/${n100}/${n50}/${nmiss})\`\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);

        message.channel.send({embed: embed}).catch(console.error)
    })
};

module.exports.config = {
    name: "rstest",
    description: "Retrieves a user's most recent play.",
    usage: "rstest [user]",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};