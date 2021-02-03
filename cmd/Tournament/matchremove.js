const { Client, Message } = require("discord.js");
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (!message.isOwner && !["316545691545501706", "526214018269184001"].includes(message.guild?.id) && !message.member?.roles.cache.find((r) => r.name === 'Referee')) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }
    const id = args[0];
    if (!id) return message.channel.send("❎ **| Hey, please enter a match ID!**");

    const matchdb = maindb.collection("matchinfo");
    matchdb.findOne({matchid: id}, (err, res) => {
        if (err) {
            console.log(err);
			return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, there is no match with given match ID!**");
        matchdb.deleteOne({matchid: id}, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            message.channel.send(`✅ **| Successfully removed match \`${id}\`.**`);
        });
    });
};

module.exports.config = {
    name: "matchremove",
	description: "Removes a match.",
	usage: "matchremove <match ID>",
	detail: "`match ID`: The match's ID [String]",
    permission: "Bot Creators"
}