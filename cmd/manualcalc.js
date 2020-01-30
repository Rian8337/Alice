var droid = require("./ojsamadroid");
var osu = require("ojsama");
var https = require("https");
var request = require("request");
require("dotenv").config();
var apikey = process.env.OSU_API_KEY;
let config = require('../config.json');

class MapStats {
	constructor() {
		this.cs = 0;
		this.ar = 0;
		this.od = 0;
		this.hp = 0
	}
	calc(params) {
		let cs = parseFloat(params.cs);
		let ar = parseFloat(params.ar);
		let od = parseFloat(params.od);
		let hp = parseFloat(params.hp);
		let mods = params.mods.toUpperCase();
		let speed_mul = 1;
		if (mods.includes("DT")) speed_mul = 1.5;
		if (mods.includes("NC")) speed_mul = 1.39;
		if (mods.includes("HT")) speed_mul *= 0.75;

		let od_ar_hp_multiplier = 1;
		if (mods.includes("HR")) od_ar_hp_multiplier = 1.4;
		if (mods.includes("EZ")) od_ar_hp_multiplier *= 0.5;
		if (cs) {
			if (mods.includes("HR")) cs *= 1.3;
			if (mods.includes("EZ")) cs *= 0.5;
			cs = Math.min(10, cs)
		}
		if (hp) {
			hp *= od_ar_hp_multiplier;
			hp = Math.min(10, hp)
		}
		if (ar) ar = this.modify_ar(ar, speed_mul, od_ar_hp_multiplier);
		if (od) od = this.modify_od(od, speed_mul, od_ar_hp_multiplier);

		this.cs = parseFloat(cs.toFixed(2));
		this.ar = parseFloat(ar.toFixed(2));
		this.od = parseFloat(od.toFixed(2));
		this.hp = parseFloat(hp.toFixed(2));
		return this
	}
	modify_ar(base_ar, speed_mul, multiplier) {
		let AR0_MS = 1800.0;
		let AR5_MS = 1200.0;
		let AR10_MS = 450.0;
		let AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0;
		let AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0;
		let ar = base_ar * multiplier;
		var arms = (
			ar < 5.0 ?
				AR0_MS-AR_MS_STEP1 * ar
				: AR5_MS - AR_MS_STEP2 * (ar - 5)
		);
		arms = Math.min(AR0_MS, Math.max(AR10_MS, arms));
		arms /= speed_mul;

		ar = (
			arms > AR5_MS ?
				(AR0_MS - arms) / AR_MS_STEP1
				: 5 + (AR5_MS - arms) / AR_MS_STEP2
		);
		return ar
	}
	modify_od(base_od, speed_mul, multiplier) {
		let OD0_MS = 80;
		let OD10_MS = 20;
		let OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0;
		let od = base_od * multiplier;
		let odms = OD0_MS - Math.ceil(OD_MS_STEP * od);
		odms = Math.min(OD0_MS, Math.max(OD10_MS, odms));
		odms /= speed_mul;
		od = (OD0_MS - odms) / OD_MS_STEP;
		return od
	}
}

