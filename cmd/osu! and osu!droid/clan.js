const Discord = require('discord.js');
const config = require('../../config.json');
const cd = new Set();

function capitalizeString(string = "") {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission but used for this command, practically the same
    eligibleRoleList.forEach((id) => {
        if (member.roles.cache.has(id[0])) res = id[1]
    });
    return res
}

function timeConvert(num) {
    let sec = parseInt(num);
    let days = Math.floor(sec / 86400);
    let hours = Math.floor((sec - days * 86400) / 3600);
    let minutes = Math.floor((sec - days * 86400 - hours * 3600) / 60);
    let seconds = sec - days * 86400 - hours * 3600 - minutes * 60;
    return [days, hours, minutes, seconds]
}

function editmember(clanres, page, rolecheck, footer, index) {
    let embed = new Discord.MessageEmbed()
        .setTitle(`${clanres[0].name} Members (Page ${page + 1}/4)`)
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(rolecheck);
    
    let list = clanres[0].member_list;
    let memberstring = '';
    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!list[i]) break;
        memberstring += `${i+1}. <@${list[i][0]}> (${list[i][0]}) - ${list[i][2] ? "Leader/Co-Leader": "Member"}\n`
    }
    embed.setDescription(memberstring);
    return embed
}

function spaceFill(s, l) {
    let a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

function editlb(res, page) {
    let output = '#   | Clan Name            | Members | Power\n';
    for (let i = page * 20; i < page * 20 + 20; i++) {
        if (res[i]) {
            if (res[i].power && res[i].name) output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].name, 21) + ' | ' + spaceFill(res[i].member_list.length.toLocaleString(), 8) + ' | ' + res[i].power.toLocaleString() + '\n';
            else output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].name, 21) + ' | ' + spaceFill(res[i].member_list.length.toLocaleString(), 8) + ' | ' + res[i].power.toLocaleString() + '\n';
        }
        else output += spaceFill("-", 4) + ' | ' + spaceFill("-", 21) + ' | ' + spaceFill("-", 8) + ' | - \n';
    }
    output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
    return output
}

