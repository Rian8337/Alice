const config = require('../../config.json');
const osudroid = require('../../modules/osu!droid');

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!', '').replace('<@', '').replace('>', '')
	}
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!res[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = res[0].uid;
		new osudroid.PlayerInfo().get({uid: uid}, player => {
			if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the user!**");
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * footer.length);
			const embed = {
				"description": "**Username: **" + player.name + "  /  **Rank**: " + player.rank + "\n" + player.location,
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
					"icon_url": `https://osu.ppy.sh/images/flags/${player.location}.png`
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
	})
};

module.exports.config = {
	name: "pfme",
	description: "Retrieves an osu!droid profile.",
	usage: "pfme [user]",
	detail: "`user`: The user to retrieve profile from [UserResolvable (mention or user ID)]",
	permission: "None"
};
