const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner) {
		return message.channel.send("❎ **| You don't have enough permission to use this command.**");
	}
	const uid = args[0];
	if (isNaN(uid)) {
		return message.channel.send("❎ **| I'm sorry, that uid is invalid!**");
	}
	const trackdb = maindb.collection("tracking");
	const query = { uid: uid };
	trackdb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
		}
		if (!res) return message.channel.send("❎ **| I'm sorry, this uid is not currently being tracked!**");
		trackdb.deleteOne(query, function(err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
			}
			message.channel.send(`✅ **| No longer tracking uid ${uid}.**`);
		});
	});
};

module.exports.config = {
	name: "deletetrack",
	description: "Deletes a uid from player tracking list.\n\nThis player tracking feature is currently exclusive to the osu!droid International server for the time being.",
	usage: "deletetrack <uid>",
	detail: "`uid`: Uid to delete [Integer]",
	permission: "Bot Creators"
};