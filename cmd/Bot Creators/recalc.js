const osudroid = require('osu-droid');

function scanWhitelist(whitelist, hash) {
	return new Promise(resolve => {
		whitelist.findOne({hashid: hash}, (err, res) => {
			if (err) {
				console.log(err);
				return resolve(null)
			}
			resolve(!!res)
		})
	})
}

async function recalc(target, tlength, i, newtarget, binddb, uid, whitelist, attempt) {
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
		return;
	}
	let mods = target[i].mods;
	const mapinfo = await new osudroid.MapInfo().getInformation({hash: target[i].hash});
	attempt++;
	if (mapinfo.error) {
		console.log("API fetch error");
		if (attempt === 3) {
			attempt = 0;
			await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, attempt);
		}
		else await recalc(target, tlength, i, newtarget, binddb, uid, whitelist, attempt);
		return;
	}
	if (!mapinfo.title) {
		console.log("Map not found");
		return await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, attempt);
	}
	if (mapinfo.objects === 0) {
		console.log("0 object found");
		return await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, attempt);
	}
	if (mapinfo.approved === 3 || mapinfo.approved <= 0) {
		let isWhitelist = await scanWhitelist(whitelist, target[i][0]);
		if (isWhitelist === null) {
			console.log("Error retrieving whitelist info");
			return await recalc(target, tlength, i, newtarget, binddb, uid, whitelist, attempt);
		}
		if (!isWhitelist) {
			console.log("Map is not ranked, approved, loved, or whitelisted");
			return await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, attempt);
		}
	}
	let acc_percent = target[i].accuracy;
	let combo = target[i].combo;
	let miss = target[i].miss;
	let star = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: mods});
	let npp = new osudroid.PerformanceCalculator().calculate({
        stars: star.droidStars,
        combo: combo,
        accPercent: acc_percent,
        miss: miss,
        mode: osudroid.modes.droid
    });
	let real_pp = parseFloat(npp.toString().split(" ")[0]);
	console.log(`${target[i].pp} -> ${real_pp}`);
	newtarget.push({
		hash: target[i].hash,
		title: target[i].hash,
		pp: real_pp,
		combo: target[i].combo,
		accuracy: target[i].accuracy,
		miss: target[i].miss,
		scoreID: target[i].scoreID
	});
	attempt = 0;
	await recalc(target, tlength, i+1, newtarget, binddb, uid, whitelist, attempt);
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
		if (!res) return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
		let ppentry = res.pp;
		let attempt = 0;
		console.log(ppentry[0]);
		await recalc(ppentry, ppentry.length, 0, newppentry, binddb, uid, whitelist, attempt)
	})
};

module.exports.config = {
	name: "recalc",
	description: "Recalculates a user's droid pp profile.",
	usage: "recalc <uid>",
	detail: "`uid`: The uid to recalculate [Integer]",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};