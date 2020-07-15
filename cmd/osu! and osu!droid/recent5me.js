const Discord = require('discord.js');
const cd = new Set();
const config = require('../../config.json');
const osudroid = require('osu-droid');

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
		default : return
	}
}

function editpp(client, rplay, name, page, footer, index, rolecheck) {
	let embed = new Discord.MessageEmbed()
		.setDescription("Recent play for **" + name + " (Page " + page + "/10)**")
		.setColor(rolecheck)
		.setFooter("Alice Synthesis Thirty", footer[index]);

	for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
		if (!rplay[i]) break;
		let date = rplay[i].date;
		let play = client.emojis.cache.get(rankEmote(rplay[i].rank)).toString() + " | " + rplay[i].title + `${rplay[i].mods ? ` +${rplay[i].mods}` : ""}`;
		let score = rplay[i].score.toLocaleString() + ' / ' + rplay[i].combo + 'x / ' + rplay[i].accuracy + '% / ' + rplay[i].miss + ' miss(es) \n `' + date.toUTCString() + '`';
		embed.addField(play, score)
	}
	return embed
}

module.exports.run = (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
	let ufind = message.author.id;
	if (cd.has(ufind)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
	let page = 1;
	if (args[0]) {
		if (isNaN(args[0]) || parseInt(args[0]) > 10) ufind = args[0];
		else if (parseInt(args[0]) <= 0) page = 1;
		else page = parseInt(args[0]);
		ufind = ufind.replace('<@!', '');
		ufind = ufind.replace('<@', '');
		ufind = ufind.replace('>', '');
	}
	if (args[1]) {
		if (isNaN(args[1]) || parseInt(args[1]) > 10 || parseInt(args[1]) <= 0) page = 1;
		else page = parseInt(args[1]);
	}

	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.findOne(query, async function (err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res) {
			if (args[0]) message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**")
			else message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
			return
		}
		let uid = res.uid;
		const player = await new osudroid.Player().get({uid: uid});
		if (player.error) {
			if (args[0]) message.channel.send("❎ **| I'm sorry, I couldn't fetch the user's profile! Perhaps osu!droid server is down?**");
			else message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
			return
		}
		if (!player.name) {
			if (args[0]) message.channel.send("❎ **| I'm sorry, I couldn't find the user's profile!**");
			else message.channel.send("❎ **| I'm sorry, I couldn't find your profile!**");
			return
		}
		if (player.recent_plays.length === 0) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
		let name = player.name;
		let rplay = player.recent_plays;
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		let rolecheck;
		try {
			rolecheck = message.member.roles.color.hexColor
		} catch (e) {
			rolecheck = "#000000"
		}
		let embed = editpp(client, rplay, name, page, footer, index, rolecheck);

		message.channel.send({embed: embed}).then(msg => {
			msg.react("⏮️").then(() => {
				msg.react("⬅️").then(() => {
					msg.react("➡️").then(() => {
						msg.react("⏭️").catch(e => console.log(e))
					})
				})
			});

			let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
			let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
			let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
			let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});

			backward.on('collect', () => {
				if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = 1;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(client, rplay, name, page, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			back.on('collect', () => {
				if (page === 1) page = 10;
				else page--;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(client, rplay, name, page, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			next.on('collect', () => {
				if (page === 10) page = 1;
				else page++;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(client, rplay, name, page, footer, index, rolecheck);
				msg.edit({embed: embed}).catch(console.error)
			});

			forward.on('collect', () => {
				if (page === 10) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				else page = 10;
				msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
				embed = editpp(client, rplay, name, page, footer, index, rolecheck);
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
	name: "recent5me",
	description: "Retrieves a user's recent plays.",
	usage: "recent5me [user] [page]",
	detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]\n`page`: The page to view from 1 to 10 [Integer]",
	permission: "None"
};