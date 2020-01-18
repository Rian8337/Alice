var Discord = require('discord.js');
var config = require('../config.json');

function time(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    var rolecheck;
    try {
        rolecheck = message.member.highestRole.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    if (!message.member.roles.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
    let matchid = args[0];
    if (!matchid) return message.channel.send("❎ **| Hey, I don't know what match to find!**");
    let map = args[1];
    if (!map) return message.channel.send("❎ **| Hey, I don't know what map is playing!**");

    let matchdb = maindb.collection("matchinfo");
    let mapdb = alicedb.collection("mapinfolength");
    let query = {matchid: matchid};

    matchdb.find(query).toArray((err, matchres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!matchres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the match!**");
        let poolid = matchid.split(".")[0];
        let poolquery = {poolid: poolid};

        mapdb.find(poolquery).toArray((err, poolres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (!poolres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the pool!**");
            let maplist = poolres[0].map;
            var mapfound;
            var timelimit = 0;
            for (var i = 0; i < maplist.length; i++) {
                if (maplist[i][0] == map.toUpperCase()) {
                    timelimit = parseInt(maplist[i][1]);
                    mapfound = true;
                    break
                }
            }
            if (!mapfound) return message.channel.send("❎ **| I'm sorry, I cannot find the map!**");
            if (map.toUpperCase().includes("DT") && poolid == "t8q") timelimit = Math.ceil(timelimit / 1.5);
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * (footer.length - 1) + 1);
            let embed = new Discord.RichEmbed()
                .setTitle("Round info")
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setTimestamp(new Date())
                .setColor(rolecheck)
                .addField("Match ID", matchid, true)
                .addField("Map", map.toUpperCase(), true)
                .addField("Map Length", time(timelimit), true);

            message.channel.send("✅ **| Round initiated!**", {embed: embed});
            setTimeout(() => {
                message.channel.send("✅ **| Round ended!**");
                let cmd = client.commands.get("matchsubmit");
                cmd.run(client, message, [matchid], maindb)
            }, (timelimit + 30) * 1000)
        })
    })
};

module.exports.config = {
    description: "Starts a round in a match.\nIntended for tournament use.",
    usage: "matchstart <match id> <pick>",
    detail: "`match id`: The ID of the match [String]\n`pick`: Current pick (NM1, NM2, etc) [String]",
    permission: "Referee"
};

module.exports.help = {
    name: "matchstart"
};
