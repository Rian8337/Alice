let Discord = require('discord.js');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.member.roles == null || !message.member.roles.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
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
                var updateVal = {
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
                var insertVal = {
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
    description: "Sets a match in a channel.\nIntended for tournament use.",
    usage: "matchset <match id>",
    detail: "`match id`: The ID of the match [String]",
    permission: "Referee"
};

module.exports.help = {
    name: "matchset"
};
