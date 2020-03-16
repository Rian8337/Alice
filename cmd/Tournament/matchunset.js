const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.member.roles == null || !message.member.roles.cache.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");

    let channeldb = alicedb.collection("matchchannel");
    channeldb.find({channelid: message.channel.id}).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res[0]) return message.channel.send("❎ **| I'm sorry, this channel has never been set for a match yet!**");
        channeldb.deleteOne({channelid: message.channel.id}, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            message.channel.send("✅ **| Successfully removed binded match in this channel.**")
        })
    })
};

module.exports.config = {
    name: "matchunset",
    description: "Removes a match binded to the channel.\nIntended for tournament use.",
    usage: "matchunset",
    detail: "None",
    permission: "Referee"
};
