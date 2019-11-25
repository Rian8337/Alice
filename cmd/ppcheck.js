var Discord = require('discord.js');
require('http');
require('mongodb');

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
		if (err) throw err;
		if (res[0]) {
			var uid = res[0].uid;
			var username = res[0].username;
			var discordid = res[0].discordid;
			var pp = 0;
			var ppentry = [];
			if (res[0].pptotal) pp = res[0].pptotal.toFixed(2);
			if (res[0].pp) ppentry = res[0].pp;

			let site = "[PP Profile](https://ppboard.herokuapp.com/profile?uid=" + uid + ")";
			let mirror = "[Mirror](https://droidppboard.herokuapp.com/profile?uid=" + uid + ")";

			const embed = new Discord.RichEmbed()
				.setDescription('**PP Profile for <@' + discordid + '> (' + username + ')**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
				.setColor(message.member.highestRole.hexColor)
				.setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg");

			for (var x = 0; x < 5; x++) {
				if (ppentry[x]) {
					let combo = ppentry[x][3].toString();
					if (combo.indexOf("x") == -1) combo = combo + "x";

					let acc = ppentry[x][4].toString();
					if (acc.indexOf('\r') != -1) acc = acc.replace(" ", "").replace("\r", "");
					else if (acc.indexOf("%") != -1) acc = parseFloat(acc.trimRight()).toFixed(2) + "%";
					else acc = acc + "%";

					let miss = ppentry[x][5].toString() + " miss(es)";
					embed.addField((x+1) + '. ' + ppentry[x][1], combo + ' | ' + acc + " | " + miss + " | __" + ppentry[x][2] + ' pp__')
				}
				else embed.addField((x+1) + '. -', '-')
			}

			message.channel.send(embed);
		}
		else message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
	});
};

module.exports.help = {
	name: "ppcheck"
};