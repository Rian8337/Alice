const Discord = require('discord.js');
const osudroid = require('osu-droid');
const https = require('https');
const apikey = process.env.OSU_API_KEY;
const config = require('../../config.json');
const { Db } = require('mongodb');

function capitalizeString(string = "") {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function editList(res, page, rolecheck, footer, index) {
    const embed = new Discord.MessageEmbed()
        .setAuthor(`Submissions with ${capitalizeString(res[0].status)} status`)
        .setColor(rolecheck)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(page / 10)}`, footer[index]);

    for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); ++i) {
        if (!res[i]) break;
        embed.addField(`${i+1}. Submission from ${res[i].submitter}`, `**User ID**: ${res[i].id}\n**Beatmap ID**: ${res[i].beatmap_id} ([Beatmap Link](https://osu.ppy.sh/b/${res[i].beatmap_id}))\nCreated at ${new Date(res[i].date * 1000).toUTCString()}`);
    }

    return embed;
}

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission
    for (const id of eligibleRoleList) {
        if (res === -1) break;
        if (member.roles.cache.has(id[0])) {
            if (id[1] === -1) res = id[1];
            else res = Math.max(res, id[1]);
        }
    }
    return res;
}

function retrieveBeatmapList(beatmapset_id) {
    return new Promise(resolve => {
        const options = new URL(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&s=${beatmapset_id}`);
        let content = '';
        https.get(options, res => {
            res.setEncoding("utf8");
            res.on("data", chunk => {
                content += chunk;
            });
            res.on("end", () => {
                let obj;
                try {
                    obj = JSON.parse(content);
                } catch (e) {
                    return resolve(null);
                }
                resolve(obj);
            });
        }).end();
    });
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    const binddb = maindb.collection("userbind");
    const mapdb = alicedb.collection("mapshare");
    const pointdb = alicedb.collection("playerpoints");
    const date = new Date();
    const isMapShareChannel = message.channel.id === '715423228461449297';
    let query = {discordid: message.author.id};
    let insertVal = {}, updateVal = {$set: {}};

    binddb.findOne(query, async (err, userres) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
		if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        
        switch (args[0]) {
            case "list": {
                if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                let status = "pending";
                let page = 1;
                if (args[1]) {
                    page = parseInt(args[1]);
                    if (page < 1) page = 1;
                    if (isNaN(page)) {
                        page = 1;
                        status = args[1];
                        if (typeof status !== 'string') status = "pending";
                        if (args[2]) {
                            page = parseInt(args[2]);
                            if (isNaN(page)) page = 1;
                        }
                    }
                }
                status = status.toLowerCase();
                if (!["accepted", "denied", "pending", "posted"].includes(status)) return message.channel.send("❎ **| Hey, that's an invalid submission status! Accepted statuses are `accepted`, `denied`, `pending`, and `posted`.**")
                mapdb.find({status: status}).toArray((err, map_entries) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (map_entries.length === 0) return message.channel.send(`❎ **| I'm sorry, there is no submission with ${status} status now!**`);
                    if (!map_entries[(page - 1)*10]) return message.channel.send(`❎ **| Hey, we don't have that much submission for ${status} status!**`);
                    let rolecheck;
                    try {
                        rolecheck = message.member.roles.color.hexColor;
                    } catch (e) {
                        rolecheck = "#000000";
                    }
                    const footer = config.avatar_list;
                    const index = Math.floor(Math.random() * footer.length);
                    let embed = editList(map_entries, page, rolecheck, footer, index);
                    message.channel.send({embed: embed}).then(msg => {
                        const max_page = Math.ceil(map_entries.length / 10);
                        if (max_page === page) return;
                        msg.react("⏮️").then(() => {
                            msg.react("⬅️").then(() => {
                                msg.react("➡️").then(() => {
                                    msg.react("⏭️").catch(console.error);
                                });
                            });
                        });
            
                        let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
                        let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
                        let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
                        let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});
            
                        backward.on('collect', () => {
                            if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            page = Math.max(1, page - 10);
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editList(map_entries, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error);
                        });
            
                        back.on('collect', () => {
                            if (page === 1) page = max_page;
                            else --page;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editList(map_entries, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error);
                        });
            
                        next.on('collect', () => {
                            if (page === max_page) page = 1;
                            else ++page;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editList(map_entries, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error);
                        });
            
                        forward.on('collect', () => {
                            if (page === max_page) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            page = Math.min(page + 10, max_page);
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editList(res, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error);
                        });
            
                        backward.on("end", () => {
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                        });
                    });
                });
                break;
            }

            case "post": {
                if (!message.isOwner) {
                    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                    if (!isMapShareChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in this channel.**");
                    if (!message.member.roles.cache.has('715219617303232542')) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**")
                }
                let beatmap_id = args[1];
                if (typeof beatmap_id === 'string') {
                    const a = beatmap_id.split("/");
                    beatmap_id = a[a.length - 1];
                }
                beatmap_id = parseInt(beatmap_id);
                if (isNaN(beatmap_id)) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");
                query = {beatmap_id: beatmap_id};
                mapdb.findOne(query, async (err, res) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!res) return message.channel.send("❎ **| I'm sorry, there is no submission with that beatmap!**");
                    if (res.status !== "accepted") {
                        let rejection_message = "❎ **| I'm sorry, the submission with that beatmap "
                        switch (res.status) {
                            case "posted": rejection_message += 'has been posted before'; break;
                            case "denied": rejection_message += 'was denied'; break;
                            case "pending": rejection_message += 'is still pending'; break;
                        }
                        rejection_message += '!**';
                        return message.channel.send(rejection_message);
                    }
                    const submitter = await message.guild.members.fetch(res.submitter).catch(console.error);
                    let summary = res.summary;
                    let coins = 20 * Math.floor(summary.split(" ").length / 50);
                    const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmap_id});
                    if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap info from osu! API! Perhaps it is down?**");
                    if (!mapinfo.title) {
                        mapdb.deleteOne(query, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            message.channel.send("❎ **| I'm sorry, I cannot find the beatmap that was submitted! Submission has been automatically deleted.**");
                        });
                        return;
                    }
                    if (res.hash !== mapinfo.hash) {
                        mapdb.deleteOne(query, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("❎ **| I'm sorry, the beatmap was updated after submission! Submission has been automatically deleted.**");
                        });
                        return;
                    }
                    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile});
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(`Submission by ${res.submitter}`)
                        .setTitle(mapinfo.showStatistics('', 0))
                        .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
                        .setColor(mapinfo.statusColor())
			            .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                        .setDescription(mapinfo.showStatistics('', 1))
                        .addField(mapinfo.showStatistics('', 2), mapinfo.showStatistics('', 3))
                        .addField(mapinfo.showStatistics('', 4), mapinfo.showStatistics('', 5))
                        .addField("**Star Rating**", `${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`)
                        .addField("**Summary**", summary);

                    if (submitter) embed.setAuthor(`Submission by ${submitter.user.username}`, submitter.user.avatarURL({dynamic: true}));
                    
                    updateVal = {
                        $set: {
                            status: "posted"
                        }
                    };
                    mapdb.updateOne(query, updateVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        query = {discordid: res.submitter};
                        pointdb.findOne(query, (err, pres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (pres) {
                                updateVal = {
                                    $set: {
                                        alicecoins: pres.alicecoins + coins
                                    }
                                };
                                pointdb.updateOne(query, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    client.channels.cache.get("430002296160649229").send({embed: embed});
                                    message.channel.send("✅ **| Successfully posted submission.**");
                                });
                            } else {
                                insertVal = {
                                    username: userres.username,
                                    uid: userres.uid,
                                    discordid: message.author.id,
                                    challenges: [],
                                    points: 0,
                                    transferred: 0,
                                    hasSubmittedMapShare: false,
                                    isBannedFromMapShare: false,
                                    hasClaimedDaily: false,
                                    chatcooldown: Math.floor(Date.now() / 1000),
                                    alicecoins: coins
                                };
                                pointdb.insertOne(insertVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    client.channels.cache.get("430002296160649229").send({embed: embed});
                                    message.channel.send("✅ **| Successfully posted submission.**");
                                });
                            }
                        });
                    });
                });
                break;
            }
    
            case "accept": {
                if (!message.isOwner) {
                    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                    if (!isMapShareChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in this channel.**");
                    if (!message.member.roles.cache.has('715219617303232542')) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                }
                let beatmap_id = args[1];
                if (typeof beatmap_id === 'string') {
                    const a = beatmap_id.split("/");
                    beatmap_id = a[a.length - 1];
                }
                beatmap_id = parseInt(beatmap_id);
                if (isNaN(beatmap_id)) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");
                query = {beatmap_id: beatmap_id};
                mapdb.findOne(query, (err, res) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!res) return message.channel.send("❎ **| I'm sorry, there is no submission with that beatmap!**");
                    if (res.status !== "pending") return message.channel.send("❎ **| I'm sorry, the submission with that beatmap has been processed before!**");
                    updateVal = {
                        $set: {
                            status: "accepted"
                        }
                    };
                    mapdb.updateOne(query, updateVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        query = {discordid: message.author.id};
                        pointdb.findOne(query, (err, pres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (pres) {
                                updateVal = {
                                    $set: {
                                        alicecoins: pres.alicecoins + 2
                                    }
                                };
                                pointdb.updateOne(query, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send("✅ **| Successfully accepted submission.**");
                                });
                            } else {
                                insertVal = {
                                    username: userres.username,
                                    uid: userres.uid,
                                    discordid: message.author.id,
                                    challenges: [],
                                    points: 0,
                                    transferred: 0,
                                    isBannedFromMapShare: false,
                                    hasSubmittedMapShare: false,
                                    hasClaimedDaily: false,
                                    chatcooldown: Math.floor(Date.now() / 1000),
                                    alicecoins: 2
                                };
                                pointdb.insertOne(insertVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send("✅ **| Successfully accepted submission.**");
                                });
                            }
                        });
                    });
                });
                break;
            }
    
            case "deny": {
                if (!message.isOwner) {
                    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                    if (!isMapShareChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in this channel.**");
                    if (!message.member.roles.cache.has('715219617303232542')) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**")
                }
                let beatmap_id = args[1];
                if (typeof beatmap_id === 'string') {
                    const a = beatmap_id.split("/");
                    beatmap_id = a[a.length - 1];
                }
                beatmap_id = parseInt(beatmap_id);
                if (isNaN(beatmap_id)) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");
                query = {beatmap_id: beatmap_id};
                mapdb.findOne(query, (err, res) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!res) return message.channel.send("❎ **| I'm sorry, there is no submission with that beatmap!**");
                    if (res.status !== "pending") return message.channel.send("❎ **| I'm sorry, the submission with that beatmap has been processed before!**")
                    updateVal = {
                        $set: {
                            status: "denied"
                        }
                    };
                    mapdb.updateOne(query, updateVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        query = {discordid: message.author.id};
                        pointdb.findOne(query, (err, pres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (pres) {
                                updateVal = {
                                    $set: {
                                        alicecoins: pres.alicecoins + 2
                                    }
                                };
                                pointdb.updateOne(query, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    message.channel.send("✅ **| Successfully denied submission.**")
                                })
                            } else {
                                insertVal = {
                                    username: userres.username,
                                    uid: userres.uid,
                                    discordid: message.author.id,
                                    challenges: [],
                                    points: 0,
                                    transferred: 0,
                                    isBannedFromMapShare: false,
                                    hasSubmittedMapShare: false,
                                    hasClaimedDaily: false,
                                    chatcooldown: Math.floor(Date.now() / 1000),
                                    alicecoins: 2
                                };
                                pointdb.insertOne(insertVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    message.channel.send("✅ **| Successfully denied submission.**")
                                })
                            }
                        })
                    })
                });
                break
            }

            case "view": {
                if (!message.isOwner) {
                    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                    if (!isMapShareChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in this channel.**");
                    if (!message.member.roles.cache.has('715219617303232542')) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**")
                }
                let beatmap_id = args[1];
                if (typeof beatmap_id === 'string') {
                    const a = beatmap_id.split("/");
                    beatmap_id = a[a.length - 1]
                }
                beatmap_id = parseInt(beatmap_id);
                if (isNaN(beatmap_id)) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");
                query = {beatmap_id: beatmap_id};
                mapdb.findOne(query, async (err, res) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!res) return message.channel.send("❎ **| I'm sorry, there is no submission with that beatmap!**");
                    const submitter = await message.guild.members.fetch(res.id).catch(console.error);
                    const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmap_id});
                    if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap info from osu! API! Perhaps it is down?**");
                    if (!mapinfo.title) {
                        mapdb.deleteOne(query, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("❎ **| I'm sorry, I cannot find the beatmap that was submitted! Submission has been automatically deleted.**");
                        });
                        return
                    }
                    if (res.hash !== mapinfo.hash) {
                        mapdb.deleteOne(query, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("❎ **| I'm sorry, the beatmap was updated after submission! Submission has been automatically deleted.**");
                        });
                        return
                    }
                    const star = new osudroid.MapStars().calculate({file: mapinfo.osuFile})
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(`Submission by ${res.submitter}`)
                        .setTitle(mapinfo.showStatistics('', 0))
                        .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
                        .setColor(mapinfo.statusColor())
                        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}l.jpg`)
                        .setImage(`https://assets.ppy.sh/beatmaps/${mapinfo.beatmapsetID}/covers/cover.jpg`)
                        .setDescription(mapinfo.showStatistics('', 1))
                        .addField(mapinfo.showStatistics('', 2), mapinfo.showStatistics('', 3))
                        .addField(mapinfo.showStatistics('', 4), mapinfo.showStatistics('', 5))
                        .addField("**Star Rating**", `${"★".repeat(Math.min(10, Math.floor(star.droidStars.total)))} ${star.droidStars.total.toFixed(2)} droid stars\n${"★".repeat(Math.min(10, Math.floor(star.pcStars.total)))} ${star.pcStars.total.toFixed(2)} PC stars`)
                        .addField("**Status and Summary**", `**Status**: ${capitalizeString(res.status)}\n\n**Summary**:\n${res.summary}`);

                    if (submitter) embed.setAuthor(`Submission by ${submitter.user.tag}`, submitter.user.avatarURL({dynamic: true}));
                    message.channel.send({embed: embed})
                });
                break
            }

            case "ban": {
                if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                const hasPermission = message.isOwner || isEligible(message.member) !== 0;
                if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
                if (!isMapShareChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in this channel.**");
                const user = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(console.error);
                if (!user) return message.channel.send("❎ **| Hey, please enter a valid user to ban from map sharing!**");
                query = {discordid: user.id};
                pointdb.findOne(query, (err, pres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (pres) {
                        if (pres.isBannedFromMapShare) return message.channel.send("❎ **| I'm sorry, the user is already banned from map sharing!**");
                        updateVal.$set.isBannedFromMapShare = true;
                        pointdb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("✅ **| Successfully banned user from map sharing.**")
                        })
                    } else {
                        insertVal = {
                            username: userres.username,
                            uid: userres.uid,
                            discordid: message.author.id,
                            challenges: [],
                            points: 0,
                            transferred: 0,
                            isBannedFromMapShare: true,
                            hasSubmittedMapShare: false,
                            hasClaimedDaily: false,
                            chatcooldown: Math.floor(Date.now() / 1000),
                            alicecoins: 0
                        };
                        pointdb.insertOne(insertVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("✅ **| Successfully banned user from map sharing.**")
                        })
                    }
                });
                break
            }

            case "unban": {
                if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
                const hasPermission = message.isOwner || isEligible(message.member) !== 0;
                if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
                if (!isMapShareChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in this channel.**");
                const user = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(console.error);
                if (!user) return message.channel.send("❎ **| Hey, please enter a valid user to ban from map sharing!**");
                query = {discordid: user.id};
                pointdb.findOne(query, (err, pres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (pres) {
                        if (!pres.isBannedFromMapShare) return message.channel.send("❎ **| I'm sorry, the user is not banned from map sharing!**");
                        updateVal.$set.isBannedFromMapShare = false;
                        pointdb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("✅ **| Successfully banned user from map sharing.**")
                        })
                    } else {
                        insertVal = {
                            username: userres.username,
                            uid: userres.uid,
                            discordid: message.author.id,
                            challenges: [],
                            points: 0,
                            transferred: 0,
                            isBannedFromMapShare: false,
                            hasSubmittedMapShare: false,
                            hasClaimedDaily: false,
                            chatcooldown: Math.floor(Date.now() / 1000),
                            alicecoins: 0
                        };
                        pointdb.insertOne(insertVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("✅ **| Successfully banned user from map sharing.**")
                        })
                    }
                });
                break
            }
    
            default: {
                if (!(message.channel instanceof Discord.DMChannel)) return message.channel.send("❎ **| I'm sorry, this part of the command is only allowed in DMs.**")
                if (!message.isOwner) {
                    const inter = client.guilds.cache.get("316545691545501706");
                    const member = inter.member(message.author);
                    if (!member) return message.channel.send("❎ **| I'm sorry, you are not a member of osu!droid International server!**");
                    if (member.roles.cache.has('715219617303232542')) return message.channel.send("❎ **| I'm sorry, you cannot submit a beatmap recommendation as a Map-share Manager!**")
                }
                pointdb.findOne(query, async (err, pres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (pres) {
                        if (pres.isBannedFromMapShare) return message.channel.send("❎ **| I'm sorry, you were banned from sharing maps due to abuse of map sharing system!**");
                        if (pres.hasSubmittedMapShare) return message.channel.send("❎ **| I'm sorry, you have submitted a map for this day! Please submit in the next day!**");
                    }
                    let beatmap_id = args[0];
                    if (typeof beatmap_id === 'string') {
                        const a = beatmap_id.split("/");
                        beatmap_id = a[a.length - 1]
                    }
                    beatmap_id = parseInt(beatmap_id);
                    if (isNaN(beatmap_id)) return message.channel.send("❎ **| Hey, please enter a valid beatmap link or ID!**");
                    console.log(beatmap_id);

                    const mapinfo = await osudroid.MapInfo.getInformation({beatmapID: beatmap_id, file: false});
                    if (mapinfo.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap info from osu! API! Perhaps it is down?**");
                    if (!mapinfo.title) return message.channel.send("❎ **| I'm sorry, I cannot find the beatmap that you are looking for!**");
                    if (mapinfo.objects < 50) return message.channel.send("❎ **| I'm sorry, it seems like the beatmap has less than 50 objects!**");
                    if (mapinfo.circles + mapinfo.sliders === 0 || mapinfo.total_length < 30) return message.channel.send("❎ **| Hey, please refrain from posting troll submissions!**");

                    if (mapinfo.approved === osudroid.rankedStatus.WIP || mapinfo.approved === osudroid.rankedStatus.QUALIFIED) return message.channel.send("❎ **| I'm sorry, you cannot submit a WIP (Work In Progress) and qualified beatmap!**");

                    if (mapinfo.favorites > 100) return message.channel.send("❎ **| I'm sorry, that beatmap has over 100 favorites!**");
                    if (mapinfo.plays > 300000) return message.channel.send("❎ **| I'm sorry, that beatmap has over 300000 plays!**");

                    // no need to check for approved maps since they are only used for very old maps
                    if (mapinfo.approved !== osudroid.rankedStatus.RANKED) {
                        if (date.getTime() - mapinfo.submitDate.getTime() < 86400 * 1000 * 7) return message.channel.send("❎ **| I'm sorry, that beatmap was submitted less than a week ago!**");
                        if (date.getTime() - mapinfo.lastUpdate.getTime() < 86400 * 1000 * 3) return message.channel.send("❎ **| I'm sorry, that beatmap was updated less than 3 days ago!**")
                    }

                    if (mapinfo.diff_total < 3) return message.channel.send("❎ **| I'm sorry, you can only submit beatmaps that are 3\* or higher!**");

                    const cmd_length = message.content.split(" ").slice(0, 2).join(" ").length + 1;
                    let summary = message.content.substring(cmd_length);
                    if (!summary) return message.channel.send("❎ **| Hey, please enter a summary of the beatmap you are picking!**");
                    const words = summary.split(" ").length;
                    if (words < 50) return message.channel.send(`❎ **| I'm sorry, your summary is too short (${words}/50 words)!**`);
                    if (words> 120) return message.channel.send(`❎ **| I'm sorry, your summary exceeded 120 words (${words}/120)!**`);
                    if (summary.length > 900) return message.channel.send("❎ **| I'm sorry, your summary must be at least 100 characters and at most 900 characters!**")

                    mapdb.findOne({beatmap_id: mapinfo.beatmapID}, async (err, mres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (mres) return message.channel.send("❎ **| I'm sorry, someone has submitted the beatmap before!**");

                        const mapList = await retrieveBeatmapList(mapinfo.beatmapsetID);
                        if (!mapList) return message.channel.send("❎ **| I'm sorry, I couldn't fetch beatmap set information! Perhaps osu! API is down?**");
                        
                        const map_query = {$or: []};
                        for (const map of mapList) map_query.$or.push({beatmap_id: parseInt(map.beatmap_id)});
                        mapdb.find(map_query).toArray((err, map_list) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (map_list.length > 0) {
                                for (const map of map_list) {
                                    const beatmap = mapList.find(m => map.beatmap_id === parseInt(m.beatmap_id));
                                    const object_count = parseInt(beatmap.count_normal) + parseInt(beatmap.count_slider) + parseInt(beatmap.count_spinner);
                                    if (mapinfo.objects === object_count) return message.channel.send("❎ **| Hey, please refrain from submitting duplicated map submissions!**")
                                }
                            }

                            insertVal = {
                                beatmap_id: mapinfo.beatmapID,
                                hash: mapinfo.hash,
                                submitter: userres.username,
                                id: userres.discordid,
                                date: Math.floor(date.getTime() / 1000),
                                summary: summary,
                                status: "pending"
                            };

                            mapdb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (pres) {
                                    updateVal = {
                                        $set: {
                                            hasSubmittedMapShare: true
                                        }
                                    };
                                    pointdb.updateOne(query, updateVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                        }
                                        message.channel.send("✅ **| Successfully submitted your summary.**");
                                    })
                                } else {
                                    insertVal = {
                                        username: userres.username,
                                        uid: userres.uid,
                                        discordid: message.author.id,
                                        challenges: [],
                                        points: 0,
                                        transferred: 0,
                                        hasSubmittedMapShare: true,
                                        isBannedFromMapShare: false,
                                        hasClaimedDaily: false,
                                        chatcooldown: Math.floor(date.getTime() / 1000),
                                        alicecoins: 0
                                    };
                                    pointdb.insertOne(insertVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                        }
                                        message.channel.send("✅ **| Successfully submitted your summary.**");
                                    });
                                }
                            });
                        });
                    });
                });
            }
        }
    });
};

