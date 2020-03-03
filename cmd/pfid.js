const config = require('../config.json');
const osudroid = require('../modules/osu!droid');

module.exports.run = (client, message, args) => {
    let uid = parseInt(args[0]);
    if (isNaN(uid)) return message.channel.send("❎ **| I'm sorry, that uid is not valid!**");
	new osudroid.PlayerInfo().get({uid: uid}, player => {
		if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the user!**");
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);
		const embed = {
			"description": "**Username: **"+ player.name +"  /  **Rank**: "+ player.rank + "\n" + player.location,
			"color": 8102199,
			"thumbnail": {
				"url": player.avatarURL
			},
			"footer": {
				"icon_url": footer[index],
				"text": "Alice Synthesis Thirty"
			},
			"author": {
				"name": "osu!droid profile (click here to view profile)",
				"url": "http://ops.dgsrz.com/profile.php?uid="+uid,
				"icon_url": "https://image.frl/p/beyefgeq5m7tobjg.jpg"
			},
			"fields": [
				{
					"name": "Total Score: " + parseInt(player.score).toLocaleString(),
					"value": "Play Count: " + player.play_count + "\n" + "Overall Accuracy: " + player.accuracy.toFixed(2) + "%"
				}
			]
		};
		message.channel.send({embed: embed}).catch(console.error)
	})
};

module.exports.config = {
	name: "pfid",
	description: "Retrieves an osu!droid profile based on uid.",
	usage: "pfid <uid>",
	detail: "`uid`: Uid to retrieve profile from [Integer]",
	permission: "None"
};
