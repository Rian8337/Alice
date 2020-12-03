const osudroid = require('osu-droid');
const fs = require('fs');
const { Db } = require('mongodb');
const { Client, Message, MessageAttachment } = require('discord.js');
const cd = new Set();

/**
 * Checks if a specific uid has played verification map.
 *
 * @param {number|string} uid The uid of the account.
 * @returns {Promise<boolean>} Whether or not the player has played the mapp (`true` or `false`).
 */
async function checkPlay(uid) {
	const play = await osudroid.Score.getFromHash({uid: uid, hash: '0eb866a0f36ce88b21c5a3d4c3d76ab0'}).catch(console.error);
	return !!play.title;
}

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = async (client, message, args, maindb) => {
	if (message.channel.type !== "text") return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
	let inter_server = client.guilds.cache.get("316545691545501706");
	let member = inter_server.member(message.author.id);
	if (!member) return message.channel.send("❎ **| I'm sorry, you must be a verified member of the osu!droid International Discord server to use this command!**");
	let role = member.roles.cache.find(r => r.name === "Member");
	if (!role) {
		if (message.guild.id === '316545691545501706') return message.channel.send("❎ **| I'm sorry, you must be a verified member to use this command!**");
		else return message.channel.send("❎ **| I'm sorry, you must be a verified member in the osu!droid International Discord server to use this command!**");
	}

	if (!args[0]) return message.channel.send("❎ **| Hey, what am I supposed to bind? Give me a username or uid!**");

	let username, uid;
	if (isNaN(args[0])) username = args[0];
	else uid = parseInt(args[0]);

	const binddb = maindb.collection("userbind");
	const player = await osudroid.Player.getInformation(uid ? {uid: uid} : {username: username});
	if (player.error) message.channel.send("❎ **| I'm sorry, I couldn't fetch the user's profile! Perhaps osu!droid server is down?**");
	if (!player.username) return message.channel.send("❎ **| I'm sorry, it looks like a player with such uid or username doesn't exist!**");

	uid = player.uid.toString();

	binddb.findOne({previous_bind: {$all: [uid]}}, async (err, res) => {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
		}
		if (!res) {
			const hasPlayed = await checkPlay(uid).catch(console.error);
			if (!hasPlayed) {
				cd.add(message.author.id);
				setTimeout(() => {
					cd.delete(message.author.id);
				}, 10000);
				fs.readFile(`${process.cwd()}/files/LiSA - crossing field (osu!droid bind verification).osz`, (err, data) => {
					if (err) {
						console.log(err);
						return message.channel.send(`❎ **| I'm sorry, I'm having trouble loading verification map!\n\n${err}**`);
					}
					const attachment = new MessageAttachment(data, 'LiSA - crossing field (osu!droid bind verification).osz');
					message.channel.send("❎ **| I'm sorry, the account hasn't played verification map yet! Please play the attached map before binding your account. This is a one-time verification and you will not be asked again in the future.\nAfter playing the verification map, please use the command again.**", {files: [attachment]});
				});
				return;
			}
			binddb.findOne({discordid: message.author.id}, (err, bindres) => {
				if (err) {
					console.log(err);
					return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
				}
				if (bindres) {
					let previous_bind = bindres.previous_bind;
					if (!previous_bind) previous_bind = [];
					if (previous_bind.length === 2) return message.channel.send("❎ **| I'm sorry, you have reached the limit of 2 binded accounts!**");

					previous_bind.push(uid);
					let updateVal = {
						$set: {
							username: player.username,
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
					});
				} else {
					let insertVal = {
						discordid: message.author.id,
						uid: uid,
						username: player.username,
						hasAskedForRecalc: false,
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
					});
				}
			});
			return;
		}

		if (res.discordid !== message.author.id) return message.channel.send("❎ **| I'm sorry, that uid has been previously binded by someone else!**");
		let updateVal = {
			$set: {
				username: player.username,
				uid: uid
			}
		};

		binddb.updateOne({discordid: message.author.id}, updateVal, err => {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
			}
			message.channel.send(`✅ **| Haii <3, binded ${message.author} to uid ${uid}.**`);
		});
	});
};

module.exports.config = {
	name: "userbind",
	description: "Binds a Discord account to an osu!droid account.",
	usage: "userbind <uid/username>",
	detail: "`uid`: The uid to bind [Integer]\n`username`: The username to bind [String]",
	permission: "None"
};