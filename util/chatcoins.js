const Discord = require('discord.js');

module.exports.run = (message, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel || message.channel.type !== 'text') return;
    if (message.guild.id !== '316545691545501706') return;
    if (['360714803691388928', '415559968062963712', '360715303149240321', '360715871187894273', '360715992621514752'].includes(message.channel.parentID)) return;
    if (['326152555392532481', '361785436982476800', '316863464888991745', '549109230284701718', '468042874202750976', '430002296160649229', '430939277720027136', '696663321633357844'].includes(message.channel.id)) return;

    const time = Math.floor(Date.now() / 1000);
    const binddb = maindb.collection("userbind");
    const pointdb = alicedb.collection("playerpoints");

    pointdb.findOne({discordid: message.author.id}, (err, res) => {
        if (err) return console.log(err);
        let cooldown = res ? res.chatcooldown : undefined;
        if (!cooldown) cooldown = time;
        if (cooldown > time) return;
        if (res) {
            let alicecoins = res.alicecoins;
            ++alicecoins;
            let updateVal = {
                $set: {
                    chatcooldown: time + 600,
                    alicecoins: alicecoins
                }
            };

            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                if (err) return console.log(err)
            })
        } else {
            binddb.findOne({discordid: message.author.id}, (err, userres) => {
                if (err) return console.log(err);
                if (!userres) return;
                let insertVal = {
                    username: userres.username,
                    uid: userres.uid,
                    discordid: message.author.id,
                    challenges: [],
                    points: 0,
                    chatcooldown: Math.floor(Date.now() / 1000),
                    dailycooldown: 0,
                    alicecoins: 1
                };
                pointdb.insertOne(insertVal, err => {
                    if (err) return console.log(err)
                })
            })
        }
    })
};

module.exports.config = {
    name: "chatcoins"
};