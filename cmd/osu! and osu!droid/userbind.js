const Discord = require('discord.js');
const osudroid = require('osu-droid');

/**
 * Checks if a specific uid has played verification map.
 *
 * @param {number|string} uid The uid of the account
 * @returns {Promise<boolean>}
 */
async function checkPlay(uid) {
	const play = await new osudroid.PlayInfo().getFromHash({uid: uid, hash: '0eb866a0f36ce88b21c5a3d4c3d76ab0'}).catch(console.error);
	return !!play.title;
}

module.exports.run = async (client, message, args, maindb) => {
	if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs!**");
	let inter_server = client.guilds.cache.get("316545691545501706");
	let member = inter_server.member(message.author.id);
	if (!member) return message.channel.send("❎ **| I'm sorry, you must be a verified member of the osu!droid International Discord server to use this command!**");
	let role = member.roles.cache.find(r => r.name === "Member");
	if (!role) {
		if (message.guild.id === '316545691545501706') return message.channel.send("❎ **| I'm sorry, you must be a verified member to use this command!**");
		else return message.channel.send("❎ **| I'm sorry, you must be a verified member in the osu!droid International Discord server to use this command!**");
	}

	let uid = parseInt(args[0]);
	if (!uid) return message.channel.send("❎ **| What am I supposed to bind? Give me a uid!**");
	if (isNaN(uid)) return message.channel.send("❎ **| Invalid uid.**");

	let binddb = maindb.collection("userbind");
	const player = await new osudroid.PlayerInfo().get({uid: uid});
	if (!player.name) return message.channel.send("❎ **| I'm sorry, it looks like a player with such uid doesn't exist! Perhaps osu!droid server is down?**");

	uid = uid.toString();

	binddb.findOne({previous_bind: {$all: [uid]}}, async (err, res) => {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res) {
			const hasPlayed = await checkPlay(uid).catch(console.error);
			if (!hasPlayed) return message.channel.send("❎ **| I'm sorry, the account hasn't played verification map yet! Please play this map before binding the account:\nhttps://drive.google.com/open?id=11lboYlvCv8rHfYOI3YvJEQXDUrzQirdr\n\nThis is a one-time verification and you will not be asked again in the future.**");
			binddb.findOne({discordid: message.author.id}, (err, bindres) => {
				if (err) {
					console.log(err);
					return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
				}
				if (bindres) {
					let previous_bind = bindres.previous_bind;
					if (previous_bind.length === 2) return message.channel.send("❎ **| I'm sorry, you have reached the limit of 2 binded accounts!**");

					previous_bind.push(uid);
					let updateVal = {
						$set: {
							uid: uid,
							previous_bind: previous_bind
						}
					};
					binddb.updateOne({discordid: message.author.id}, updateVal, err => {
						if (err) {
							console.log(err);
							return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
						}
						message.channel.send(`✅ **| Haii <3, binded ${message.author} to uid ${uid}.**`);
					})
				} else {
					let insertVal = {
						discordid: message.author.id,
						uid: uid,
						username: player.username,
						pptotal: 0,
						playc: 0,
						pp: [],
						previous_bind: [uid],
						clan: ""
					};
					binddb.insertOne(insertVal, err => {
						if (err) {
							console.log(err);
							return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
						}
						message.channel.send(`✅ **| Haii <3, binded ${message.author} to uid ${uid}.**`);
					})
				}
			});
			return
		}

		if (res.discordid !== message.author.id) return message.channel.send("❎ **| I'm sorry, that uid has been previously binded by someone else!**");
		let updateVal = {
			$set: {
				uid: uid
			}
		};

		binddb.updateOne({discordid: message.author.id}, updateVal, err => {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
			}
			message.channel.send(`✅ **| Haii <3, binded ${message.author} to uid ${uid}.**`);
		})
	})
};

module.exports.config = {
	name: "userbind",
	description: "Binds a Discord account to an osu!droid account. ",
	usage: "userbind <uid>",
	detail: "`uid`: The uid to bind [Integer]",
	permission: "None"
};