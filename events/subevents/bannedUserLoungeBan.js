const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = async (guild, user, alicedb) => {
    let banInfo = await guild.fetchBan(user.id);
	let reason = banInfo.reason ? banInfo.reason : "Not specified";
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setTitle("Ban executed")
		.setThumbnail(user.avatarURL({dynamic: true}))
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.addField(`Banned user: ${user.tag}`, `User ID: ${user.id}`)
		.addField("=========================", `Reason: ${reason}`);
	
	guild.channels.cache.find((c) => c.name === config.management_channel).send({embed: embed});

	const loungedb = alicedb.collection("loungelock");
	loungedb.findOne({discordid: user.id}, (err, res) => {
		if (err) {
			console.log(err);
			console.log("Unable to retrieve lounge ban data")
		}
		if (res) return;
		loungedb.insertOne({discordid: user.id}, err => {
			if (err) {
				console.log(err);
				console.log("Unable to insert ban data")
			}
			guild.channels.cache.find(c => c.name === config.management_channel).send("✅ **| Successfully locked user from lounge.**")
		})
	})
};

module.exports.config = {
	name: "bannedUserLoungeBan"
};
