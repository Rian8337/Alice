const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return
	}
}

module.exports.run = (client, message, args, maindb, alicedb, current_map) => {
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
        let title = `${play.title} +${play.mods ? play.mods : "No Mod"}`;
        let score = play.score.toLocaleString();
        let combo = play.combo;
        let rank = client.emojis.cache.get(rankEmote(play.rank));
        let ptime = play.date;
        let acc = play.accuracy;
        let miss = play.miss;
        let mod = play.mods;
        let hash = play.hash;

        let n300, n100, n50;
        if (message.isOwner) {
            const score_data = await new osudroid.PlayInfo({uid: uid, hash: hash}).getFromHash();
            const data = await new osudroid.ReplayAnalyzer(score_data.score_id).analyze();
            n300 = data.data.hit300;
            n100 = data.data.hit100;
            n50 = data.data.hit50;
        }

        let rolecheck;
        try {
            rolecheck = message.member.roles.highest.hexColor
        } catch (e) {
            rolecheck = 8311585
        }
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(title, player.avatarURL)
            .setColor(rolecheck)
            .setFooter(`Achieved on ${ptime.toUTCString()} | Alice Synthesis Thirty`, footer[index]);

        const mapinfo = await new osudroid.MapInfo().get({hash: hash});
        if (!mapinfo.title || !mapinfo.objects || !mapinfo.osu_file) {
            embed.setDescription(`▸ ${rank} ▸ ${acc}%\n‣ ${score} ▸ ${combo}x${n300 ? ` ▸ [${n300}/${n100}/${n50}/${miss}]` : ""}`);
            return message.channel.send(`✅ **| Most recent play for ${name}:**`, {embed: embed})
        }
        const star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
        const starsline = parseFloat(star.droid_stars.toString());
        const pcstarsline = parseFloat(star.pc_stars.toString());

        title = `${mapinfo.full_title} [${starsline}★ | ${pcstarsline}★] +${play.mods ? play.mods : "No Mod"}`;
        embed.setAuthor(title, player.avatarURL, `https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`);

        const npp = osudroid.ppv2({
            stars: star.droid_stars,
            combo: combo,
            acc_percent: acc,
            miss: miss,
            mode: "droid"
        });

        const pcpp = osudroid.ppv2({
            stars: star.pc_stars,
            combo: combo,
            acc_percent: acc,
            miss: miss,
            mode: "osu"
        });

        const ppline = parseFloat(npp.toString());
        const pcppline = parseFloat(pcpp.toString());

        if (miss > 0 || combo < mapinfo.max_combo) {
            const fc_acc = new osudroid.Accuracy({
                n300: (n300 ? n300 : npp.computed_accuracy.n300) + miss,
                n100: n100 ? n100 : npp.computed_accuracy.n100,
                n50 : n50 ? n50 : npp.computed_accuracy.n50,
                nmiss: 0,
                nobjects: mapinfo.objects
            }).value() * 100;

            const fc_dpp = osudroid.ppv2({
                stars: star.droid_stars,
                combo: mapinfo.max_combo,
                acc_percent: fc_acc,
                miss: 0,
                mode: "droid"
            });

            const fc_pp = osudroid.ppv2({
                stars: star.pc_stars,
                combo: mapinfo.max_combo,
                acc_percent: fc_acc,
                miss: 0,
                mode: "osu"
            });

            const dline = parseFloat(fc_dpp.toString());
            const pline = parseFloat(fc_pp.toString());

            embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** (${dline}DPP, ${pline}PP for ${fc_acc.toFixed(2)}% FC) ▸ ${acc}%\n‣ ${score} ▸ ${combo}x/${mapinfo.max_combo}x${n300 ? ` ▸ [${n300}/${n100}/${n50}/${miss}]` : ""}`);
        } else embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** ▸ ${acc}%\n‣ ${score} ▸ ${combo}x/${mapinfo.max_combo}x${n300 ? ` ▸ [${n300}/${n100}/${n50}/${miss}]` : ""}`);

        message.channel.send(`✅ **| Most recent play for ${name}:**`, {embed: embed})
    })
};

module.exports.config = {
    name: "rs",
    description: "Retrieves a user's most recent play.",
    usage: "rs [user]",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};