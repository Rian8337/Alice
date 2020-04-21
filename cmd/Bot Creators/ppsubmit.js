const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('../../modules/osu!droid');

function calculatePP(message, whitelist, embed, i, submitted, pplist, playc, playentry, cb) {
	if (!playentry[i]) return cb(false, false, true);
	let play = playentry[i];
	whitelist.findOne({hashid: play.hash}, (err, wlres) => {
		if (err) {
			console.log(err);
			message.channel.send("❎ **| I'm sorry, I'm having trouble on retrieving the map's whitelist info!**");
			return cb(true)
		}
		let query = {hash: play.hash};
		if (wlres) query = {beatmap_id: wlres.mapid};
		new osudroid.MapInfo().get(query, mapinfo => {
			if (!mapinfo.osu_file) {
				message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
				return cb(false, false)
			}
			if (!mapinfo.title) {
				message.channel.send("❎ **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
				return cb(false, false)
			}
			if (!mapinfo.objects) {
				message.channel.send("❎ **| I'm sorry, it seems like this map has 0 objects!**");
				return cb(false, false)
			}
			if ((mapinfo.approved == 3 || mapinfo.approved <= 0) && !wlres) {
				message.channel.send("❎ **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
				return cb(false, false)
			}
			let mod = osudroid.mods.droid_to_PC(play.mod);
			let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
			let npp = osudroid.ppv2({
				stars: star.droid_stars,
				combo: play.combo,
				acc_percent: play.accuracy,
				miss: play.miss,
				mode: "droid"
			});
			let pp = parseFloat(npp.toString().split(" ")[0]);
			let playinfo = mapinfo.showStatistics(mod, 0);
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
	})
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
	if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
	let ufind = args[0];
        if (!ufind) return message.channel.send("❎ **| Hey, please mention a user!**");
	ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "");
	let offset = 1;
	let start = 1;
	if (args[1]) offset = parseInt(args[1]);
	if (args[2]) start = parseInt(args[2]);
	if (isNaN(offset)) offset = 1;
	if (isNaN(start)) start = 1;
	if (offset > 5 || offset < 1) return message.channel.send("❎ **| I cannot submit that many plays at once! I can only do up to 5!**");
	if (start + offset - 1 > 50) return message.channel.send('❎ **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
	let binddb = maindb.collection("userbind");
	let whitelist = maindb.collection("mapwhitelist");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, userres) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = userres[0].uid;
		let pplist = [];
		let pptotal = 0;
		let pre_pptotal = 0;
		let submitted = 1;
		let playc = 0;
		if (userres[0].pp) pplist = userres[0].pp;
		if (userres[0].pptotal) pre_pptotal = userres[0].pptotal;
		if (userres[0].playc) playc = userres[0].playc;
		new osudroid.PlayerInfo().get({uid: uid}, player => {
			if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find your profile!**");
			if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, you haven't submitted any play!**");
			let rplay = player.recent_plays;
			let playentry = [];
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

			for (let i = start - 1; i < start + offset - 1; i++) {
				if (!rplay[i]) break;
				let play = {
					title: "", accuracy: "", miss: "", combo: "", mod: "", hash: ""
				};
				play.title = rplay[i].filename;
				play.accuracy = parseFloat((parseInt(rplay[i].accuracy) / 1000).toFixed(2));
				play.miss = rplay[i].miss;
				play.combo = rplay[i].combo;
				play.mod = rplay[i].mode;
				play.hash = rplay[i].hash;
				playentry.push(play)
			}
			let i = 0;
			calculatePP(message, whitelist, embed, i, submitted, pplist, playc, playentry, function testResult(error = false, success = true, stopSign = false) {
				if (stopSign) {
					if (submitted == 1) return;
					let weight = 1;
					for (let i in pplist) {
						pptotal += weight * pplist[i][2];
						weight *= 0.95;
					}
					let diff = pptotal - pre_pptotal;
					embed.setDescription(`Total PP: **${pptotal.toFixed(2)} pp**\nPP gained: **${diff.toFixed(2)} pp**`);
					message.channel.send(`✅ **| ${message.author}, successfully submitted play(s) of <@${ufind}>. More info in embed.**`, {embed: embed});
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
				calculatePP(message, whitelist, embed, i, submitted, pplist, playc, playentry, testResult)
			})
		})
	})
};

module.exports.config = {
	name: "ppsubmit",
	description: "Submits plays from user's profile into the user's droid pp profile. Only allowed in bot channel and pp project channel in osu!droid International Discord server.",
	usage: "ppsubmit <user> [offset] [start]",
	detail: "`offset`: The amount of play to submit from 1 to 5, defaults to 1 [Integer]\n`start`: The position in your recent play list that you want to start submitting, up to 50, defaults to 1 [Integer]\n`user`: The user to submit for [UserResolvable (mention or user ID)]",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
