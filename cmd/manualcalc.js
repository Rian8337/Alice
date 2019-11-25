var droid = require("./ojsamadroid");
var osu = require("ojsama");
var https = require("https");
var request = require("request");
require("dotenv").config();
var apikey = process.env.OSU_API_KEY;

function modenum(mod) {
	var res = 4;
	if (mod.includes("HR")) res += 16;
	if (mod.includes("HD")) res += 8;
	if (mod.includes("DT")) res += 64;
	if (mod.includes("NC")) res += 576;
	if (mod.includes("NF")) res += 1;
	if (mod.includes("EZ")) res += 2;
	if (mod.includes("HT")) res += 256;
	return res;
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

function getMapPP(target, message) {

	var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + target[0]);

	var content = "";   

	var req = https.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var obj = JSON.parse(content);
			if (!obj[0]) {message.channel.send("Map not found"); return;}
			var mapinfo = obj[0];
			if (mapinfo.mode !=0) {
				message.channel.send("The beatmap is not an osu!standard beatmap");
				return;
			}
			//console.log(obj.beatmaps[0])
			if (target[4]) var mods = modenum(target[4]);
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

					if (target[4].includes("PR")) { cur_od += 4; }

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
					message.channel.send(output_test) ;*/

					//console.log(object_list);
					
					nparser.reset();
                    
					console.log(nstars.toString());
                    			console.log(npp.toString());
					var starsline = nstars.toString().split("(");
					var ppline = npp.toString().split("(");
					var pcstarsline = pcstars.toString().split("(");
					var pcppline = pcpp.toString().split("(");
					const embed = {
						"title": mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] " + target[4] + ((target[4].includes("PR")? "PR": "")),
						"description": "Download: [osu!](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download) ([no video](https://osu.ppy.sh/beatmapsets/" + mapinfo.beatmapset_id + "/download?noVideo=1)) - [Bloodcat](https://bloodcat.com/osu/_data/beatmaps/" + mapinfo.beatmapset_id + ".osz) - [sayobot](https://osu.sayobot.cn/osu.php?s=" + mapinfo.beatmapset_id + ")" ,
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
								"value": "BPM: " + mapinfo.bpm + " - Length: " + mapinfo.hit_length + "/" + mapinfo.total_length + " s"
							},
							{
								"name": "Last Update: " + mapinfo.last_update,
								"value": "Result: " + combo + "/" + mapinfo.max_combo + "x / " + acc_percent + "% / " + nmiss + " miss(es)"
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

module.exports.run = (client, message, args) => {
	var beatmapid;
	var combo;
	var acc;
	var missc;
	var mod;
	if (!args[0]) {message.channel.send("Hey at least give me the map :/"); return;}
	var a = args[0].split("/");
	beatmapid = a[a.length-1];
	for (var i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) acc = args[i];
		if (args[i].endsWith("m")) missc = args[i];
		if (args[i].endsWith("x")) combo = args[i];
		if (args[i].startsWith("+")) mod = args[i];
	}
	console.log(acc);
	var target = [beatmapid, combo, acc, missc, mod];
	getMapPP(target, message);
};

module.exports.help = {
	name: "manualcalc"
};
