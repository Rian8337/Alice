var droid = require("./ojsamadroid");
var osu = require("ojsama");
var https = require("https");
var mongodb = require("mongodb");
var request = require("request");
var apikey = process.env.OSU_API_KEY;

function recalc(target, tlength, i, newtarget, binddb, uid, whitelist) {

    if (i >= tlength) {
        newtarget.sort(function(a, b) {return b[2] - a[2];});
        var totalpp = 0;
        var weight = 1;
        for (x in newtarget) {
            totalpp += newtarget[x][2] * weight;
            weight *= 0.95;
        }
        console.log(totalpp.toFixed(2));
		//TODO: update database
		var updatedata = { $set : {
			pptotal: totalpp,
			pp: newtarget
		}};
        binddb.updateOne({uid: uid}, updatedata, (err, res) => {
        	if (err) return console.log(err);
			console.log("User pp is updated. Total pp:" + totalpp);
		});
		return;
    }

    if (target[i][1].includes('+'))  {
        var mapstring = target[i][1].split('+');
        var modstring = mapstring[mapstring.length-1]
    }
    else var modstring = "";

    var guessing_mode = false;

	var isWhitelist = false;

	var whitelistQuery = {hashid: target[i][0]};

	whitelist.findOne(whitelistQuery, (err, wlres) => {
		if (err) return recalc(target, tlength, i, newtarget, binddb, uid, whitelist);
		if (wlres) isWhitelist = true;

		if (isWhitelist) var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + wlres.mapid);
		else var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&h=" + target[i][0]);

		var content = "";

		var req = https.get(options, function(res) {
			res.setEncoding("utf8");
			res.on("data", function (chunk) {
				content += chunk;
			});
			res.on("error", err1 => {
				console.log(err1);
				return recalc(target, tlength, i, newtarget, binddb, uid, whitelist)
			});
			res.on("end", function () {
				var obj = JSON.parse(content);
				if (!obj[0]) {console.log("Map not found"); return recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist)}
				var mapinfo = obj[0];
				if (mapinfo.mode !=0) return;
				//console.log(obj.beatmaps[0])
				if (modstring) var mods = droid.modbits.from_string(modstring) + 4;
				else var mods = 4;
				if (target[i][4]) var acc_percent = parseFloat(target[i][4]);
				else {var acc_percent = 100; guessing_mode = true;}
				if (target[i][3]) var combo = parseInt(target[i][3]);
				else var combo;
				if (target[i][5]) var nmiss = parseInt(target[i][5]);
				else var nmiss = 0;
				var parser = new osu.parser();
				var nparser = new droid.parser();
				//console.log(acc_percent);
				//var url = "https://osu.ppy.sh/osu/1031991";
				var url = 'https://osu.ppy.sh/osu/' + mapinfo.beatmap_id;
				request(url, function (err, response, data) {
						parser.feed(data);
						nparser.feed(data);
						var map = parser.map;
						var nmap = nparser.map;
						var cur_od = map.od - 5;
						var cur_ar = map.ar;
						var cur_cs = map.cs - 4;
						// if (mods) {
						// 	console.log("+" + osu.modbits.string(mods));
						// }
						if (modstring.includes("HR")) {
							mods -= 16;
							cur_ar = Math.min(cur_ar*1.4, 10);
							cur_od = Math.min(cur_od*1.4, 5);
							cur_cs += 1;
						}

						if (modstring.includes("PR")) { cur_od += 4; }

						map.od = cur_od; map.ar = cur_ar; map.cs = cur_cs;
						nmap.od = cur_od; nmap.ar = cur_ar; nmap.cs = cur_cs;

						if (map.ncircles == 0 && map.nsliders == 0) {
							console.log(target[i][0] + ' - Error: no object found');
							console.log(target[i][2] + " -> " + target[i][2]);
							newtarget.push([target[i][0], target[i][1], target[i][2], target[i][3], target[i][4], target[i][5]]);
							recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist);
							return
						}

						var stars = new osu.diff().calc({map: map, mods: mods});
						var nstars = new droid.diff().calc({map: nmap, mods: mods});
						//console.log(stars.toString());


						var pp = osu.ppv2({
							stars: stars,
							combo: combo,
							nmiss: nmiss,
							acc_percent: acc_percent,
						});

						var npp = droid.ppv2({
							stars: nstars,
							combo: combo,
							nmiss: nmiss,
							acc_percent: acc_percent,
						});

						parser.reset();
						nparser.reset();
						if (modstring.includes("HR")) { mods += 16; }

						//console.log(stars.toString() + ' -> '+ nstars.toString());
						//console.log(pp.toString() + ' -> '+ npp.toString());
						parseFloat(pp.toString().split('(')[0]);
						var newpp = parseFloat(npp.toString().split('(')[0]);
						// console.log(acc_percent);
						// console.log(guessing_mode);
						var real_pp;
						if (guessing_mode) {real_pp = parseFloat(target[i][2]); real_pp = real_pp.toFixed(2)}
						else real_pp = newpp;
						console.log(target[i][2] + " -> " + real_pp);
						if (guessing_mode) newtarget.push([target[i][0], target[i][1], real_pp]);
						else newtarget.push([target[i][0], target[i][1], real_pp, target[i][3], target[i][4], target[i][5]]);
						recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist)
					}

				)
			})
		});
		req.end()
	})
}

module.exports.run = (client, message, args, maindb) => {
	try {
		let rolecheck = message.member.roles
	} catch (e) {
		return
	}
	if (message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
	var binddb = maindb.collection("userbind");
	let whitelist = maindb.collection("mapwhitelist");
    binddb.find({}.toArray((err, res) => {
        if (err) {
        	console.log(err);
        	return message.channel.send("Error: Empty database response. Please try again!")
		}
		res.forEach(player => {
			var ppentry = res.pp;
			if (ppentry) {
				var newppentry = [];
				var name = player.username;
				var uid = player.uid;
				console.log(name);
				recalc(ppentry, ppentry.length, 0, newppentry, binddb, uid, whitelist);
			}
			else console.log("Player pp not found");
		})
	}))
};

module.exports.help = {
	name: "recalcall"
};
