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

    const bindDb = maindb.collection("userbind");
    const banDb = maindb.collection("ppban");
    const whitelistDb = maindb.collection("mapwhitelist");
    const blacklistDb = maindb.collection("mapblacklist");
    const query = {discordid: message.author.id};
    bindDb.findOne(query, async (err, res) => {
        if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        const uid = res.uid;

        const isBanned = await banDb.findOne({uid: uid});
        if (isBanned) {
            return message.channel.send(`❎ **| I'm sorry, your currently binded account has been disallowed from submitting pp due to \`${isBanned.reason}\`**`);
        }

        const pplist = res.pp ?? [];
		let pptotal = 0;
		let pre_pptotal = res.pptotal ?? 0;
		let submitted = 0;
		let playc = res.playc ?? 0;
        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const color = message.member.displayHexColor;
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

                const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmap});
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
                const isBlacklist = await blacklistDb.findOne({beatmapID: mapinfo.beatmapID});
                if (isBlacklist) {
                    return message.channel.send(`❎ **| I'm sorry, this beatmap has been blacklisted with reason \`${isBlacklist.reason}\`!**`);
                }

                if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                    const isWhitelist = await whitelistDb.findOne({hashid: hash});
                    if (!isWhitelist) {
                        return message.channel.send("❎ **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
                    }
                }

                const score = await osudroid.Score.getFromHash({uid: uid, hash: hash});
                if (score.error) {
                    return message.channel.send("❎ **| I'm sorry, I couldn't check the map's scores! Perhaps osu!droid server is down?**");
                }
                if (!score.title) {
                    return message.channel.send("❎ **| I'm sorry, you don't have a score submitted in this map!**");
                }
                if (score.forcedAR !== undefined) {
                    return message.channel.send("❎ **| I'm sorry, force AR is not allowed!**");
                }
                if (score.speedMultiplier !== 1) {
                    return message.channel.send("❎ **| I'm sorry, custom speed multiplier is not allowed!**");
                }
                const mods = score.mods;
                const acc = score.accuracy;
                const combo = score.combo;
                const miss = score.miss;
                
                const replay = await new osudroid.ReplayAnalyzer({scoreID: score.scoreID, map: mapinfo.map}).analyze();
                const { data } = replay;
                if (!data) {
                    return message.channel.send("❎ **| I'm sorry, I couldn't find your replay file!**");
                }
                
                const stats = new osudroid.MapStats({
                    ar: score.forcedAR,
                    speedMultiplier: score.speedMultiplier,
                    isForceAR: !isNaN(score.forcedAR),
                    oldStatistics: data.replayVersion <= 3
                });

                const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods, stats});

                replay.map = star.droidStars;
                replay.checkFor3Finger();

                const realAcc = new osudroid.Accuracy({
                    n300: data.hit300,
                    n100: data.hit100,
                    n50: data.hit50,
                    nmiss: miss
                });

                const npp = new osudroid.DroidPerformanceCalculator().calculate({
                    stars: star.droidStars,
                    combo: combo,
                    accPercent: realAcc,
                    tapPenalty: replay.tapPenalty,
                    stats
                });
                const pp = parseFloat(npp.total.toFixed(2));
                if (isNaN(pp)) {
                    return message.channel.send("❎ **| I'm sorry, your play is worth no pp!**");
                }
                const pp_object = {
                    hash,
                    title: mapinfo.fullTitle,
                    pp,
                    mods,
                    accuracy: acc,
                    combo,
                    miss,
                    scoreID: score.scoreID
                };
                if (stats.isForceAR) {
                    pp_object.forcedAR = stats.ar;
                }
                if (score.speedMultiplier !== 1) {
                    pp_object.speedMultiplier = score.speedMultiplier;
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

                if (duplicate) {
                    embed.addField(`${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp | **Duplicate**`);
                } else {
                    const dup_index = pplist.findIndex(p => p.hash === pp_object.hash);
                    if (dup_index !== -1) {
                        embed.addField(`${pp_object.title}${pp_object.mods ? ` +${pp_object.mods}` : ""}`, `${combo}x | ${acc}% | ${miss} ❌ | ${pp}pp`);
                    } else {
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

                const updateVal = {
					$set: {
						pptotal: pptotal,
						pp: pplist,
						playc: playc
					}
				};
				bindDb.updateOne({discordid: message.author.id}, updateVal, function (err) {
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

                const player = await osudroid.Player.getInformation({uid: uid});
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
                    const mapinfo = await osudroid.MapInfo.getInformation({hash: play.hash});
                    ++submitted;

                    const combo = play.combo;
                    const mods = play.mods;
                    const acc = play.accuracy;
                    const miss = play.miss;

                    const titleString = `${submitted}. ${play.title} ${play.getCompleteModString()}`;
                    const statsString = `${combo}x | ${acc}% | ${miss} ❌`;

                    if (mapinfo.error) {
                        embed.addField(titleString, `${statsString} | **API fetch error**`);
                        continue;
                    }
                    if (!mapinfo.title) {
                        embed.addField(titleString, `${statsString} | **Beatmap not found**`);
                        continue;
                    }
                    if (!mapinfo.objects) {
                        embed.addField(titleString, `${statsString} | **Beatmap with 0 objects**`);
                        continue;
                    }
                    if (!mapinfo.osuFile) {
                        embed.addField(titleString, `${statsString} | **API fetch error**`);
                        continue;
                    }

                    const isBlacklist = await blacklistDb.findOne({beatmapID: mapinfo.beatmapID});
                    if (isBlacklist) {
                        embed.addField(titleString, `${statsString} | **Blacklisted**`);
                        continue;
                    }

                    if (mapinfo.approved === osudroid.rankedStatus.QUALIFIED || mapinfo.approved <= osudroid.rankedStatus.PENDING) {
                        const isWhitelist = await whitelistDb.findOne({hashid: play.hash});
                        if (!isWhitelist) {
                            embed.addField(titleString, `${statsString} | **Unranked beatmap**`);
                            continue;
                        }
                    }
                    if (play.forcedAR !== undefined || play.speedMultiplier !== 1) {
                        embed.addField(titleString, `${statsString} | **Unranked feature active**`);
                        continue;
                    }
                    const replay = await new osudroid.ReplayAnalyzer({scoreID: play.scoreID, map: mapinfo.map}).analyze();
                    const { data } = replay;
                    if (!data) {
                        embed.addField(titleString, `${statsString} | **Replay not found**`);
                        continue;
                    }
                    
                    const stats = new osudroid.MapStats({
                        ar: play.forcedAR,
                        speedMultiplier: play.speedMultiplier,
                        isForceAR: !isNaN(play.forcedAR),
                        oldStatistics: data.replayVersion <= 3
                    });

                    const realAcc = new osudroid.Accuracy({
                        n300: data.hit300,
                        n100: data.hit100,
                        n50: data.hit50,
                        nmiss: miss
                    });
                    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods, stats});

                    replay.map = star.droidStars;
                    replay.checkFor3Finger();

                    const npp = new osudroid.DroidPerformanceCalculator().calculate({
                        stars: star.droidStars,
                        combo: combo,
                        accPercent: realAcc,
                        tapPenalty: replay.tapPenalty,
                        stats
                    });
                    const pp = parseFloat(npp.total.toFixed(2));
                    if (isNaN(pp)) {
                        embed.addField(titleString, `${statsString} | **Calculation error**`);
                        continue;
                    }

                    const pp_object = {
                        hash: play.hash,
                        title: mapinfo.fullTitle,
                        pp,
                        mods,
                        accuracy: acc,
                        combo,
                        miss,
                        scoreID: play.scoreID
                    };
                    if (stats.isForceAR) {
                        pp_object.forcedAR = stats.ar;
                    }
                    if (play.speedMultiplier !== 1) {
                        pp_object.speedMultiplier = play.speedMultiplier;
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

                    if (duplicate) {
                        embed.addField(titleString, `${statsString} | ${pp}pp | **Duplicate**`);
                    } else {
                        const dup_index = pplist.findIndex(p => p.hash === pp_object.hash);
                        if (dup_index !== -1) {
                            embed.addField(titleString, `${statsString} | ${pp}pp`);
                        } else {
                            embed.addField(titleString, `${statsString} | ${pp}pp | **Worth no pp**`);
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
				bindDb.updateOne({discordid: message.author.id}, updateVal, function (err) {
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