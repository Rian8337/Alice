const Discord = require('discord.js');
const osudroid = require('osu-droid');

function timeconvert (num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes, seconds]
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.guild.id !== '316545691545501706' && message.guild.id !== '635532651029332000' && message.guild.id !== '528941000555757598') return message.channel.send("❎ **| I'm sorry, this command is only allowed in droid (International) Discord server and droid café server!**");
    let binddb = maindb.collection("userbind");
    let pointdb = alicedb.collection("playerpoints");
    let coin = client.emojis.cache.get("669532330980802561");
    let curtime = Math.floor(Date.now() / 1000);
    if (curtime - (message.member.joinedTimestamp / 1000) < 86400 * 7) return message.channel.send("❎ **| I'm sorry, you haven't been in the server for a week!**");
    let query = {};
    switch (args[0]) {
        case "claim": {
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres.uid;
                let username = userres.username;
                pointdb.findOne(query, (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    let streak = 1;
                    let daily = 100;
                    let streakcomplete = false;
                    if (dailyres) {
                        streak += dailyres.streak;
                        let timelimit = dailyres.dailycooldown - curtime;
                        if (timelimit > 0) {
                            let time = timeconvert(timelimit);
                            return message.channel.send(`❎ **| I'm sorry, you're still in cooldown! You can claim ${coin}Alice coins again in ${time[0] === 0 ? "" : `${time[0] === 1 ? `${time[0]} hour` : `${time[0]} hours`}`}${time[1] === 0 ? "" : `${time[0] === 0 ? "" : ", "}${time[1] === 1 ? `${time[1]} minute` : `${time[1]} minutes`}`}${time[2] === 0 ? "" : `${time[1] === 0 ? "" : ", "}${time[2] === 1 ? `${time[2]} second` : `${time[2]} seconds`}`}.**`)
                        }
                        if (timelimit <= -86400) streak = 1;
                        if (streak === 5) {
                            streakcomplete = true;
                            daily += 200;
                            streak = 1
                        }
                        let totalcoins = dailyres.alicecoins + daily;
                        message.channel.send(`✅ **| ${message.author}, you have ${streakcomplete ? "completed a streak and " : ""}claimed ${coin}\`${daily}\` Alice coins! Your current streak is \`${streak}\`. You now have ${coin}\`${totalcoins}\` Alice coins.**`);
                        let updateVal = {
                            $set: {
                                dailycooldown: curtime + 86400,
                                alicecoins: totalcoins,
                                streak: streak
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
                        message.channel.send(`✅ **| ${message.author}, you have claimed ${coin}\`${daily}\` Alice coins! Your current streak is \`1\`. You now have ${coin}\`${daily}\` Alice coins.**`);
                        let insertVal = {
                            username: username,
                            uid: uid,
                            discordid: message.author.id,
                            challenges: [],
                            points: 0,
                            dailycooldown: curtime + 86400,
                            chatcooldown: Math.floor(Date.now() / 1000),
                            alicecoins: daily,
                            streak: 1
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
            });
            break
        }
        case "transfer": {
            let totransfer = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!totransfer) return message.channel.send("❎ **| Hey, I don't know the user to give your coins to!**");
            if (totransfer.user.bot) return message.channel.send("❎ **| Hey, you can't transfer coins to a bot!**");
            if (totransfer.id === message.author.id) return message.channel.send("❎ **| Hey, you cannot transfer coins to yourself!**");
            if (curtime - totransfer.joinedTimestamp / 1000 < 86400 * 7) return message.channel.send("❎ **| I'm sorry, the user you are giving your coins to has not been in the server for a week!**");
            let amount = parseInt(args[2]);
            if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Hey, I need a valid amount to give!**");
            query = {discordid: message.author.id};
            binddb.findOne(query, async (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = userres.uid;
                const player = await new osudroid.PlayerInfo().get({uid: uid});
                if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
                let rank = player.rank;
                let limit;
                if (rank < 10) limit = 500;
                else if (rank < 50) limit = 350;
                else if (rank < 100) limit = 250;
                else if (rank < 500) limit = 100;
                else limit = 50;
                if (amount > limit) return message.channel.send(`❎ **| I'm sorry, your ${coin}Alice coins transfer limit is \`${limit}\`!**`);
                pointdb.findOne(query, (err, pointres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!pointres) return message.channel.send("❎ **| I'm sorry, you don't have enough coins!**");
                    let alicecoins = pointres.alicecoins;
                    if (alicecoins < amount) return message.channel.send("❎ **| I'm sorry, you don't have enough coins!**");
                    message.channel.send(`❗**| Are you sure you want to transfer ${coin}\`${amount}\` Alice coins to ${totransfer}?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            query = {discordid: totransfer.id};
                            pointdb.findOne(query, (err, giveres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!giveres) return message.channel.send("❎ **| I'm sorry, this user has not used any daily claims before!**");
                                let coins = giveres.alicecoins + amount;
                                message.channel.send(`✅ **| ${message.author}, successfully transferred ${coin}\`${amount}\` Alice coins to ${totransfer}. You now have ${coin}\`${alicecoins - amount}\` Alice coins.**`)
                                let updateVal = {
                                    $set: {
                                        alicecoins: coins
                                    }
                                };
                                pointdb.updateOne({discordid: totransfer.id}, updateVal, err => {
                                    if (err) return console.log(err);
                                });
                                updateVal = {
                                    $set: {
                                        alicecoins: pointres.alicecoins - amount
                                    }
                                };
                                pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                    if (err) return console.log(err)
                                })
                            })
                        });
                        confirm.on("end", () => {
                            if (!confirmation) {
                                msg.delete();
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                            }
                        })
                    })
                })
            });
            break
        }
        case "view": {
            let id = message.author.id;
            if (args[1]) {
                id = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
                if (!id) return message.channel.send("❎ **| Hey, please enter a valid user to view!**");
                id = id.id
            }
            query = {discordid: id};
            pointdb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (res) message.channel.send(`✅ **| ${message.author}, ${args[1] ? "that user has" : "you have"} ${coin}\`${res.alicecoins}\` Alice coins.**`);
                else message.channel.send(`✅ **| ${message.author}, ${args[1] ? "that user has" : "you have"} ${coin}\`0\` Alice coins.**`)
            });
            break
        }
        default: return message.channel.send("❎ **| I'm sorry, it looks like your argument is invalid! Accepted arguments are `claim`, `transfer`, and `view`.**")
    }
};

module.exports.config = {
    name: "coins",
    description: "Main command for Alice coins.",
    usage: "coins claim\ncoins transfer <user>\ncoins view [user]",
    detail: "`user`: User to transfer or view [UserResolvable (mention or user ID)]",
    permission: "None"
};