module.exports.config = {
	name: "mapshare",
	description: "Main command for map sharing.\n\nEach day, you can submit a beatmap recommendation via DM to <@627321230902689813> to be reviewed by a <@&715219617303232542>. If your recommendation is accepted, it will be queued for posting in <#430002296160649229> and you will receive 20 Alice coins for each 50 words in your summary in return.\n\n__**General Rules**__\n▸ Abuse of the map sharing system of any kind will lead to a mute or at worst a ban.\n\n**Beatmap**:\n▸ The beatmap must have less than 300,000 plays and 100 favorites.\n▸ The beatmap cannot be in WIP and qualified status.\n▸ The beatmap must be submitted for at least a week. If the beatmap was deleted, the submission will automatically be deleted.\n▸ The beatmap's drain length must be longer than 20 seconds.\n▸ The beatmap's star rating must be above 3\*.\n▸ The beatmap must not be updated for at least 3 days. If the beatmap was updated after map share submission, the submission will automatically be deleted.\n\n**Summary**:\n▸ The summary must be written in English. Any non-English summaries will be automatically denied.\n▸ The summary must be at least 50 words and must not exceed 120 words or 900 characters.",
	usage: "mapshare <map link/map ID> <summary>\nmapshare accept <map link/map ID>\nmapshare ban <user>\nmapshare deny <map link/map ID>\nmapshare list [status/page] [page]\nmapshare post <map link/map ID>\nmapshare unban <user>\nmapshare view <map link/map ID>",
	detail: "`map link/map ID`: The link or beatmap ID of the map [Integer/String]\n`page`: The page to view [Integer]\n`status`: The status of submission to view. Accepted arguments are `accepted`, `denied`, `pending`, and `posted` [String]\n`user`: The user to ban or unban [UserResolvable (mention or user ID)]\n`summary`: Overall summary of the specified map [String]",
    permission: "None | Map-share Manager | Helper | Moderator | Specific person (<@132783516176875520> and <@386742340968120321>)"
};