function time(second) {
	return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

function modenum(mod) {
	var res = 4;
	if (mod.includes("HR")) res += 16;
	if (mod.includes("HD")) res += 8;
	if (mod.includes("DT")) res += 64;
	if (mod.includes("NC")) res += 576;
	if (mod.includes("NF")) res += 1;
	if (mod.includes("EZ")) res += 2;
	if (mod.includes("HT")) res += 256;
	return res
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
		default: return 0
	}
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

function getMapPP(target, message, ndetail, pcdetail) {

	var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + target[0]);

	var content = "";

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});
		res.on("error", err => {
			console.log(err);
			return message.channel.send("Error: Empty API response. Please try again!")
		});
		res.on("end", function () {
			var obj;
			try {
				obj = JSON.parse(content)
			} catch (e) {
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API now. Please try again later!**")
			}
			if (!obj[0]) {message.channel.send("Map not found"); return;}
			var mapinfo = obj[0];
			if (mapinfo.mode !=0) return message.channel.send("❎ **| I'm sorry, the beatmap is not an osu!standard beatmap!**");
			//console.log(obj.beatmaps[0])
			if (target[4]) var mods = modenum(target[4].toUpperCase());
			else {var mods = 4; target[4] = "";}
			if (target[2]) var acc_percent = parseFloat(target[2]);
			else var acc_percent = 100;
			if (target[1]) var combo = parseInt(target[1]);
			else var combo = mapinfo.max_combo;
			if (combo > mapinfo.max_combo) combo = mapinfo.max_combo;
			if (target[3]) var nmiss = parseInt(target[3]);
			else var nmiss = 0;
			var nparser = new droid.parser();
			var pcparser = new osu.parser();
			//console.log(acc_percent);
			//var url = "https://osu.ppy.sh/osu/1031991";
			var url = 'https://osu.ppy.sh/osu/' + target[0];
			request(url, function (err, response, data) {
					nparser.feed(data);
					pcparser.feed(data);
					var pcmods = mods - 4;
					var nmap = nparser.map;
					var pcmap = pcparser.map;
					var cur_od = nmap.od - 5;
					var cur_ar = nmap.ar;
					var cur_cs = nmap.cs - 4;
					// if (mods) {
					// 	console.log("+" + osu.modbits.string(mods));
					// }
					if (target[4].includes("HR")) {
						mods -= 16;
						cur_ar = Math.min(cur_ar*1.4, 10);
						cur_od = Math.min(cur_od*1.4, 5);
						cur_cs += 1;
					}

					var hitlength = mapinfo.hit_length;
					var maplength = mapinfo.total_length;
					if (target[4].toUpperCase().includes("DT") || target[4].toUpperCase().includes("NC")) {
						hitlength = Math.ceil(hitlength / 1.5);
						maplength = Math.ceil(maplength / 1.5);
					}
					if (target[4].toUpperCase().includes("HT")) {
						hitlength = Math.ceil(hitlength * 4/3);
						maplength = Math.ceil(hitlength * 4/3);
					}

					if (target[4].includes("PR")) cur_od += 4;
					if (target[4].includes("TD")) pcmods += 4;

					nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;

                    if (nmap.ncircles == 0 && nmap.nsliders == 0) {
						console.log(target[0] + ' - Error: no object found');
						return;
                    }

					var nstars = new droid.diff().calc({map: nmap, mods: mods});
					var pcstars = new osu.diff().calc({map: pcmap, mods: pcmods});
					//console.log(stars.toString());


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

					/*var object_list = nstars.objects;
					var diff_elem_array = [];
					var strain_array = [];
					object_list.forEach((x) => {
						var diff_elem = {
							strain: parseFloat(x.strains[0].toFixed(4)),
					 		angle: (x.angle)? parseFloat((x.angle/(2*Math.PI)*360).toFixed(3)) : 0,
					 		spacing: x.delta_time/x.d_distance? parseFloat((x.d_distance/x.delta_time).toFixed(4)) : 0
					 	};
					 	diff_elem_array.push(diff_elem);
					 	strain_array.push(parseFloat(x.strains[0].toFixed(4)))
					});
					
					console.table(diff_elem_array);
					message.channel.send("Diff spike test");
					var strain_max = Math.max(...strain_array);

					var max_30p = 0;
					var max_50p = 0;
					var max_70p = 0;
					var max_90p = 0;

					strain_array.forEach((x) => {
					 	if (x/strain_max >= 0.3) max_30p++;
					 	if (x/strain_max >= 0.5) max_50p++;
					 	if (x/strain_max >= 0.7) max_70p++;
					 	if (x/strain_max >= 0.9) max_90p++;
					});
					
					var nx = strain_array.length;
					var output_test = "```30% strain: " + max_30p/nx + "\n50% strain: " + max_50p/nx + "\n70% strain: " + max_70p/nx + "\n90% strain: " + max_90p/nx + "```";
					message.channel.send(output_test) ;

					console.log(object_list);*/

					nparser.reset();

					console.log(nstars.toString());
                    console.log(npp.toString());
					var starsline = nstars.toString().split("(");
					var ppline = npp.toString().split("(");
					var pcstarsline = pcstars.toString().split("(");
					var pcppline = pcpp.toString().split("(");
					var objc = parseInt(mapinfo.count_normal) + parseInt(mapinfo.count_slider) + parseInt(mapinfo.count_spinner);
					let mapstat = new MapStats().calc({cs: mapinfo.diff_size, ar: mapinfo.diff_approach, od: mapinfo.diff_overall, hp: mapinfo.diff_drain, mods: target[4]});
					let footer = config.avatar_list;
					const index = Math.floor(Math.random() * (footer.length - 1) + 1);
					const embed = {
						"title": mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + target[4],
						"description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/" + mapinfo.beatmapset_id + ".osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=" + mapinfo.beatmapset_id + ")" ,
						"url": "https://osu.ppy.sh/b/" + mapinfo.beatmap_id,
						"color": mapstatusread(parseInt(mapinfo.approved)),
						"footer": {
							"icon_url": footer[index],
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
								"name": `CS: ${pcmap.cs}${mapstat.cs == pcmap.cs?"":` (${mapstat.cs})`} - AR: ${pcmap.ar}${mapstat.ar == pcmap.ar?"":` (${mapstat.ar})`} - OD: ${pcmap.od}${mapstat.od == pcmap.od?"":` (${mapstat.od})`} - HP: ${pcmap.hp}${mapstat.hp == pcmap.hp?"":` (${mapstat.hp})`}`,
								"value": "BPM: " + mapinfo.bpm + " - Length: " + time(hitlength) + "/" + time(maplength) + " - Object count: " + objc
							},
							{
								"name": "Last Update: " + mapinfo.last_update + " | " + mapstatus(parseInt(mapinfo.approved)),
								"value": "Result: " + combo + "/" + mapinfo.max_combo + "x / " + acc_percent + "% / " + nmiss + " miss(es)"
							},
							{
								"name": "Droid pp (Experimental): __" + ppline[0] + "__ - " + starsline[0] ,
								"value": "PC pp: " + pcppline[0] + " - " + pcstarsline[0]
							}
						]
					};
					if (ndetail) message.channel.send(`Raw droid pp: ${npp.toString()}`);
					if (pcdetail) message.channel.send(`Raw PC pp: ${pcpp.toString()}`);
					message.channel.send({embed})
				}
			)
		})
	});
	req.end()
}

