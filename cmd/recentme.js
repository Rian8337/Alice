var http = require('http');
var droid = require("./ojsamadroid");
var osu = require("ojsama");
var request = require("request");
var https = require("https");
require("dotenv").config();
var apikey = process.env.OSU_API_KEY;
var droidapikey = process.env.DROID_API_KEY;

function rankread(imgsrc) {
	let rank="";
	switch(imgsrc) {
		case 'S':rank="http://ops.dgsrz.com/assets/images/ranking-S-small.png";break;
		case 'A':rank="http://ops.dgsrz.com/assets/images/ranking-A-small.png";break;
		case 'B':rank="http://ops.dgsrz.com/assets/images/ranking-B-small.png";break;
		case 'C':rank="http://ops.dgsrz.com/assets/images/ranking-C-small.png";break;
		case 'D':rank="http://ops.dgsrz.com/assets/images/ranking-D-small.png";break;
		case 'SH':rank="http://ops.dgsrz.com/assets/images/ranking-SH-small.png";break;
		case 'X':rank="http://ops.dgsrz.com/assets/images/ranking-X-small.png";break;
		case 'XH':rank="http://ops.dgsrz.com/assets/images/ranking-XH-small.png";break;
		default: rank="unknown";
	}
	return rank;
}

function mapstatusread(status) {
	switch (status) {
		case -2: return 16711711;
		case -1: return 9442302;
		case 0: return 16312092;
		case 1: return 2483712;
		case 2: return 16741376;
		case 3: return 5301186;
		case 4: return 16711796;
		default: return 0;
	}
}

function modenum(mod) {
	var res = 4;
	if (mod.includes("r")) res += 16;
	if (mod.includes("h")) res += 8;
	if (mod.includes("d")) res += 64;
	if (mod.includes("c")) res += 576;
	if (mod.includes("n")) res += 1;
	if (mod.includes("e")) res += 2;
	if (mod.includes("t")) res += 256;
	return res;
}

function modname(mod) {
	var res = '';
	var count = 0;
	if (mod.includes("-")) {res += 'None '; count++}
	if (mod.includes("r")) {res += 'HardRock '; count++}
	if (mod.includes("h")) {res += 'Hidden '; count++}
	if (mod.includes("d")) {res += 'DoubleTime '; count++}
	if (mod.includes("c")) {res += 'NightCore '; count++}
	if (mod.includes("n")) {res += 'NoFail '; count++}
	if (mod.includes("e")) {res += 'Easy '; count++}
	if (mod.includes("t")) {res += 'HalfTime '; count++}
	if (count > 1) return res.trimRight().split(" ").join(", ");
	else return res.trimRight()
}

function mapstatus(status) {
	switch (status) {
		case -2: return "Graveyard";
		case -1: return "WIP";
		case 0: return "Pending";
		case 1: return "Ranked";
		case 2: return "Approved";
		case 3: return "Qualified";
		case 4: return "Loved";
		default: return "Unspecified"
	}
}

