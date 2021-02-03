const { Guild, User } = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Guild} guild 
 * @param {User} user 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (guild, user, maindb, alicedb) => {
    if (guild.id !== '316545691545501706') {
        return;
    }
    const binddb = maindb.collection("userbind");
    const scoredb = alicedb.collection("playerscore");
    const channeldb = alicedb.collection("mutelogchannel");

    let updateVal = {
        $set: {
            pptotal: 0,
            pp: [],
            playc: 0
        }
    };

    const res = await binddb.findOneAndUpdate({discordid: user.id}, updateVal);
    const log = await channeldb.findOne({guildID: guild.id});
    if (!log) return;
    const channel = guild.channels.resolve(log.channelID);
    if (!res) return;

    await scoredb.findOneAndDelete({discordid: user.id});

    channel.send("✅ **| Successfully wiped user's pp and score data!**");
};

module.exports.config = {
    name: "bindWipe"
};