var Discord = require('discord.js');
var cd = new Set();
require('http');
let config = require('../config.json');

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (cd.has(ufind)) return message.channel.send("Please wait for a bit before using this command again!");
	let page = 1;
	if (args[0]) {
		if (isNaN(args[0]) || parseInt(args[0]) > 15) ufind = args[0];
		else if (parseInt(args[0]) <= 0) page = 1;
		else page = parseInt(args[0]);
		ufind = ufind.replace('<@!', '');
		ufind = ufind.replace('<@', '');
		ufind = ufind.replace('>', '');
	}
	if (args[1]) {
		if (isNaN(args[1]) || parseInt(args[1]) > 15 || parseInt(args[1]) <= 0) page = 1;
		else page = parseInt(args[1]);
	}
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!");
		}
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
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);

			let embed = new Discord.RichEmbed()
				.setDescription('**PP Profile for <@' + discordid + '> (' + username + ') [Page ' + page + ']**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
				.setColor(message.member.highestRole.hexColor)
				.setFooter(`Alice Synthesis Thirty | Page ${page}/15`, footer[index]);

			for (var x = 5 * (page - 1); x < 5 + 5 * (page - 1); x++) {
				if (ppentry[x]) {
					let combo = ppentry[x][3].toString();
					if (combo.indexOf("x") == -1) combo = combo + "x";
					else if (combo.indexOf(" ") != -1) combo = combo.trimRight();

					let acc = ppentry[x][4].toString();
					if (acc.indexOf('\r') != -1) acc = acc.replace(" ", "").replace("\r", "");
					else if (acc.indexOf("%") != -1) acc = parseFloat(acc.trimRight()).toFixed(2) + "%";
					else acc = acc + "%";

					let miss = ppentry[x][5].toString() + " ❌";
					embed.addField((x+1) + '. ' + ppentry[x][1], combo + ' | ' + acc + " | " + miss + " | __" + ppentry[x][2] + ' pp__ (Net pp: ' + (ppentry[x][2] * Math.pow(0.95, x)).toFixed(2) + ' pp)')
				}
				else embed.addField((x+1) + '. -', '-')
			}

			message.channel.send(embed).then(msg => {
				msg.react("⬅").then(() => {
					msg.react("➡");

					const previous = (reaction, user) => reaction.emoji.name === '⬅' && user.id === message.author.id;
					const forward = (reaction, user) => reaction.emoji.name === '➡' && user.id === message.author.id;

					const back = msg.createReactionCollector(previous, {time: 60000});
					const next = msg.createReactionCollector(forward, {time: 60000});

					back.on('collect', () => {
						if (page === 1) return;
						page--;
						embed = new Discord.RichEmbed()
							.setDescription('**PP Profile for <@' + discordid + '> (' + username + ') [Page ' + page + ']**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
							.setColor(message.member.highestRole.hexColor)
							.setFooter(`Alice Synthesis Thirty | Page ${page}/15`, footer[index]);

						for (var x = 5 * (page - 1); x < 5 + 5 * (page - 1); x++) {
							if (ppentry[x]) {
								let combo = ppentry[x][3].toString();
								if (combo.indexOf("x") == -1) combo = combo + "x";
								else if (combo.indexOf(" ") != -1) combo = combo.trimRight();

								let acc = ppentry[x][4].toString();
								if (acc.indexOf('\r') != -1) acc = acc.replace(" ", "").replace("\r", "");
								else if (acc.indexOf("%") != -1) acc = parseFloat(acc.trimRight()).toFixed(2) + "%";
								else acc = acc + "%";

								let miss = ppentry[x][5].toString() + " ❌";
								embed.addField((x+1) + '. ' + ppentry[x][1], combo + ' | ' + acc + " | " + miss + " | __" + ppentry[x][2] + ' pp__ (Net pp: ' + (ppentry[x][2] * Math.pow(0.95, x)).toFixed(2) + ' pp)')
							}
							else embed.addField((x+1) + '. -', '-')
						}
						msg.edit(embed)
					});

					next.on('collect', () => {
						if (page === 15) return;
						page++;
						embed = new Discord.RichEmbed()
							.setDescription('**PP Profile for <@' + discordid + '> (' + username + ') [Page ' + page + ']**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
							.setColor(message.member.highestRole.hexColor)
							.setFooter(`Alice Synthesis Thirty | Page ${page}/15`, footer[index]);

						for (var x = 5 * (page - 1); x < 5 + 5 * (page - 1); x++) {
							if (ppentry[x]) {
								let combo = ppentry[x][3].toString();
								if (combo.indexOf("x") == -1) combo = combo + "x";
								else if (combo.indexOf(" ") != -1) combo = combo.trimRight();

								let acc = ppentry[x][4].toString();
								if (acc.indexOf('\r') != -1) acc = acc.replace(" ", "").replace("\r", "");
								else if (acc.indexOf("%") != -1) acc = parseFloat(acc.trimRight()).toFixed(2) + "%";
								else acc = acc + "%";

								let miss = ppentry[x][5].toString() + " ❌";
								embed.addField((x+1) + '. ' + ppentry[x][1], combo + ' | ' + acc + " | " + miss + " | __" + ppentry[x][2] + ' pp__ (Net pp: ' + (ppentry[x][2] * Math.pow(0.95, x)).toFixed(2) + ' pp)')
							}
							else embed.addField((x+1) + '. -', '-')
						}
						msg.edit(embed)
					})
				})
			});
			cd.add(message.author.id);
			setTimeout(() => {
				cd.delete(message.author.id)
			}, 5000)
		}
		else message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")
	});
};

module.exports.help = {
	name: "ppcheck"
};