function editAuction(res, coin, page, rolecheck, footer, index) {
    let embed = new Discord.MessageEmbed()
        .setColor(rolecheck)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.floor(res.length / 5)}`, footer[index])
        .setDescription(`**${res.length === 1 ? "Auction" : "Auctions"}**: ${res.length.toLocaleString()}`);

    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!res[i]) break;
        embed.addField(`**${i+1}. ${res[i].name}**`, `**Auctioneer**: ${res[i].auctioneer}\n**Created at**: ${new Date(res[i].creationdate * 1000).toUTCString()}\n**Expires at**: ${new Date(res[i].expirydate * 1000).toUTCString()}\n\n**Powerup**: ${capitalizeString(res[i].powerup)}\n**Amount**: ${res[i].amount.toLocaleString()}\n**Minimum bid amount**: ${coin}**${res[i].min_price.toLocaleString()}** Alice coins\n**Bidders**: ${res[i].bids.length.toLocaleString()}`)
    }

    return embed
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    //if (message.guild.id != '316545691545501706') return message.channel.send("❎ **| I'm sorry, this command is only available in droid (International) Discord server!**");
    if (message.author.id !== '386742340968120321' && message.author.id !== '132783516176875520') return message.channel.send("❎ **| I'm sorry, this command is still in testing!**");
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    let binddb = maindb.collection("userbind");
    let clandb = maindb.collection("clandb");
    let pointdb = alicedb.collection("playerpoints");
    let auctiondb = alicedb.collection("auction");
    let coin = client.emojis.cache.get("669532330980802561");
    let curtime = Math.floor(Date.now() / 1000);
    let perm = isEligible(message.member) === -1;
    let query = {};
    let updateVal;
    let insertVal;
    let rolecheck;
    try {
        rolecheck = message.member.roles.highest.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(rolecheck);

    switch (args[0]) {
        case "info": {
            // view info of a clan
            // ============================
            // if args[1] is not specified,
            // it will search for the user's
            // clan
            query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                let clan = userres[0].clan;
                if (args[1]) clan = args.slice(1).join(" ");
                if (!clan) return message.channel.send("❎ **| I'm sorry, you are currently not in a clan! Please enter a clan name!**");
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    let power = clanres.power;
                    let clandate = clanres.createdAt * 1000;
                    let members = clanres.member_list.length;
                    let clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                    if (clanrole) embed.setColor(clanrole.hexColor);
                    embed.setTitle(clan)
                        .addField("Clan Leader", `<@${clanres[0].leader}>\n(${clanres[0].leader})`, true)
                        .addField("Power", power.toLocaleString(), true)
                        .addField("Members", members.toLocaleString(), true)
                        .addField("Created at", new Date(clandate).toUTCString());
                    if (clanres[0].icon) embed.setThumbnail(clanres[0].icon);
                    message.channel.send({embed: embed}).catch(console.error);
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 4000);
            break
        }
        case "members": {
            // view members of a clan
            // =================================
            // not really special, just
            // like other lbs one it uses paging
            let page = 1;
            if (args[2]) {
                if (isNaN(args[2]) || parseInt(args[2]) > 5 || parseInt(args[1]) <= 0) page = 1;
                else page = parseInt(args[2]);
            }
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                let clan = userres.clan;
                if (args[1]) clan = args.slice(1).join(" ");
                if (!clan) return message.channel.send("❎ **| I'm sorry, you are currently not in a clan! Please enter a clan name!**");
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    let clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                    if (clanrole) rolecheck = clanrole.hexColor;
                    let embed = editmember(clanres, page, rolecheck, footer, index);
                    message.channel.send({embed: embed}).then(msg => {
                        msg.react("⏮️").then(() => {
                            msg.react("⬅️").then(() => {
                                msg.react("➡️").then(() => {
                                    msg.react("⏭️").catch(console.error)
                                })
                            })
                        });

                        let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 45000});
                        let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 45000});
                        let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 45000});
                        let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 45000});

                        backward.on('collect', () => {
                            if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            else page = 1;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error)
                        });

                        back.on('collect', () => {
                            if (page === 1) page = 5;
                            else page--;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error)
                        });

                        next.on('collect', () => {
                            if (page === 5) page = 1;
                            else page++;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error);
                        });

                        forward.on('collect', () => {
                            if (page === 5) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            else page = 5;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit({embed: embed}).catch(console.error)
                        });

                        backward.on("end", () => {
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
                        })
                    })
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 5000);
            break
        }
        case "lb": {
            // views leaderboard of clans based on power points
            // ================================================
            // will be able to specify page
            let page = 0;
            if (parseInt(args[1]) > 0) page = parseInt(args[1]) - 1;
            clandb.find({}, {projection: {_id: 0, name: 1, member_list: 1, power: 1}}).sort({power: -1}).toArray((err, clanres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!clanres[page*20]) return message.channel.send("Nah we don't have that much clan :p");
                let output = editlb(clanres, page);
                message.channel.send('```c\n' + output + '```').then(msg => {
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error)
                            })
                        })
                    });

                    let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
                    let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
                    let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
                    let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

                    backward.on('collect', () => {
                        page = 0;
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
                    });

                    back.on('collect', () => {
                        if (page === 0) page = Math.floor(clanres.length / 20);
                        else page--;
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
                    });

                    next.on('collect', () => {
                        if ((page + 1) * 20 >= clanres.length) page = 0;
                        else page++;
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
                    });

                    forward.on('collect', () => {
                        page = Math.floor(clanres.length / 20);
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
                    });

                    backward.on("end", () => {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
                    })
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 4000);
            break
        }
        case "upkeep": {
            // views weekly uptime pickup of the user's clan
            // =============================================
            // allows a clan to prepare for their weekly
            // upkeep so that it is not sudden
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clan = userres.clan;
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find your clan!**");
                    let time = timeConvert(clanres.weeklyfee - curtime);
                    message.channel.send(`✅ **| ${message.author}, your clan's weekly upkeep will be picked up in ${time[0] === 0 ? "" : `${time[0] === 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] === 0 ? "" : `${time[0] === 0 ? "" : ", "}${time[1] === 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] === 0 ? "" : `${time[1] === 0 ? "" : ", "}${time[2] === 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] === 0 ? "" : `${time[2] === 0 ? "" : ", "}${time[3] === 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 4000);
            break
        }
        case "accept": {
            let toaccept = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!toaccept) return message.channel.send("❎ **| Hey, please enter a correct user!**");
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                query = {discordid: toaccept.id};
                binddb.findOne(query, (err, joinres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!joinres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                    if (joinres.clan) return message.channel.send("❎ **| I'm sorry, this user is already in a clan!**");
                    let cooldown = joinres.joincooldown - curtime;
                    if (cooldown > 0) {
                        let time = timeConvert(cooldown);
                        return message.channel.send(`❎ **| I'm sorry, that user is still in cooldown! Please wait for ${time[0] === 0 ? "" : `${time[0] === 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] === 0 ? "" : `${time[0] === 0 ? "" : ", "}${time[1] === 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] === 0 ? "" : `${time[1] === 0 ? "" : ", "}${time[2] === 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] === 0 ? "" : `${time[2] === 0 ? "" : ", "}${time[3] === 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                    }
                    let oldcooldown = userres.oldjoincooldown - curtime;
                    if (oldcooldown > 0 && userres.oldclan === joinres.clan) {
                        let time = timeConvert(oldcooldown);
                        return message.channel.send(`❎ **| I'm sorry, that user is still in cooldown! Please wait for ${time[0] === 0 ? "" : `${time[0] === 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] === 0 ? "" : `${time[0] === 0 ? "" : ", "}${time[1] === 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] === 0 ? "" : `${time[1] === 0 ? "" : ", "}${time[2] === 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] === 0 ? "" : `${time[2] === 0 ? "" : ", "}${time[3] === 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                    }
                    let uid = joinres.uid;
                    query = {name: userres.clan};
                    clandb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find your clan!**");
                        if (message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, only the clan leader can accept new members!**");
                        let memberlist = clanres[0].member_list;
                        for (let i = 0; i < memberlist.length; i++) {
                            if (memberlist[i][0] === toaccept.id) return message.channel.send("❎ **| I'm sorry, this user is already in your clan!**");
                        }
                        if (memberlist.length >= 25) return message.channel.send("❎ **| I'm sorry, a clan can only have up to 25 members (including leader)!");
                        message.channel.send(`❗**| ${message.author}, are you sure you want to accept ${toaccept} to your clan?**`).then(msg => {
                            msg.react("✅").catch(console.error);
                            let confirmation = false;
                            let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && (user.id === message.author.id || user.id === toaccept.id), {time: 20000});
                            let confirmbox = [];
                            confirm.on("collect", () => {
                                if (!confirmbox.includes(message.author.id)) confirmbox.push(message.author.id);
                                if (!confirmbox.includes(toaccept.id)) confirmbox.push(toaccept.id);
                                if (confirmbox.length === 2) {
                                    confirmation = true;
                                    msg.delete();
                                    let role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                    let clanrole = message.guild.roles.cache.find((r) => r.name === userres.clan);
                                    if (clanrole) toaccept.roles.add([role, clanrole], "Accepted into clan").catch(console.error);
                                    memberlist.push([toaccept.id, uid, false]);
                                    updateVal = {
                                        $set: {
                                            member_list: memberlist
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        console.log("Clan data updated")
                                    });
                                    updateVal = {
                                        $set: {
                                            clan: userres.clan
                                        }
                                    };
                                    binddb.updateOne({discordid: toaccept.id}, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        message.channel.send(`✅ **| ${message.author}, successfully accepted ${toaccept} as your clan member.**`);
                                        console.log("User data updated")
                                    })
                                }
                            });
                            confirm.on("end", () => {
                                if (!confirmation) {
                                    msg.delete();
                                    message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                }
                            })
                        })
                    })
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2000);
            break
        }
        case "kick": {
            // kicks a user out of a clan
            // ===============================
            // for now this is only restricted
            // to clan leaders and server mods
            let tokick = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!tokick) return message.channel.send("❎ **| Hey, please enter a correct user!**");
            if (message.author.id === tokick.id) return message.channel.send("❎ **| Hey, you cannot kick yourself!**");
            let reason = args.slice(2).join(" ");
            if (!reason) return message.channel.send("❎ **| Hey, please enter a reason!**");
            query = {discordid: tokick.id};
            binddb.findOne(query, (err, kickres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!kickres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!kickres.clan) return message.channel.send("❎ **| I'm sorry, this user is not in any clan!**");
                let clan = kickres.clan;
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id !== clanres.leader && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                    if (tokick.id === clanres.leader) return message.channel.send("❎ **| I'm sorry, you cannot kick the leader of the clan!**");
                    let memberlist = clanres.member_list;
                    let member_index = clanres.member_list.findIndex(member => member[0] === tokick.id);
                    if (member_index === -1) return message.channel.send("❎ **| I'm sorry, this user is not in your clan!");
                    message.channel.send(`❗**| ${message.author}, are you sure you want to kick the user out from ${perm?`\`${clan}\``:""} clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            let role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                            let clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                            if (clanrole) tokick.roles.remove([role, clanrole], "Kicked from clan").catch(console.error);
                            updateVal = {
                                $set: {
                                    member_list: memberlist.splice(member_index, 1)
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                console.log("Clan data updated")
                            });
                            updateVal = {
                                $set: {
                                    clan: "",
                                    joincooldown: curtime + 86400 * 3,
                                    oldclan: clan,
                                    oldjoincooldown: curtime + 86400 * 14
                                }
                            };
                            binddb.updateOne({discordid: tokick.id}, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully kicked user for ${reason}.**`);
                                console.log("User data updated")
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2500);
            break
        }
        case "leave": {
            // leaves a clan
            // ======================
            // pretty straightforward
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clan = userres.clan;
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id === clanres.leader) return message.channel.send("❎ **| I'm sorry, you cannot leave as the leader of the clan!**");
                    message.channel.send(`❗**| ${message.author}, are you sure you want to leave your current clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            let role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                            let clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                            if (clanrole) message.member.roles.remove([role, clanrole], "Left the clan").catch(console.error);
                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member[0] === message.author.id);
                            memberlist.splice(member_index, 1);
                            updateVal = {
                                $set: {
                                    member_list: memberlist
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                console.log("Clan data updated")
                            });
                            updateVal = {
                                $set: {
                                    clan: "",
                                    joincooldown: curtime + 86400 * 3,
                                    oldclan: clan,
                                    oldjoincooldown: curtime + 86400 * 14
                                }
                            };
                            binddb.updateOne({discordid: message.author.id}, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully left \`${clan}\` clan.**`);
                                console.log("User clan data updated")
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2000);
            break
        }
        case "create": {
            // creates a clan
            // =========================
            // this will use Alice coins
            // as currency
            let clanname = args.slice(1).join(" ");
            if (!clanname) return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
            if (clanname.length > 20) return message.channel.send("❎ **| I'm sorry, clan names can only be 20 characters long!**");
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (userres.clan) return message.channel.send("❎ **| I'm sorry, you are already in a clan!**");
                let uid = userres.uid;
                pointdb.findOne(query, (err, pointres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan! Creating a clan costs ${coin}\`7,500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                    let alicecoins = pointres.alicecoins;
                    if (alicecoins < 7500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan! Creating a clan costs ${coin}\`7,500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                    query = {name: clanname};
                    clandb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (clanres) return message.channel.send("❎ **| I'm sorry, that name is already taken by other clan!**");
                        message.channel.send(`❗**| ${message.author}, are you sure you want to create a clan named \`${clanname}\` for ${coin}\`7,500\` Alice coins?**`).then(msg => {
                            msg.react("✅").catch(console.error);
                            let confirmation = false;
                            let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                            confirm.on("collect", () => {
                                confirmation = true;
                                msg.delete();
                                query = {discordid: message.author.id};
                                updateVal = {
                                    $set: {
                                        alicecoins: alicecoins - 7500
                                    }
                                };
                                pointdb.updateOne(query, updateVal, err => {
                                    if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    console.log("User coins data updated")
                                });
                                updateVal = {
                                    $set: {
                                        clan: clanname
                                    }
                                };
                                binddb.updateOne(query, updateVal, err => {
                                    if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    console.log("User data updated")
                                });
                                insertVal = {
                                    name: clanname,
                                    power: 0,
                                    createdAt: curtime,
                                    leader: message.author.id,
                                    icon: "",
                                    iconcooldown: 0,
                                    namecooldown: 0,
                                    weeklyfee: curtime + 86400 * 7,
                                    isMatch: false,
                                    powerups: [['megabuff', 0], ['megadebuff', 0], ["superbuff", 0], ["superdebuff", 0], ["superchallenge", 0], ["superbomb", 0], ["buff", 0], ["debuff", 0], ["challenge", 0], ["bomb", 0]],
                                    active_powerups: [],
                                    member_list: [[message.author.id, uid, true]]
                                };
                                clandb.insertOne(insertVal, err => {
                                    if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    message.channel.send(`✅ **| ${message.author}, successfully created a clan named \`${clanname}\`. You now have ${coin}\`${(alicecoins - 7500).toLocaleString()}\` Alice coins.**`);
                                    console.log("Clan data added")
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
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2500);
            break
        }
        case "promote": {
            // promotes a clan member to co-leader
            // ==================================================
            // co-leaders can do anything that a leader can
            // except changing clan name, disbanding it, changing
            // role color, and promoting other members
            let topromote = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!topromote) return message.channel.send("❎ **| Hey, please mention a valid user to promote!**");

            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clan = userres.clan;

                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                    let member_list = clanres.member_list;
                    let member_index = member_list.findIndex(member => member[0] === topromote.id);
                    if (member_index === -1) return message.channel.send("❎ **| I'm sorry, the user is not in your clan!**");
                    if (member_list[member_index][2]) return message.channel.send("❎ **| I'm sorry, this user is already a co-leader!**");
                    member_list[member_index][2] = true;

                    message.channel.send(`❗**| ${message.author}, are you sure you want to promote ${topromote} to co-leader?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();

                            updateVal = {
                                $set: {
                                    member_list: member_list
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully promoted ${topromote} to co-leader.**`)
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
        case "demote": {
            // demotes a clan member to normal member
            // ======================================
            // moderators can demote a user to normal
            // member despite them being outside the
            // clan
            let todemote = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));
            if (!todemote) return message.channel.send("❎ **| Hey, please mention a valid user to demote!**");

            query = {discordid: todemote.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she needs to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres.clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                let clan = userres.clan;

                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the user's clan!**");
                    if (!perm && message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                    let member_list = clanres.member_list;
                    let member_index = member_list.findIndex(member => member[0] === todemote.id);
                    if (!perm && member_index === -1) return message.channel.send("❎ **| I'm sorry, the user is not in a clan!**");
                    if (!member_list[member_index][2]) return message.channel.send("❎ **| I'm sorry, this user is already a normal member!**");
                    member_list[member_index][2] = false;

                    message.channel.send(`❗**| ${message.author}, are you sure you want to demote ${todemote} to normal member?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();

                            updateVal = {
                                $set: {
                                    member_list: member_list
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully demoted ${todemote} to normal member.**`)
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
        case "disband": {
            // disbands a clan
            // ===========================
            // restricted for clan leaders
            // and server mods
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres && !perm) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres.clan && !perm) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clanname = '';
                if (perm) {
                    if (args[1]) clanname = args.slice(1).join(" ");
                    else clanname = userres.clan;
                    if (!clanname) return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
                }
                else clanname = userres.clan;
                query = {name: clanname};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id !== clanres.leader && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this command.**");
                    message.channel.send(`❗**| ${message.author}, are you sure you want to disband ${perm && args[1]?`\`${clanname}\` clan`:"your clan"}?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            let clanrole = message.guild.roles.cache.find((r) => r.name === clanname);
                            if (clanrole) {
                                clanrole.delete("Clan disbanded").catch(console.error);
                                let role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                clanres.member_list.forEach((member) => {
                                    message.guild.members.cache.get(member[0]).roles.remove(role, "Clan disbanded").catch(console.error)
                                })
                            }
                            updateVal = {
                                $set: {
                                    clan: ""
                                }
                            };
                            binddb.updateMany({clan: clanname}, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                            });
                            auctiondb.deleteMany({auctioneer: clanname}, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                            });
                            clandb.deleteOne({name: clanname}, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully disbanded ${perm && args[1]?`a clan named \`${clanname}\``:"your clan"}.**`);
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2000);
            break
        }
        case "icon": {
            // main hub for clan icons
            // ============================
            // removal of icons is allowed
            // for server mods to filter
            // icons that are contradicting
            // server rules
            switch (args[1]) {
                case "set": {
                    // set icon
                    let icon = args[2];
                    if (!icon) return message.channel.send("❎ **| Hey, I don't know what icon to set!**");
                    if (!icon.includes("http")) return message.channel.send("❎ **| Hey, I think that icon link is invalid!**");
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            if (message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member[0] === message.author.id);
                            let hasPermission = memberlist[member_index][2];
                            if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            if (clanres.power < 250) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 250!**");
                            let cooldown = clanres.iconcooldown - curtime;
                            if (cooldown > 0) {
                                let time = timeConvert(cooldown);
                                return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time[0] === 0 ? "" : `${time[0] === 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] === 0 ? "" : `${time[0] === 0 ? "" : ", "}${time[1] === 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] === 0 ? "" : `${time[1] === 0 ? "" : ", "}${time[2] === 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] === 0 ? "" : `${time[2] === 0 ? "" : ", "}${time[3] === 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                            }
                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan icon? You wouldn't be able to change it for 5 minutes!**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    updateVal = {
                                        $set: {
                                            icon: icon,
                                            iconcooldown: curtime + 300
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        message.channel.send(`✅ **| ${message.author}, successfully set an icon for your clan.**`);
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
                case "remove": {
                    // remove icon
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres && !perm) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan && !perm) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = '';
                        if (perm) {
                            if (args[2]) clan = args.slice(2).join(" ");
                            else clan = userres.clan;
                            if (!clan) return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
                            query = {name: clan}
                        } else {
                            clan = userres.clan;
                            query = {name: clan}
                        }
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");

                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member[0] === message.author.id);
                            let hasPermission = memberlist[member_index][2];
                            if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                            message.channel.send(`❗**| ${message.author}, are you sure you want to remove ${perm && args[2]?`\`${clan}\``:"your clan"}'s icon?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    updateVal = {
                                        $set: {
                                            icon: ""
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        message.channel.send(`✅ **| ${message.author}, successfully removed icon from ${perm && args[2]?`\`${clan}\``:"your clan"}.**`);
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `remove` and `set`.**")
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 3000);
            break
        }
        case "powerup": {
            // main hub for powerups
            // ===============================
            // options to buy, activate, and view currently
            // active and owned powerup will be in this subcommand
            switch (args[1]) {
                case "list": {
                    // views current powerups of the user's clan
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let powerups = clanres.powerups;
                            embed.setTitle(`Current owned powerups by ${clan}`);
                            for (let i = 0; i < powerups.length; i++) embed.addField(capitalizeString(powerups[i][0]), powerups[i][1]);
                            message.channel.send({embed: embed}).catch(console.error)
                        })
                    });
                    break
                }
                case "activelist": {
                    // views current active powerups of the user's clan
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let activepowerups = clanres.active_powerups;
                            if (activepowerups.length === 0) return message.channel.send(`❎ **| I'm sorry, \`${clan}\` clan does not have any powerups active!**`);
                            embed.setTitle(`Current active powerups for ${clan}`);
                            let description_string = '';
                            for (let i = 0; i < activepowerups.length; i++) description_string += `**${i+1}. ${capitalizeString(activepowerups[i])}**\n`;
                            embed.setDescription(description_string);
                            message.channel.send({embed: embed}).catch(console.error)
                        })
                    });
                    break
                }
                case "activate": {
                    // activates a powerup
                    // ===============================
                    // can only be done by clan leader
                    let powertype = args[2];
                    if (!powertype) return message.channel.send("❎ **| Hey, I don't know what powerup to activate!**");
                    powertype.toLowerCase();
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");

                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member[0] === message.author.id);
                            let hasPermission = memberlist[member_index][2];
                            if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                            if (clanres.isMatch) return message.channel.send("❎ **| I'm sorry, your clan is currently in match mode, therefore you cannot activate powerups!**");
                            let powerups = clanres.powerups;
                            let activepowerups = clanres.active_powerups;
                            let powercount = 0;
                            let powerup_index = powerups.findIndex(powerup => powerup[0] === powertype);
                            if (powerup_index === -1) return message.channel.send("❎ **| I'm sorry, I cannot find the powerup type you are looking for!**");

                            if (powerups[powerup_index][1] === 0) return message.channel.send(`❎ **| I'm sorry, your clan doesn't have any \`${powertype}\` powerups! To view your clan's currently owned powerups, use \`a!clan powerup view\`.**`);
                            --powerups[powerup_index][1];
                            powercount = powerups[powerup_index][1];

                            if (activepowerups.includes(powertype)) return message.channel.send(`❎ **| I'm sorry, your clan currently has an active \`${powertype}\` powerup!**`);
                            message.channel.send(`❗**| ${message.author}, are you sure you want to activate \`${powertype}\` powerup for your clan?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    activepowerups.push(powertype);
                                    updateVal = {
                                        $set: {
                                            powerups: powerups,
                                            active_powerups: activepowerups
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        message.channel.send(`✅ **| ${message.author}, successfully activated \`${powertype}\` powerup for your clan. Your clan now has \`${powercount.toLocaleString()}\` remaining ${powertype} powerups.**`)
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `activelist`, `activate`, and `list`.**")
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 3000);
            break
        }
        case "shop": {
            // main hub for clan shops
            // ===========================================
            // players can buy clan name change, custom role,
            // clan color change, powerups, etc in here, specified by
            // args[1]. also uses alice coins as currency
            switch (args[1]) {
                case "rename": {
                    // changes the clan name
                    // ============================================
                    // only works for clan leaders, mods can disband
                    // clans with inappropriate names
                    let newname = args.slice(2).join(" ");
                    if (!newname) return message.channel.send("❎ **| Hey, give me a new name for your clan!**");
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a clan name change! A clan name change costs ${coin}\`2,500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres.alicecoins;
                            if (alicecoins < 2500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a clan name change! A clan name change costs ${coin}\`2,500\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                if (clanres.power < 500) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 500!**");
                                let cooldown = clanres.namecooldown - curtime;
                                if (cooldown > 0) {
                                    let time = timeConvert(cooldown);
                                    return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time[0] === 0 ? "" : `${time[0] === 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] === 0 ? "" : `${time[0] === 0 ? "" : ", "}${time[1] === 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] === 0 ? "" : `${time[1] === 0 ? "" : ", "}${time[2] === 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] === 0 ? "" : `${time[2] === 0 ? "" : ", "}${time[3] === 1 ? `${time[3]} second` : `${time[3]} seconds`}`}**`)
                                }
                                message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan name to \`${newname}\` for ${coin}\`2,500\` Alice coins? You wouldn't be able to change it again for 3 days!**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        let clanrole = message.guild.roles.cache.find(r => r.name === clan);
                                        if (clanrole) clanrole.setName(newname, "Changed clan name").catch(console.error);
                                        updateVal = {
                                            $set: {
                                                clan: newname
                                            }
                                        };
                                        binddb.updateMany({clan: clan}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                                        });
                                        updateVal = {
                                            $set: {
                                                name: newname,
                                                namecooldown: curtime + 86400 * 3
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, successfully changed your clan name to \`${newname}\`. You now have ${coin}\`${(alicecoins - 2500).toLocaleString()}\` Alice coins.**`);
                                        });
                                        updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 2500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
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
                        })
                    });
                    break
                }
                case "role": {
                    // buy a custom role for clan members
                    // =======================================
                    // the custom role will be the clan's name
                    // to make it easier for moderators to
                    // moderate clan names, only works for leaders
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        pointdb.findOne(query, (err, pointres) => {
                            if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A custom role costs ${coin}\`5,000\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres.alicecoins;
                            if (alicecoins < 5000) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A custom role costs ${coin}\`5,000\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                if (clanres.power < 2000) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 2000!**");
                                let memberlist = clanres.member_list;
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a custom clan role for ${coin}\`5,000\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        let clanrole = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                        message.guild.roles.create({data: {
                                            name: clan,
                                            color: "DEFAULT",
                                            permissions: [],
                                            position: clanrole.position - 1
                                        }, reason: "Clan leader bought clan role"}).then(role => {
                                            memberlist.forEach((id) => {
                                                message.guild.members.cache.get(id[0]).roles.add([clanrole, role], "Clan leader bought clan role").catch(console.error)
                                            })
                                        }).catch(console.error);
                                        updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 5000
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, successfully bought clan role for your clan. You now have ${coin}\`${(alicecoins - 5000).toLocaleString()}\` Alice coins.**`)
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
                        })
                    });
                    break
                }
                case "color": {
                    // changes clan role color if one is available
                    // ===========================================
                    // does not affect embed message colors, only
                    // affects clan role color and only supports
                    // integer color format
                    let color = args[2];
                    if (!(/^#[0-9A-F]{6}$/i.test(color))) return message.channel.send("❎ **| I'm sorry, that does not look like a valid hex color!**");
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        let clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                        if (!clanrole) return message.channel.send("❎ **| I'm sorry, your clan doesn't have a custom clan role!**");
                        pointdb.findOne(query, (err, pointres) => {
                            if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to change your clan's custom role color! A role color change costs ${coin}\`500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres.alicecoins;
                            if (alicecoins < 500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A role color change costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.find(query).toArray((err, clanres) => {
                                if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id !== clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a clan role color change for ${coin}\`500\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        clanrole.setColor(parseInt(color), "Clan leader changed role color").catch(console.error);
                                        updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| Successfully changed clan role color. You now have ${coin}\`${(alicecoins - 500).toLocaleString()}\` Alice coins.**`)
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
                        })
                    });
                    break
                }
                case "powerup": {
                    // buy powerups with Alice coins
                    // =============================
                    // lootbox (gacha) style
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a powerup! A powerup costs ${coin}\`100\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres.alicecoins;
                            if (alicecoins < 100) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a powerup! A powerup costs ${coin}\`100\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                let powerups = clanres.powerups;
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a powerup for ${coin}\`100\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        const gachanum = Math.random() * 100;
                                        let powerup = false;
                                        if (gachanum > 20) {
                                            switch (true) {
                                                case (gachanum <= 50): { // 20% chance of not getting anything
                                                    powerup = "bomb"; // 30% chance
                                                    break
                                                }
                                                case (gachanum <= 75): {
                                                    powerup = "challenge"; // 25% chance
                                                    break
                                                }
                                                case (gachanum <= 82.5): {
                                                    powerup = "debuff"; // 7.5% chance
                                                    break
                                                }
                                                case (gachanum <= 90): {
                                                    powerup = "buff"; // 7.5% chance
                                                    break
                                                }
                                                case (gachanum <= 94): {
                                                    powerup = "superbomb"; // 4% chance
                                                    break
                                                }
                                                case (gachanum <= 98): {
                                                    powerup = "superchallenge"; // 4% chance
                                                    break
                                                }
                                                case (gachanum <= 99): {
                                                    powerup = "superdebuff"; // 1% chance
                                                    break
                                                }
                                                case (gachanum <= 100): {
                                                    powerup = "buff" // 1% chance
                                                }
                                            }
                                        }
                                        // reserved for special events
                                        /*if (gachanum > 20) {
                                            switch (true) {
                                                case (gachanum <= 50): { // 20% chance of not getting anything
                                                    powerup = "bomb"; // 30% chance
                                                    break
                                                }
                                                case (gachanum <= 75): {
                                                    powerup = "challenge"; // 25% chance
                                                    break
                                                }
                                                case (gachanum <= 82.5): {
                                                    powerup = "debuff"; // 7.5% chance
                                                    break
                                                }
                                                case (gachanum <= 90): {
                                                    powerup = "buff"; // 7.5% chance
                                                    break
                                                }
                                                case (gachanum <= 94): {
                                                    powerup = "superbomb"; // 4% chance
                                                    break
                                                }
                                                case (gachanum <= 98): {
                                                    powerup = "superchallenge"; // 4% chance
                                                    break
                                                }
                                                case (gachanum <= 99): {
                                                    powerup = "superdebuff"; // 1% chance
                                                    break
                                                }
                                                case (gachanum <= 100): {
                                                    powerup = "buff" // 1% chance
                                                }
                                            }
                                        }*/
                                        if (!powerup) {
                                            message.channel.send(`✅ **| ${message.author}, unfortunately you didn't get anything! You now have ${coin}\`${(alicecoins - 100).toLocaleString()}\` Alice coins.**`);
                                            updateVal = {
                                                $set: {
                                                    alicecoins: alicecoins - 100
                                                }
                                            };
                                            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                                            });
                                            return
                                        }
                                        let powerup_index = powerups.findIndex(pow => pow[0] === powerup);
                                        ++powerups[powerup_index][1];
                                        let powercount = powerups[powerup_index][1];
                                        updateVal = {
                                            $set: {
                                                powerups: powerups
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, you have earned the \`${powerup}\` powerup! Your clan now has \`${powercount.toLocaleString()}\` ${powerup} ${powercount === 1 ? "powerup" : "powerups"}. You now have ${coin}\`${(alicecoins - 100).toLocaleString()}\` Alice coins.**`);
                                        });
                                        updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 100
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
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
                        })
                    });
                    break
                }
                case "leader": {
                    // changes the leader of a clan
                    // ============================
                    // only works for clan leaders
                    let totransfer = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!totransfer) return message.channel.send("❎ **| Hey, please enter a valid user to transfer the clan leadership to!**");
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to transfer clan leadership! A clan leadership transfer costs ${coin}\`500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres.alicecoins;
                            if (alicecoins < 500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to transfer clan leadership! A clan leadership transfer costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id !== clanres.leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                if (message.author.id === totransfer.id) return message.channel.send("❎ **| You cannot transfer clan leadership to yourself!**");
                                let memberlist = clanres.member_list;
                                if (memberlist.length === 1) return message.channel.send("❎ **| I'm sorry, looks like you are alone in your clan! Who would you transfer leadershp to?**");
                                if (clanres.power < 300) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 300!**");
                                let member_index = memberlist.findIndex(member => member[0] === totransfer.id);
                                if (member_index === -1) return message.channel.send("❎ **| I'm sorry, this user is not in your clan!");

                                message.channel.send(`❗**| ${message.author}, are you sure you want to transfer clan leadership to ${totransfer} for ${coin}\`500\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        updateVal = {
                                            $set: {
                                                leader: totransfer.id
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, successfully transfered clan leadership to ${totransfer}. You now have ${coin}\`${(alicecoins - 500).toLocaleString()}\` Alice coins.**`)
                                        });
                                        updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
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
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `color`, `leader`, `powerup`, `rename`, `role`, and `special`.**")
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 3000);
            break
        }
        case "power": {
            // main hub for power points
            // ==============================
            // gives pp if match commence, also
            // based on active powerups
            if ((message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'Referee')) && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
            switch (args[1]) {
                case "give": {
                    // adds power points to a clan
                    // =======================================
                    // this must be carefully watched as abuse
                    // can be easily done
                    let togive = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!togive) return message.channel.send("❎ **| Hey, please give me a valid user to give power points to!**");
                    let amount = args[3];
                    if (!amount) return message.channel.send("❎ **| Hey, I don't know how many points do I need to add!**");
                    amount = parseInt(amount);
                    if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Invalid amount to add.**");
                    query = {discordid: togive.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let newpower = clanres.power + amount;
                            updateVal = {
                                $set: {
                                    power: newpower
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully given \`${amount.toLocaleString()}\` power points to \`${clan}\` clan. The clan now has \`${newpower.toLocaleString()}\` power points.**`)
                            })
                        })
                    });
                    break
                }
                case "take": {
                    // removes power points from a clan
                    // =========================================
                    // just like add cmd, this must be carefully
                    // watched as abuse can be easily done
                    let totake = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!totake) return message.channel.send("❎ **| Hey, please give me a valid user to take power points from!**");
                    let amount = args[3];
                    if (!amount) return message.channel.send("❎ **| Hey, I don't know how many points do I need to remove!**");
                    amount = parseInt(amount);
                    if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Invalid amount to remove.**");
                    query = {discordid: totake.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let newpower = clanres.power - amount;
                            if (newpower < 0) return message.channel.send("❎ **| I'm sorry, this clan doesn't have as many power points as the amount you mentioned!**");
                            updateVal = {
                                $set: {
                                    power: newpower
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully taken \`${amount.toLocaleString()}\` power points from \`${clan}\` clan. The clan now has \`${newpower.toLocaleString()}\` power points.**`)
                            })
                        })
                    });
                    break
                }
                case "transfer": {
                    // transfers power points from one clan to another
                    // =======================================================
                    // main cmd to use during clan matches, will automatically
                    // convert total power points based on active powerups
                    if (args.length < 4) return message.channel.send("❎ **| Hey, I need more input!**");
                    let totake = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!totake) return message.channel.send("❎ **| Hey, please give me a valid user to take power points from!**");
                    let togive = message.guild.member(message.mentions.users.last() || message.guild.members.cache.get(args[3]));
                    if (totake.id === togive.id) return message.channel.send("❎ **| Hey, you cannot transfer power points to the same user!**");
                    let challengepass = args[4];
                    query = {discordid: totake.id};
                    binddb.findOne(query, (err, takeres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!takeres) return message.channel.send("❎ **| I'm sorry, the account to take power points from is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!takeres.clan) return message.channel.send("❎ **| I'm sorry, the user to take is not in a clan!**");
                        let takeclan = takeres.clan;
                        query = {discordid: togive.id};
                        binddb.findOne(query, (err, giveres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!giveres) return message.channel.send("❎ **| I'm sorry, the account to give power points to is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                            if (!giveres.clan) return message.channel.send("❎ **| I'm sorry, the user to give is not in a clan!**");
                            let giveclan = giveres.clan;
                            if (takeclan === giveclan) return message.channel.send("❎ **| Hey, you cannot transfer power points to the same clan!**");
                            query = {name: takeclan};
                            clandb.findOne(query, (err, tclanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!tclanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan to take power points from!**");
                                if (!tclanres.isMatch) return message.channel.send("❎ **| I'm sorry, the clan to take power points from is not in match mode!**");
                                let t_power = tclanres.power;
                                let t_activepowerups = tclanres.active_powerups;
                                let givemultiplier = 0.1;
                                for (let i = 0; i < t_activepowerups.length; i++) {
                                    switch (t_activepowerups[i]) {
                                        case "superdebuff": {
                                            message.channel.send(`⬇️⬇️ **| \`${takeclan}\` has \`superdebuff\` powerup active!**`);
                                            givemultiplier /= 1.5;
                                            break
                                        }
                                        case "superbomb": {
                                            message.channel.send(`⬇️ **| \`${takeclan}\` has \`superbomb\` powerup active${!challengepass?"":", but unfortunately their opponents have accomplished the task provided"}!**`);
                                            if (!challengepass) givemultiplier /= 1.3;
                                            break
                                        }
                                        case "debuff": {
                                            givemultiplier /= 1.1;
                                            break
                                        }
                                        case "bomb": {
                                            if (!challengepass) givemultiplier /= 1.05;
                                            break
                                        }
                                    }
                                }
                                query = {name: giveclan};
                                clandb.findOne(query, (err, gclanres) => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    if (!gclanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan to give power points to!**");
                                    if (!gclanres.isMatch) return message.channel.send("❎ **| I'm sorry, the clan to give power points to is not in match mode!**");
                                    let g_power = gclanres.power;
                                    let g_activepowerups = gclanres.active_powerups;
                                    for (let i = 0; i < g_activepowerups.length; i++) {
                                        switch (g_activepowerups[i]) {
                                            case "superbuff": {
                                                message.channel.send(`⬆️⬆️ **| \`${giveclan}\` has \`superbuff\` powerup active!**`);
                                                givemultiplier *= 1.7;
                                                break
                                            }
                                            case "superchallenge": {
                                                message.channel.send(`⬆️ **| \`${giveclan}\` has \`superchallenge\` powerup active${challengepass?"":", but unfortunately they did not accomplish the task provided"}!**`);
                                                if (challengepass) givemultiplier *= 1.4;
                                                break
                                            }
                                            case "buff": {
                                                givemultiplier *= 1.2;
                                                break
                                            }
                                            case "challenge": {
                                                if (challengepass) givemultiplier *= 1.1;
                                                break
                                            }
                                        }
                                    }
                                    let totalpower = Math.min(t_power, Math.floor(t_power * givemultiplier));
                                    message.channel.send(`❗**| ${message.author}, are you sure you want to transfer \`${totalpower.toLocaleString()}\` power points from \`${takeclan}\` clan to \`${giveclan}\` clan?**`).then(msg => {
                                        msg.react("✅").catch(console.error);
                                        let confirmation = false;
                                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                        confirm.on("collect", () => {
                                            confirmation = true;
                                            msg.delete();
                                            updateVal = {
                                                $set: {
                                                    power: t_power - totalpower,
                                                    isMatch: false,
                                                    active_powerups: []
                                                }
                                            };
                                            clandb.updateOne({name: takeclan}, updateVal, err => {
                                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                                            });
                                            updateVal = {
                                                $set: {
                                                    power: g_power + totalpower,
                                                    isMatch: false,
                                                    active_powerups: []
                                                }
                                            };
                                            clandb.updateOne({name: giveclan}, updateVal, err => {
                                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                                message.channel.send(`✅ **| ${message.author}, successfully transferred \`${totalpower.toLocaleString()}\` power points from \`${takeclan}\` clan to \`${giveclan}\` clan.**`)
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
                            })
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `give`, `take`, and `transfer`.**")
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 3000);
            break
        }
        case "match": {
            // adds/removes two clans into match list
            // ===========================================
            // this prevents them from activating powerups
            // in the middle of a battle, referee/mod only
            if ((message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'Referee')) && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
            switch (args[1]) {
                // add clan
                case "add": {
                    let tomatch = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!tomatch) return message.channel.send("❎ **| Hey, please give me a valid user!**");
                    query = {discordid: tomatch.id};
                    binddb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!clanres) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!clanres.clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = clanres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            if (clanres.power === 0) return message.channel.send("❎ **| I'm sorry, the user's clan has 0 power points!**");
                            updateVal = {
                                $set: {
                                    isMatch: true
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully set \`${clan}\` clan in match mode.**`)
                            })
                        })
                    });
                    break
                }
                case "remove": {
                    // remove clan
                    let tomatch = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[2]));
                    if (!tomatch) return message.channel.send("❎ **| Hey, please give me a valid user!**");
                    query = {discordid: tomatch.id};
                    binddb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!clanres) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!clanres.clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = clanres.clan;
                        updateVal = {
                            $set: {
                                isMatch: false
                            }
                        };
                        clandb.updateOne({name: clan}, updateVal, err => {
                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            message.channel.send(`✅ **| ${message.author}, successfully removed \`${clan}\` clan from match mode.**`)
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `add` and `remove`.**")
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2500);
            break
        }
        case "auction": {
            // auctions
            // =====================================
            // as of now only powerups are available
            // for auction
            switch (args[1]) {
                case "bid": {
                    let name = args[2];
                    if (!name) return message.channel.send("❎ **| Hey, please enter a name of the auction!**");
                    if (name.length > 20) return message.channel.send("❎ **| I'm sorry, an auction's name does not exceed 20 characters!**");

                    let amount = parseInt(args[3]);
                    if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Hey, please enter a valid coin amount to bid!**");

                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres) return message.channel.send(`❎ **| I'm sorry, you don't have that many ${coin}Alice coins to bid! You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres.alicecoins;
                            if (alicecoins < amount) return message.channel.send(`❎ **| I'm sorry, you don't have that many ${coin}Alice coins to bid! You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);

                            query = {name: name};
                            auctiondb.findOne(query, (err, auctionres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!auctionres) return message.channel.send("❎ **| I'm sorry, that auction does not exist!**");
                                if (auctionres.auctioneer === clan) return message.channel.send("❎ **| Hey, you cannot bid on your clan's auction!**");
                                if (auctionres.expirydate - curtime <= 0) return message.channel.send("❎ **| I'm sorry, this auction is over!**");

                                let bids = auctionres.bids;
                                let bid_index = bids.findIndex(bid => bid[0] === clan);
                                if (bid_index !== -1) bids[bid_index][1] += amount;
                                else bids.push([clan, amount]);
                                bids.sort((a, b) => {return b[1] - a[1]});
                                bid_index = bids.findIndex(bid => bid[0] === clan);
                                let cur_amount = bids[bid_index][1];

                                message.channel.send(`❗**| ${message.author}, are you sure you want to create the auction?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

                                    confirm.on("collect", () => {
                                        msg.delete().catch(console.error);
                                        confirmation = true;

                                        alicecoins -= amount;
                                        updateVal = {
                                            $set: {
                                                bids: bids
                                            }
                                        };
                                        auctiondb.updateOne(query, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                        });
                                        updateVal = {
                                            $set: {
                                                alicecoins: alicecoins
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully bidded ${coin}\`${amount.toLocaleString()}\`Alice coins to auction \`${name}\`. Your clan is currently #${bid_index + 1} with ${coin}\`${cur_amount.toLocaleString()}\` Alice coins bidded. You now have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.\n\nUse \`a!clan auction status ${name}\` to check the auction's status.**`)
                                        })
                                    });
                                    confirm.on("end", () => {
                                        if (!confirmation) {
                                            msg.delete().catch(console.error);
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                        }
                                    })
                                })
                            })
                        })
                    });
                    break
                }
                case "create": {
                    let name = args[2];
                    if (!name) return message.channel.send("❎ **| Hey, please enter a name for your auction!**");
                    if (name.length > 20) return message.channel.send("❎ **| I'm sorry, an auction's name must not exceed 20 characters!**");

                    let powerup = args[3];
                    if (!powerup) return message.channel.send("❎ **| Hey, please enter a powerup!**");
                    powerup = powerup.toLowerCase();

                    let amount = parseInt(args[4]);
                    if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Hey, please enter a valid powerup amount to auction!**");

                    let min_price = parseInt(args[5]);
                    if (isNaN(min_price) || min_price < 0) return message.channel.send("❎ **| Hey, please enter a valid minimum price for other clans to bid!**");

                    let auction_duration = parseInt(args[6]);
                    if (isNaN(auction_duration)) return message.channel.send("❎ **| Hey, please enter a valid auction duration!**");
                    if (auction_duration < 60 || auction_duration > 86400) return message.channel.send("❎ **| I'm sorry, auction duration can only range from 60 (1 minute) to 86400 (1 day) seconds!**");

                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");

                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member[0] === message.author.id);
                            let hasPermission = memberlist[member_index][2];
                            if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                            let powerups = clanres.powerups;
                            let powerup_index = powerups.findIndex(pow => pow[0] === powerup);
                            if (powerup_index === -1) return message.channel.send("❎ **| I'm sorry, I cannot find the powerup you are looking for!**");
                            if (powerups[powerup_index][1] < amount) return message.channel.send(`❎ **| I'm sorry, you don't have that many \`${powerup}\` powerups! Your clan has \`${powerups[powerup_index][1].toLocaleString()}\` of it.**`);

                            query = {name: name};
                            auctiondb.findOne(query, (err, auctionres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (auctionres) return message.channel.send("❎ **| I'm sorry, an auction with that name exists! Please choose another name!**");
                                powerups[powerup_index][1] -= amount;

                                message.channel.send(`❗**| ${message.author}, are you sure you want to create the auction?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

                                    confirm.on("collect", () => {
                                        msg.delete().catch(console.error);
                                        confirmation = true;
                                        insertVal = {
                                            name: name,
                                            auctioneer: clan,
                                            creationdate: curtime,
                                            expirydate: curtime + auction_duration,
                                            powerup: powerup,
                                            amount: amount,
                                            min_price: min_price,
                                            bids: []
                                        };
                                        auctiondb.insertOne(insertVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                        });
                                        updateVal = {
                                            $set: {
                                                powerups: powerups
                                            }
                                        };
                                        clandb.updateOne({name: clan}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully created auction \`${name}\`.**`);

                                            embed.setTitle("Auction Information")
                                                .setDescription(`**Name**: ${name}\n**Auctioneer**: ${clan}\n**Created at**: ${new Date(curtime * 1000).toUTCString()}\n**Expires at**: ${new Date((curtime + auction_duration) * 1000).toUTCString()}`)
                                                .addField("**Auction Item**", `**Powerup**: ${capitalizeString(powerup)}\n**Amount**: ${amount.toLocaleString()}\n**Minimum bid amount**: ${coin}**${min_price.toLocaleString()}** Alice coins`);
                                            client.channels.cache.get("696646867567640586").send(`❗**| An auction has started with the following details:**`, {embed: embed})
                                        })
                                    });
                                    confirm.on("end", () => {
                                        if (!confirmation) {
                                            msg.delete().catch(console.error);
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                        }
                                    })
                                })
                            })
                        })
                    });
                    break
                }
                case "list": {
                    let page = 1;
                    if (parseInt(args[1]) > 1) page = parseInt(args[1]);
                    auctiondb.find({}).sort({min_price: -1}).toArray((err, auctionres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (auctionres.length === 0) return message.channel.send("❎ **| I'm sorry, there are no ongoing auctions as of now!**");
                        if (!auctionres[page*5]) return message.channel.send(`❎ **| I'm sorry, there aren't that many auctions available!**`);
                        embed = editAuction(auctionres, coin, page, rolecheck, footer, index);
                        message.channel.send({embed: embed}).then(msg => {
                            msg.react("⏮️").then(() => {
                                msg.react("⬅️").then(() => {
                                    msg.react("➡️").then(() => {
                                        msg.react("⏭️").catch(console.error)
                                    })
                                })
                            });

                            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 180000});
                            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 180000});
                            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 180000});
                            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 180000});

                            backward.on('collect', () => {
                                if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                else page = Math.max(1, page - 10);
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, rolecheck, footer, index);
                                msg.edit({embed: embed}).catch(console.error)
                            });

                            back.on('collect', () => {
                                if (page === 1) page = Math.floor(auctionres.length / 5);
                                else --page;
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, rolecheck, footer, index);
                                msg.edit({embed: embed}).catch(console.error)
                            });

                            next.on('collect', () => {
                                if (page === Math.floor(auctionres.length / 5)) page = 1;
                                else ++page;
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, rolecheck, footer, index);
                                msg.edit({embed: embed}).catch(console.error);
                            });

                            forward.on('collect', () => {
                                if (page === Math.floor(auctionres.length / 5)) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                else page = Math.min(page + 10, Math.floor(auctionres.length / 5));
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, rolecheck, footer, index);
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
                case "status": {
                    let name = args[2];
                    if (!name) return message.channel.send("❎ **| Hey, please enter a name of the auction!**");
                    if (name.length > 20) return message.channel.send("❎ **| I'm sorry, an auction's name does not exceed 20 characters!**");

                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        let clan = '';
                        if (userres) clan = userres.clan;

                        query = {name: name};
                        auctiondb.findOne(query, (err, auctionres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!auctionres) return message.channel.send("❎ **| I'm sorry, that auction does not exist!**");
                            let bids = auctionres.bids;
                            let bid_index = bids.findIndex(bid => bid[0] === clan);

                            embed.setTitle("Auction Information")
                                .setDescription(`**Name**: ${name}\n**Auctioneer**: ${auctionres.auctioneer}\n**Created at**: ${new Date(auctionres.creationdate * 1000).toUTCString()}\n**Expires at**: ${new Date(auctionres.expirydate * 1000).toUTCString()}`)
                                .addField("**Auction Item**", `**Powerup**: ${capitalizeString(auctionres.powerup)}\n**Amount**: ${auctionres.amount.toLocaleString()}\n**Minimum bid amount**: ${coin}**${auctionres.min_price.toLocaleString()}** Alice coins`);

                            let top_string = '';
                            for (let i = 0; i < 5; i++) {
                                if (bids[i]) top_string += `#${i+1}: ${bids[i][0]} - ${coin}**${bids[i][1]}** Alice coins\n`;
                                else top_string += `#${i+1}: -\n`
                            }
                            if (bid_index > 4) top_string += `${'.\n'.repeat(Math.min(bid_index - 4, 3))}#${bid_index + 1}: ${clan} - ${coin}**${bids[bid_index][1].toLocaleString()}** Alice coins`;
                            embed.addField("**Bid Information**", `**Bidders**: ${bids.length.toLocaleString()}\n**Top bidders**:\n${top_string}`);
                            message.channel.send({embed: embed})
                        })
                    });
                    break
                }
                case "cancel": {
                    let name = args[2];
                    if (!name) return message.channel.send("❎ **| Hey, please enter a name of your auction!**");
                    if (name.length > 20) return message.channel.send("❎ **| I'm sorry, an auction's name does not exceed 20 characters!**");

                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres.clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres.clan;
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");

                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member[0] === message.author.id);
                            let hasPermission = memberlist[member_index][2];
                            if (!hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                            query = {name: name};
                            auctiondb.findOne(query, (err, auctionres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!auctionres) return message.channel.send("❎ **| I'm sorry, that auction does not exist!**");
                                if (auctionres.auctioneer !== clan) return message.channel.send("❎ **| I'm sorry, that auction does not belong to your clan!**");
                                if (auctionres.bids.length > 0) return message.channel.send("❎ **| I'm sorry, a clan has bidded for this auction, therefore you cannot cancel it!**");

                                let powerup = auctionres.powerup;
                                let amount = auctionres.amount;
                                let powerups = clanres.powerups;
                                let powerup_index = powerups.findIndex(pow => pow[0] === powerup);
                                powerups[powerup_index][1] += amount;

                                message.channel.send(`❗**| ${message.author}, are you sure you want to cancel the auction?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

                                    confirm.on("collect", () => {
                                        msg.delete().catch(console.error);
                                        confirmation = true;

                                        updateVal = {
                                            $set: {
                                                powerups: powerups
                                            }
                                        };
                                        clandb.updateOne({name: clan}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                        });
                                        auctiondb.deleteOne(query, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully cancelled auction \`${name}\`.**`)
                                        })
                                    });
                                    confirm.on("end", () => {
                                        if (!confirmation) {
                                            msg.delete().catch(console.error);
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                        }
                                    })
                                })
                            })
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `bid`, `create`, `list`, and `status`.**")
            }
            break
        }
        default: return message.channel.send("❎ **| I'm sorry, looks like your first argument is invalid! Accepted arguments are `accept`, `auction`, `create`, `disband`, `lb`, `icon`, `info`, `kick`, `leave`, `match`, `members`, `power`, `powerup`, and `shop`.**")
    }
};

