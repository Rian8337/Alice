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
        return message.channel.send("❎ **| I'm sorry, you don't have enough permission to use this command.**");
    }

    const uid = args[0];
    if (isNaN(uid)) {
        return message.channel.send("❎ **| I'm sorry, please specify a valid uid!**");
    }

    const binddb = maindb.collection("userbind");
    const query = {previous_bind: {$all: [uid]}};
    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this uid has not been binded!**");
        }
        const previous_bind = res.previous_bind;
        if (previous_bind.length > 1) {
            const index = previous_bind.findIndex(u => u === uid);
            previous_bind.splice(index, 1);
            const updateVal = {
                $set: {
                    previous_bind: previous_bind
                }
            };
            if (res.uid === uid) {
                updateVal.$set.uid = previous_bind[Math.floor(Math.random() * previous_bind.length)];
            }
            binddb.updateOne({discordid: res.discordid}, updateVal, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                message.channel.send(`✅ **| Successfully unbinded uid ${uid}.**`);
            });
        } else {
            binddb.deleteOne({discordid: res.discordid}, err => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                message.channel.send(`✅ **| Successfully unbinded uid ${uid}.**`);
            });
        }
    });
};

module.exports.config = {
    name: "unbind",
    description: "Unbinds an osu!droid account.",
    usage: "unbind <uid>",
    detail: "`uid`: The uid to unbind [Integer]",
    permission: "Bot Creators"
};