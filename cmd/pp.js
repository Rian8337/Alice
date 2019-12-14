var Discord = require('discord.js');
var http = require('http');
var droid = require("./ojsamadroid");
var https = require("https");
var request = require("request");
require("dotenv").config();
require('mongodb');
var apikey = process.env.OSU_API_KEY;
var droidapikey = process.env.DROID_API_KEY;

function modenum(mod) {
	var res = 4;
	if (mod.includes("r")) res += 16;
	if (mod.includes("h")) res += 8;
	if (mod.includes("d")) res += 64;
	if (mod.includes("c")) res += 576;
	if (mod.includes("n")) res += 1;
	if (mod.includes("e")) res += 2;
	if (mod.includes("t")) res += 256;
	return res
}

function getMapPP(input, pcombo, pacc, pmissc, pmod = "", message, objcount, whitelist, cb) {

	var isWhitelist = false;

	var whitelistQuery = {hashid: input};

	whitelist.findOne(whitelistQuery, (err, wlres) => {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!");
		}
		if (wlres) isWhitelist = true; 
		console.log(input);

		if (isWhitelist) var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + wlres.mapid); 
		else var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + input);

		var content = "";   

		var req = https.get(options, function(res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
				content += chunk;
			});
			res.on("error", err1 => {
				console.log(err1);
				return message.channel.send("Error: Empty API response. Please try again!")
			});
			res.on("end", function () {
				var obj = JSON.parse(content);
				if (!obj[0]) {
					console.log("Map not found"); 
					message.channel.send("❎  **| I'm sorry, the map you've played can't be found on osu! beatmap listing, please make sure the map is submitted and up-to-date!**");
					objcount.x++;
					return;
				}
				var mapinfo = obj[0];
				var mapid = mapinfo.beatmap_id;
				if (mapinfo.mode != 0) return;
				if ((mapinfo.approved == 3 || mapinfo.approved <= 0) && !isWhitelist) {
					message.channel.send("❎  **| I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!**");
					objcount.x++;
					return;
				}
				//console.log(obj.beatmaps[0])
				if (pmod) var mods = modenum(pmod);
				else var mods = 4;
				if (pacc) var acc_percent = parseFloat(pacc);
				else var acc_percent = 100;
				if (pcombo) var combo = parseInt(pcombo);
				else var combo;
				if (pmissc) var nmiss = parseInt(pmissc);
				else var nmiss = 0;
				var parser = new droid.parser();
				console.log(acc_percent);
				//var url = "https://osu.ppy.sh/osu/1031991";
				var url = 'https://osu.ppy.sh/osu/' + mapid;
				request(url, function (err, response, data) {
					parser.feed(data);
					var nmap = parser.map;
					var cur_od = nmap.od - 5;
					var cur_ar = nmap.ar;
					var cur_cs = nmap.cs - 4;
					// if (mods) {
					// 	console.log("+" + osu.modbits.string(mods));
					// }
					if (pmod.includes("r")) {
						mods -= 16; 
						cur_ar = Math.min(cur_ar*1.4, 10);
						cur_od = Math.min(cur_od*1.4, 5);
						cur_cs += 1;
					}

					if (pmod.includes("PR")) { cur_od += 4; }

					nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;
					
					if (nmap.ncircles == 0 && nmap.nsliders == 0) {
						console.log('Error: no object found'); 
						objcount.x++;
						return;
					}
					
					var nstars = new droid.diff().calc({map: nmap, mods: mods});
					//console.log(stars.toString());

					
					var npp = droid.ppv2({
						stars: nstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});
					
					parser.reset();

					if (pmod.includes("r")) { mods += 16; }
					
					console.log(nstars.toString());
					console.log(npp.toString());
					var ppline = npp.toString().split("(");
					var playinfo = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mods == 4 && (!pmod.includes("PR")))? " " : "+ ") + droid.modbits.string(mods - 4) + ((pmod.includes("PR")? "PR": ""))
					objcount.x++;
					cb(ppline[0], playinfo, input, pcombo, pacc, pmissc);
				})
			})
		})
	})
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
	if (message.channel.name != 'bot-ground' && message.channel.name != 'elaina-pp-project') {
		let channel = message.guild.channels.find(c => c.name === 'bot-ground');
		let channel2 = message.guild.channels.find(c => c.name === 'elaina-pp-project');
		if (channel && channel2) return message.channel.send(`❎  **| I'm sorry, this command is only allowed in ${channel} and ${channel2}!**`);
		if (channel) return message.channel.send(`❎  **| I'm sorry, this command is only allowed in ${channel}!**`);
		if (channel2) return message.channel.send(`❎  **| I'm sorry, this command is only allowed in ${channel2}!**`);
		else return message.channel.send("❎  **| Hey, please create #bot-ground or #elaina-pp-project first!**")
	}
	let ufind = message.author.id;
	let objcount = {x: 0};
	var offset = 1;
	var start = 1;
	if (args[0]) offset = parseInt(args[0]);
	if (args[1]) start = parseInt(args[1]);
	if (isNaN(offset)) return message.channel.send("❎  **| How many of your plays do I need to submit?**");
	if (isNaN(start)) return message.channel.send("❎  **| I can't start submitting from there!");
	if (offset > 5 || offset < 1) offset = 1;
	if (start + offset - 1 > 50) return message.channel.send('❎  **| I think you went over the limit. You can only submit up to 50 of your recent plays!**');
	/*if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}*/
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let whitelist = maindb.collection("mapwhitelist");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, userres) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (userres[0]) {
			console.log(offset);
			let uid = userres[0].uid;
			let discordid = userres[0].discordid;
			if (userres[0].pp) var pplist = userres[0].pp;
			else var pplist = [];
			if (userres[0].pptotal) var pre_pptotal = userres[0].pptotal;
			else var pre_pptotal = 0;
			if (userres[0].playc) var playc = userres[0].playc;
			else var playc = 0;
			var pptotal = 0;
			var submitted = 0;
			var options = {
				host: "ops.dgsrz.com",
				port: 80,
				path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
			};

			var content = "";

			var req = http.request(options, function (res) {
				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					content += chunk;
				});
				res.on("error", err1 => {
					console.log(err1);
					return message.channel.send("Error: Empty API response. Please try again!")
				});
				res.on("end", function () {
					curpos = 0;
					var playentry = [];
					var resarr = content.split('<br>');
					var headerres = resarr[0].split(" ");
					if (headerres[0] == 'FAILED') return message.channel.send("User not found!");
					var obj = JSON.parse(resarr[1]);
					var rplay = obj.recent;
					for (var i = start - 1; i < start + offset - 1; i++) {
						if (!rplay[i]) break;
						var play = {
							title: "", acc: "", miss: "", combo: "", mod: "", hash: ""
						};
						play.title = rplay[i].filename;
						play.acc = rplay[i].accuracy.toPrecision(4) / 1000;
						play.miss = rplay[i].miss;
						play.combo = rplay[i].combo;
						play.mod = rplay[i].mode;
						play.hash = rplay[i].hash;
						playentry[curpos] = play;
						curpos++;
					}

					console.log(playentry);
					playentry.forEach(function (x) {
						if (x.title) getMapPP(x.hash, x.combo, x.acc, x.miss, x.mod, message, objcount, whitelist, (pp, playinfo, hash, acc, combo, miss) => {
							console.log(objcount);
							var ppentry = [hash, playinfo, parseFloat(pp), acc, combo, miss];
							if (!isNaN(ppentry[2])) {
								var dup = false;
								for (i in pplist) {
									if (ppentry[0] == pplist[i][0]) {
										pplist[i] = ppentry;
										dup = true;
										playc++;
										break;
									}
								}
								if (!dup) {
									pplist.push(ppentry);
									playc++;
								}
								pplist.sort(function (a, b) {
									return b[2] - a[2]
								});
								while (pplist.length > 75) pplist.pop();
								submitted++;
								if (objcount.x == playentry.length) {
									var weight = 1;
									for (i in pplist) {
										pptotal += weight * pplist[i][2];
										weight *= 0.95;
									}
									var diff = pptotal - pre_pptotal;
									if (submitted === 1) message.channel.send('✅  **| <@' + discordid + '> Submitted ' + submitted + ' play: + ' + diff.toFixed(2) + ' pp.**');
									else message.channel.send('✅  **| <@' + discordid + '> Submitted ' + submitted + ' plays: + ' + diff.toFixed(2) + ' pp.**');
									var updateVal = {
										$set: {
											pptotal: pptotal,
											pp: pplist,
											playc: playc
										}
									};
									binddb.updateOne(query, updateVal, function (err) {
										if (err) throw err;
										console.log('pp updated');
										addcount = 0;
									})
								}
							} else message.channel.send("❎  **| Sorry, I'm having trouble on retrieving the map's pp data!**")
						})
					})
				})
			});
			req.end()
		} else message.channel.send("❎  **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**")
	})
};

module.exports.help = {
	name: "pp"
};
