const Discord = require('discord.js');

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

    const channeldb = alicedb.collection("matchchannel");
    channeldb.findOne({channelid: message.channel.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this channel has never been set for a match yet!**");
        }
        channeldb.deleteOne({channelid: message.channel.id}, err => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            message.channel.send("✅ **| Successfully removed binded match in this channel.**");
        });
    });
};

module.exports.config = {
    name: "matchunset",
    description: "Removes a match binded to the channel.\nIntended for tournament use.",
    usage: "matchunset",
    detail: "None",
    permission: "Referee"
};
