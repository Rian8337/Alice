const { Client, Message } = require('discord.js');
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
	if (!message.isOwner) {
		return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
	}
	const uid = args[0];
	if (isNaN(uid)) {
		return message.channel.send("❎ **| I'm sorry, that uid is invalid!**");
	}
	const trackdb = maindb.collection("tracking");
	const  query = {uid: uid};
	trackdb.findOne(query, function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
		}
		if (res) {
			return message.channel.send("❎ **| I'm sorry, this uid is already being tracked!**");
		}
		trackdb.insertOne(query, function(err) {
			if (err) {
				console.log(err);
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
			}
			message.channel.send(`✅ **| Now tracking uid ${uid}.**`);
		});
	});
};

module.exports.config = {
	name: "addtrack",
	description: "Adds a uid into player tracking list.\n\nThis player tracking feature is currently exclusive to the osu!droid International server for the time being.",
	usage: "addtrack <uid>",
	detail: "`uid`: The uid to track [Integer]",
	permission: "Bot Creators"
};