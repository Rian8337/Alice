const Discord = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (!message.isOwner && !["316545691545501706", "526214018269184001"].includes(message.guild?.id) && !message.member?.roles.cache.find((r) => r.name === 'Referee')) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }
    let matchid = args[0];
    if (!matchid) return message.channel.send("❎ **| Hey, I don't know what match to set!**");
    let matchdb = maindb.collection("matchinfo");
    let channeldb = alicedb.collection("matchchannel");
    let query = {matchid: matchid};

    matchdb.find(query).toArray((err, matchres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!matchres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the match!**");
        let name = matchres[0].name.replace("(", "").replace(") ", "");
        query = {channelid: message.channel.id};
        channeldb.find(query).toArray((err, channelres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (channelres[0]) {
                let updateVal = {
                    $set: {
                        matchid: matchid
                    }
                };
                channeldb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send("✅ **| Successfully set this channel for match `" + name + "`.**")
                })
            }
            else {
                let insertVal = {
                    channelid: message.channel.id,
                    matchid: matchid
                };
                channeldb.insertOne(insertVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send("✅ **| Successfully set this channel for match `" + name + "`.**")
                })
            }
        })
    })
};

module.exports.config = {
    name: "matchset",
    description: "Sets a match in a channel.\nIntended for tournament use.",
    usage: "matchset <match id>",
    detail: "`match id`: The ID of the match [String]",
    permission: "Referee"
};
