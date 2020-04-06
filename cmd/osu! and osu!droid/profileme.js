const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');
const {createCanvas, loadImage} = require('canvas');
const canvas = createCanvas(500, 500);
const c = canvas.getContext('2d');
c.imageSmoothingQuality = "high";

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
				let score = 0;
				if (playerres) {
					score = playerres.score;
					level = playerres.level;
				}
				pointdb.findOne({uid: uid}, async (err, pointres) => {
					if (err) {
						console.log(err);
						return message.channel.send("Error: Empty database response. Please try again!")
					}
					let coins = 0;
					let points = 0;
					let pictureConfig = {};
					if (pointres) {
						points = pointres.points;
						coins = pointres.alicecoins;
						pictureConfig = pointres.picture_config;
						if (!pictureConfig) pictureConfig = {}
					}

					// background
					let backgroundImage = pictureConfig.activeBackground;
					if (!backgroundImage) backgroundImage = 'bg';
					else backgroundImage = backgroundImage.id;
					const bg = await loadImage(`./img/${backgroundImage}.png`);
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
					if (player.location !== "LL") {
                                            const flag = await loadImage(`https://osu.ppy.sh/images/flags/${player.location}.png`);
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
					if (progress > 0) c.fillRect(79, 208, progress, 26);

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
						default: c.fillStyle = '#787878'
					}
					c.fillText(`#${player.rank.toLocaleString()}`, 12, 187);

					// profile
					c.fillStyle = "#000000";
					c.font = 'bold 25px Exo';
					c.fillText(player.name, 169, 45, 243);

					c.font = '18px Exo';
					c.fillText(`Total Score: ${player.score.toLocaleString()}`, 169, 84);
					c.fillText(`Ranked Score: ${score.toLocaleString()}`, 169, 104);
					c.fillText(`Accuracy: ${player.accuracy}%`, 169, 124);
					c.fillText(`Play Count: ${player.play_count.toLocaleString()}`, 169, 144);
					c.fillText(`Droid pp: ${pp.toFixed(2)}pp`, 169, 164);
					if (res.clan) c.fillText(`Clan: ${res.clan}`, 169, 184);
					if (player.location !== "LL") c.fillText(player.location, 451, flag.height + 20);

					// ranked level
					let textColor = pictureConfig.textColor;
					if (!textColor) textColor = "#000000";
					c.fillStyle = textColor;
					c.fillText(((level - Math.floor(level)) * 100).toFixed(2) + "%", 245, 226);
					c.font = '19px Exo';
					c.fillText(`Lv${Math.floor(level)}`, 15, 230);

					// alice coins
					c.fillText(`${coins.toLocaleString()} Alice Coins | ${points} Challenge Points`, 75, 285);

					// badges
					let badges = pictureConfig.activeBadges;
					if (!badges) badges = [];
					if (badges.length > 0) {
						for (let i = 0; i < badges.length; i++) {
							let badge = await loadImage(`./img/badges/${badges[i].id}.png`);
							if (i / 5 < 1) c.drawImage(badge, i * 94 + 19.5, 312, 85, 85);
							else c.drawImage(badge, (i - 5) * 94 + 19.5, 397, 85, 85)
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
