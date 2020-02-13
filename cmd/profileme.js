let Discord = require('discord.js');
let config = require('../config.json');
let osudroid = require('../modules/osu!droid');

function modread(input) {
	let res = '';
	if (input.includes('n')) res += 'NF';
	if (input.includes('h')) res += 'HD';
	if (input.includes('r')) res += 'HR';
	if (input.includes('e')) res += 'EZ';
	if (input.includes('t')) res += 'HT';
	if (input.includes('c')) res += 'NC';
	if (input.includes('d')) res += 'DT';
	if (res) res = '+' + res;
	return res;
}

function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return;
	}
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
		if (!res[0]) message.channel.send("The account is not binded, he/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`");
		let uid = res[0].uid;
		new osudroid.PlayerInfo().get({uid: uid}, player => {
			if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
			if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
			let name = player.name;
			let avalink = player.avatarURL;
			let location = player.location;
			let tscore = player.score;
			let pcount = player.play_count;
			let oacc = player.accuracy;
			let rplay = player.recent_plays[0];
			let rank = player.rank;
			let date = new Date(rplay.date * 1000);
			date.setUTCHours(date.getUTCHours() + 7);
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			let embed = new Discord.RichEmbed()
				.setDescription(`**Username**: ${name}\n**Rank**: ${rank}`)
				.setColor(8102199)
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setThumbnail(avalink)
				.setAuthor("osu!droid profile (click/tap here to view profile)", "https://image.frl/p/beyefgeq5m7tobjg.jpg", `https://ops.dgsrz.com/profile.php?uid=${uid}`)
				.addField(`Total Score: ${tscore.toLocaleString()}`, `Overall Accuracy: ${oacc}%`)
				.addField(`Play Count: ${pcount}`, `Location: ${location}`)
				.addField("Most Recent Play", `${client.emojis.get(rankEmote(rplay.mark)).toString()} | ${rplay.filename} ${modread(rplay.mode)}\n${rplay.score.toLocaleString()} / ${rplay.combo}x / ${(parseFloat(rplay.accuracy) / 1000).toFixed(2)}% / ${rplay.miss}m\n${date.toUTCString()}`);

			message.channel.send({embed: embed}).catch(console.error)
		})
	})
};

module.exports.config = {
	description: "Retrieves an osu!droid profile (detailed).",
	usage: "profileme [user]",
	detail: "`user`: The user to retrieve profile from [UserResolvable (mention or user ID)]",
	permission: "None"
};

module.exports.help = {
	name: "profileme"
};
