var Discord = require('discord.js');
var config = require('../config.json');
var http = require('http');

function levelBar(levelprogress) {
    let barcount = 20;
    let progress = Math.floor(parseFloat(levelprogress.toFixed(2)) / (100 / barcount));
    return "🔵".repeat(progress) + "⚪".repeat(barcount - progress)
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    var uid = args[0];
    if (!uid) return message.channel.send("❎ **| Hey, I don't know what uid to view!**");
    if (isNaN(uid)) return message.channel.send("❎ **| Hey, that uid is invalid!**");
    let binddb = maindb.collection("userbind");
    let scoredb = alicedb.collection("playerscore");
    let query = {uid: uid};
    binddb.find(query).toArray((err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you must use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let username = userres[0].username;

        scoredb.find(query).toArray((err, res) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            let score = 0;
            let level = 1;
            let playc = 0;
            if (res[0]) {
                score = res[0].score;
                level = res[0].level;
                playc = res[0].playc
            }
            let levelremain = (level - Math.floor(level)) * 100;

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
                        .setDescription(`**Total Ranked Score:** ${score.toLocaleString()}\n**Play Count:** ${playc}\n**Level:** ${Math.floor(level)} (${levelremain.toFixed(2)}%)\n\n**Level Progress**\n${levelBar(levelremain)}`);

                    message.channel.send({embed: embed}).catch(console.error)
                })
            });
            req.end()
        })
    })
};

module.exports.config = {
    description: "Views a user's ranked score profile based on uid.\nUid must be binded into a Discord account and has previously submitted plays.",
    usage: "levelid <uid>",
    detail: "`user`: The uid to view [Integer]",
    permission: "None"
};

module.exports.help = {
    name: "levelid"
};
