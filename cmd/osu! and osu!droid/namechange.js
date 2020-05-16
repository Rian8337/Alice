const Discord = require('discord.js');
const http = require('http');
const osudroid = require('osu-droid');
const droidapikey = process.env.DROID_API_KEY;
const config = require('../../config.json');

function processEmbed(res, page, footer, index) {
    const embed = new Discord.MessageEmbed()
        .setTitle("Name Change Request List")
        .setColor("#cb9000")
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(res.length / 10)}`, footer[index]);
    
    for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); i++) {
        if (!res[i]) break;
        embed.addField(`**${i+1}**. **${res[i].current_username} (${res[i].uid})**`, `**Discord Account**: <@${res[i].discordid}> (${res[i].discordid})\n**Username requested:** ${res[i].new_username}\n**Creation date**: ${new Date((res[i].cooldown - 86400 * 30) * 1000).toUTCString()}\n[Screenshot Attachment](${res[i].attachment}) (only viewable to <@386742340968120321>)`)
    }
    
    return embed
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    const binddb = maindb.collection("userbind");
    const namedb = alicedb.collection("namechange");
    const curtime = Math.floor(Date.now() / 1000);
    const guild = client.guilds.cache.get('316545691545501706');
    const name_channel = client.channels.cache.get('701732111744499713');
    let query = {discordid: message.author.id};
    let insertVal;
    let updateVal;
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setTimestamp(new Date());

    switch (args[0]) {
        case 'accept': {
            if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to do this.**");
            let uid = parseInt(args[1]);
            if (isNaN(uid)) return message.channel.send("❎ **| Hey, that's an invalid uid!**");

            query = {uid: uid.toString()};
            namedb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res || res.isProcessed) return message.channel.send("❎ **| I'm sorry, this user does not have an active name change request!**");
                let user = guild.member(res.discordid);
                if (!user) {
                    updateVal = {
                        $set: {
                            new_username: null,
                            attachment: null,
                            isProcessed: true
                        }
                    };

                    namedb.updateOne(query, updateVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        message.channel.send("❎ **| I'm sorry, this user is not in the server!**");
                    })
                    return
                }

                let cooldown = res.cooldown;
                let old_name = res.current_username;
                let new_name = res.new_username;
                let prev_names = res.previous_usernames;

                let url = encodeURI(`http://ops.dgsrz.com/api/rename.php?apiKey=${droidapikey}&username=${old_name}&newname=${new_name}`);
                let content = '';
                let req = http.request(url, name_res => {
                    name_res.setEncoding("utf8");
                    name_res.setTimeout(10000);
                    name_res.on("data", chunk => {
                        content += chunk
                    });
                    name_res.on("end", () => {
                        let msg = content.split(" ");
                        if (msg[0] === 'FAILED') {
                            updateVal = {
                                $set: {
                                    new_username: null,
                                    attachment: null,
                                    isProcessed: true
                                }
                            };

                            namedb.updateOne(query, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send("❎ **| I'm sorry, the username that the user has requested has been taken!**");

                                embed.setTitle("Request Details")
                                    .setColor(16711711)
                                    .setDescription(`**Old Username**: ${old_name}\n**New Username**: ${new_name}\n**Creation date:** ${new Date((cooldown - 86400 * 30) * 1000).toUTCString()}\n\n**Status**: Denied\n**Reason**: New username taken`);

                                user.send("❎ **| Hey, I would like to inform you that your name change request was denied as the username you have requested has been taken.\n\nYou are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!**", {embed: embed}).catch(console.error)
                            });
                            return
                        }

                        prev_names.push(old_name);

                        updateVal = {
                            $set: {
                                username: new_name
                            }
                        };

                        binddb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                        });

                        updateVal = {
                            $set: {
                                current_username: new_name,
                                isProcessed: true,
                                attachment: null,
                                previous_usernames: prev_names
                            }
                        };

                        namedb.updateOne(query, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            message.channel.send("✅ **| Successfully accepted name change request.**");

                            embed.setTitle("Request Details")
                                .setColor(2483712)
                                .setDescription(`**Old Username**: ${old_name}\n**New Username**: ${new_name}\n**Creation date:** ${new Date((cooldown - 86400 * 30) * 1000).toUTCString()}\n\n**Status**: Accepted`);

                            user.send(`✅ **| Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in ${new Date(cooldown * 1000).toUTCString()}.**`, {embed: embed}).catch(console.error)
                        })
                    })
                });
                req.end()
            })
            break
        }
        case 'deny': {
            if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to do this.**");

            let uid = parseInt(args[1]);
            if (isNaN(uid)) return message.channel.send("❎ **| Hey, that's an invalid uid!**");

            const cmd_length = message.content.split(" ").slice(0, 3).join(" ").length + 1;
            let reason = message.content.substring(cmd_length);
            if (!reason) return message.channel.send("❎ **| Hey, please enter a denial reason!**")
            
            query = {uid: uid};
            namedb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res || res.isProcessed) return message.channel.send("❎ **| I'm sorry, this user does not have an active name change request!**");

                let user = guild.member(res.discordid);
                let cooldown = res.cooldown;
                let old_name = res.current_username;
                let new_name = res.new_username;

                updateVal = {
                    $set: {
                        new_username: null,
                        attachment: null,
                        isProcessed: true
                    }
                };

                namedb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!user) return message.channel.send(`✅ **| Successfully denied request with reason \`${reason}\`, however this user is not in the server!**`);
                    message.channel.send(`✅ **| Successfully denied request with reason \`${reason}\`.**`);

                    embed.setTitle("Request Details")
                        .setColor(16711711)
                        .setDescription(`**Old Username**: ${old_name}\n**New Username**: ${new_name}\n**Creation date:** ${new Date((cooldown - 86400 * 30) * 1000).toUTCString()}\n\n**Status**: Denied\n**Reason**: ${reason}`);

                    user.send(`❎ **| Hey, I would like to inform you that your name change request was denied due to \`${reason}\`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!**`, {embed: embed}).catch(console.error)
                })
            });
            break
        }
        case 'list': {
            namedb.find({isProcessed: false}).sort({cooldown: 1}).toArray((err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (res.length === 0) return message.channel.send("❎ **| I'm sorry, there is no active name change request now!**");
                
                let page = 1;
                embed = processEmbed(res, page, footer, index);
                message.channel.send({embed: embed}).then(msg => {
                    if (Math.ceil(res.length / 10) === page) return;
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error)
                            })
                        })
                    });

                    let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
                    let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
                    let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
                    let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});

                    backward.on('collect', () => {
                        if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        page = Math.max(1, page - 10);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        embed = processEmbed(res, page, footer, index);
                        msg.edit({embed: embed}).catch(console.error)
                    });

                    back.on('collect', () => {
                        if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        --page;
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        embed = processEmbed(res, page, footer, index);
                        msg.edit({embed: embed}).catch(console.error)
                    });

                    next.on('collect', () => {
                        if (page === Math.ceil(res.length / 10)) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        ++page;
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        embed = processEmbed(res, page, footer, index);
                        msg.edit({embed: embed}).catch(console.error);
                    });

                    forward.on('collect', () => {
                        if (page === Math.ceil(res.length / 10)) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        page = Math.min(page + 10, Math.ceil(res.length / 10));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        embed = processEmbed(res, page, footer, index);
                        msg.edit({embed: embed}).catch(console.error)
                    });

                    backward.on("end", () => {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
                    })
                })
            });
            break
        }
        default: {
            if (!(message.channel instanceof Discord.DMChannel)) {
                message.delete({reason: "Prevent email leak"}).catch(console.error);
                return message.channel.send("❎ **| I'm sorry, this part of the command is only allowed in DMs for privacy reasons.**")
            }

            let email = args[0];
            if (!email) return message.channel.send("❎ **| Hey, please enter your email address!**");

            let new_name = args[1];
            if (!new_name) return message.channel.send("❎ **| Hey, please enter the desired new nickname that you want to use!**");
            if (new_name.length < 2 || new_name > 20) return message.channel.send("❎ **| I'm sorry, a username must be at least 2 characters and doesn't exceed 20 characters!**");
            if (new_name.includes('<:')) return message.channel.send("❎ **| I'm sorry, a username cannot contain emojis!**");

            if (message.attachments.size !== 1) return message.channel.send("❎ **| Hey, please only attach one screenshot of your osu!droid main menu with your account logged in!**");
            let attachment = message.attachments.first();
            let url = attachment.url;
            let length = url.length;
            if (
                url.indexOf("png", length - 3) === -1 &&
                url.indexOf("jpg", length - 3) === -1 &&
                url.indexOf("jpeg", length - 4) === -1
            ) return message.channel.send("❎ **| Hey, please provide a valid screenshot!**");

            binddb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                let uid = res.uid;
                let username = res.username;

                query = {uid: uid};
                namedb.findOne(query, async (err, nameres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    let cooldown = 0;
                    if (nameres) {
                        if (!nameres.isProcessed) return message.channel.send("❎ **| Hey, you currently have an active request! Please wait for that one to get reviewed before submitting another one!**");
                        cooldown = nameres.cooldown;
                        if (curtime < cooldown) return message.channel.send(`❎ **| I'm sorry, you're still in cooldown! You will be able to send a name change request in \`${new Date(cooldown * 1000).toUTCString()}\`.**`);
                    }

                    const player = await new osudroid.PlayerInfo().get({uid: uid});
                    if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot fetch your profile! Perhaps osu!droid server is down?**");
                    if (email !== player.email) return message.channel.send("❎ **| I'm sorry, the email you have provided is not the same as the email registered to your binded osu!droid account!**");
                    if (username !== player.name) return message.channel.send("❎ **| I'm sorry, your username is not the same as the one stored in bot database! If you've requested a name change before, please rebind your account using `a!userbind <uid>` and then submit a request again!**");

                    const new_player = await new osudroid.PlayerInfo().get({username: new_name});
                    if (new_player.name) return message.channel.send("❎ **| I'm sorry, the username you have provided is already taken!**");

                    name_channel.send(`<@386742340968120321>\nName change request from <@${message.author.id}> (${message.author.id})\n\nUid: ${uid}\nNew username: ${new_name}\n\nCreated at ${new Date(curtime * 1000).toUTCString()}`, {files: [attachment]}).then(msg => {
                        if (nameres) {
                            updateVal = {
                                $set: {
                                    new_username: new_name,
                                    cooldown: curtime + 86400 * 30,
                                    attachment: msg.url,
                                    isProcessed: false
                                }
                            };
                            namedb.updateOne(query, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send("✅ **| Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your DMs or else you won't get notified of your name change request status!**")
                            })
                        } else {
                            insertVal = {
                                discordid: message.author.id,
                                current_username: username,
                                new_username: new_name,
                                uid: uid,
                                cooldown: curtime + 86400 * 30,
                                attachment: msg.url,
                                isProcessed: false,
                                previous_usernames: []
                            };
                            namedb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send("✅ **| Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your DMs or else you won't get notified of your name change request status!**")
                            })
                        }
                    })
                })
            })
        }
    }
};

module.exports.config = {
    name: "namechange",
    aliases: 'nc',
    description: "Main command for osu!droid name change requests.\n\nTo request a name change, use the first usage of the command (`namechange <email> <new username>`) __**in DM (Direct Message)**__. New username must be at least 2 characters and at most 20 characters, cannot contain spaces, and must not have any special characters and/or emotes.\n\nYou must allow me to DM you if you want to request a name change.",
    usage: "namechange <email> <new username>\nnamechange accept <uid>\nnamechange deny <uid> <reason>\nnamechange list",
    detail: "`email`: The email of the osu!droid account [String]\n`new username`: The new username the user wants to change to [String]\n`reason`: Reason for denial [String]\n`uid`: Uid of osu!droid account [Integer]",
    permission: "None | Specific person (<@132783516176875520> and <@386742340968120321>)"
};
