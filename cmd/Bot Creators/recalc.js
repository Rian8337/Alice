const osudroid = require('osu-droid');

async function recalc(target, tlength, i, newtarget, binddb, uid, whitelist) {
	if (i >= tlength) {
		newtarget.sort(function(a, b) {return b[2] - a[2];});
		let totalpp = 0;
		let weight = 1;
		for (let x of newtarget) {
			totalpp += x[2] * weight;
			weight *= 0.95;
		}
		console.log(totalpp.toFixed(2));
		let updatedata = {
			$set : {
				pptotal: totalpp,
				pp: newtarget
			}
		};
		binddb.updateOne({uid: uid}, updatedata, (err) => {
			if (err) return console.log(err);
			console.log("User pp is updated. Total pp:" + totalpp);
		});
		return
	}
	let mods = '';
	if (target[i][1].includes('+'))  {
		let mapstring = target[i][1].split('+');
		mods = mapstring[mapstring.length-1];
		if (mods.includes("]")) mods = ''
	}

	let guessing_mode = true;
	let whitelistQuery = {hashid: target[i][0]};

	whitelist.findOne(whitelistQuery, async (err, wlres) => {
		let query = {hash: target[i][0]};
		if (err) return await recalc(target, tlength, i, newtarget, binddb, uid, whitelist);
		if (wlres) query = {beatmap_id: wlres.mapid};
		const mapinfo = await new osudroid.MapInfo().get(query);
		if (!mapinfo.title) {
			console.log("Map not found");
			return await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist)
		}
		if (mapinfo.objects === 0) {
			console.log("0 object found");
			return recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist)
		}
		let acc_percent = 100;
		if (target[i][4]) {
			acc_percent = parseFloat(target[i][4]);
			guessing_mode = false;
		}
		let combo = target[i][3] ? parseInt(target[i][3]) : mapinfo.max_combo;
		let miss = target[i][5] ? parseInt(target[i][5]) : 0;
		let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mods});
		let npp = osudroid.ppv2({
			stars: star.droid_stars,
			combo: combo,
			acc_percent: acc_percent,
			miss: miss,
			mode: "droid"
		});
		let pp = parseFloat(npp.toString().split(" ")[0]);
		let real_pp = guessing_mode ? parseFloat(target[i][2]).toFixed(2) : pp;
		console.log(`${target[i][2]} -> ${real_pp}`);
		newtarget.push(guessing_mode ? [target[i][0], target[i][1], real_pp] : [target[i][0], target[i][1], real_pp, target[i][3], target[i][4], target[i][5]]);
		await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist)
	})
}

module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
	let uid = args[0];
	let newppentry = [];
	let binddb = maindb.collection("userbind");
	let whitelist = maindb.collection("mapwhitelist");
	binddb.findOne({uid: uid}, async function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, I cannot find the user's profile!**");
		let ppentry = res.pp;
		console.log(ppentry[0]);
		await recalc(ppentry, ppentry.length, 0, newppentry, binddb, uid, whitelist)
	})
};

module.exports.config = {
	name: "recalc",
	description: "Recalculates a user's droid pp profile.",
	usage: "recalc <uid>",
	detail: "`uid`: The uid to recalculate [Integer]",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};