var Discord = require('discord.js');
var cd = new Set();
let config = require('../config.json');

function editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck) {
	let site = "[PP Profile](https://ppboard.herokuapp.com/profile?uid=" + uid + ")";
	let mirror = "[Mirror](https://droidpp.glitch.me/profile?uid=" + uid + ")";
	let embed = new Discord.RichEmbed()
		.setDescription('**PP Profile for <@' + discordid + '> (' + username + ') [Page ' + page + '/15]**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
		.setColor(rolecheck)
		.setFooter("Alice Synthesis Thirty", footer[index]);

	for (var x = 5 * (page - 1); x < 5 + 5 * (page - 1); x++) {
		if (ppentry[x]) {
			let combo = ppentry[x][3];
			if (!combo) combo = '0x';
			combo = combo.toString();
			if (combo.indexOf("x") == -1) combo = combo + "x";
			else if (combo.indexOf(" ") != -1) combo = combo.replace(" ", "");

			let acc = ppentry[x][4];
			if (!acc) acc = '100.00%';
			acc = acc.toString();
			if (acc.indexOf('\r') != -1) acc = acc.replace(" ", "").replace("\r", "");
			else if (acc.indexOf("%") != -1) acc = parseFloat(acc.trimRight()).toFixed(2) + "%";
			else acc = acc + "%";

			let miss = ppentry[x][5];
			if (!miss) miss = '0 ❌';
			else miss = miss.toString() + " ❌";
			embed.addField((x+1) + '. ' + ppentry[x][1], combo + ' | ' + acc + " | " + miss + " | __" + ppentry[x][2] + ' pp__ (Net pp: ' + (ppentry[x][2] * Math.pow(0.95, x)).toFixed(2) + ' pp)')
		}
		else embed.addField((x+1) + '. -', '-')
	}
	return embed
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
	let ufind = message.author.id;
	if (cd.has(ufind)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
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
			var rolecheck;
			try {
				rolecheck = message.member.highestRole.hexColor
			} catch (e) {
				rolecheck = "#000000"
			}
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			let embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);

			message.channel.send(embed).then(msg => {
				msg.react("⏮️").then(() => {
					msg.react("⬅️").then(() => {
						msg.react("➡️").then(() => {
							msg.react("⏭️").catch(e => console.log(e))
						})
					})
				});

				let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
				let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
				let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
				let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

				backward.on('collect', () => {
					if (page === 1) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
					else page = 1;
					msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
					embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
					msg.edit(embed).catch(e => console.log(e))
				});

				back.on('collect', () => {
					if (page === 1) page = 15;
					else page--;
					msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
					embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
					msg.edit(embed).catch(e => console.log(e))
				});

				next.on('collect', () => {
					if (page === 15) page = 1;
					else page++;
					msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
					embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
					msg.edit(embed).catch(e => console.log(e))
				});

				forward.on('collect', () => {
					if (page === 15) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
					else page = 15;
					msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
					embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
					msg.edit(embed).catch(e => console.log(e))
				});
				
				backward.on("end", () => {
					msg.reactions.deleteAll()
				})
			});
			cd.add(message.author.id);
			setTimeout(() => {
				cd.delete(message.author.id)
			}, 10000)
		}
		else message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**")
	})
};

module.exports.config = {
	description: "Checks a user's droid pp profile.",
	usage: "ppcheck [page/user] [page]",
	detail: "`user`: The user to check [UserResolvable (mention or user ID)]\n`page`: Page to check from 1 to 15. If specified, the first argument will be treated as `user` [Integer]",
	permission: "None"
};

module.exports.help = {
	name: "ppcheck"
};
