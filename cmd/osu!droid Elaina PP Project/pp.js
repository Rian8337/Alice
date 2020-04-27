const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
let cd = new Set();

async function calculatePP(message, whitelist, embed, i, submitted, pplist, playc, playentry, cb) {
	if (!playentry[i]) return cb(false, false, true);
	let play = playentry[i];
	whitelist.findOne({hashid: play.hash}, async (err, wlres) => {
		if (err) {
			console.log(err);
			message.channel.send("❎ **| I'm sorry, I'm having trouble on retrieving the map's whitelist info!**");
			return cb(true)
		}
		let query = {hash: play.hash};
		if (wlres) query = {beatmap_id: wlres.mapid};
		const mapinfo = await new osudroid.MapInfo().get(query);
		if (!mapinfo.osu_file) {
			message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
			return cb(false, false)
		}
		if (!mapinfo.title) {
			message.channel.send("❎ **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
			return cb(false, false)
		}
		if (!mapinfo.objects) {
			message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
			return cb(false, false)
		}
		if ((mapinfo.approved === 3 || mapinfo.approved <= 0) && !wlres) {
			message.channel.send("❎ **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
			return cb(false, false)
		}
		let mod = play.mod;
		let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
		let npp = osudroid.ppv2({
			stars: star.droid_stars,
			combo: play.combo,
			acc_percent: play.accuracy,
			miss: play.miss,
			mode: "droid"
		});
		let pp = parseFloat(npp.toString().split(" ")[0]);
		let playinfo = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]${mod ? ` +${mod}` : ""}`;
		let ppentry = [play.hash, playinfo, pp, play.combo, play.accuracy, play.miss];
		if (isNaN(pp)) {
			message.channel.send("❎ **| I'm sorry, I'm having trouble on retrieving the map's pp data!**");
			return cb()
		}
		playc++;
		let dup = false;
		for (let i in pplist) {
			if (ppentry[0] == pplist[i][0]) {
				pplist[i] = ppentry;
				dup = true;
				break
			}
		}
		if (!dup) pplist.push(ppentry);
		pplist.sort(function (a, b) {
			return b[2] - a[2]
		});
		if (pplist.length > 75) pplist.splice(75);
		if (dup) embed.addField(`${submitted}. ${playinfo}`, `${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | ${pp}pp | **Duplicate**`);
		else {
			let x = 0;
			for (x; x < pplist.length; x++) {
				if (pplist[x][1].includes(playinfo)) {
					embed.addField(`${submitted}. ${playinfo}`, `${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | ${pp}pp`);
					break
				}
			}
			if (x == pplist.length) embed.addField(`${submitted}. ${playinfo}`, `${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | ${pp}pp | **Worth no pp**`);
		}
		cb()
	})
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
	if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
	let channels = config.pp_channel;
	let channel_index = channels.findIndex(id => message.channel.id === id);
	if (channel_index === -1) return message.channel.send("❎ **| I'm sorry, this command is not allowed in here!**");

	let binddb = maindb.collection("userbind");
	let whitelist = maindb.collection("mapwhitelist");

	let ufind = message.author.id;
	let query = {discordid: ufind};
	binddb.findOne(query, async (err, res) => {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = res.uid;
		let pplist = [];
		let pptotal = 0;
		let pre_pptotal = 0;
		let submitted = 1;
		let playc = 0;
		if (res) {
			pplist = res.pp;
			pre_pptotal = res.pptotal;
			playc = res.playc
		}
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		let rolecheck;
		try {
			rolecheck = message.member.roles.highest.hexColor
		} catch (e) {
			rolecheck = "#000000"
		}
		let embed = new Discord.MessageEmbed()
			.setTitle("PP submission info")
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setColor(rolecheck);

		switch (args[0]) {
			case "past": {
				cd.add(message.author.id);
				setTimeout(() => {
					cd.delete(message.author.id)
				}, 2000);
				let beatmap = args[1];
				if (!beatmap) return message.channel.send("❎ **| Hey, please give me a beatmap to submit!**");
				if (typeof beatmap !== "number") {
					let a = beatmap.split("/");
					beatmap = parseInt(a[a.length - 1]);
					if (isNaN(beatmap)) return message.channel.send("❎ **| Hey, that beatmap ID is not valid!**")
				}
				const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap});
				if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, that map does not exist in osu! database!**");
				if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
				if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
				let hash = mapinfo.hash;

				const play = await new osudroid.PlayInfo().getFromHash({uid: uid, hash: hash});
				if (!play.title) return message.channel.send("❎ **| I'm sorry, you don't have any plays submitted in this map!**");
				let combo = play.combo;
				let acc = play.accuracy;
				let mod = play.mods;
				let miss = play.miss;

				whitelist.findOne({hashid: play.hash}, (err, wlres) => {
					if (err) {
						console.log(err);
						return message.channel.send("❎ **| I'm sorry, I'm having trouble on retrieving the map's whitelist info!**");
					}
					if ((mapinfo.approved === 3 || mapinfo.approved <= 0) && !wlres) return message.channel.send("❎ **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
					let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
					let npp = osudroid.ppv2({
						stars: star.droid_stars,
						combo: combo,
						acc_percent: acc,
						miss: miss,
						mode: "droid"
					});
					let pp = parseFloat(npp.toString().split(" ")[0]);
					let playinfo = `${mapinfo.artist} - ${mapinfo.title} (${mapinfo.creator}) [${mapinfo.version}]${mod ? ` +${mod}` : ""}`;
					let ppentry = [play.hash, playinfo, pp, play.combo, play.accuracy, play.miss];
					if (isNaN(pp)) message.channel.send("❎ **| I'm sorry, I'm having trouble on retrieving the map's pp data!**");

					playc++;
					let dup = false;
					for (let i in pplist) {
						if (ppentry[0] === pplist[i][0]) {
							pplist[i] = ppentry;
							dup = true;
							break
						}
					}
					if (!dup) pplist.push(ppentry);

					pplist.sort(function (a, b) {
						return b[2] - a[2]
					});
					if (pplist.length > 75) pplist.splice(75);
					if (dup) embed.addField(playinfo, `${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | ${pp}pp | **Duplicate**`);
					else {
						let x = 0;
						for (x; x < pplist.length; x++) {
							if (pplist[x][1].includes(playinfo)) {
								embed.addField(playinfo, `${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | ${pp}pp`);
								break
							}
						}
						if (x === pplist.length) embed.addField(playinfo, `${play.combo}x | ${play.accuracy}% | ${play.miss} ❌ | ${pp}pp | **Worth no pp**`);
					}

					let pptotal = 0;
					let weight = 1;
					for (let i in pplist) {
						pptotal += weight * pplist[i][2];
						weight *= 0.95;
					}
					let diff = pptotal - pre_pptotal;
					embed.setDescription(`Total PP: **${pptotal.toFixed(2)} pp**\nPP gained: **${diff.toFixed(2)} pp**`);
					message.channel.send(`✅ **| ${message.author}, successfully submitted your play(s). More info in embed.**`, {embed: embed});
					let updateVal = {
						$set: {
							pptotal: pptotal,
							pp: pplist,
							playc: playc
						}
					};
					binddb.updateOne({discordid: message.author.id}, updateVal, function (err) {
						if (err) throw err
					});
				})
				break
			}
			default: {
				let offset = 1;
				let start = 1;
				if (args[0]) offset = parseInt(args[0]);
				if (args[1]) start = parseInt(args[1]);
				if (isNaN(offset)) offset = 1;
				if (isNaN(start)) start = 1;
				if (offset > 5 || offset < 1) return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
				if (start + offset - 1 > 50) return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
				cd.add(message.author.id);
				setTimeout(() => {
					cd.delete(message.author.id)
				}, 1000 * offset);

				const player = await new osudroid.PlayerInfo().get({uid: uid});
				if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find your profile!**");
				if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
				let rplay = player.recent_plays;
				let playentry = [];

				for (let i = start - 1; i < start + offset - 1; i++) {
					if (!rplay[i]) break;
					let play = {
						title: rplay[i].title,
						accuracy: rplay[i].accuracy,
						miss: rplay[i].miss,
						combo: rplay[i].combo,
						mod: rplay[i].mods,
						hash: rplay[i].hash
					};
					playentry.push(play)
				}
				let i = 0;
				await calculatePP(message, whitelist, embed, i, submitted, pplist, playc, playentry, async function testResult(error = false, success = true, stopSign = false) {
					if (stopSign) {
						if (submitted === 1) return;
						let weight = 1;
						for (let i in pplist) {
							pptotal += weight * pplist[i][2];
							weight *= 0.95;
						}
						let diff = pptotal - pre_pptotal;
						embed.setDescription(`Total PP: **${pptotal.toFixed(2)} pp**\nPP gained: **${diff.toFixed(2)} pp**`);
						message.channel.send(`✅ **| ${message.author}, successfully submitted your play(s). More info in embed.**`, {embed: embed});
						let updateVal = {
							$set: {
								pptotal: pptotal,
								pp: pplist,
								playc: playc
							}
						};
						binddb.updateOne(query, updateVal, function (err) {
							if (err) throw err
						});
						return
					}
					if (!error) i++;
					if (success) submitted++;
					await calculatePP(message, whitelist, embed, i, submitted, pplist, playc, playentry, await testResult)
				})
			}
		}
	})
};

module.exports.config = {
	name: "pp",
	description: "Submits plays from user's profile into the user's droid pp profile. Only allowed in bot channel and pp project channel in osu!droid International Discord server.",
	usage: "pp [offset] [start]\npp past <beatmap link/ID>",
	detail: "`beatmap link/ID`: The link or ID of the beatmap that you want to submit [Integer/String]\n`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]",
	permission: "None"
};
