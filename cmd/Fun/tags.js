const Discord = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');

function listTag(tags, page, footer, index, color) {
    const embed = new Discord.MessageEmbed()
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(tags.length / 10)}`, footer[index])
        .setColor(color);

    let list = '';
    for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); i++) {
        if (!tags[i]) break;
        list += `${i+1}. ${tags[i].name}\n`;
    }
    embed.setDescription(`**Tags for <@${tags[0].author}>**\n**Total tags**: ${tags.length}\n\n${list}`);
    return embed;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel.type !== "text") {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }

    const tagdb = alicedb.collection("tags");
    const attachments_channel = client.channels.cache.get("695521921441333308");
    const color = message.member.roles.color?.hexColor || "#000000";
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setFooter("Alice Synthesis Thirty", footer[index]);

    switch (args[0]) {
        case "list": {
            const user = args[1]?.replace("<@!", "").replace("<@", "").replace(">", "") || message.author.id;
            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, there are no tags saved in this server!**");
                }

                let tags_list = res.tags;
                if (tags_list.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, there are no tags saved in this server!**");
                }

                tags_list = tags_list.filter(tag => tag.author === user);
                if (tags_list.length === 0) {
                    if (args[1]) {
                        return message.channel.send("❎ **| I'm sorry, this user doesn't have any saved tags in this server!**");
                    } else {
                        return message.channel.send("❎ **| I'm sorry, you don't have any saved tags in this server!**");
                    }
                }

                let page = 1;
                embed = listTag(tags_list, page, footer, index, color);

                message.channel.send({embed: embed}).then(msg => {
                    const page_length = Math.ceil(tags_list.length / 10);

                    if (page_length <= 1) {
                        return;
                    }

                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error);
                            });
                        });
                    });

                    let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
                    let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
                    let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
                    let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

                    backward.on('collect', () => {
                        page = Math.max(1, page - 10);
                        embed = listTag(tags_list, page, footer, index, color);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    back.on('collect', () => {
                        if (page === 1) page = page_length;
                        else page--;
                        embed = listTag(tags_list, page, footer, index, color);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    next.on('collect', () => {
                        if ((page - 1) * 10 >= tags_list.length) page = 1;
                        else page++;
                        embed = listTag(tags_list, page, footer, index, color);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    forward.on('collect', () => {
                        page = Math.min(page + 10, page_length);
                        embed = listTag(tags_list, page, footer, index, color);
                        msg.edit({embed: embed}).catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    backward.on("end", () => {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                    });
                });
            });
            break;
        }
        case 'add': {
            const name = args[1];
            if (!name) {
                return message.channel.send("❎ **| Hey, give your tag a name!**");
            }
            if (name.length > 30) {
                return message.channel.send("❎ **| I'm sorry, a tag's name must not exceed 30 characters!**");
            }

            const cmd_length = message.content.split(" ").slice(0, 3).join(" ").length + 1;
            let tag_content = message.content.substring(cmd_length);
            if (!tag_content) {
                tag_content = '';
            }
            if (tag_content.length > 1500) {
                return message.channel.send("❎ **| I'm sorry, you can only enter up to 1500 characters in a tag!**");
            }

            if (!tag_content && message.attachments.size === 0) {
                return message.channel.send("❎ **| Hey, please enter a content for your tag!**");
            }

            tag_content = tag_content.replace("@everyone", "").replace("@here", "");

            if (message.attachments.size > 3) {
                return message.channel.send("❎ **| I'm sorry, you can only use up to 3 attachments in a tag!**");
            }

            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                const tags = res.tags ?? [];

                if (tags.findIndex(tag => tag.name === name) !== -1) {
                    return message.channel.send("❎ **| I'm sorry, a tag with that name exists!**");
                }

                let attachments = [];
                if (message.attachments.size > 0) {
                    for (const [, attachment] of message.attachments.entries()) attachments.push(attachment.proxyURL);
                    attachments_channel.send(`**Tag by <@${message.author.id}>**\n**User ID**: ${message.author.id}\n**Name**: \`${name}\`\n**Created at ${message.createdAt.toUTCString()}**`, {files: attachments}).then(msg => {
                        let attachment_id = msg.id;
                        let attachment_list = [];
                        for (const [, attachment] of msg.attachments.entries()) attachment_list.push(attachment.url);
                        let tag = {
                            author: message.author.id,
                            name: name,
                            date: message.createdTimestamp,
                            content: tag_content,
                            attachment_message: attachment_id,
                            attachments: attachment_list
                        };
                        if (res) {
                            tags.push(tag);
                            let updateVal = {
                                $set: {
                                    tags: tags
                                }
                            };
                            tagdb.updateOne({guildid: message.guild.id}, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully added tag \`${name}\`.**`);
                            });
                        } else {
                            let insertVal = {
                                guildid: message.guild.id,
                                tags: [tag]
                            };
                            tagdb.insertOne(insertVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully added tag \`${name}\`.**`);
                            });
                        }
                    });
                } else {
                    const tag = {
                        author: message.author.id,
                        name: name,
                        date: message.createdTimestamp,
                        content: tag_content,
                        attachment_message: '',
                        attachments: []
                    };
                    if (res) {
                        tags.push(tag);
                        let updateVal = {
                            $set: {
                                tags: tags
                            }
                        };
                        tagdb.updateOne({guildid: message.guild.id}, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully added tag \`${name}\`.**`);
                        });
                    } else {
                        let insertVal = {
                            guildid: message.guild.id,
                            tags: [tag]
                        };
                        tagdb.insertOne(insertVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully added tag \`${name}\`.**`);
                        });
                    }
                }
            });
            break;
        }
        case 'delete': {
            const name = args[1];
            if (!name) {
                return message.channel.send("❎ **| Hey, give me a tag name!**");
            }
            if (name.length > 30) {
                return message.channel.send("❎ **| I'm sorry, a tag's name isn't more than 30 characters!**");
            }

            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this server doesn't have any saved tags!**");
                }

                const tags = res.tags;
                const tag_index = tags.findIndex(tag => tag.name === name);
                if (tag_index === -1) {
                    return message.channel.send("❎ **| I'm sorry, there is no tag with that name!**");
                }

                // allow server admins to remove tags that violate server rules
                if (!message.member.hasPermission("ADMINISTRATOR") && tags[tag_index].author !== message.author.id) {
                    return message.channel.send("❎ **| I'm sorry, this tag doesn't belong to you!**");
                }

                const attachment_id = tags[tag_index].attachment_message;
                tags.splice(tag_index, 1);

                message.channel.send(`❗**| ${message.author}, are you sure you want to delete tag \`${name}\`?**`).then(msg => {
                    msg.react("✅").catch(console.error);
                    let confirmation = false;
                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

                    confirm.on('collect', () => {
                        msg.delete().catch(console.error);
                        confirmation = true;

                        if (attachment_id) {
                            attachments_channel.messages.fetch(attachment_id).then((m) =>
                                m.delete({reason: "Tag deleted"}).catch(console.error));
                        }

                        const updateVal = {
                            $set: {
                                tags: tags
                            }
                        };
                        tagdb.updateOne({guildid: message.guild.id}, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully deleted tag \`${name}\`.**`);
                        });
                    });
                    confirm.on("end", () => {
                        if (!confirmation) {
                            msg.delete().catch(console.error);
                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                        }
                    });
                });
            });
            break;
        }
        case 'edit': {
            const name = args[1];
            if (!name) {
                return message.channel.send("❎ **| Hey, give me a tag name!**");
            }
            if (name.length > 30) {
                return message.channel.send("❎ **| I'm sorry, a tag's name isn't more than 30 characters!**");
            }

            const cmd_length = message.content.split(" ").slice(0, 3).join(" ").length + 1;
            let new_content = message.content.substring(cmd_length);
            if (!new_content) {
                new_content = '';
            }
            if (new_content.length > 1500) {
                return message.channel.send("❎ **| I'm sorry, you can only enter up to 1500 characters in a tag!**");
            }

            new_content = new_content.replace("@everyone", "").replace("@here", "");

            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this server doesn't have any saved tags!**");
                }

                const tags = res.tags;
                if (tags.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, there are no tags saved in this server!**");
                }

                const tag_index = tags.findIndex(tag => tag.name === name);
                if (tag_index === -1) {
                    return message.channel.send("❎ **| I'm sorry, there is no tag with that name!**");
                }

                // allow server admins to edit tags that violate server rules
                if (!message.member.hasPermission("ADMINISTRATOR") && tags[tag_index].author !== message.author.id) {
                    return message.channel.send("❎ **| I'm sorry, this tag doesn't belong to you!**");
                }

                tags[tag_index].content = new_content;

                message.channel.send(`❗**| ${message.author}, are you sure you want to edit tag \`${name}\`?**`).then(msg => {
                    msg.react("✅").catch(console.error);
                    let confirmation = false;
                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

                    confirm.on('collect', () => {
                        msg.delete().catch(console.error);
                        confirmation = true;

                        let updateVal = {
                            $set: {
                                tags: tags
                            }
                        };
                        tagdb.updateOne({guildid: message.guild.id}, updateVal, err => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully edited tag \`${name}\`.**`);
                        });
                    });
                    confirm.on("end", () => {
                        if (!confirmation) {
                            msg.delete().catch(console.error);
                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                        }
                    });
                });
            });
            break;
        }
        case 'info': {
            const name = args[1];
            if (!name) {
                return message.channel.send("❎ **| Hey, give me a tag name!**");
            }
            if (name.length > 30) {
                return message.channel.send("❎ **| I'm sorry, a tag's name isn't more than 30 characters!**");
            }

            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this server doesn't have any saved tags!**");
                }

                const tags = res.tags;
                if (tags.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, there are no tags saved in this server!**");
                }

                const tag_index = tags.findIndex(tag => tag.name === name);
                if (tag_index === -1) {
                    return message.channel.send("❎ **| I'm sorry, there is no tag with that name!**");
                }

                const tag = tags[tag_index];
                const string = `**Name**: ${tag.name}\n**Author**: <@${tag.author}>\n**Creation date**: ${new Date(tag.date).toUTCString()}\n**Attachment amount**: ${tag.attachments.length}`;

                embed.setTitle("Tag Information").setDescription(string);
                message.channel.send({embed: embed});
            });
            break;
        }
        case "move": {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
            }

            const oldUser = args[1]?.replace(/[<@!>]/g, "");
            if (!oldUser) {
                return message.channel.send("❎ **| Hey, please enter a user to move tags from!**");
            }
            const newUser = await message.guild.members.fetch(message.mentions.users.last() || args[2]).catch();
            if (!newUser) {
                return message.channel.send("❎ **| Hey, please enter a valid user to move tags to!**");
            }

            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this server doesn't have any saved tags!**");
                }

                const tags = res.tags;
                if (tags.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, there are no tags saved in this server!**");
                }

                tags.forEach(tag => {
                    if (tag.author === oldUser) {
                        tag.author = newUser.id;
                    }
                });

                const updateVal = {
                    $set: {
                        tags: tags
                    }
                };

                tagdb.updateOne({guildid: message.guild.id}, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully moved old user's tags to new user.**`);
                });
            });
            break;
        }
        default: {
            const name = args[0];
            if (!name) {
                return message.channel.send("❎ **| Hey, give me a tag name!**");
            }
            if (name.length > 30) {
                return message.channel.send("❎ **| I'm sorry, a tag's name isn't more than 30 characters!**");
            }

            tagdb.findOne({guildid: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, this server doesn't have any saved tags!**");
                }

                const tags = res.tags;
                if (tags.length === 0) {
                    return message.channel.send("❎ **| I'm sorry, there are no tags saved in this server!**");
                }

                const tag_index = tags.findIndex(tag => tag.name === name);
                if (tag_index === -1) {
                    return message.channel.send("❎ **| I'm sorry, there is no tag with that name!**");
                }

                const tag = tags[tag_index];
                message.channel.send(tag.content, {files: tag.attachments, disableMentions: 'all'});
            });
        }
    }
};

module.exports.config = {
    name: "tags",
    aliases: "t",
    description: "Main command for tags. Tags can have a name up to 30 characters and content up to 1500 characters, with up to 3 attachments.",
    usage: "tags <name>\ntags add <name> [content]\ntags delete <name>\ntags edit <name> [content]\ntags move <old user> <new user>\ntags info <name>\ntags list [user]",
    detail: "`content`: Content of the tag, up to 1500 characters [String]\n`old user`: The old user to move tags from [UserResolvable (mention or user ID)]\n`name`: The name of the tag, up to 30 characters [String]\n`new user`: The new user to move tags to [UserResolvable (mention or user ID)]\n`user`: The user to retrieve tag list from [UserResolvable (mention or user ID)]",
    permission: "None | Specific person (<@132783516176875520> and <@386742340968120321>)"
};