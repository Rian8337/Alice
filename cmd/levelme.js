var Discord = require('discord.js');
var config = require('../config.json');
var http = require('http');

module.exports.run = (client, message, args, maindb, alicedb) => {
    var ufind = message.author.id;
    if (args[0]) {
        ufind = args[0];
        ufind = ufind.replace("<@", "");
        ufind = ufind.replace(">", "")
    }
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you must use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = userres[0].uid;
        let username = userres[0].username;

        let scoredb = alicedb.collection("playerscore");
        query = {uid: uid};
        scoredb.find(query).toArray((err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (!res[0]) return message.channel.send("❎ **| You haven't submitted any plays! Please use `a!score` to submit your plays. For more information, type `a!help score`.**");
            let score = res[0].score;
            let level = res[0].level;
            let levelremain = (level - Math.floor(level)) * 100;
            let playc = res[0].playc;

            var options = {
                host: "ops.dgsrz.com",
                port: 80,
                path: "/profile.php?uid=" + uid + ".html"
            };
            var content = '';

            var req = http.request(options, res => {
                res.setEncoding("utf8");
                res.on("data", chunk => {
                    content += chunk
                });
                res.on("error", err => {
                    console.log(err);
                    avalink = "https://cdn.discordapp.com/embed/avatars/0.png"
                });
                res.on("end", () => {
                    const a = content;
                    let b = a.split('\n');
                    let avalink = "";
                    let location = "";
                    for (x = 0; x < b.length; x++) {
                        if (b[x].includes('h3 m-t-xs m-b-xs')) {
                            b[x-3] = b[x-3].replace('<img src="',"");
                            b[x-3] = b[x-3].replace('" class="img-circle">',"");
                            b[x-3] = b[x-3].trim();
                            avalink = b[x-3];
                            b[x+1] = b[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
                            b[x+1] = b[x+1].replace("<\/small>","");
                            b[x+1] = b[x+1].trim();
                            location = b[x+1]
                        }
                    }
                    var rolecheck;
                    try {
                        rolecheck = message.member.highestRole.hexColor
                    } catch (e) {
                        rolecheck = "#000000"
                    }
                    let footer = config.avatar_list;
                    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                    let embed = new Discord.RichEmbed()
                        .setColor(rolecheck)
                        .setThumbnail(avalink)
                        .setAuthor(`Level profile for ${username}`, "https://image.frl/p/beyefgeq5m7tobjg.jpg", `http://ops.dgsrz.com/profile.php?uid=${uid}.html`)
                        .setFooter("Alice Synthesis Thirty", footer[index])
                        .addField("Level", `${Math.floor(level)} (${levelremain.toFixed(2)}%)`, true)
                        .addField("Play count", playc, true)
                        .addField("Total Ranked Score", score.toLocaleString(), true);

                    message.channel.send({embed: embed})
                })
            });
            req.end()
        })
    })
};

module.exports.config = {
    description: "Views a user's ranked score profile.",
    usage: "levelme [user]",
    detail: "`user`: The user to view [UserResolvable (mention or user ID)]",
    permission: "None"
};

module.exports.help = {
    name: "levelme"
};
