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

	let todelete = args[1];
	if (!todelete) {message.channel.send("Please specify play number to delete"); return;}
	if (todelete <= 0) {message.channel.send("Invalid play number, minimum is 1"); return;}
	if (isNaN(todelete)) {message.channel.send("Invalid play number to delete"); return;}

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
			if (todelete > pplist.length) {console.log("Data not found"); message.channel.send("User pp data does not exist"); return;}
			var pptotal = 0;

			pplist.sort(function (a, b) {
				return b[2] - a[2]
			});

			var scdelete = pplist[todelete - 1];
			console.log(scdelete);

			pplist.splice(todelete - 1, 1);
			playc--;

			var weight = 1;
			for (var i in pplist) {
				pptotal += weight * pplist[i][2];
				weight *= 0.95;
			}

			const embed = new Discord.RichEmbed()
				.setTitle("__Deleted play data__")
				.setColor("#6699cb")
				.setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
				.setTimestamp(new Date())
				.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
				.addField("**Play stats**", `Map Name: ${scdelete[1]}\nPP: ${scdelete[2]} pp\nCombo: ${scdelete[3]}\nAccuracy: ${scdelete[4]}\nMiss count: ${scdelete[5]} miss(es)`)
				.addField("**PP stats**", `Pre-PP count: ${parseFloat(pre_pptotal).toFixed(2)} pp\nPost-PP count: ${parseFloat(pptotal).toFixed(2)} pp`);
			logchannel.send({embed});

			playc--;
			message.channel.send("Play pp data has been deleted");
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
		} else {message.channel.send("The account is not binded, he/she/you need to use `&userbind <uid>` first. To get uid, use `&profilesearch <username>`")};
	});
};

module.exports.help = {
	name: "ppdelete"
};
