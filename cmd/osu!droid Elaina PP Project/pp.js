const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');
const cd = new Set();

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (message.channel.type !== "text") {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }
    if (!message.isOwner && !config.pp_channel.find(id => message.channel.id === id)) {
        return message.channel.send("❎ **| I'm sorry, this command is not allowed in here!**");
    }

    const binddb = maindb.collection("userbind");
    const whitelistdb = maindb.collection("mapwhitelist");

    const query = {discordid: message.author.id};
    binddb.findOne(query, async (err, res) => {
        if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        const uid = res.uid;
        let pplist = res.pp ? res.pp : [];
		let pptotal = 0;
		let pre_pptotal = res.pptotal ? res.pptotal : 0;
		let submitted = 0;
		let playc = res.playc ? res.playc : 0;
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const color = message.member.roles.color ? message.member.roles.color.hexColor : "#000000";
        const embed = new Discord.MessageEmbed()
            .setTitle("PP submission info")
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setColor(color);

        switch (args[0]) {
            case "past": {
                let beatmap = args[1];
				if (!beatmap) {
                    return message.channel.send("❎ **| Hey, please give me a beatmap to submit!**");
                }
				if (isNaN(beatmap)) {
					let a = beatmap.split("/");
					beatmap = parseInt(a[a.length - 1]);
					if (isNaN(beatmap)) {
                        return message.channel.send("❎ **| Hey, that beatmap ID is not valid!**");
                    }
                }
                
                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 2000);

                const mapinfo = await new osudroid.MapInfo().getInformation({beatmapID: beatmap});
                if (mapinfo.error) {
                    return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap data! Perhaps osu! API is down?**");
                }
				if (!mapinfo.title) {
                    return message.channel.send("❎ **| I'm sorry, that map does not exist in osu! database!**");
                }
				if (!mapinfo.objects) {
                    return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
                }
                if (!mapinfo.osuFile) {
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
                }
                const hash = mapinfo.hash;
                if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                    const isWhitelist = await whitelistdb.findOne({hashid: hash});
                    if (!isWhitelist) {
                        return message.channel.send("❎ **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
                    }
                }

                const score = await new osudroid.Score().getFromHash({uid: uid, hash: hash});
                if (score.error) {
                    return message.channel.send("❎ **| I'm sorry, I couldn't check the map's scores! Perhaps osu!droid server is down?**");
                }
                if (!score.title) {
                    return message.channel.send("❎ **| I'm sorry, you don't have any plays submitted in this map! Perhaps osu!droid server is down?**");
                }
                const mods = score.mods;
                const acc = score.accuracy;
                const combo = score.combo;
                const miss = score.miss;

                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods});
                const npp = new osudroid.PerformanceCalculator().calculate({
                    stars: star.droidStars,
                    combo: combo,
                    accPercent: acc,
                    miss: miss,
                    mode: osudroid.modes.droid
                });
                const pp = parseFloat(npp.total.toFixed(2));
                const pp_object = {
                    hash: hash,
                    title: mapinfo.fullTitle,
                    pp: pp,
                    mods: mods,
                    accuracy: acc,
                    combo: combo,
                    miss: miss,
                    scoreID: score.scoreID
                };
                if (osudroid.mods.modbitsFromString(mods) & osudroid.mods.osuMods.nc) {
                    pp_object.isOldPlay = true;
                }
                playc++;
                let duplicate = false;
                for (let i in pplist) {
                    if (pp_object.hash === pplist[i].hash) {
                        duplicate = true;
                        pplist[i] = pp_object;
                        break;
                    }
                }
                if (!duplicate) {
                    pplist.push(pp_object);
                }

                pplist.sort((a, b) => {
                    return b.pp - a.pp;
                });

                if (pplist.length > 75) {
                    pplist.splice(75);
                }

                if (duplicate) embed.addField(`${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp | **Duplicate**`);
				else {
                    const dup_index = pplist.findIndex(p => p.hash === pp_object.hash);
                    if (dup_index !== -1) {
                        embed.addField(`${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp`);
                    }
                    else {
                        embed.addField(`${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp | **Worth no pp**`);
                    }
                }
                
                let weight = 1;
                for (const entry of pplist) {
                    pptotal += weight * entry.pp;
                    weight *= 0.95;
                }

                const diff = pptotal - pre_pptotal;
                embed.setDescription(`Total PP: **${pptotal.toFixed(2)} pp**\nPP gained: **${diff.toFixed(2)} pp**${!res ? "\nHey, looks like you are new to the system! You can ask a moderator or helper to enter all of your previous scores, or ignore this message if you want to start new!" : ""}`);
                message.channel.send(`✅ **| ${message.author}, successfully submitted your play. More info in embed.**`, {embed: embed});

                let updateVal = {
					$set: {
						pptotal: pptotal,
						pp: pplist,
						playc: playc
					}
				};
				binddb.updateOne({discordid: message.author.id}, updateVal, function (err) {
					if (err) throw err;
				});
				break;
            }
            default: {
                let offset = 1;
                let start = 1;
                
				if (args[0]) {
                    offset = parseInt(args[0]);
                }
				if (args[1]) {
                    start = parseInt(args[1]);
                }
				if (isNaN(offset)) {
                    offset = 1;
                }
				if (isNaN(start)) {
                    start = 1;
                }
                if (offset > 5 || offset < 1) {
                    return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
                }
				if (start + offset - 1 > 50) {
                    return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
                }

                cd.add(message.author.id);
                setTimeout(() => {
                    cd.delete(message.author.id);
                }, 1000 * offset);

                const player = await new osudroid.Player().getInformation({uid: uid});
                if (player.error) {
                    return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
                }
				if (!player.username) {
                    return message.channel.send("❎ **| I'm sorry, I couldn't find your profile!**");
                }
                const recent_plays = player.recentPlays;
				if (recent_plays.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
                }

                const plays = [];
                for (let i = start - 1; i < start + offset - 1; ++i) {
                    if (!recent_plays[i]) {
                        break;
                    }
                    plays.push(recent_plays[i]);
                }
                
                for await (const play of plays) {
                    const mapinfo = await new osudroid.MapInfo().getInformation({hash: play.hash});
                    ++submitted;

                    const combo = play.combo;
                    const mods = play.mods;
                    const acc = play.accuracy;
                    const miss = play.miss;

                    if (mapinfo.error) {
                        embed.addField(`${submitted}. ${play.title}${play.mods ? ` +${mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | **API fetch error**`);
                        continue;
                    }
                    if (!mapinfo.title) {
                        embed.addField(`${submitted}. ${play.title}${play.mods ? ` +${mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | **Beatmap not found**`);
                        continue;
                    }
                    if (!mapinfo.objects) {
                        embed.addField(`${submitted}. ${play.title}${play.mods ? ` +${mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | **Beatmap with 0 objects**`);
                        continue;
                    }
                    if (!mapinfo.osuFile) {
                        embed.addField(`${submitted}. ${play.title}${play.mods ? ` +${mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | **API fetch error**`);
                        continue;
                    }

                    if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                        const isWhitelist = await whitelistdb.findOne({hashid: play.hash});
                        if (!isWhitelist) {
                            embed.addField(`${submitted}. ${play.title}${play.mods ? ` +${mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | **Unranked beatmap**`);
                            continue;
                        }
                    }

                    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods});
                    const npp = new osudroid.PerformanceCalculator().calculate({
                        stars: star.droidStars,
                        combo: combo,
                        accPercent: acc,
                        miss: miss,
                        mode: osudroid.modes.droid
                    });
                    const pp = parseFloat(npp.total.toFixed(2));

                    const pp_object = {
                        hash: play.hash,
                        title: mapinfo.fullTitle,
                        pp: pp,
                        mods: mods,
                        accuracy: acc,
                        combo: combo,
                        miss: miss,
                        scoreID: play.scoreID
                    };
                    if (osudroid.mods.modbitsFromString(mods) & osudroid.mods.osuMods.nc) {
                        pp_object.isOldPlay = true;
                    }
                    ++playc;
                    let duplicate = false;
                    for (let i in pplist) {
                        if (pp_object.hash === pplist[i].hash) {
                            duplicate = true;
                            pplist[i] = pp_object;
                            break;
                        }
                    }
                    if (!duplicate) {
                        pplist.push(pp_object);
                    }

                    pplist.sort((a, b) => {
                        return b.pp - a.pp;
                    });

                    if (pplist.length > 75) {
                        pplist.splice(75);
                    }

                    if (duplicate) embed.addField(`${submitted}. ${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp | **Duplicate**`);
				    else {
                        const dup_index = pplist.findIndex(p => p.hash === pp_object.hash);
                        if (dup_index !== -1) {
                            embed.addField(`${submitted}. ${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp`);
                        }
                        else {
                            embed.addField(`${submitted}. ${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp | **Worth no pp**`);
                        }
                    }
                }
                
                if (!submitted) {
                    return;
                }

                let weight = 1;
                for (const entry of pplist) {
                    pptotal += weight * entry.pp;
                    weight *= 0.95;
                }
                const diff = pptotal - pre_pptotal;
                embed.setDescription(`Total PP: **${pptotal.toFixed(2)} pp**\nPP gained: **${diff.toFixed(2)} pp**${!res ? "\nHey, looks like you are new to the system! You can ask a moderator or helper to enter all of your previous scores, or ignore this message if you want to start new!" : ""}`);
                message.channel.send(`✅ **| ${message.author}, successfully submitted your ${submitted === 1 ? "play" : "plays"}. More info in embed.**`, {embed: embed});

                let updateVal = {
					$set: {
						pptotal: pptotal,
						pp: pplist,
						playc: playc
					}
				};
				binddb.updateOne({discordid: message.author.id}, updateVal, function (err) {
					if (err) throw err;
				});
            }
        }
    });
};

module.exports.config = {
	name: "pp",
	description: "Submits plays from user's profile into the user's droid pp profile. Only allowed in bot channel and pp project channel in osu!droid International Discord server.",
	usage: "pp [offset] [start]\npp past <beatmap link/ID>",
	detail: "`beatmap link/ID`: The link or ID of the beatmap that you want to submit [Integer/String]\n`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]",
	permission: "None"
};