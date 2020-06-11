const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

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
		if (args[i].endsWith("%")) {
                        const new_acc = parseFloat(args[i]);
                        if (!isNaN(new_acc)) acc = Math.max(0, Math.min(new_acc, 100))
                }
		if (args[i].endsWith("m")) {
                        const new_missc = parseInt(args[i]);
                        if (!isNaN(new_missc)) missc = Math.max(0, new_missc)
                }
		if (args[i].endsWith("x")) {
                        const new_combo = parseInt(args[i]);
                        if (!isNaN(new_combo)) combo = Math.max(0, new_combo)
                }
		if (args[i].startsWith("+")) mod = args[i].replace("+", "").toUpperCase();
		if (args[i].startsWith("-d")) ndetail = true;
		if (args[i].startsWith("-p")) pcdetail = true
	}
	const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmapid});
	if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
	if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
	if (!mapinfo.objects) return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
	if (!mapinfo.osu_file) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! servers. Please try again!**");
	if (!combo) combo = mapinfo.max_combo - missc;
        if (combo <= 0) return message.channel.send("❎ **| Hey, the specified miss count is more than or equal to the specified combo or the beatmap's maximum combo!**");
        combo = Math.min(combo, mapinfo.max_combo);
        let acc_estimation = false;
        if (acc === 100 && missc > 0) {
                acc_estimation = true;
                const real_acc = new osudroid.Accuracy({
                        n300: mapinfo.objects - missc,
                        n100: 0,
                        n50: 0,
                        nmiss: missc,
                        nobjects: mapinfo.objects
                }).value() * 100;
                acc = parseFloat(real_acc.toFixed(2))
        }

	let max_score = mapinfo.max_score(mod);
	let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: mod});
	let starsline = parseFloat(star.droid_stars.total.toFixed(2));
	let pcstarsline = parseFloat(star.pc_stars.total.toFixed(2));
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
	let ppline = parseFloat(npp.total.toFixed(2));
	let pcppline = parseFloat(pcpp.total.toFixed(2));

	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}l.jpg`)
		.setColor(mapinfo.statusColor())
		.setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
		.setImage(`https://assets.ppy.sh/beatmaps/${mapinfo.beatmapset_id}/covers/cover.jpg`)
		.setTitle(mapinfo.showStatistics(mod, 0))
		.setDescription(mapinfo.showStatistics(mod, 1))
		.setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
		.addField(mapinfo.showStatistics(mod, 2), `${mapinfo.showStatistics(mod, 3)}\n**Max score**: ${max_score.toLocaleString()}`)
		.addField(mapinfo.showStatistics(mod, 4), `${mapinfo.showStatistics(mod, 5)}\n**Result**: ${combo}/${mapinfo.max_combo}x / ${acc}%${acc_estimation ? " (estimated)" : ""} / ${missc} miss(es)`)
		.addField(`**Droid pp (Experimental)**: __${ppline} pp__ - ${starsline} stars`, `**PC pp**: ${pcppline} pp - ${pcstarsline} stars`);

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
