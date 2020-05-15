const request = require('request');
const tatsukey = process.env.TATSU_API_KEY;
const droidapikey = process.env.DROID_API_KEY;
const osudroid = require('osu-droid');

async function memberValidation(message, user, role, time, userres, cb) {
    switch (role.toLowerCase()) {
        case "skilled": {
            if (time < 86400 * 120) {
                message.channel.send("❎ **| I'm sorry, this user hasn't been in the server for 3 months!**");
                return cb()
            }
            let pp = userres[0].pptotal;
            if (pp < 4500) {
                message.channel.send("❎ **| I'm sorry, this user doesn't have 4000 dpp yet!**");
                return cb()
            }
            cb(true);
            break
        }
        case "dedicated": {
            if (time < 86400 * 180) {
                message.channel.send("❎ **| I'm sorry, this user hasn't been in the server for 6 months!**");
                return cb()
            }
            let uid = userres[0].uid;
            const player = await new osudroid.PlayerInfo().get({uid: uid});
            if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the user info!**");
            let rank = player.rank;
            if (rank > 5000) {
                message.channel.send("❎ **| I'm sorry, this user's rank is above 5000!**");
                return cb()
            }
            let url = `https://api.tatsumaki.xyz/guilds/${message.guild.id}/members/${user.id}/stats`;
            request(url, {headers: {"Authorization": tatsukey}}, (err, response, data) => {
                if (err) {
                    message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from Tatsumaki's API. Please try again!**");
                    return cb()
                }
                let userstats = JSON.parse(data);
                let userscore = parseInt(userstats.score);
                if (userscore < 125000) {
                    message.channel.send("❎ **| I'm sorry, you don't have 125,000 Tatsumaki XP yet!**");
                    return cb()
                }
                cb(true)
            });
            break
        }
        case "veteran": {
            if (time < 86400 * 90) {
                message.channel.send("❎ **| I'm sorry, this user hasn't been in the server for 3 months!**");
                return cb()
            }
            let uid = userres[0].uid;
            let url = "http://ops.dgsrz.com/api/scoresearch.php?apiKey=" + droidapikey + "&uid=" + uid + "&page=0";
            request(url, async (err, response, data) => {
                if (!data) {
                    message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from droid API. Please try again!**");
                    return cb()
                }
                let line = data.split("<br>").shift();
                let first = parseInt(line[0].split(" ")[7]) + 3600 * 7;
                for (let i = 1; i < line.length; i++) {
                    let entry = line[i].split(" ");
                    let date = parseInt(entry[7]) + 3600 * 7;
                    if (entry[1] == '0') date = parseInt(entry[5]) + 3600 * 7;
                    if (date < first) first = date
                }
                let curyear = new Date().getUTCFullYear();
                let firstyear = new Date(first * 1000).getUTCFullYear();
                if (curyear - firstyear < 2) {
                    message.channel.send("❎ **| I'm sorry, the user hasn't been registered in Discord for 2 years!**");
                    return cb()
                }
                const player = await new osudroid.PlayerInfo().get({uid: uid}).catch(console.error)
                if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot fetch the user's player info! Perhaps osu!droid server is down?**");
                let rank = player.rank;
                if (rank > 1000) {
                    message.channel.send("❎ **| I'm sorry, this user's rank is above 1000!**");
                    return cb()
                }
                let playc = player.play_count;
                if (playc < 1000) {
                    message.channel.send("❎ **| I'm sorry, this user's play count is below 1000!**");
                    return cb()
                }
                cb(true)
            });
            break
        }
        default: {
            message.channel.send("❎ **| Hey, looks like role argument is invalid! Accepted arguments are `skilled`, `dedicated`, and `veteran`.**");
            return cb()
        }
    }
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.guild.id != '316545691545501706') return message.channel.send("❎ **| I'm sorry, this command is only available in droid (International) Discord server!**");
    if (!message.member.roles.cache.find((r) => r.name === "Moderator")) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command. Please ask a Moderator!**");

    let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
    if (!user) return message.channel.send("❎ **| I'm sorry, I cannot find the server member you are looking for!**");
    let role = args[1];
    if (!role) return message.channel.send("❎ **| Hey, I don't know what role to give!**");
    let time = Math.floor((Date.now() - user.joinedTimestamp) / 1000);
    
    let binddb = maindb.collection("userbind");
    let loungedb = alicedb.collection("loungeban");
    let query = {discordid: user.id};
    loungedb.findOne(query, (err, banres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (banres) return message.channel.send("❎ **| I'm sorry, this user has been banned from the channel!**");
        binddb.findOne(query, async (err, userres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you must use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.");
            await memberValidation(message, user, role, time, userres, (valid = false) => {
                if (valid) {
                    let pass = message.guild.roles.cache.find((r) => r.name === 'Lounge Pass');
                    user.roles.add(pass, "Fulfilled requirement for role").then(() => {
                        message.channel.send("✅ **| Successfully given `" + pass.name + " for " + user)
                    }).catch(() => message.channel.send("❎ **| I'm sorry, this user already has a pass!**"))
                }
            })
        })
    })
};

module.exports.config = {
    name: "fancy",
    description: "Gives a user access to lounge channel.",
    usage: "fancy <user> <role>",
    detail: "`user`: The user to give [UserResolvable (mention or user ID)]\n`role`: Role to give. Accepted arguments are `skilled`, `dedicated`, and `veteran`.",
    permission: "Moderator"
};
