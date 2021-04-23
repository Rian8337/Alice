const Discord = require('discord.js');
const osudroid = require('osu-droid');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return;
    }
    if (message.guild.id !== '316545691545501706' && message.guild.id !== '635532651029332000' && message.guild.id !== '528941000555757598') {
        return message.channel.send("❎ **| I'm sorry, this command is only allowed in the international server!**");
    }
    const binddb = maindb.collection("userbind");
    const pointdb = alicedb.collection("playerpoints");
    const coin = client.emojis.cache.get("669532330980802561");
    const curtime = Math.floor(Date.now() / 1000);
    if (curtime - (message.member.joinedTimestamp / 1000) < 86400 * 7) {
        return message.channel.send("❎ **| I'm sorry, you haven't been in the server for a week!**");
    }
    let query = {};
    switch (args[0]) {
        case "claim": {
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                let uid = userres.uid;
                let username = userres.username;
                pointdb.findOne(query, (err, dailyres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    let streak = 1;
                    let daily = 50;
                    let streakcomplete = false;
                    if (dailyres) {
                        if (dailyres.hasClaimedDaily) {
                            return message.channel.send(`❎ **| I'm sorry, you have claimed today's ${coin}Alice coins! Daily claim resets at 0:00 UTC each day.**`);
                        }
                        streak += dailyres.streak;
                        if (streak === 5) {
                            streakcomplete = true;
                            daily += 100;
                            streak = 1;
                        }
                        const totalcoins = dailyres.alicecoins + daily;
                        message.channel.send(`✅ **| ${message.author}, you have ${streakcomplete ? "completed a streak and " : ""}claimed ${coin}\`${daily}\` Alice coins! Your current streak is \`${streak}\`. You now have ${coin}\`${totalcoins}\` Alice coins.**`);
                        const updateVal = {
                            $set: {
                                hasClaimedDaily: true,
                                alicecoins: totalcoins,
                                streak: streak
                            }
                        };
                        pointdb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                        });
                    } else {
                        message.channel.send(`✅ **| ${message.author}, you have claimed ${coin}\`${daily}\` Alice coins! Your current streak is \`1\`. You now have ${coin}\`${daily}\` Alice coins.**`);
                        const insertVal = {
                            username: username,
                            uid: uid,
                            discordid: message.author.id,
                            challenges: [],
                            points: 0,
                            transferred: 0,
                            hasSubmittedMapShare: false,
                            isBannedFromMapShare: false,
                            hasClaimedDaily: true,
                            chatcooldown: Math.floor(Date.now() / 1000),
                            alicecoins: daily,
                            streak: 1
                        };
                        pointdb.insertOne(insertVal, err => {
                            if (err) {
                                console.log(err);
                                message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                        });
                    }
                });
            });
            break;
        }
        case "transfer": {
            const totransfer = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(() => {});
            if (!totransfer) {
                return message.channel.send("❎ **| Hey, I don't know the user to give your coins to!**");
            }
            if (totransfer.user.bot) {
                return message.channel.send("❎ **| Hey, you can't transfer coins to a bot!**");
            }
            if (totransfer.id === message.author.id) {
                return message.channel.send("❎ **| Hey, you cannot transfer coins to yourself!**");
            }
            if (curtime - totransfer.joinedTimestamp / 1000 < 86400 * 7) {
                return message.channel.send("❎ **| I'm sorry, the user you are giving your coins to has not been in the server for a week!**");
            }
            const amount = parseInt(args[2]);
            if (isNaN(amount) || amount <= 0) {
                return message.channel.send("❎ **| Hey, I need a valid amount to give!**");
            }
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                const uid = userres.uid;
                pointdb.findOne(query, async (err, pointres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!pointres) {
                        return message.channel.send("❎ **| I'm sorry, you don't have enough coins!**");
                    }
                    const transferred = pointres.transferred ?? 0;
                    if (transferred === amount) {
                        return message.channel.send("❎ **| I'm sorry, you have reached the transfer limit for today!**");
                    }
                    const player = await osudroid.Player.getInformation({uid: uid});
                    if (player.error) {
                        return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
                    }
                    let limit = 0;
                    switch (true) {
                        case (player.rank < 10):
                            limit = 2500;
                            break;
                        case (player.rank < 50):
                            limit = 1750;
                            break;
                        case (player.rank < 100):
                            limit = 1250;
                            break;
                        case (player.rank < 500):
                            limit = 500;
                            break;
                        default:
                            limit = 250;
                    }
                    if (transferred + amount > limit) {
                        return message.channel.send(`❎ **| I'm sorry, the amount you have specified is beyond your daily limit! You can only transfer ${coin}\`${limit - transferred}\` Alice coins for today!**`);
                    }

                    const alicecoins = pointres.alicecoins;
                    if (alicecoins < amount) {
                        return message.channel.send("❎ **| I'm sorry, you don't have enough coins!**");
                    }
                    message.channel.send(`❗**| Are you sure you want to transfer ${coin}\`${amount}\` Alice coins to ${totransfer}?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            query = {discordid: totransfer.id};
                            pointdb.findOne(query, (err, giveres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!giveres) {
                                    return message.channel.send("❎ **| I'm sorry, this user has not used any daily claims before!**");
                                }
                                const coins = giveres.alicecoins + amount;
                                message.channel.send(`✅ **| ${message.author}, successfully transferred ${coin}\`${amount}\` Alice coins to ${totransfer}. You can transfer ${coin}\`${limit - (amount + transferred)}\` Alice coins left today. You now have ${coin}\`${alicecoins - amount}\` Alice coins.**`)
                                let updateVal = {
                                    $set: {
                                        alicecoins: coins
                                    }
                                };
                                pointdb.updateOne({discordid: totransfer.id}, updateVal, err => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                                updateVal = {
                                    $set: {
                                        alicecoins: pointres.alicecoins - amount,
                                        transferred: transferred + amount
                                    }
                                };
                                pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                            });
                        });
                        confirm.on("end", () => {
                            if (!confirmation) {
                                msg.delete();
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                            }
                        });
                    });
                });
            });
            break;
        }
        case "view": {
            let id = message.author.id;
            if (args[1]) {
                id = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(() => {});
                if (!id) {
                    return message.channel.send("❎ **| Hey, please enter a valid user to view!**");
                }
                id = id.id;
            }
            query = {discordid: id};
            pointdb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (res) message.channel.send(`✅ **| ${message.author}, ${args[1] ? "that user has" : "you have"} ${coin}\`${res.alicecoins}\` Alice coins.**`);
                else message.channel.send(`✅ **| ${message.author}, ${args[1] ? "that user has" : "you have"} ${coin}\`0\` Alice coins.**`);
            });
            break;
        }
        case "add": {
            if (!message.isOwner) {
                return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
            }
            const toadd = args[1]?.replace("<@!", "").replace("<@", "").replace(">", "");
            if (!toadd) {
                return message.channel.send("❎ **| Hey, please enter a valid user to add coins to!**");
            }
            const amount = parseInt(args[2]);
            if (isNaN(amount) || amount <= 0) {
                return message.channel.send("❎ **| Hey, please enter a valid amount to add!**");
            }
            query = {discordid: toadd};
            pointdb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this user has not claimed daily coins at least once!**");
                }
                const updateVal = {
                    $set: {
                        alicecoins: res.alicecoins + amount
                    }
                };
                pointdb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| Successfully added ${coin}\`${amount}\` Alice coins to user. The user now has ${coin}\`${(res.alicecoins + amount).toLocaleString()}\` Alice coins.**`);
                });
            });
            break;
        }
        case "remove": {
            if (!message.isOwner) {
                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
            }
            const toremove = args[1]?.replace("<@!", "").replace("<@", "").replace(">", "");
            if (!toremove) {
                return message.channel.send("❎ **| Hey, please enter a valid user to remove coins from!**");
            }
            const amount = parseInt(args[2]);
            if (isNaN(amount) || amount <= 0) {
                return message.channel.send("❎ **| Hey, please enter a valid amount to remove!**");
            }
            query = {discordid: toremove};
            pointdb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this user has not claimed daily coins at least once!**");
                }
                if (res.alicecoins < amount) {
                    return message.channel.send(`❎ **| I'm sorry, the amount you have specified is more than the user's Alice coins! The user has ${coin}\`${res.alicecoins.toLocaleString()}\` Alice coins.**`);
                }
                const updateVal = {
                    $set: {
                        alicecoins: res.alicecoins - amount
                    }
                };
                pointdb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    message.channel.send(`✅ **| Successfully removed ${coin}\`${amount}\` Alice coins from user. The user now has ${coin}\`${(res.alicecoins - amount).toLocaleString()}\` Alice coins.**`);
                });
            });
            break;
        }
        default: return message.channel.send("❎ **| I'm sorry, it looks like your argument is invalid! Accepted arguments are `claim`, `transfer`, and `view`.**");
    }
};

module.exports.config = {
    name: "coins",
    description: "Main command for Alice coins.",
    usage: "coins add <user> <amount>\ncoins claim\ncoins remove <user> <amount>\ncoins transfer <user>\ncoins view [user]",
    detail: "`amount`: The amount of coins to add or remove [Integer]\n`user`: User to add, remove, transfer, or view [UserResolvable (mention or user ID)]",
    permission: "None | Bot Creators"
};