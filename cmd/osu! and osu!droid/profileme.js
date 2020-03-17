const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');
const {createCanvas, loadImage} = require('canvas');
const canvas = createCanvas(300, 300);
const c = canvas.getContext('2d');

function modread(input) {
	let res = '';
	if (input.includes('n')) res += 'NF';
	if (input.includes('h')) res += 'HD';
	if (input.includes('r')) res += 'HR';
	if (input.includes('e')) res += 'EZ';
	if (input.includes('t')) res += 'HT';
	if (input.includes('c')) res += 'NC';
	if (input.includes('d')) res += 'DT';
	if (res) res = '+' + res;
	return res;
}

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
		default : return;
	}
}

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace("<@!", "").replace("<@", "").replace(">", "");
	}
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res) message.channel.send("The account is not binded, he/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`");
		let uid = res.uid;
		let pp = res.pptotal;
		new osudroid.PlayerInfo().get({uid: uid}, async player => {
			if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
			if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
			let rplay = player.recent_plays[0];
			let date = new Date(rplay.date * 1000);
			date.setUTCHours(date.getUTCHours() + 7);

			// background
			const bg = await loadImage('./img/bg.png');
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
			c.fillStyle = '#bba300';
			c.fillRect(9, 109, 282, 182);

			// player flag
			c.globalAlpha = 1;
			const flag = await loadImage(`https://osu.ppy.sh/images/flags/${player.location}.png`);
			c.drawImage(flag, 253, 12, flag.width / 2, flag.height / 2);

			// text
			// profile
			c.fillStyle = '#000000';
			c.font = 'bold 15px Exo';
			c.fillText(player.name, 89, 24, 243);

			c.font = '13px Exo';
			c.fillText(`Score: ${player.score.toLocaleString()}`, 89, 39, 243);
			c.fillText(`Accuracy: ${player.accuracy}%`, 89, 54, 243);
			c.fillText(`Play Count: ${player.play_count.toLocaleString()}`, 89, 69, 243);
			c.fillText(player.location, 263, flag.height + 5);
			c.fillText(`Droid pp: ${pp.toFixed(2)}pp`, 89, 84, 243);

			c.font = 'bold 14px Exo';
			c.globalAlpha = 1;
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

			// recent play
			c.fillStyle = "#000000";
			c.font = 'bold 15px Exo';
			c.fillText("Most Recent Play", 15, 127);

			c.font = '13px Exo';
			let mod = osudroid.mods.droid_to_PC(rplay.mode);
			let recent = `${rplay.filename}${mod ? ` +${mod}` : ""}`;

			let index = 0;
			if (recent.length >= 40) {
				c.font = '12px Exo';
				let text_parts = recent.split(" ");
				for (let i = 0; i < text_parts.length; ++index) {
					let text = '';
					while (text.length < 40) {
						if (!text_parts[i]) break;
						text += text_parts[i] + " ";
						++i
					}
					text = text.trimEnd();
					if (text.length > 40) {
						text = text.split(" ").slice(0, -2).join(" ");
						--i
					}
					c.fillText(text, 37, index * 14 + 145)
				}
			} else c.fillText(recent, 37, 145, 243);

			--index;
			const rankImage = await loadImage(osudroid.rankImage.get(rplay.mark));
			c.drawImage(rankImage, 12, Math.max(0, index - 1) * 6 + 135, 20, 25);

			let default_multiplier = 13;
			while (Math.max(0, index) * default_multiplier + 221 > 282) --default_multiplier;
			let y_pos = Math.max(0, index) * default_multiplier;

			c.font = '12px Exo';
			c.fillText(`Score: ${rplay.score.toLocaleString()}`, 12, y_pos + 165);
			c.fillText(`Combo: ${rplay.combo}x`, 12, y_pos + 179);
			c.fillText(`Accuracy: ${(parseFloat(rplay.accuracy) / 1000).toFixed(2)}%`, 12, y_pos + 193);
			c.fillText(`Miss: ${rplay.miss} miss(es)`, 12, y_pos + 207);
			c.font = '12px Exo';
			c.fillText(`Date: ${date.toUTCString()}`, 12, y_pos + 221);

			let attachment = new Discord.MessageAttachment(canvas.toBuffer());
			message.channel.send(attachment)
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
