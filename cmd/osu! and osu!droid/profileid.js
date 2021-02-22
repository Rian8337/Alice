const Discord = require('discord.js');
const osudroid = require('osu-droid');
const {createCanvas, loadImage} = require('canvas');
const { Db } = require('mongodb');
const canvas = createCanvas(500, 500);
const c = canvas.getContext('2d');
c.imageSmoothingQuality = "high";

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    let uid = parseInt(args[0]);
    if (isNaN(uid)) {
		return message.channel.send("❎ **| I'm sorry, that uid is not valid!**");
	}
    const bindDb = maindb.collection("userbind");
    const scoreDb = alicedb.collection("playerscore");
	const pointDb = alicedb.collection("playerpoints");
	const query = {previous_bind: {$all: [uid.toString()]}};
	bindDb.findOne(query, async function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
		}
		let weighted_accuracy = 0;
		let weight = 0;
		if (res) {
			let pp_entries = res.pp ?? [];
			for (let i = 0; i < pp_entries.length; ++i) {
				weighted_accuracy += parseFloat(pp_entries[i].accuracy) * Math.pow(0.95, i);
				weight += Math.pow(0.95, i);
			}
			if (weighted_accuracy) {
				weighted_accuracy /= weight;
			}
		}
		const player = await osudroid.Player.getInformation({uid: uid});
		if (player.error) {
			return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
		}
		if (!player.username) {
			return message.channel.send("❎ **| I'm sorry, I couldn't find the player's profile!**");
		}
		scoreDb.findOne({uid: uid}, (err, playerres) => {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
			}
			const level = playerres?.level ?? 1;
			const score = playerres?.score ?? 0;
			pointDb.findOne({discordid: res?.discordid ?? ""}, async (err, pointres) => {
				if (err) {
					console.log(err);
					return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
				}
				const coins = pointres?.alicecoins ?? 0;
				const points = pointres?.points ?? 0;
				const pictureConfig = pointres?.picture_config ?? {};

				// background
				const backgroundImage = pictureConfig.activeBackground?.id ?? "bg";
				const bg = await loadImage(`${process.cwd()}/img/${backgroundImage}.png`);
				c.drawImage(bg, 0, 0);

				// player avatar
				const avatar = await loadImage(player.avatarURL);
				c.drawImage(avatar, 9, 9, 150, 150);

				// area
				// user profile
				c.globalAlpha = 0.9;
				c.fillStyle = '#bbbbbb';
				c.fillRect(164, 9, 327, 185);

				// player flag
				c.globalAlpha = 1;
				const flag = player.location !== "LL" ? await loadImage(`https://osu.ppy.sh/images/flags/${player.location}.png`) : undefined;
				if (flag) {
					c.drawImage(flag, 440, 15, flag.width / 1.5, flag.height / 1.5);
				}

				// player rank
				c.globalAlpha = 0.9;
				c.fillStyle = '#cccccc';
				c.fillRect(9, 164, 150, 30);

				// description box
				c.globalAlpha = 0.85;
				let bgColor = pictureConfig.bgColor;
				if (!bgColor) bgColor = 'rgb(0,139,255)';
				c.fillStyle = bgColor;
				c.fillRect(9, 197, 482, 294);

				// badges
				c.globalAlpha = 0.6;
				c.fillStyle = '#b9a29b';
				c.fillRect(15, 312, 470, 170);

				// level
				c.fillRect(77, 206, 405, 30);
				c.fillStyle = '#979797';
				c.fillRect(79, 208, 401, 26);

				let progress = (level - Math.floor(level)) * 401;
				c.globalAlpha = 1;
				c.fillStyle = '#e1c800';
				if (progress > 0) {
					c.fillRect(79, 208, progress, 26);
				}

				// alice coins
				let coinImage = await loadImage(client.emojis.cache.get("669532330980802561").url);
				c.drawImage(coinImage, 15, 255, 50, 50);

				// text
				// player rank
				c.globalAlpha = 1;
				c.font = 'bold 24px Exo';
				switch (true) {
					case player.rank === 1:
						c.fillStyle = '#0009cd';
						break;
					case player.rank <= 10:
						c.fillStyle = '#e1b000';
						break;
					case player.rank <= 100:
						c.fillStyle = 'rgba(180, 44, 44, 0.81)';
						break;
					case player.rank <= 1000:
						c.fillStyle = '#008708';
						break;
					default: c.fillStyle = '#787878';
				}
				c.fillText(`#${player.rank.toLocaleString()}`, 12, 187);

				// profile
				c.fillStyle = "#000000";
				c.font = 'bold 25px Exo';
				c.fillText(player.username, 169, 45, 243);

				c.font = '18px Exo';
				c.fillText(`Total Score: ${player.score.toLocaleString()}`, 169, 84);
				c.fillText(`Ranked Score: ${score.toLocaleString()}`, 169, 104);
				c.fillText(`Accuracy: ${player.accuracy}%${weighted_accuracy ? ` | ${weighted_accuracy.toFixed(2)}%` : ""}`, 169, 124);
				c.fillText(`Play Count: ${player.playCount.toLocaleString()}`, 169, 144);
				if (res?.pptotal) {
					c.fillText(`Droid pp: ${res.pptotal.toFixed(2)}pp`, 169, 164);
				}
				if (res?.clan) {
					c.fillText(`Clan: ${res.clan}`, 169, 184);
				}
				if (flag) {
					c.fillText(player.location, 451, flag.height + 20);
				}

				// ranked level
				const textColor = pictureConfig.textColor ?? "#000000";
				c.fillStyle = textColor;
				c.fillText(((level - Math.floor(level)) * 100).toFixed(2) + "%", 245, 226);
				c.font = '19px Exo';
				c.fillText(`Lv${Math.floor(level)}`, 15, 230);

				// alice coins
				c.fillText(`${coins.toLocaleString()} Alice Coins | ${points} Challenge Points`, 75, 285);

				// badges
				const badges = pictureConfig.activeBadges ?? [];
				if (badges.length > 0) {
					for (let i = 0; i < badges.length; i++) {
						if (!badges[i]) {
							continue;
						}
						const badge = await loadImage(`${process.cwd()}/img/badges/${badges[i]}.png`);
						if (i / 5 < 1) {
							c.drawImage(badge, i * 94 + 19.5, 312, 85, 85);
						} else {
							c.drawImage(badge, (i - 5) * 94 + 19.5, 397, 85, 85);
						}
					}
				}
				
				const attachment = new Discord.MessageAttachment(canvas.toBuffer());
				message.channel.send(`✅ **| osu!droid profile for ${player.username}:\n<http://ops.dgsrz.com/profile.php?uid=${player.uid}>**`, {files: [attachment]});
			});
		});
	});
};

module.exports.config = {
	name: "profileid",
	description: "Retrieves an droid profile based on uid (detailed).",
	usage: "profileid <uid>",
	detail: "`uid`: Uid to retrieve profile from [Integer]",
	permission: "None"
};