module.exports.run = (client, message, args) => {
	var beatmapid;
	var combo;
	var acc;
	var missc;
	var mod;
	var ndetail = false;
	var pcdetail = false;
	if (!args[0]) return message.channel.send("❎ **| Hey, how am I supposed to calculate when I don't know what to calculate?**");
	var a = args[0].split("/");
	beatmapid = a[a.length-1];
	for (var i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) acc = args[i];
		if (args[i].endsWith("m")) missc = args[i];
		if (args[i].endsWith("x")) combo = args[i];
		if (args[i].startsWith("+")) mod = args[i];
		if (args[i].startsWith("-d")) ndetail = true;
		if (args[i].startsWith("-p")) pcdetail = true
	}
	console.log(acc);
	var target = [beatmapid, combo, acc, missc, mod];
	getMapPP(target, message, ndetail, pcdetail)
};

module.exports.config = {
	description: "Calculates pp for an osu!standard map.",
	usage: "manualcalc <map link / map ID> [(+<mod>) (<combo>x) (<acc>%) (<miss>m) (-d) (-p)]",
	detail: "`map link/map ID`: The link or beatmap ID of the map [String/Integer]\n`mod`: Applied game modifications (HD, HR, etc) [String]\n`combo`: Max combo reached [Integer]\n`acc`: Accuracy gained [Float]\n`miss`: Amount of misses [Integer]\n`-d`: Gives detailed response of droid pp\n`-p`: Gives detailed response of pp",
	permission: "None"
};

module.exports.help = {
	name: "manualcalc"
};
