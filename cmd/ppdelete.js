var Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = (client, message, args, maindb) => {
	if (!message.member.roles.find(r => r.name === 'Owner')) return message.channel.send("You don't have permission to do this");

	let guild = client.guilds.get('528941000555757598');
	let logchannel = guild.channels.get('638671295470370827');
	if (!logchannel) return message.channel.send("Please create #pp-log first!");

	let ufind = args[0];
	if (!args[0]) return message.channel.send("Please mention a user");
	ufind = ufind.replace('<@!','');
	ufind = ufind.replace('<@','');
	ufind = ufind.replace('>','');
	if (isNaN(Number(ufind))) return message.channel.send("Please make sure you have specified the correct user!");

	let todelete = args[1];
	if (!todelete) return message.channel.send("Please specify play number to delete");
	if (todelete <= 0) return message.channel.send("Invalid play number, minimum is 1");
	if (isNaN(todelete)) return message.channel.send("Invalid play number to delete");

	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.find(query).toArray(function (err, userres) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
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
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);

			const embed = new Discord.RichEmbed()
				.setTitle("__Deleted play data__")
				.setColor("#6699cb")
				.setFooter("Alice Synthesis Thirty", footer[index])
				.setTimestamp(new Date())
				.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
				.addField("**Play stats**", `Map Name: ${scdelete[1]}\nPP: ${scdelete[2]} pp\nCombo: ${scdelete[3]}\nAccuracy: ${scdelete[4]}\nMiss count: ${scdelete[5]} miss(es)`)
				.addField("**PP stats**", `Pre-PP count: ${parseFloat(pre_pptotal).toFixed(2)} pp\nPost-PP count: ${parseFloat(pptotal).toFixed(2)} pp\nPP difference: ${(parseFloat(pre_pptotal) - parseFloat(pptotal)).toFixed(2)}`);
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
				if (err) {
					console.log(err);
					return message.channel.send("Error: Empty database response. Please try again!")
				}
				console.log('pp updated');
				addcount = 0;
			})
		} else message.channel.send("The account is not binded, he/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`")
	})
};

module.exports.help = {
	name: "ppdelete"
};
