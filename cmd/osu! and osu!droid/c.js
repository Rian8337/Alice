const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
    if (message.channel instanceof Discord.DMChannel) return;
    let channel_index = current_map.findIndex(map => map[0] === message.channel.id);
    if (channel_index === -1) return message.channel.send("❎ **| I'm sorry, there is no map being talked in the channel!**");
    let hash = current_map[channel_index][1];

    let ufind = message.author.id;
    if (args[0]) {
        ufind = args[0];
        ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "")
    }

    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.findOne(query, async function(err, res) {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res.uid;

        const play = await new osudroid.PlayInfo().getFromHash({uid: uid, hash: hash});
        if (!play.title) return message.channel.send("❎ **| I'm sorry, you don't have scores set in the map!**")
        const name = play.player_name;
        const score = play.score;
        const combo = play.combo;
        const rank = osudroid.rankImage.get(play.rank);
        const mod = play.mods;
        const mod_string = osudroid.mods.pc_to_detail(mod);
        const acc = play.accuracy;
        const miss = play.miss;
        const date = play.date;
        const title = play.title;

        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = new Discord.MessageEmbed()
            .setAuthor(`Comparison play for ${name}`, rank, `http://ops.dgsrz.com/profile.php?uid=${uid}`)
            .setTitle(title)
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setColor(8311585);

        const mapinfo = await new osudroid.MapInfo().get({hash: hash});
        if (!mapinfo.title || !mapinfo.objects) {
            embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\`x)\nMod: \`${osudroid.mods.pc_to_detail(mod)}\`\nTime: \`${date.toUTCString()}\``);
            return message.channel.send({embed: embed}).catch(console.error)
        }
        const star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
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

        if (miss > 0 || combo < mapinfo.max_combo) {
            let if_fc_acc = new osudroid.Accuracy({
                n300: npp.computed_accuracy.n300,
                n100: npp.computed_accuracy.n100,
                n50: npp.computed_accuracy.n50,
                nmiss: 0,
                nobjects: mapinfo.objects
            }).value() * 100;
            let if_fc_dpp = osudroid.ppv2({
                stars: star.droid_stars,
                combo: mapinfo.max_combo,
                acc_percent: if_fc_acc,
                miss: 0,
                mode: "droid"
            });
            let if_fc_pp = osudroid.ppv2({
                stars: star.pc_stars,
                combo: mapinfo.max_combo,
                acc_percent: if_fc_acc,
                miss: 0,
                mode: "osu"
            });
            let dline = parseFloat(if_fc_dpp.toString().split(" ")[0]);
            let pline = parseFloat(if_fc_pp.toString().split(" ")[0]);
            embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${date.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\`\n\`If FC (${mapinfo.max_combo}x, ${if_fc_acc.toFixed(2)}): ${dline} droid pp - ${pline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);
        } else embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${date.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);

        message.channel.send({embed: embed}).catch(console.error)
    })
};

module.exports.config = {
    name: "c",
    description: "Compare your play amongst others.",
    usage: "c [user]",
    detail: "`user`: The user you want to compare [UserResolvable (mention or user ID)]",
    permission: "None"
};