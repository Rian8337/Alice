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
        let title = play.title;
        let score = play.score.toLocaleString();
        let combo = play.combo;
        let rank = osudroid.rankImage.get(play.rank);
        let ptime = play.date;
        let acc = play.accuracy;
        let miss = play.miss;
        let mod = play.mods;
        let hash = play.hash;

        if (message.isOwner) {
            title = play.title + (play.mods ? ` +${play.mods}` : " +No Mod");
            rank = client.emojis.cache.get(rankEmote(play.rank));
    
            const score_data = await play.getFromHash({uid: player.uid, hash: hash});
            const data = await new osudroid.ReplayAnalyzer(score_data.score_id).analyze();
            
            const n300 = data.data.hit300;
            const n100 = data.data.hit100;
            const n50 = data.data.hit50;
            const nmiss = data.data.hit0;
    
            let rolecheck;
            try {
                rolecheck = message.member.roles.highest.hexColor
            } catch (e) {
                rolecheck = 8311585
            }
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            let embed = new Discord.MessageEmbed()
                .setFooter(`Achieved on ${ptime.toUTCString()} | Alice Synthesis Thirty`, footer[index])
                .setColor(rolecheck);
    
            let entry = [message.channel.id, hash];
            let map_index = current_map.findIndex(map => map[0] === message.channel.id);
            if (map_index === -1) current_map.push(entry);
            else current_map[map_index][1] = hash;
    
            const mapinfo = await new osudroid.MapInfo().get({hash: hash});
            if (!mapinfo.title || !mapinfo.objects || !mapinfo.osu_file) {
                embed.setAuthor(title, player.avatarURL)
                    .setDescription(`▸ ${rank} ▸ ${acc}%\n‣ ${score} ▸ ${combo}x ▸ [${n300}/${n100}/${n50}/${nmiss}]`);
                return message.channel.send(`✅ **| Most recent play for ${name}:**`, {embed: embed}).catch(console.error)
            }
    
            let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
            let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
            let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
    
            title = `${mapinfo.full_title} [${starsline}★ | ${pcstarsline}★] +${play.mods ? play.mods : "No Mod"}`;
            embed.setAuthor(title, player.avatarURL, `https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
                .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`);
    
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
    
                embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** (${dline}DPP, ${pline}PP for ${fc_acc.toFixed(2)}% FC) ▸ ${acc}%\n‣ ${score} ▸ ${combo}x/${mapinfo.max_combo}x ▸ [${n300}/${n100}/${n50}/${nmiss}]`);
            } else embed.setDescription(`▸ ${rank} ▸ **${ppline}DPP** | **${pcppline}PP** ▸ ${acc}%\n‣ ${score} ▸ ${combo}x/${mapinfo.max_combo}x ▸ [${n300}/${n100}/${n50}/${nmiss}]`);
    
            message.channel.send(`✅ **| Most recent play for ${name}:**`, {embed: embed}).catch(console.error)
            return
        }

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

        const mapinfo = await new osudroid.MapInfo().get({hash: hash});
        if (!mapinfo.title || !mapinfo.objects || !mapinfo.osu_file) {
            embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${osudroid.mods.pc_to_detail(mod)}\`\nTime: \`${ptime.toUTCString()}\``);
            return message.channel.send({embed: embed}).catch(console.error)
        }
        embed.setTitle(mapinfo.full_title);
        let mod_string = osudroid.mods.pc_to_detail(mod);
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

        if (miss > 0 || combo < mapinfo.max_combo) {
            let if_fc_acc = new osudroid.Accuracy({
                n300: npp.computed_accuracy.n300 + miss,
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
            embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\`\n\`If FC (${mapinfo.max_combo}x, ${if_fc_acc.toFixed(2)}%): ${dline} droid pp - ${pline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);
        } else embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\`\n(\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`).setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`);

        message.channel.send({embed: embed}).catch(console.error)
    })
};

module.exports.config = {
    name: "rs",
    description: "Retrieves a user's most recent play.",
    usage: "rs [user]",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};
