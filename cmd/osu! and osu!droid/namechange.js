const Discord = require('discord.js');
const osudroid = require('osu-droid');
const config = require('../../config.json');
const {Db} = require('mongodb');

function hasUnicode(str = "") {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127) return true;
    }
    return false;
}

function processEmbed(res, page, footer, index) {
    const embed = new Discord.MessageEmbed()
        .setTitle("Name Change Request List")
        .setColor("#cb9000")
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(res.length / 10)}`, footer[index]);
    
    for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); i++) {
        if (!res[i]) break;
        embed.addField(`**${i+1}**. **${res[i].current_username} (${res[i].uid})**`, `**Discord Account**: <@${res[i].discordid}> (${res[i].discordid})\n**Username requested:** ${res[i].new_username}\n**Creation Date**: ${new Date((res[i].cooldown - 86400 * 30) * 1000).toUTCString()}\n[Screenshot Attachment](${res[i].attachment}) (only viewable to <@132783516176875520> and <@386742340968120321>)`);
    }
    
    return embed;
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
            namedb.findOne(query, async (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res || res.isProcessed) return message.channel.send("❎ **| I'm sorry, this user does not have an active name change request!**");
                let cooldown = res.cooldown;
                let old_name = res.current_username;
                let new_name = res.new_username;
                let prev_names = res.previous_usernames;
                const user = await guild.members.fetch(res.discordid).catch(console.error);

                const apiRequestBuilder = new osudroid.DroidAPIRequestBuilder()
                    .setEndpoint("rename.php")
                    .addParameter("username", old_name)
                    .addParameter("newname", new_name);

                const result = await apiRequestBuilder.sendRequest();
                if (result.statusCode !== 200) {
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid server. Please try again!**");
                }
                const content = result.data.toString("utf-8");
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

                        if (user) {
                            embed.setTitle("Request Details")
                                .setColor(16711711)
                                .setDescription(`**Old Username**: ${old_name}\n**New Username**: ${new_name}\n**Creation Date:** ${new Date((cooldown - 86400 * 30) * 1000).toUTCString()}\n\n**Status**: Denied\n**Reason**: New username taken`);

                            user.send("❎ **| Hey, I would like to inform you that your name change request was denied as the username you have requested has been taken.\n\nYou are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!**", {embed: embed}).catch(console.error);
                        }
                    });
                    return;
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
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
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

                    if (user) {
                        embed.setTitle("Request Details")
                            .setColor(2483712)
                            .setDescription(`**Old Username**: ${old_name}\n**New Username**: ${new_name}\n**Creation Date:** ${new Date((cooldown - 86400 * 30) * 1000).toUTCString()}\n\n**Status**: Accepted`);

                        user.send(`✅ **| Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in ${new Date(cooldown * 1000).toUTCString()}.**`, {embed: embed}).catch(console.error);
                    }
                });
            });
            break;
        }
        case 'deny': {
            if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to do this.**");

            let uid = parseInt(args[1]);
            if (isNaN(uid)) return message.channel.send("❎ **| Hey, that's an invalid uid!**");

            const cmd_length = message.content.split(" ").slice(0, 3).join(" ").length + 1;
            let reason = message.content.substring(cmd_length);
            if (!reason) return message.channel.send("❎ **| Hey, please enter a denial reason!**")
            
            query = {uid: uid.toString()};
            namedb.findOne(query, async (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res || res.isProcessed) return message.channel.send("❎ **| I'm sorry, this user does not have an active name change request!**");

                const user = await guild.members.fetch(res.discordid).catch(console.error);
                let cooldown = res.cooldown;
                let old_name = res.current_username;
                let new_name = res.new_username;

                updateVal = {
                    $set: {
                        cooldown: cooldown - 86400 * 30,
                        new_username: null,
                        attachment: null,
                        isProcessed: true
                    }
                };

                namedb.updateOne(query, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!user) return message.channel.send(`✅ **| Successfully denied request with reason \`${reason}\`, however this user is not in the server!**`);
                    message.channel.send(`✅ **| Successfully denied request with reason \`${reason}\`.**`);

                    embed.setTitle("Request Details")
                        .setColor(16711711)
                        .setDescription(`**Old Username**: ${old_name}\n**New Username**: ${new_name}\n**Creation Date:** ${new Date((cooldown - 86400 * 30) * 1000).toUTCString()}\n\n**Status**: Denied\n**Reason**: ${reason}`);

                    user.send(`❎ **| Hey, I would like to inform you that your name change request was denied due to \`${reason}\`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!**`, {embed: embed}).catch(console.error);
                });
            });
            break;
        }
        case 'list': {
            namedb.find({isProcessed: false}).sort({cooldown: 1}).toArray((err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (res.length === 0) return message.channel.send("❎ **| I'm sorry, there is no active name change request now!**");
                
                let page = 1;
                embed = processEmbed(res, page, footer, index);
                message.channel.send({embed: embed}).then(msg => {
                    if (Math.ceil(res.length / 10) === page) return;
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error);
                            });
                        });
                    });

                    const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
                    const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
                    const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
                    const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});

                    backward.on('collect', () => {
                        if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        page = Math.max(1, page - 10);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        embed = processEmbed(res, page, footer, index);
                        msg.edit({embed: embed}).catch(console.error);
                    });

                    back.on('collect', () => {
                        if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        --page;
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                        embed = processEmbed(res, page, footer, index);
                        msg.edit({embed: embed}).catch(console.error);
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
        default: {
            if (!(message.channel.type !== "text")) {
                message.delete({reason: "Prevent email leak"}).catch(console.error);
                return message.channel.send("❎ **| I'm sorry, this part of the command is only allowed in DMs for privacy reasons.**");
            }

            if (args.length !== 2) return message.channel.send("❎ **| Hey, spaces in nicknames are not allowed!**");

            const email = args[0];
            if (!email) return message.channel.send("❎ **| Hey, please enter your email address!**");

            const new_name = args[1];
            if (!new_name) return message.channel.send("❎ **| Hey, please enter the desired new nickname that you want to use!**");
            if (new_name.length < 2 || new_name.length > 20) return message.channel.send("❎ **| I'm sorry, a username must be at least 2 characters and doesn't exceed 20 characters!**");
            if (hasUnicode(new_name) || !(/^[a-zA-Z0-9_]+$/.test(new_name))) return message.channel.send("❎ **| I'm sorry, usernames can only contain letters, numbers, and underscores!**");
            if (new_name.includes('<:')) return message.channel.send("❎ **| I'm sorry, a username cannot contain emojis!**");

            if (message.attachments.size === 0) return message.channel.send("❎ **| Hey, please attach a screenshot of your osu!droid main menu with your account logged in!**");
            if (message.attachments.size > 1) return message.channel.send("❎ **| Hey, please attach only one screenshot of your osu!droid main menu with your account logged in!**");
            const attachment = message.attachments.first();
            const url = attachment.url;
            const length = url.length;
            if (
                url.indexOf("png", length - 3) === -1 &&
                url.indexOf("jpg", length - 3) === -1 &&
                url.indexOf("jpeg", length - 4) === -1
            ) return message.channel.send("❎ **| Hey, please provide a valid screenshot!**");
            if (attachment.size >= 8e6) {
                return message.channel.send("❎ **| I'm sorry, your screenshot's size is above 8 MB! Please upload a screenshot with smaller size!**");
            }

            binddb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                const uid = res.uid;
                const username = res.username;

                query = {uid: uid};
                namedb.findOne(query, async (err, nameres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    let cooldown = 0;
                    if (nameres) {
                        if (!nameres.isProcessed) return message.channel.send("❎ **| Hey, you currently have an active request! Please wait for that one to get reviewed before submitting another one!**");
                        cooldown = nameres.cooldown;
                        if (curtime < cooldown) return message.channel.send(`❎ **| I'm sorry, you're still in cooldown! You will be able to send a name change request in \`${new Date(cooldown * 1000).toUTCString()}\`.**`);
                    }

                    const player = await osudroid.Player.getInformation({uid: uid});
                    if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
                    if (email !== player.email) return message.channel.send("❎ **| I'm sorry, the email you have provided is not the same as the email registered to your binded osu!droid account!**");
                    if (username !== player.username) return message.channel.send("❎ **| I'm sorry, your username is not the same as the one stored in bot database! If you've requested a name change before, please rebind your account using `a!userbind <uid>` and then submit a request again!**");

                    const new_player = await osudroid.Player.getInformation({username: new_name});
                    if (new_player.error) return message.channel.send("❎ **| I'm sorry, I couldn't check for nickname availability! Perhaps osu!droid server is down?**");
                    if (new_player.username) return message.channel.send("❎ **| I'm sorry, the username you have provided is already taken!**");

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
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send("✅ **| Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your DMs or else you won't get notified of your name change request status!**");
                            });
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
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send("✅ **| Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your DMs or else you won't get notified of your name change request status!**");
                            });
                        }
                    });
                });
            });
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
