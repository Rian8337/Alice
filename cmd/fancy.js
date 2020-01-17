let http = require('http');
let request = require('request');
let droidapikey = process.env.DROID_API_KEY;

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.guild.id != '316545691545501706') return message.channel.send("❎ **| I'm sorry, this command is only available in osu!droid (International) Discord server!**");
    if (message.author.id != '386742340968120321' && message.author.id != '132783516176875520') return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");

    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) return message.channel.send("❎ **| I'm sorry, I cannot find the server member you are looking for!**");
    let role = args[1];
    if (!role) return message.channel.send("❎ **| Hey, I don't know what role to give!**");
    let time = Math.floor((Date.now() - user.joinedTimestamp) / 1000);
    
    let binddb = maindb.collection("userbind");
    let loungedb = alicedb.collection("loungeban");
    let query = {discordid: user.id};
    loungedb.find(query).toArray((err, banres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (banres[0]) return message.channel.send("❎ **| I'm sorry, this user has been banned from the channel!**");
        binddb.find(query).toArray((err, userres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (!userres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you must use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.");

            switch (role.toLowerCase()) {
                case "skilled": {
                    if (time < 86400 * 90) return message.channel.send("❎ **| I'm sorry, this user hasn't been in the server for 3 months!**");
                    let pp = userres[0].pptotal;
                    if (pp < 4000) return message.channel.send("❎ **| I'm sorry, this user doesn't have 4000 dpp yet!**");
                    let skilled = message.guild.roles.find(r => r.name === 'Skilled Member');
                    user.addRole(skilled, "Fulfilled requirement for role").then(user => {
                        message.channel.send("✅ **| Successfully added `" + skilled.name + "` for " + user + ".**")
                    }).catch(() => message.channel.send("❎ **| I'm sorry, the user already has `" + skilled.name + "` role!**"));
                    break
                }
                case "dedicated": {
                    if (time < 86400 * 180) return message.channel.send("❎ **| I'm sorry, this user hasn't been in the server for 6 months!**");
                    var uid = userres[0].uid;
                    var options = {
                        host: "ops.dgsrz.com",
                        port: 80,
                        path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
                    };
                    var content = '';
                    var req = http.request(options, res => {
                        res.setEncoding("utf8");
                        res.on("data", chunk => {
                            content += chunk
                        });
                        res.on("end", () => {
                            var resarr = content.split("<br>");
                            var headerres = resarr[0].split(" ");
                            if (headerres[0] == 'FAILED') return message.channel.send("❎ **| I'm sorry, it looks like the user doesn't exist!**");
                            var obj;
                            try {
                                obj = JSON.parse(resarr[1])
                            } catch (e) {
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                            }
                            let rank = parseInt(obj.rank);
                            if (rank > 5000) return message.channel.send("❎ **| I'm sorry, this user's rank is above 5000!**");
                            let dedicated = message.guild.roles.find(r => r.name === 'Dedicated Member');
                            user.addRole(dedicated, "Fulfilled requirement for role").then(user => {
                                message.channel.send("✅ **| Successfully added `" + dedicated.name + "` role for " + user + ".**")
                            }).catch(() => message.channel.send("❎ **| I'm sorry, the user already has `" + dedicated.name + "` role!**"))
                        })
                    });
                    req.end();
                    break
                }
                case "veteran": {
                    if (time < 86400 * 90) return message.channel.send("❎ **| I'm sorry, this user hasn't been in the server for 3 months!**");
                    let uid = userres[0].uid;
                    let url = "http://ops.dgsrz.com/api/scoresearch.php?apiKey=" + droidapikey + "&uid=" + uid + "&page=0";
                    request(url, (err, response, data) => {
                        if (!data) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**");
                        var line = data.split("<br>").shift();
                        var first = parseInt(line[0].split(" ")[7]) + 3600 * 7;
                        for (var i = 1; i < line.length; i++) {
                            let date = parseInt(line[i].split(" ")[7]) + 3600 * 7;
                            if (date < first) first = date
                        }
                        var curyear = new Date().getUTCFullYear();
                        var firstyear = new Date(first * 1000).getUTCFullYear();
                        if (curyear - firstyear < 2) return message.channel.send("❎ **| I'm sorry, the user hasn't been registered for 2 years!**");
                        var options = {
                            host: "ops.dgsrz.com",
                            port: 80,
                            path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid
                        };
                        var content = '';
                        var req = http.request(options, res => {
                            res.setEncoding("utf8");
                            res.on("data", chunk => {
                                content += chunk
                            });
                            res.on("end", () => {
                                var resarr = content.split("<br>");
                                var headerres = resarr[0].split(" ");
                                if (headerres[0] == 'FAILED') return message.channel.send("❎ **| I'm sorry, it looks like the user doesn't exist!**");
                                var obj;
                                try {
                                    obj = JSON.parse(resarr[1])
                                } catch (e) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API. Please try again!**")
                                }
                                let rank = parseInt(obj.rank);
                                if (rank > 1000) return message.channel.send("❎ **| I'm sorry, this user's rank is above 1000!**");
                                let playc = parseInt(headerres[4]);
                                if (playc < 1000) return message.channel.send("❎ **| I'm sorry, this user's play count is below 1000!**");
                                let veteran = message.guild.roles.find(r => r.name === 'Veteran Member');
                                user.addRole(veteran, "Fulfilled requirement for role").then(user => {
                                    message.channel.send("✅ **| Successfully added `" + veteran.name + "` role for " + user + ".**")
                                }).catch(() => message.channel.send("❎ **| I'm sorry, the user already has `" + veteran.name + "` role!**"))
                            })
                        });
                        req.end()
                    });
                    break
                }
                default: return message.channel.send("❎ **| Hey, looks like role argument is invalid! Accepted arguments are `skilled`, `dedicated`, and `veteran`.**")
            }
        })
    })
};

module.exports.config = {
    description: "Gives a user access to lounge channel.",
    usage: "fancy <user> <role>",
    detail: "`user`: The user to give [UserResolvable (mention or user ID)]\n`role`: Role to give. Accepted arguments are `skilled`, `dedicated`, and `veteran`.",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};

module.exports.help = {
    name: "fancy"
};
