const Discord = require('discord.js');
const cd = new Set();
const config = require('../../config.json');

function editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck) {
	let site = "[PP Profile](https://ppboard.herokuapp.com/profile?uid=" + uid + ")";
	let mirror = "[Mirror](https://droidpp.glitch.me/profile?uid=" + uid + ")";
	let embed = new Discord.MessageEmbed()
		.setDescription('**PP Profile for <@' + discordid + '> (' + username + ') [Page ' + page + '/15]**\nTotal PP: **' + pp + " pp**\n" + site + " - " + mirror)
		.setColor(rolecheck)
		.setFooter("Alice Synthesis Thirty", footer[index]);

	for (let x = 5 * (page - 1); x < 5 + 5 * (page - 1); x++) {
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
	binddb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!");
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = res.uid;
		let username = res.username;
		let discordid = res.discordid;
		let pp = 0;
		let ppentry = [];
		if (res.pptotal) pp = res.pptotal.toFixed(2);
		if (res.pp) ppentry = res.pp;
		let rolecheck;
		try {
			rolecheck = message.member.roles.highest.hexColor
		} catch (e) {
			rolecheck = "#000000"
		}
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		let embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);

		message.channel.send({embed: embed}).then(msg => {
			msg.react("⏮️").then(() => {
				msg.react("⬅️").then(() => {
					msg.react("➡️").then(() => {
						msg.react("⏭️").catch(console.error)
					})
				})
			});

			let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
			let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
			let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
			let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

			backward.on('collect', () => {
				if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = 1;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			back.on('collect', () => {
				if (page === 1) page = 15;
				else page--;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			next.on('collect', () => {
				if (page === 15) page = 1;
				else page++;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			forward.on('collect', () => {
				if (page === 15) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = 15;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(page, pp, ppentry, discordid, uid, username, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			backward.on("end", () => {
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
			})
		});
		cd.add(message.author.id);
		setTimeout(() => {
			cd.delete(message.author.id)
		}, 10000)

	})
};

module.exports.config = {
	name: "ppcheck",
	description: "Checks a user's droid pp profile.",
	usage: "ppcheck [page/user] [page]",
	detail: "`user`: The user to check [UserResolvable (mention or user ID)]\n`page`: Page to check from 1 to 15. If specified, the first argument will be treated as `user` [Integer]",
	permission: "None"
};