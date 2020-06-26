const config = require('../config.json');

module.exports.run = async (client, guild, user, maindb, alicedb) => {
    if (guild.id !== '316545691545501706') return;
    const binddb = maindb.collection("userbind");
    const scoredb = alicedb.collection("playerscore");

    let updateVal = {
        $set: {
            pptotal: 0,
            pp: [],
            playc: 0
        }
    };

    const res = await binddb.findOneAndUpdate({discordid: user.id}, updateVal);
    if (!res) return;

    await scoredb.findOneAndDelete({discordid: user.id});

    guild.channels.cache.find(c => c.name === config.management_channel).send("✅ **| Successfully wiped user's pp and score data!**")
};

module.exports.config = {
    name: "bindWipe"
};