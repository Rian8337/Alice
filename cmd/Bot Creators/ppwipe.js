const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message, args, maindb) => {
	if (message.author.id != '132783516176875520' && message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

	let guild = client.guilds.cache.get('528941000555757598');
	let logchannel = guild.channels.cache.get('638671295470370827');
	if (!logchannel) return message.channel.send("❎ **| Please create #pp-log first!**");

	let ufind = args[0];
	if (!args[0]) return message.channel.send("❎ **| Hey, can you mention a user? Unless you want me to delete your own plays, if that's your thing.**");
	ufind.replace("<@!", "").replace("<@", "").replace(">", "");

	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, userres) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!userres[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = userres[0].uid;
		let discordid = userres[0].discordid;
		let username = userres[0].username;
		let pre_pptotal = userres[0].pptotal;
		let playc = userres[0].playc;

		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);

		const embed = new Discord.MessageEmbed()
			.setTitle("__PP data wipe performed__")
			.setColor("#188c1f")
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setTimestamp(new Date())
			.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
			.addField("**PP stats**", `PP count: ${parseFloat(pre_pptotal).toFixed(2)} pp\nPlay count: ${playc}`);

		let updateVal = {
			$set: {
				pptotal: 0,
				pp: [],
				playc: 0
			}
		};
		binddb.updateOne(query, updateVal, function (err) {
			if (err) {
				console.log(err);
				return message.channel.send("Error: Empty database response. Please try again!")
			}
			message.channel.send("✅ **| Successfully wiped user's pp data!**");
			logchannel.send({embed: embed});
			console.log('pp updated')
		})
	})
};

module.exports.config = {
	name: "ppwipe",
	description: "Wipes a user's droid pp data.",
	usage: "ppwipe <user>",
	detail: "`user`: The user to wipe [UserResolvable (mention or user ID)]",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
