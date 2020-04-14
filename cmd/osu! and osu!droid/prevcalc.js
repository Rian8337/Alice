const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');
const config = require('../../config.json');

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
    let channel_index = current_map.findIndex(map => map[0] === message.channel.id);
    if (channel_index === -1) return message.channel.send("❎ **| I'm sorry, there is no map being talked in the channel!**");
    let hash = current_map[channel_index][1];

    let combo;
    let acc = 100;
    let missc = 0;
    let mod = '';
    let ndetail = false;
    let pcdetail = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i].endsWith("%")) acc = parseFloat(args[i]);
        if (args[i].endsWith("m")) missc = parseInt(args[i]);
        if (args[i].endsWith("x")) combo = parseInt(args[i]);
        if (args[i].startsWith("+")) mod = args[i].replace("+", "").toUpperCase();
        if (args[i].startsWith("-d")) ndetail = true;
        if (args[i].startsWith("-p")) pcdetail = true
    }

    new osudroid.MapInfo().get({hash: hash}, mapinfo => {
        if (!mapinfo.title || !mapinfo.objects || mapinfo.mode != 0) return;
        if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
        if (!combo) combo = mapinfo.max_combo;
        let max_score = mapinfo.max_score(mod);
        let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
        let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
        let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
        let npp = osudroid.ppv2({
            stars: star.droid_stars,
            combo: combo,
            miss: missc,
            acc_percent: acc,
            mode: "droid"
        });
        let pcpp = osudroid.ppv2({
            stars: star.pc_stars,
            combo: combo,
            miss: missc,
            acc_percent: acc,
            mode: "osu"
        });
        let ppline = parseFloat(npp.toString().split(" ")[0]);
        let pcppline = parseFloat(pcpp.toString().split(" ")[0]);

        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = new Discord.MessageEmbed()
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
            .setColor(mapinfo.statusColor())
            .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
            .setTitle(mapinfo.showStatistics(mod, 0))
            .setDescription(mapinfo.showStatistics(mod, 1))
            .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
            .addField(mapinfo.showStatistics(mod, 2), `${mapinfo.showStatistics(mod, 3)}\n**Max score**: ${max_score.toLocaleString()}`)
            .addField(mapinfo.showStatistics(mod, 4), `${mapinfo.showStatistics(mod, 5)}\n**Result**: ${combo}/${mapinfo.max_combo}x / ${acc}% / ${missc} miss(es)`)
            .addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

        if (ndetail) message.channel.send(`Raw droid pp: ${npp.toString()}`);
        if (pcdetail) message.channel.send(`Raw PC pp: ${pcpp.toString()}`);
        message.channel.send({embed: embed}).catch(console.error);
    })
};

module.exports.config = {
    name: "prevcalc",
    description: "Automatically calculates pp for an osu!standard map. Takes the currently cached map as the map to calculate.",
    usage: "None",
    detail: "None",
    permission: "None"
};