module.exports.config = {
    name: "clan",
    description: "Main command for clans.",
    usage: "clan accept <user>\nclan auction <bid/cancel/create/list/status>\nclan create <name>\nclan disband [name]\nclan lb [page]\nclan icon <remove/set>\nclan info [name]\nclan kick <user>\nclan leave\nclan match <add/remove>\nclan members [name]\nclan power <give/take/transfer>\nclan powerup <activate/activelist/list>\nclan shop <color/leader/powerup/rename/role>\nclan upkeep",
    detail: "`accept`: Accepts a user into your clan\n`auction`: Manager for auction\n`create`: Creates a clan with given name\n`disband`: Disbands your clan. Name is required if mod wants to disband another clan (leader/mod only)\n`lb`: Views leaderboard for clans based on power points\n`icon`: Sets/removes an icon for your clan from a given image URL. Clan name must be specified if mod wants to clear a clan's icon (leader/mod only)\n`info`: Views info about a clan\n`kick`: Kicks a user out from your clan. If mod and clan name is specified, will kick the user out from the given clan (leader/mod only)\n`leave`: Leaves your current clan\n`match`: Adds/removes a clan to match mode. Prevents the clan from activating powerups mid-match (referee/mod only)\n`members`: Views members of a clan\n`power`: Main hub for power points (referee/mod only)\n`powerup`: Main hub for clan powerups\n`shop`: Main hub for clan shop\n`upkeep`: Views the user's clan weekly upkeep pickup",
    permission: "None / Clan Leader / Referee / Moderator"
};
