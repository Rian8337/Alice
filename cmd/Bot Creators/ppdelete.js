const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");

	let guild = client.guilds.cache.get('528941000555757598');
	let logchannel = guild.channels.cache.get('638671295470370827');
	if (!logchannel) return message.channel.send("❎ **| Please create #pp-log first!**");

	let ufind = args[0];
	if (!args[0]) return message.channel.send("❎ **| Hey, can you mention a user? Unless you want me to delete your own plays, if that's your thing.**");
	ufind.replace("<@!", "").replace("<@", "").replace(">", "");
	if (isNaN(parseInt(ufind))) return message.channel.send("❎ **| I don't think that user is correct... Please make sure you have entered a correct user!**");

	let todelete = args[1];
	if (!todelete) return message.channel.send("❎ **| Hey, I don't know which play to delete!**");
	if (todelete <= 0) return message.channel.send("❎ **| Invalid play number, minimum is 1.**");
	if (isNaN(todelete)) return message.channel.send("❎ **| Invalid play number to delete.**");

	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = {discordid: ufind};
	binddb.findOne(query, function (err, userres) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
		let uid = userres.uid;
		let discordid = userres.discordid;
		let username = userres.username;
		let pplist = userres.pp;
		let pre_pptotal = userres.pptotal;
		let playc = userres.playc;
		if (todelete > pplist.length) {console.log("Data not found"); message.channel.send("❎ **| This user doesn't seem to have a pp data.**"); return;}
		let pptotal = 0;

		pplist.sort(function (a, b) {
			return b[2] - a[2]
		});

		let scdelete = pplist[todelete - 1];
		console.log(scdelete);

		pplist.splice(todelete - 1, 1);
		playc--;

		let weight = 1;
		for (let i in pplist) {
			pptotal += weight * pplist[i][2];
			weight *= 0.95;
		}
		let footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);

		const embed = new Discord.MessageEmbed()
			.setTitle("__Deleted play data__")
			.setColor("#6699cb")
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setTimestamp(new Date())
			.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
			.addField("**Play stats**", `Map Name: ${scdelete[1]}\nPP: ${scdelete[2]} pp\nCombo: ${scdelete[3]}\nAccuracy: ${scdelete[4]}\nMiss count: ${scdelete[5]} miss(es)`)
			.addField("**PP stats**", `Pre-PP count: ${parseFloat(pre_pptotal.toString()).toFixed(2)} pp\nPost-PP count: ${parseFloat(pptotal.toString()).toFixed(2)} pp\nPP difference: ${(parseFloat(pre_pptotal) - parseFloat(pptotal)).toFixed(2)}`);

		playc--;
		let updateVal = {
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
			message.channel.send("✅ **| Successfully deleted play data!**");
			logchannel.send({embed: embed});
			console.log('pp updated')
		})
	})
};

module.exports.config = {
	name: "ppdelete",
	description: "Deletes a play from a user's droid pp profile.",
	usage: "ppdelete <user> <play>",
	detail: "`user`: The user to delete the play data from [UserResolvable (mention or user ID)]\n`play`: The play to delete in numerical order of the user's droid pp profile [Integer]",
	permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};