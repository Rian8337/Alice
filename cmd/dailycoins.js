let Discord = require('discord.js');

function timeconvert (num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes, seconds]
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.author.id != '386742340968120321') return message.channel.send("❎ **| I'm sorry, this command is still in testing!**");
    let binddb = maindb.collection("userbind");
    let pointdb = alicedb.collection("playerpoints");
    let query = {discordid: message.author.id};
    binddb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres[0].uid;
        let username = userres[0].username;
        pointdb.find(query).toArray((err, dailyres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            let daily = 200;
            let coin = client.emojis.get("669532330980802561");
            if (dailyres[0]) {
                let timelimit = dailyres[0].dailycooldown - Math.floor(Date.now() / 1000);
                if (timelimit > 0) {
                    let time = timeconvert(timelimit);
                    return message.channel.send(`❎ **| I'm sorry, you're still in cooldown! You can claim ${coin}Alice coins again in ${time[0] == 0?"":`${time[0]} hours`}${time[1] == 0?"":`, ${time[1]} minutes`}${time[2] == 0?"":`, ${time[2]} seconds`}.**`)
                }
                let totalcoins = dailyres[0].alicecoins + daily;
                message.channel.send(`✅ **| ${message.author}, you have claimed ${coin}\`${daily}\` Alice coins! You now have ${coin}\`${totalcoins}\` Alice coins.**`);
                let updateVal = {
                    $set: {
                        dailycooldown: Math.floor(Date.now() / 1000) + 86400,
                        alicecoins: totalcoins
                    }
                };
                pointdb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("Alice coins updated")
                })
            } else {
                message.channel.send(`✅ **| ${message.author}, you have claimed ${coin}\`${daily}\` Alice coins! You now have ${coin}\`${daily}\` Alice coins.**`);
                let insertVal = {
                    username: username,
                    uid: uid,
                    discordid: message.author.id,
                    challenges: [],
                    points: 0,
                    dailycooldown: Math.floor(Date.now() / 1000) + 86400,
                    alicecoins: daily
                };
                pointdb.insertOne(insertVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("Alice coins updated")
                })
            }
        })
    })
};

module.exports.config = {
    description: "Claims daily Alice coins.",
    usage: "dailycoins",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "dailycoins"
};
