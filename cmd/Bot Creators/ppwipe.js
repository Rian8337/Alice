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
		return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
	}

	const guild = client.guilds.cache.get('528941000555757598');
	const logchannel = guild.channels.cache.get('638671295470370827');
	if (!logchannel) {
		return message.channel.send("❎ **| Please create #pp-log first!**");
	}

	const ufind = args[0]?.replace("<@!", "").replace("<@", "").replace(">", "");
	if (!ufind) {
		return message.channel.send("❎ **| Hey, can you mention a user? Unless you want me to delete your own plays, if that's your thing.**");
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
		const pre_pptotal = userres.pptotal;
		const playc = userres.playc;

		const footer = config.avatar_list;
		const index = Math.floor(Math.random() * footer.length);

		const embed = new Discord.MessageEmbed()
			.setTitle("__PP data wipe performed__")
			.setColor("#188c1f")
			.setFooter("Alice Synthesis Thirty", footer[index])
			.setTimestamp(new Date())
			.addField("**User stats**", `Discord User: <@${discordid}>\nUsername: ${username}\nUid: ${uid}`)
			.addField("**PP stats**", `PP count: ${pre_pptotal.toFixed(2)} pp\nPlay count: ${playc}`);

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
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
			}
			message.channel.send("✅ **| Successfully wiped user's pp data!**");
			logchannel.send({embed: embed});
			console.log('pp updated');
		});
	});
};

module.exports.config = {
	name: "ppwipe",
	description: "Wipes a user's droid pp data.",
	usage: "ppwipe <user>",
	detail: "`user`: The user to wipe [UserResolvable (mention or user ID)]",
	permission: "Bot Creators"
};