var Discord = require('discord.js');
var https = require('https');
var apikey = process.env.OSU_API_KEY;
var config = require('../config.json');

function progress (level) {
    var final = (parseFloat(level) - Math.floor(parseFloat(level))) * 100;
    return final.toFixed(2)
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
    var playerdb = alicedb.collection("osubind");
    var query = {discordid: message.author.id};
    playerdb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        var username;
        if (args[0] === 'set') {
            username = args.slice(1).join(" ");
            if (!username) return message.channel.send("❎ **| Hey, I don't know what account to bind!**");
            if (!res[0]) {
                var insertVal = {
                    discordid: message.author.id,
                    username: username
                };
                playerdb.insertOne(insertVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("osu! profile updated for " + message.author.id);
                    message.channel.send("✅ **| Your osu! profile has been set to " + username + ".**")
                })
            } else {
                var updateVal = {
                    $set: {
                        discordid: message.author.id,
                        username: username
                    }
                };
                playerdb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    console.log("osu! profile updated for " + message.author.id);
                    message.channel.send("✅ **| Your osu! profile has been set to " + username + ".**")
                })
            }
        }
        else {
            username = res[0].username;
            var mode = args[0];
            if (mode === 'std') mode = 0;
            else if (mode === 'taiko') mode = 1;
            else if (mode === 'ctb') mode = 2;
            else if (mode === 'mania') mode = 3;
            else mode = 0;

            if (args[1]) username = args.slice(1).join(" ");

            var options = new URL("https://osu.ppy.sh/api/get_user?k=" + apikey + "&u=" + username + "&m=" + mode);
            var content;

            https.get(options, res => {
                res.setEncoding("utf8");
                res.on("data", chunk => {
                    content = chunk
                });
                res.on("error", err => {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                });
                res.on("end", () => {
                    var obj;
                    try {
                        obj = JSON.parse(content)
                    } catch (e) {
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API. Please try again!**")
                    }
                    if (!obj[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the username!**");
                    var playerinfo = obj[0];
                    let footer = config.avatar_list;
                    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                    let embed = new Discord.RichEmbed()
                        .setThumbnail("https://a.ppy.sh/" + playerinfo.user_id)
                        .setColor(message.member.highestRole.hexColor)
                        .setFooter("Alice Synthesis Thirty", footer[index])
                        .addField("Rank", "#" + playerinfo.pp_rank, true)
                        .addField("Country rank", playerinfo.country + " #" + playerinfo.pp_country_rank, true)
                        .addField("Accuracy", parseFloat(playerinfo.accuracy).toFixed(2) + "%", true)
                        .addField("Play count", playerinfo.playcount, true)
                        .addField("Ranked score", parseInt(playerinfo.ranked_score).toLocaleString("en-US"), true)
                        .addField("Total score", parseInt(playerinfo.total_score).toLocaleString("en-US"), true)
                        .addField("PP", playerinfo.pp_raw, true)
                        .addField("Level", Math.floor(parseFloat(playerinfo.level)) + " (" + progress(playerinfo.level) + "%)", true)
                        .addField("Join date", playerinfo.join_date + " UTC", true)
                        .addField("User ID", playerinfo.user_id, true);

                    if (mode === 0) embed.setAuthor("osu!standard Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id);
                    if (mode === 1) embed.setAuthor("Taiko Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id);
                    if (mode === 2) embed.setAuthor("Catch the Beat Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id);
                    if (mode === 3) embed.setAuthor("osu!mania Profile for " + username, "https://osu.ppy.sh/images/flags/" + playerinfo.country + ".png", "https://osu.ppy.sh/users/" + playerinfo.user_id);

                    message.channel.send({embed: embed})
                })
            })
        }
    })
};

module.exports.config = {
    description: "Retrieves an osu! account profile.",
    usage: "osu [mode] [user]\nosu set <username>",
    detail: "`mode`: Gamemode. Accepted arguments are `std`, `taiko`, `ctb`, `mania`\n`user`: The user to retrieve information from [UserResolvable (mention or user ID) or String]`username`: The username to bind [String]",
    permission: "None"
};

module.exports.help = {
    name: "osu"
};