function getMapPP(input, pcombo, pacc, pmissc, pmod = "", message) {

	var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + input);

	var content = "";   

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			if (!content) return message.channel.send("Error: Empty API response. Please try again!");
			var obj = JSON.parse(content);
			if (!obj[0]) {console.log("Map not found"); return;}
			var mapinfo = obj[0];
			var mapid = mapinfo.beatmap_id;
			if (mapinfo.mode !=0) return;
			//console.log(obj.beatmaps[0])
			if (pmod) var mods = modenum(pmod);
			else var mods = 4;
			if (pacc) var acc_percent = parseFloat(pacc);
			else var acc_percent = 100;
			if (pcombo) var combo = parseInt(pcombo);
			else var combo;
			if (pmissc) var nmiss = parseInt(pmissc);
			else var nmiss = 0;
			var nparser = new droid.parser();
			var pcparser = new osu.parser();
			console.log(acc_percent);
			var url = 'https://osu.ppy.sh/osu/' + mapid;
			request(url, function (err, response, data) {
					nparser.feed(data);
					pcparser.feed(data);
					var pcmods = mods - 4;
					var nmap = nparser.map;
					var pcmap = pcparser.map;
					var cur_od = nmap.od - 5;
					var cur_ar = nmap.ar;
					var cur_cs = nmap.cs - 4;
					if (pmod.includes("r")) {
						mods -= 16; 
						cur_ar = Math.min(cur_ar*1.4, 10);
						cur_od = Math.min(cur_od*1.4, 5);
						cur_cs += 1;
					}

					if (pmod.includes("PR")) { cur_od += 4; }

					nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;
                    
                    			if (nmap.ncircles == 0 && nmap.nsliders == 0) {
						console.log(target[0] + ' - Error: no object found'); 
						return;
                    			}
                    
					var nstars = new droid.diff().calc({map: nmap, mods: mods});
					var pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});

                    			var npp = droid.ppv2({
						stars: nstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					var pcpp = osu.ppv2({
						stars: pcstars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});
					
					nparser.reset();
					if (pmod.includes("r")) { mods += 16 }
                    
					console.log(nstars.toString());
                    			console.log(npp.toString());
					var starsline = nstars.toString().split("(");
					var ppline = npp.toString().split("(");
					var pcstarsline = pcstars.toString().split("(");
					var pcppline = pcpp.toString().split("(");
					const embed = {
						"title": mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + ((mods == 4 && (!pmod.includes("PR")))? " " : "+ ") + osu.modbits.string(mods - 4) + ((pmod.includes("PR")? "PR": "")),
						"description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/" + mapinfo.beatmapset_id + ".osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=" + mapinfo.beatmapset_id + ")",
						"url": "https://osu.ppy.sh/b/" + mapinfo.beatmap_id ,
						"color": mapstatusread(parseInt(mapinfo.approved)),
						"footer": {
							"icon_url": "https://i.imgur.com/S5yspQs.jpg",
							"text": "Alice Synthesis Thirty"
						},
						"author": {
							"name": "Map Found",
							"icon_url": "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg"
						},
						"thumbnail": {
							"url": "https://b.ppy.sh/thumb/" + mapinfo.beatmapset_id + ".jpg"
						},
						"fields": [
							{
								"name": "CS: " + mapinfo.diff_size + " - AR: " + mapinfo.diff_approach + " - OD: " + mapinfo.diff_overall + " - HP: " + mapinfo.diff_drain ,
								"value": "BPM: " + mapinfo.bpm + " - Length: " + mapinfo.hit_length + "/" + mapinfo.total_length + " s - Max Combo: " + mapinfo.max_combo + "x"
							},
							{
								"name": "Last Update: " + mapinfo.last_update + " | " + mapstatus(parseInt(mapinfo.approved)),
								"value": "❤️ " + mapinfo.favourite_count + " - ▶️ " + mapinfo.playcount
							},
							{
								"name": "Droid pp (Experimental): __" + ppline[0] + "__ - " + starsline[0] ,
								"value": "PC pp: " + pcppline[0] + " - " + pcstarsline[0]
							}
						]
					};
					message.channel.send({embed})
				}
			)
		});
	});
}

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (res[0]) {
			let uid = res[0].uid;
			var options = {
				host: "ops.dgsrz.com",
				port: 80,
				path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
			};

			var content = "";   

			var req = http.request(options, function(res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
			content += chunk;
			});

			res.on("end", function () {
				if (!content) return message.channel.send("Error: Empty API response. Please try again!");
				var resarr = content.split('<br>');
				var headerres = resarr[0].split(" ");
				if (headerres[0] == 'FAILED') {
					message.channel.send("User doesn't exist");
					return;
				}
				let name = resarr[0].split(" ")[2];
				var obj = JSON.parse(resarr[1]);
				var play = obj.recent[0];
				let title = play.filename;
				let score = play.score.toLocaleString();
				let combo = play.combo;
				let rank = rankread(play.mark);
				let ptime = new Date(play.date * 1000).toISOString().replace("T", " ").slice(0, -5);
				let acc = play.accuracy.toPrecision(4) / 1000;
				let miss = play.miss;
				let mod = play.mode;
				let hash = play.hash;

				if (title) {getMapPP(hash, combo, acc, miss, mod, message);}

				const embed = {
					"title": title,
					"description": "**Score**: `" + score + " ` - Combo: `" + combo + "x ` - Accuracy: `" + acc + "%` \n(`" + miss + "` x )\nMod: `" + modname(mod) + "` Time: `" + ptime + "`",
					"color": 8311585,
					"author": {
						"name": "Recent Play for "+ name,
						"icon_url": rank
					},
					"footer": {
						"icon_url": "https://i.imgur.com/S5yspQs.jpg",
						"text": "Alice Synthesis Thirty"
					}
				};
				message.channel.send({ embed });
				});
			});
			req.end();
		}
		else message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
	});
};


module.exports.help = {
	name: "recentme"
};
