const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');
const {createCanvas, loadImage} = require('canvas');
const canvas = createCanvas(300, 300);
const c = canvas.getContext('2d');

module.exports.run = (client, message, args, maindb, alicedb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "");
	}
	let binddb = maindb.collection("userbind");
	let scoredb = alicedb.collection("playerscore");
	let pointdb = alicedb.collection("playerpoints");
	let query = { discordid: ufind };
	binddb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = res.uid;
		let pp = res.pptotal;
		new osudroid.PlayerInfo().get({uid: uid}, player => {
			if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
			scoredb.findOne({uid: uid}, (err, playerres) => {
				if (err) {
					console.log(err);
					return message.channel.send("Error: Empty database response. Please try again!")
				}
				let level = 1;
				if (playerres) level = playerres.level;
				let next_level = Math.floor(level) + 1;
				pointdb.findOne({uid: uid}, async (err, pointres) => {
					if (err) {
						console.log(err);
						return message.channel.send("Error: Empty database response. Please try again!")
					}
					let coins = 0;
                    let pictureConfig = {};
                    if (pointres) {
                        coins = pointres.alicecoins;
                        pictureConfig = pointres.picture_config
                    }
					
					// background
					let backgroundImage = pictureConfig.activeBackground;
					if (!backgroundImage) backgroundImage = 'bg';
					else backgroundImage = backgroundImage.id;
					const bg = await loadImage(`./img/${backgroundImage}.png`);
					c.drawImage(bg, 0, 0);

					// player avatar
					const avatar = await loadImage(player.avatarURL);
					c.drawImage(avatar, 9, 9, 70, 70);

					// area
					c.globalAlpha = 0.7;
					c.fillStyle = '#bbbbbb';
					c.fillRect(84, 9, 207, 95);

					c.globalAlpha = 0.9;
					c.fillStyle = '#cccccc';
					c.fillRect(9, 84, 70, 20);

					c.globalAlpha = 0.8;
					let bgColor = pictureConfig.bgColor;
					if (!bgColor) bgColor = 'rgb(0,139,255)';
					c.fillStyle = bgColor;
					c.fillRect(9, 109, 282, 182);

					c.globalAlpha = 0.6;
					c.fillStyle = '#b9a29b';
					c.fillRect(15, 191, 270, 90);

					c.fillRect(50, 115, 195, 20);
					c.fillStyle = '#979797';
					c.fillRect(52, 117, 191, 16);

					let progress = (level - Math.floor(level)) * 191;
					c.globalAlpha = 0.9;
					c.fillStyle = '#e1c800';
					if (progress > 0) c.fillRect(52, 117, progress, 16);

					// line
					c.globalAlpha = 0.7;
					c.fillStyle = '#000000';
					c.beginPath();
					c.moveTo(15, 236);
					c.lineTo(285, 236);
					for (let i = 60; i < 285; i += 45) {
						c.moveTo(i, 191);
						c.lineTo(i, 281)
					}
					c.stroke();

					// player flag
					c.globalAlpha = 1;
					const flag = await loadImage(`https://osu.ppy.sh/images/flags/${player.location}.png`);
					c.drawImage(flag, 253, 12, flag.width / 2, flag.height / 2);

					// text
					// player rank
					c.font = 'bold 14px Exo';
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
						default: c.fillStyle = '#787878'
					}
					c.fillText(`#${player.rank.toLocaleString()}`, 12, 99);

					// profile
					c.fillStyle = "#000000";
					c.font = 'bold 15px Exo';
					c.fillText(player.name, 89, 24, 243);

					c.font = '13px Exo';
					c.fillText(`Score: ${player.score.toLocaleString()}`, 89, 39, 243);
					c.fillText(`Accuracy: ${player.accuracy}%`, 89, 53, 243);
					c.fillText(`Play Count: ${player.play_count.toLocaleString()}`, 89, 67, 243);
					c.fillText(player.location, 265, flag.height + 5);
					c.fillText(`Droid pp: ${pp.toFixed(2)}pp`, 89, 81, 243);
					if (res.clan) c.fillText(`Clan: ${res.clan}`, 89, 95, 243);

					// ranked level
					let textColor = pictureConfig.textColor;
					if (!textColor) textColor = "#000000";
					c.fillStyle = textColor;
					c.font = '11px Exo';
					c.fillText(`Lv${Math.floor(level)}`, 15, 128.5);
					c.fillText(`Lv${next_level}`, 255, 128.5);

					// alice coins
					let coinImage = await loadImage(client.emojis.cache.get("669532330980802561").url);
					c.drawImage(coinImage, 15, 145, 30, 30);
					c.font = '12px Exo';
					c.fillText(`${coins.toLocaleString()} Alice Coins`, 50, 165);

					// badges
					let badges = pictureConfig.activeBadges;
					if (!badges) badges = [];
					if (badges.length > 0) {
						for (let i = 0; i < badges.length; i++) {
							let badge = await loadImage(`./img/badges/${badges[i].id}.png`);
							if (i % 2 === 0) c.drawImage(badge, Math.floor(i / 2) * 45 + 15, 191, 45, 45);
							else c.drawImage(badge, Math.floor(i / 2) * 45 + 15, 236, 45, 45)
						}
					}
					let attachment = new Discord.MessageAttachment(canvas.toBuffer());
					message.channel.send(attachment)
				})
			})
		})
	})
};

module.exports.config = {
	name: "profileme",
	description: "Retrieves an droid profile (detailed).",
	usage: "profileme [user]",
	detail: "`user`: The user to retrieve profile from [UserResolvable (mention or user ID)]",
	permission: "None"
};
