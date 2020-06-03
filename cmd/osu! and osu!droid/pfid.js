const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');
const {createCanvas, loadImage} = require('canvas');
const canvas = createCanvas(500, 200);
const c = canvas.getContext("2d");
c.imageSmoothingQuality = "high";

module.exports.run = (client, message, args, maindb, alicedb) => {
    let uid = parseInt(args[0]);
    if (isNaN(uid)) return message.channel.send("❎ **| I'm sorry, that uid is not valid!**");
    const binddb = maindb.collection("userbind");
    const scoredb = alicedb.collection("playerscore");
    const pointdb = alicedb.collection("playerpoints");
    const query = {uid: uid.toString()};
    binddb.findOne(query, async function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		const player = await new osudroid.PlayerInfo().get(query);
		if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
		if (!player.name) return message.channel.send("❎ **| I'm sorry, I couldn't find the player's profile!**");
		scoredb.findOne(query, function(err, playerres) {
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
			pointdb.findOne(query, async function(err, pointres) {
				if (err) {
					console.log(err);
					return message.channel.send("Error: Empty database response. Please try again!")
				}
				let pictureConfig = {};
				if (pointres) {
					pictureConfig = pointres.picture_config;
					if (!pictureConfig) pictureConfig = {}
				}

				// background
				let backgroundImage = pictureConfig.activeBackground;
				if (!backgroundImage) backgroundImage = 'bg';
				else backgroundImage = backgroundImage.id;
				const bg = await loadImage(`./img/${backgroundImage}.png`);
				c.drawImage(bg, 0, 75, 500, 300, 0, 0, 500, 300);

				// player avatar
				const avatar = await loadImage(player.avatarURL);
				c.drawImage(avatar, 9, 9, 150, 150);

				// area
				// user profile
				c.globalAlpha = 0.9;
				c.fillStyle = '#bbbbbb';
				c.fillRect(164, 9, 327, 182);

				// player flag
				c.globalAlpha = 1;
				let flag = player.location !== "LL" ? await loadImage(`https://osu.ppy.sh/images/flags/${player.location}.png`) : undefined;
				if (flag) c.drawImage(flag, 440, 15, flag.width / 1.5, flag.height / 1.5);

				// player rank
				c.globalAlpha = 0.9;
				c.fillStyle = '#cccccc';
				c.fillRect(9, 164, 150, 27);

				// level
				c.fillRect(215, 152, 267, 30);
				c.fillStyle = '#979797';
				c.fillRect(217, 154, 263, 26);

				let progress = (level - Math.floor(level)) * 263;
				c.globalAlpha = 1;
				c.fillStyle = '#e1c800';
				if (progress > 0) c.fillRect(217, 154, progress, 26);

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
				c.font = 'bold 20px Exo';
				c.fillText(player.name, 169, 30, 243);

				c.font = '16px Exo';
				c.fillText(`Total Score: ${player.score.toLocaleString()}`, 169, 50);
				c.fillText(`Ranked Score: ${score.toLocaleString()}`, 169, 68);
				c.fillText(`Accuracy: ${player.accuracy}%`, 169, 86);
				c.fillText(`Play Count: ${player.play_count.toLocaleString()}`, 169, 104);
				if (res && res.pptotal) c.fillText(`Droid pp: ${res.pptotal.toFixed(2)}pp`, 169, 122);
				if (res && res.clan) c.fillText(`Clan: ${res.clan}`, 169, 140);
				if (flag) c.fillText(player.location, 451, flag.height + 20);

				// ranked level
				let textColor = pictureConfig.textColor;
				if (!textColor) textColor = "#000000";
				c.fillStyle = textColor;
				c.fillText(((level - Math.floor(level)) * 100).toFixed(2) + "%", 321, 173);
				c.fillText(`Lv${Math.floor(level)}`, 169, 173);

				const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'profile.png');

				let rolecheck;
				try {
					rolecheck = message.member.roles.highest.hexColor
				} catch (e) {
					rolecheck = "#000000"
				}
				const footer = config.avatar_list;
				const index = Math.floor(Math.random() * footer.length);
				const embed = new Discord.MessageEmbed()
					.setFooter("Alice Synthesis Thirty", footer[index])
					.setColor(rolecheck)
					.setAuthor(`osu!droid profile (click/tap here to view profile)`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${player.uid}`)
					.setDescription(`${res ? `**User ID**: ${res.discordid} (<@${res.discordid}>)\n` : ""}**Uid**: ${player.uid}`)
					.attachFiles([attachment])
					.setImage("attachment://profile.png")

				message.channel.send({embed: embed})
			})
		})
	})
};

module.exports.config = {
	name: "pfid",
	description: "Retrieves an droid profile based on uid.",
	usage: "pfid <uid>",
	detail: "`uid`: Uid to retrieve profile from [Integer]",
	permission: "None"
};