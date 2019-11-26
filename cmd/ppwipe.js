var Discord = require('discord.js');

module.exports.run = (client, message, args, maindb) => {
	if (message.author.id != '386742340968120321') return;
	let guild = client.guilds.get('528941000555757598');
	let logchannel = guild.channels.get('638671295470370827');
	if (!logchannel) {message.channel.send("Please create #pp-log first!"); return;}

	let ufind = args[0];
	if (!args[0]) {message.channel.send("Please mention a user"); return;}
	ufind = ufind.replace('<@!','');
	ufind = ufind.replace('<@','');
	ufind = ufind.replace('>','');

	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, userres) {
		if (err) throw err;
		if (userres[0]) {
			let uid = userres[0].uid;
			let discordid = userres[0].discordid;
			let username = userres[0].username;
			if (userres[0].pp) var pplist = userres[0].pp;
			else var pplist = [];
			if (userres[0].pptotal) var pre_pptotal = userres[0].pptotal;
			else var pre_pptotal = 0;
			if (userres[0].playc) var playc = userres[0].playc;
			else var playc = 0;

			pplist = [];
			message.channel.send("User pp data has been wiped");

			const embed = new Discord.RichEmbed()
				.setTitle("__PP data wipe performed__")
				.setColor("#188c1f")
				.setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
				.setTimestamp(new Date())
				.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
				.addField("**PP stats**", `PP count: ${parseFloat(pre_pptotal).toFixed(2)} pp\nPlay count: ${playc}`);
			logchannel.send({embed});

			var pptotal = 0;
			playc = 0;
			var updateVal = {
				$set: {
					pptotal: pptotal,
					pp: pplist,
					playc: playc
				}
			};
			binddb.updateOne(query, updateVal, function (err) {
				if (err) throw err;
				console.log('pp updated');
				addcount = 0;
			})
		} else {message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")}
	});
};

module.exports.help = {
	name: "ppwipe"
};
