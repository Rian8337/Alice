const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('../../modules/osu!droid');
const droid = require('../../modules/ojsamadroid');
const {createCanvas, loadImage} = require('canvas');

module.exports.run = async (client, message, args, maindb, alicedb, current_map) => {
	let beatmapid;
	let combo;
	let acc = 100;
	let missc = 0;
	let mod = '';
	let ndetail = false;
	let pcdetail = false;
	if (!args[0]) return message.channel.send("❎ **| Hey, how am I supposed to calculate when I don't know what to calculate?**");
	let a = args[0].split("/");
	beatmapid = a[a.length-1];
	for (let i = 1; i < args.length; i++) {
		if (args[i].endsWith("%")) acc = parseFloat(args[i]);
		if (args[i].endsWith("m")) missc = parseInt(args[i]);
		if (args[i].endsWith("x")) combo = parseInt(args[i]);
		if (args[i].startsWith("+")) mod = args[i].replace("+", "").toUpperCase();
		if (args[i].startsWith("-d")) ndetail = true;
		if (args[i].startsWith("-p")) pcdetail = true
	}
	const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid}).catch(console.error);

	if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
	if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
	if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
	if (!combo) combo = mapinfo.max_combo;
	let max_score = mapinfo.max_score(mod);
	let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
	let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
	let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
	let npp = osudroid.ppv2({
		stars: star.droid_stars,
		combo: combo,
		miss: missc,
		acc_percent: acc,
		mode: "droid"
	});
	let pcpp = osudroid.ppv2({
		stars: star.pc_stars,
		combo: combo,
		miss: missc,
		acc_percent: acc,
		mode: "osu"
	});
	let ppline = parseFloat(npp.toString().split(" ")[0]);
	let pcppline = parseFloat(pcpp.toString().split(" ")[0]);

	let nparser = new droid.parser();
	nparser.feed(mapinfo.osu_file);
	let map = nparser.map;
	let cur_od = map.od;
	let cur_ar = map.ar;
	let cur_cs = map.cs;

	let mods = osudroid.mods.modbits_from_string(mod);
	if (!(mods & osudroid.mods.td)) {
		mods += osudroid.mods.td
	}
	if (mods & osudroid.mods.hr) {
		mods -= osudroid.mods.hr;
		cur_od = Math.min(cur_od * 1.4, 10);
		cur_ar = Math.min(cur_ar * 1.4, 10);
		++cur_cs
	}
	if (mods & osudroid.mods.ez) {
		mods -= osudroid.mods.ez;
		cur_od /= 2;
		cur_ar /= 2;
		--cur_cs
	}

	let droidtoMS = 75 + 5 * (5 - cur_od);
	cur_cs -= 4;
	cur_od = 5 - (droidtoMS - 50) / 6;

	map.cs = cur_cs; map.ar = cur_ar; map.od = cur_od;

	let star1 = new droid.diff().calc({map: map, mods: mods});

	let npp1 = droid.ppv2({
		stars: star1,
		combo: combo,
		acc_percent: acc,
		nmiss: missc
	});

	let droidppline = parseFloat(npp1.toString().split(" ")[0]);

	let strain_list = [];
	let objects = star.pc_stars.objects;
	let max_strain = 0;
	let max_time = Math.floor(objects[objects.length - 1].obj.time / 1000);
	for (let i = 0; i < objects.length; i++) {
		let diff_object = objects[i];
		let time = Math.floor(diff_object.obj.time / 1000);
		let strain = diff_object.strains;
		let strain_squared = Math.sqrt(Math.pow(strain[0], 2) + Math.pow(strain[1], 2));
		strain_list.push({strain: strain_squared, time: time});
		if (max_strain < strain_squared) max_strain = strain_squared
	}

	let graph_height_scale = 1;
	if (max_strain > 500) graph_height_scale = 500 / max_strain;

	let graph_width_base = Math.max(1000, max_time);
	let graph_width_scale = 1;
	if (max_time < 1000) graph_width_scale = 1000 / max_time;
	const canvas = createCanvas(graph_width_base + 50, 550);
	const c = canvas.getContext('2d');

	const bg = await loadImage(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`);
	c.drawImage(bg, 0, 0, canvas.width, canvas.height);

	c.globalAlpha = 0.8;
	c.fillStyle = '#aaaaaa';
	c.fillRect(0, 0, canvas.width, canvas.height);

	c.globalAlpha = 1;
	c.fillStyle = '#000000';
	c.lineWidth = 2;
	c.beginPath();
	c.moveTo(25, 25);
	c.lineTo(25, canvas.height - 25);
	c.lineTo(canvas.width - 25, canvas.height - 25);
	c.stroke();
	c.closePath();
	c.lineWidth = 3;
	c.beginPath();
	c.moveTo(25, canvas.height - 25);
	for (let i = 1; i < strain_list.length; i++) {
		let prev_entry = strain_list[i - 1];
		let entry = strain_list[i];
		if (entry.time === prev_entry.time) continue;
		c.lineTo(entry.time * graph_width_scale + 25, canvas.height - entry.strain * graph_height_scale - 25)
	}
	c.stroke();
	c.closePath();

	let attachment = new Discord.MessageAttachment(canvas.toBuffer());
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
		.setColor(mapinfo.statusColor(mapinfo.approved))
		.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
		.setTitle(mapinfo.showStatistics(mod, 0))
		.attachFiles([attachment])
		.setDescription(mapinfo.showStatistics(mod, 1))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
		.addField(mapinfo.showStatistics(mod, 2), `${mapinfo.showStatistics(mod, 3)}\n**Max score**: ${max_score.toLocaleString()}`)
		.addField(mapinfo.showStatistics(mod, 4), `${mapinfo.showStatistics(mod, 5)}\n**Result**: ${combo}/${mapinfo.max_combo}x / ${acc}% / ${missc} miss(es)`)
		.addField(`**Fixed droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**Original droid pp**: __${droidppline} pp__ - ${starsline} stars\n**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

	let string = '';
	if (ndetail) string += `Raw droid pp: ${npp.toString()}\n`;
	if (pcdetail) string += `Raw PC pp: ${pcpp.toString()}`;
	message.channel.send(string, {embed: embed}).catch(console.error);

	let map_index = current_map.findIndex(map => map[0] === message.channel.id);
	if (map_index === -1) current_map.push([message.channel.id, mapinfo.hash]);
	else current_map[map_index][1] = mapinfo.hash;
};

module.exports.config = {
	name: "manualcalc",
	description: "Calculates pp for an osu!standard map.",
	usage: "manualcalc <map link / map ID> [(+<mod>) (<combo>x) (<acc>%) (<miss>m) (-d) (-p)]",
	detail: "`map link/map ID`: The link or beatmap ID of the map [String/Integer]\n`mod`: Applied game modifications (HD, HR, etc) [String]\n`combo`: Max combo reached [Integer]\n`acc`: Accuracy gained [Float]\n`miss`: Amount of misses [Integer]\n`-d`: Gives detailed response of droid pp\n`-p`: Gives detailed response of pp",
	permission: "None"
};