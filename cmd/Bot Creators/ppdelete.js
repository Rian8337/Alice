const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner) {
		return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this. Please ask an Owner!**");
	}

	const guild = client.guilds.cache.get('528941000555757598');
	const logchannel = guild.channels.cache.get('638671295470370827');
	if (!logchannel) return message.channel.send("❎ **| Please create #pp-log first!**");

	const ufind = args[0]?.replace("<@!", "").replace("<@", "").replace(">", "");
	if (!ufind) {
		return message.channel.send("❎ **| Hey, can you mention a user? Unless you want me to delete your own plays, if that's your thing.**");
	}
	if (isNaN(ufind)) {
		return message.channel.send("❎ **| I don't think that user is correct... Please make sure you have entered a correct user!**");
	}

	const todelete = parseInt(args[1]);
	if (!todelete) {
		return message.channel.send("❎ **| Hey, I don't know which play to delete!**");
	}
	if (todelete <= 0) {
		return message.channel.send("❎ **| Invalid play number, minimum is 1.**");
	}
	if (isNaN(todelete)) {
		return message.channel.send("❎ **| Invalid play number to delete.**");
	}

	const binddb = maindb.collection("userbind");
	const query = {discordid: ufind};
	binddb.findOne(query, function (err, userres) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
		}
		if (!userres) {
			return message.channel.send("❎ **| I'm sorry, that account is not binded.**");
		}
		const uid = userres.uid;
		const discordid = userres.discordid;
		const username = userres.username;
		const pplist = userres.pp;
		const pre_pptotal = userres.pptotal;
		let playc = userres.playc;
		if (todelete > pplist.length) {
			return message.channel.send("❎ **| This user doesn't seem to have that much pp data.**");
		}
		let pptotal = 0;

		pplist.sort(function (a, b) {
			return b.pp - a.pp;
		});

		const scdelete = pplist[todelete - 1];
		console.log(scdelete);

		pplist.splice(todelete - 1, 1);
		playc--;

		let weight = 1;
		for (let i in pplist) {
			pptotal += weight * pplist[i].pp;
			weight *= 0.95;
		}
		const footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);

		const embed = new Discord.MessageEmbed()
			.setTitle("__Deleted play data__")
			.setColor("#6699cb")
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setTimestamp(new Date())
			.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
			.addField("**Play stats**", `Map Name: ${scdelete[1]}\nPP: ${scdelete[2]} pp\nCombo: ${scdelete[3]}\nAccuracy: ${scdelete[4]}\nMiss count: ${scdelete[5]} miss(es)`)
			.addField("**PP stats**", `Pre-PP count: ${parseFloat(pre_pptotal.toString()).toFixed(2)} pp\nPost-PP count: ${parseFloat(pptotal.toString()).toFixed(2)} pp\nPP difference: ${(parseFloat(pre_pptotal) - parseFloat(pptotal)).toFixed(2)}`);

		const updateVal = {
			$set: {
				pptotal: pptotal,
				pp: pplist,
				playc: playc
			}
		};
		binddb.updateOne(query, updateVal, function (err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
			}
			message.channel.send("✅ **| Successfully deleted play data!**");
			logchannel.send({embed: embed});
			console.log('pp updated');
		});
	});
};

module.exports.config = {
	name: "ppdelete",
	description: "Deletes a play from a user's droid pp profile.",
	usage: "ppdelete <user> <play>",
	detail: "`user`: The user to delete the play data from [UserResolvable (mention or user ID)]\n`play`: The play to delete in numerical order of the user's droid pp profile [Integer]",
	permission: "Bot Creators"
};