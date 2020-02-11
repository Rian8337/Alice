let Discord = require('discord.js');
let config = require('../config.json');
let cd = new Set();

function capitalizeString(string = "") {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm; //mute_permission but used for this command, practically the same
    eligibleRoleList.forEach((id) => {
        if (member.roles.has(id[0])) res = id[1]
    });
    return res
}

function timeconvert(num) {
    let sec = parseInt(num);
    let days = Math.floor(sec / 86400);
    let hours = Math.floor((sec - days * 86400) / 3600);
    let minutes = Math.floor((sec - days * 86400 - hours * 3600) / 60);
    let seconds = sec - days * 86400 - hours * 3600 - minutes * 60;
    return [days, hours, minutes, seconds]
}

function editmember(clanres, page, rolecheck, footer, index) {
    let embed = new Discord.RichEmbed()
        .setTitle(`${clanres[0].name} Members (Page ${page}/4)`)
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(rolecheck);
    
    let list = clanres[0].member_list;
    let memberstring = '';
    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!list[i]) break;
        memberstring += `${i+1}. <@${list[i][0]}> (${list[i][0]})\n`
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
            if (res[i].power && res[i].name) {output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].name, 21) + ' | ' + spaceFill(res[i].member_list.length.toString(), 8) + ' | ' + res[i].power.toString() + '\n';}
            else {output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].name, 21) + ' | ' + spaceFill(res[i].member_list.length.toString(), 8) + ' | ' + res[i].power.toString() + '\n';}
        }
        else output += spaceFill("-", 4) + ' | ' + spaceFill("-", 21) + ' | ' + spaceFill("-", 8) + ' | - \n';
    }
    output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
    return output
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (message.guild.id != '316545691545501706') return message.channel.send("❎ **| I'm sorry, this command is only available in osu!droid (International) Discord server!**");
    if (message.author.id != '386742340968120321' && message.author.id != '132783516176875520') return message.channel.send("❎ **| I'm sorry, this command is still in testing!**");
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    let binddb = maindb.collection("userbind");
    let clandb = maindb.collection("clandb");
    let pointdb = alicedb.collection("playerpoints");
    let coin = client.emojis.get("669532330980802561");
    let curtime = Math.floor(Date.now() / 1000);
    let query = {};
    let rolecheck;
    try {
        rolecheck = message.member.highestRole.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
    let embed = new Discord.RichEmbed()
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
                clandb.find(query).toArray((err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    let power = clanres[0].power;
                    let clandate = clanres[0].createdAt * 1000;
                    let members = clanres[0].member_list.length;
                    let clanrole = message.guild.roles.find(r => r.name === clan);
                    if (clanrole) embed.setColor(clanrole.hexColor);
                    embed.setTitle(clan)
                        .addField("Clan Leader", `<@${clanres[0].leader}>\n(${clanres[0].leader})`, true)
                        .addField("Power", power, true)
                        .addField("Members", members, true)
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
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                let clan = userres[0].clan;
                if (args[1]) clan = args.slice(1).join(" ");
                if (!clan) return message.channel.send("❎ **| I'm sorry, you are currently not in a clan! Please enter a clan name!**");
                query = {name: clan};
                clandb.find(query).toArray((err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    let clanrole = message.guild.roles.find(r => r.name === clan);
                    if (clanrole) rolecheck = clanrole.hexColor;
                    let embed = editmember(clanres, page, rolecheck, footer, index);
                    message.channel.send({embed}).then(msg => {
                        msg.react("⏮️").then(() => {
                            msg.react("⬅️").then(() => {
                                msg.react("➡️").then(() => {
                                    msg.react("⏭️").catch(e => console.log(e))
                                })
                            })
                        });

                        let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 45000});
                        let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 45000});
                        let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 45000});
                        let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 45000});

                        backward.on('collect', () => {
                            if (page === 1) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                            else page = 1;
                            msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit(embed).catch(e => console.log(e))
                        });

                        back.on('collect', () => {
                            if (page === 1) page = 5;
                            else page--;
                            msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit(embed).catch(e => console.log(e))
                        });

                        next.on('collect', () => {
                            if (page === 5) page = 1;
                            else page++;
                            msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit(embed).catch(e => console.log(e));
                        });

                        forward.on('collect', () => {
                            if (page === 5) return msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                            else page = 5;
                            msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)));
                            embed = editmember(clanres, page, rolecheck, footer, index);
                            msg.edit(embed).catch(e => console.log(e))
                        });
                        
                        backward.on("end", () => {
                            msg.reactions.deleteAll()
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
                                msg.react("⏭️").catch(e => console.log(e))
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
                        msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
                    });

                    back.on('collect', () => {
                        if (page === 0) page = Math.floor(clanres.length / 20);
                        else page--;
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
                    });

                    next.on('collect', () => {
                        if ((page + 1) * 20 >= clanres.length) page = 0;
                        else page++;
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
                    });

                    forward.on('collect', () => {
                        page = Math.floor(clanres.length / 20);
                        output = editlb(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                        msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
                    })
                });
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
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clan = userres[0].clan;
                query = {name: clan};
                clandb.find(query).toArray((err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find your clan!**");
                    let time = timeconvert(clanres[0].weeklyfee - curtime);
                    message.channel.send(`✅ **| ${message.author}, your clan's weekly upkeep will be picked up in ${time[0] == 0 ? "" : `${time[0] == 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] == 0 ? "" : `${time[0] == 0?"":", "}${time[1] == 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] == 0 ? "" : `${time[1] == 0?"":", "}${time[2] == 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] == 0 ? "" : `${time[2] == 0?"":", "}${time[3] == 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                })
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 4000);
            break
        }
        case "accept": {
            let toaccept = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
            if (!toaccept) return message.channel.send("❎ **| Hey, please enter a correct user!**");
            query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                query = {discordid: toaccept.id};
                binddb.find(query).toArray((err, joinres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!joinres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                    if (joinres[0].clan) return message.channel.send("❎ **| I'm sorry, this user is already in a clan!**");
                    let cooldown = joinres[0].joincooldown - curtime;
                    if (cooldown > 0) {
                        let time = timeconvert(cooldown);
                        return message.channel.send(`❎ **| I'm sorry, that user is still in cooldown! Please wait for ${time[0] == 0 ? "" : `${time[0] == 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] == 0 ? "" : `${time[0] == 0?"":", "}${time[1] == 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] == 0 ? "" : `${time[1] == 0?"":", "}${time[2] == 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] == 0 ? "" : `${time[2] == 0?"":", "}${time[3] == 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                    }
                    let oldcooldown = userres[0].oldjoincooldown - curtime;
                    if (oldcooldown > 0 && userres[0].oldclan == joinres[0].clan) {
                        let time = timeconvert(oldcooldown);
                        return message.channel.send(`❎ **| I'm sorry, that user is still in cooldown! Please wait for ${time[0] == 0 ? "" : `${time[0] == 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] == 0 ? "" : `${time[0] == 0?"":", "}${time[1] == 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] == 0 ? "" : `${time[1] == 0?"":", "}${time[2] == 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] == 0 ? "" : `${time[2] == 0?"":", "}${time[3] == 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                    }
                    let uid = joinres[0].uid;
                    query = {name: userres[0].clan};
                    clandb.find(query).toArray((err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find your clan!**");
                        if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, only the clan leader can accept new members!**");
                        let memberlist = clanres[0].member_list;
                        for (let i = 0; i < memberlist.length; i++) {
                            if (memberlist[i][0] == toaccept.id) return message.channel.send("❎ **| I'm sorry, this user is already in your clan!**");
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
                                if (confirmbox.length == 2) {
                                    confirmation = true;
                                    msg.delete();
                                    let role = message.guild.roles.find(r => r.name === 'Clans');
                                    let clanrole = message.guild.roles.find(r => r.name === userres[0].clan);
                                    if (clanrole) toaccept.addRoles([role, clanrole], "Accepted into clan").catch(console.error);
                                    memberlist.push([toaccept.id, uid]);
                                    let updateVal = {
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
                                            clan: userres[0].clan
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
                                    message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
            let tokick = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));
            if (!tokick) return message.channel.send("❎ **| Hey, please enter a correct user!**");
            if (message.author.id == tokick.id) return message.channel.send("❎ **| Hey, you cannot kick yourself!**");
            let reason = args.slice(2).join(" ");
            if (!reason) return message.channel.send("❎ **| Hey, please enter a reason!**");
            query = {discordid: tokick.id};
            let perm = isEligible(message.member) == -1;
            binddb.find(query).toArray((err, kickres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!kickres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!kickres[0].clan) return message.channel.send("❎ **| I'm sorry, this user is not in any clan!**");
                let clan = kickres[0].clan;
                query = {name: clan};
                clandb.find(query).toArray((err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id != clanres[0].leader && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                    if (tokick.id == clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you cannot kick the leader of the clan!**");
                    let memberlist = clanres[0].member_list;
                    let found = false;
                    for (let i = 0; i < memberlist.length; i++) {
                        if (memberlist[i][0] == tokick.id) {
                            found = true;
                            break
                        }
                    }
                    if (!found) return message.channel.send("❎ **| I'm sorry, this user is not in your clan!");
                    message.channel.send(`❗**| ${message.author}, are you sure you want to kick the user out from ${perm?`\`${clan}\``:""} clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            let role = message.guild.roles.find(r => r.name === 'Clans');
                            let clanrole = message.guild.roles.find(r => r.name === clan);
                            if (clanrole) tokick.removeRoles([role, clanrole], "Kicked from clan").catch(console.error);
                            let updateVal = {
                                $set: {
                                    member_list: memberlist.filter(id => id[0] != tokick.id)
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
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
            // ==================
            // pretty straightforward
            query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clan = userres[0].clan;
                query = {name: clan};
                clandb.find(query).toArray((err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id == clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you cannot leave as the leader of the clan!**");
                    message.channel.send(`❗**| ${message.author}, are you sure you want to leave your current clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            let role = message.guild.roles.find(r => r.name === 'Clans');
                            let clanrole = message.guild.roles.find(r => r.name === clan);
                            if (clanrole) message.member.removeRoles([role, clanrole], "Left the clan").catch(console.error);
                            let memberlist = clanres[0].member_list;
                            let updateVal = {
                                $set: {
                                    member_list: memberlist.filter(id => id[0] != message.author.id)
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
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are already in a clan!**");
                let uid = userres[0].uid;
                pointdb.find(query).toArray((err, pointres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!pointres[0]) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan! Creating a clan costs ${coin}\`7500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                    let alicecoins = pointres[0].alicecoins;
                    if (alicecoins < 7500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan! Creating a clan costs ${coin}\`7500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                    query = {name: clanname};
                    clandb.find(query).toArray((err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (clanres[0]) return message.channel.send("❎ **| I'm sorry, that name is already taken by other clan!**");
                        message.channel.send(`❗**| ${message.author}, are you sure you want to create a clan named \`${clanname}\` for ${coin}\`7500\` Alice coins?**`).then(msg => {
                            msg.react("✅").catch(console.error);
                            let confirmation = false;
                            let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                            confirm.on("collect", () => {
                                confirmation = true;
                                msg.delete();
                                query = {discordid: message.author.id};
                                let updateVal = {
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
                                let insertVal = {
                                    name: clanname,
                                    power: 0,
                                    createdAt: curtime,
                                    leader: message.author.id,
                                    icon: "",
                                    iconcooldown: 0,
                                    namecooldown: 0,
                                    weeklyfee: curtime + 86400 * 7,
                                    isMatch: false,
                                    powerups: [["superbuff", 0], ["superdebuff", 0], ["superchallenge", 0], ["superbomb", 0], ["buff", 0], ["debuff", 0], ["challenge", 0], ["bomb", 0]],
                                    active_powerups: [],
                                    member_list: [[message.author.id, uid]]
                                };
                                clandb.insertOne(insertVal, err => {
                                    if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    message.channel.send(`✅ **| ${message.author}, successfully created a clan named \`${clanname}\`. You now have ${coin}\`${alicecoins - 7500}\` Alice coins.**`);
                                    console.log("Clan data added")
                                })
                            });
                            confirm.on("end", () => {
                                if (!confirmation) {
                                    msg.delete();
                                    message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
        case "disband": {
            // disbands a clan
            // ===========================
            // restricted for clan leaders
            // and server mods
            let perm = isEligible(message.member) == -1;
            query = {discordid: message.author.id};
            binddb.find(query).toArray((err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres[0] && !perm) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                if (!userres[0].clan && !perm) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                let clanname = '';
                if (perm) {
                    if (args[1]) clanname = args.slice(1).join(" ");
                    else clanname = userres[0].clan;
                    if (!clanname) return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
                }
                else clanname = userres[0].clan;
                query = {name: clanname};
                clandb.find(query).toArray((err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    if (message.author.id != clanres[0].leader && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this command.**");
                    message.channel.send(`❗**| ${message.author}, are you sure you want to disband ${perm && args[1]?`\`${clanname}\` clan`:"your clan"}?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            let clanrole = message.guild.roles.find(r => r.name === clanname);
                            if (clanrole) {
                                clanrole.delete("Clan disbanded").catch(console.error);
                                let role = message.guild.roles.find(r => r.name === 'Clans');
                                clanres[0].member_list.forEach(member => {
                                    message.guild.members.get(member[0]).removeRole(role, "Clan disbanded").catch(console.error)
                                })
                            }
                            let updateVal = {
                                $set: {
                                    clan: ""
                                }
                            };
                            binddb.updateMany({clan: clanname}, updateVal, err => {
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
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            if (clanres[0].power < 250) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 250!**");
                            let cooldown = clanres[0].iconcooldown - curtime;
                            if (cooldown > 0) {
                                let time = timeconvert(cooldown);
                                return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time[0] == 0 ? "" : `${time[0] == 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] == 0 ? "" : `${time[0] == 0?"":", "}${time[1] == 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] == 0 ? "" : `${time[1] == 0?"":", "}${time[2] == 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] == 0 ? "" : `${time[2] == 0?"":", "}${time[3] == 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                            }
                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan icon? You wouldn't be able to change it for 5 minutes!**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    let updateVal = {
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
                                        message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
                                    }
                                })
                            })
                        })
                    });
                    break
                }
                case "remove": {
                    // remove icon
                    let perm = isEligible(message.member) == -1;
                    query = {discordid: message.author.id};
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0] && !perm) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan && !perm) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = '';
                        if (perm) {
                            if (args[2]) clan = args.slice(2).join(" ");
                            else clan = userres[0].clan;
                            if (!clan) return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
                            query = {name: clan};
                        } else {
                            clan = userres[0].clan;
                            query = {name: clan}
                        }
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            if (message.author.id != clanres[0].leader && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this command.**");
                            message.channel.send(`❗**| ${message.author}, are you sure you want to remove ${perm && args[2]?`\`${clan}\``:"your clan"}'s icon?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    let updateVal = {
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
                                        message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
                                    }
                                })
                            })
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your argument is invalid! Accepted arguments are `remove` and `set`.**")
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
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let powerups = clanres[0].powerups;
                            embed.setTitle(`Current owned powerups by ${clan}`);
                            for (let i = 0; i < powerups.length; i++) {
                                embed.addField(capitalizeString(powerups[i][0]), powerups[i][1], true);
                                if (i % 2 != 0) embed.addBlankField(true)
                            }
                            message.channel.send({embed: embed}).catch(console.error)
                        })
                    });
                    break
                }
                case "activelist": {
                    // views current active powerups of the user's clan
                    query = {discordid: message.author.id};
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let activepowerups = clanres[0].active_powerups;
                            if (activepowerups.length == 0) return message.channel.send(`❎ **| I'm sorry, \`${clan}\` clan does not have any powerups active!**`);
                            embed.setTitle(`Current active powerups for ${clan}`);
                            let description_string = '';
                            for (let i = 0; i < activepowerups.length; i++) {
                                description_string += `**${i+1}. ${capitalizeString(activepowerups[i])}**\n`
                            }
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
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            if (clanres[0].isMatch) return message.channel.send("❎ **| I'm sorry, your clan is currently in match mode, therefore you cannot activate powerups!**");
                            let powerups = clanres[0].powerups;
                            let activepowerups = clanres[0].active_powerups;
                            let powercount = 0;
                            let found = false;
                            for (let i = 0; i < powerups.length; i++) {
                                if (powerups[i][0] == powertype) {
                                    if (powerups[i][1] == 0) return message.channel.send(`❎ **| I'm sorry, your clan doesn't have any \`${powertype}\` powerups! To view your clan's currently owned powerups, use \`a!clan powerup view\`.**`);
                                    powerups[i][1]--;
                                    powercount = powerups[i][1];
                                    found = true;
                                    break
                                }
                            }
                            if (!found) return message.channel.send("❎ **| I'm sorry, I cannot find the powerup type you are looking for!**");
                            if (activepowerups.includes(powertype)) return message.channel.send(`❎ **| I'm sorry, your clan currently has an active \`${powertype}\` powerup!**`);
                            message.channel.send(`❗**| ${message.author}, are you sure you want to activate \`${powertype}\` powerup for your clan?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    activepowerups.push(powertype);
                                    let updateVal = {
                                        $set: {
                                            powerups: powerups,
                                            active_powerups: activepowerups
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        message.channel.send(`✅ **| ${message.author}, successfully activated \`${powertype}\` powerup for your clan. Your clan now has \`${powercount}\` remaining ${powertype} powerups.**`)
                                    })
                                });
                                confirm.on("end", () => {
                                    if (!confirmation) {
                                        msg.delete();
                                        message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
                                    }
                                })
                            })
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your argument is invalid! Accepted arguments are `activelist`, `activate`, and `list`.**")
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
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        pointdb.find(query).toArray((err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres[0]) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a clan name change! A clan name change costs ${coin}\`2500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres[0].alicecoins;
                            if (alicecoins < 2500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a clan name change! A clan name change costs ${coin}\`2500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.find(query).toArray((err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                if (clanres[0].power < 500) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 500!**");
                                let cooldown = clanres[0].namecooldown - curtime;
                                if (cooldown > 0) {
                                    let time = timeconvert(cooldown);
                                    return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time[0] == 0 ? "" : `${time[0] == 1 ? `${time[0]} day` : `${time[0]} days`}`}${time[1] == 0 ? "" : `${time[0] == 0?"":", "}${time[1] == 1 ? `${time[1]} hour` : `${time[1]} hours`}`}${time[2] == 0 ? "" : `${time[1] == 0?"":", "}${time[2] == 1 ? `${time[2]} minute` : `${time[2]} minutes`}`}${time[3] == 0 ? "" : `${time[2] == 0?"":", "}${time[3] == 1 ? `${time[3]} second` : `${time[3]} seconds`}`}.**`)
                                }
                                message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan name to \`${newname}\` for ${coin}\`2500\` Alice coins? You wouldn't be able to change it again for 3 days!**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        let clanrole = message.guild.roles.find(r => r.name === clan);
                                        if (clanrole) clanrole.setName(newname, "Changed clan name").catch(console.error);
                                        let updateVal = {
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
                                            message.channel.send(`✅ **| ${message.author}, successfully changed your clan name to \`${newname}\`. You now have ${coin}\`${alicecoins - 2500}\` Alice coins.**`);
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
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        pointdb.find(query).toArray((err, pointres) => {
                            if (!pointres[0]) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A custom role costs ${coin}\`5000\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres[0].alicecoins;
                            if (alicecoins < 5000) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A custom role costs ${coin}\`5000\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.find(query).toArray((err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                if (clanres[0].power < 2000) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 2000!**");
                                let memberlist = clanres[0].member_list;
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a custom clan role for ${coin}\`1000\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        let clanrole = message.guild.roles.find(r => r.name === 'Clans');
                                        message.guild.createRole({
                                            name: clan,
                                            color: "DEFAULT",
                                            permissions: [],
                                            position: clanrole.calculatedPosition - 1
                                        }).then(role => {
                                            memberlist.forEach(id => {
                                                message.guild.members.get(id[0]).addRoles([clanrole, role], "Clan leader bought clan role").catch(console.error)
                                            })
                                        }).catch(console.error);
                                        let updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 5000
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, successfully bought clan role for your clan. You now have ${coin}\`${alicecoins - 5000}\` Alice coins.**`)
                                        })
                                    });
                                    confirm.on("end", () => {
                                        if (!confirmation) {
                                            msg.delete();
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
                    if (!/^#[0-9A-F]{6}$/i.test(color)) return message.channel.send("❎ **| I'm sorry, that does not look like a valid hex color!**");
                    query = {discordid: message.author.id};
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        let clanrole = message.guild.roles.find(r => r.name === clan);
                        if (!clanrole) return message.channel.send("❎ **| I'm sorry, your clan doesn't have a custom clan role!**");
                        pointdb.find(query).toArray((err, pointres) => {
                            if (!pointres[0]) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to change your clan's custom role color! A role color change costs ${coin}\`500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres[0].alicecoins;
                            if (alicecoins < 500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A role color change costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.find(query).toArray((err, clanres) => {
                                if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a clan role color change for ${coin}\`500\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        clanrole.setColor(parseInt(color), "Clan leader changed role color").catch(console.error);
                                        let updateVal = {
                                            $set: {
                                                alicecoins: alicecoins - 500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| Successfully changed clan role color. You now have ${coin}\`${alicecoins - 500}\` Alice coins.**`)
                                        })
                                    });
                                    confirm.on("end", () => {
                                        if (!confirmation) {
                                            msg.delete();
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        pointdb.find(query).toArray((err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres[0]) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a powerup! A powerup costs ${coin}\`100\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres[0].alicecoins;
                            if (alicecoins < 100) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a powerup! A powerup costs ${coin}\`100\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.find(query).toArray((err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                let powerups = clanres[0].powerups;
                                let powercount = 0;
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a powerup for ${coin}\`100\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        const gachanum = Math.random() * 100;
                                        console.log(gachanum);
                                        let powerup = false;
                                        switch (true) {
                                            case (gachanum > 20 && gachanum <= 50): { // 20% chance of not getting anything
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
                                                powerup = "buff"; // 1% chance
                                            }
                                        }
                                        // reserved for special events
                                        /*switch (true) {
                                            case (gachanum > 20 && gachanum <= 50): { // 20% chance of not getting anything
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
                                                powerup = "buff"; // 1% chance
                                            }
                                        }*/
                                        if (!powerup) {
                                            message.channel.send(`✅ **| ${message.author}, unfortunately you didn't get anything! You now have ${coin}\`${alicecoins - 100}\` Alice coins.**`);
                                            let updateVal = {
                                                $set: {
                                                    alicecoins: alicecoins - 100
                                                }
                                            };
                                            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                                            });
                                            return
                                        }
                                        for (let i = 0; i < powerups.length; i++) {
                                            if (powerups[i][0] == powerup) {
                                                powerups[i][1]++;
                                                powercount = powerups[i][1];
                                                break
                                            }
                                        }
                                        let updateVal = {
                                            $set: {
                                                powerups: powerups
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, you have earned the \`${powerup}\` powerup! Your clan now has \`${powercount}\` ${powerup} ${powercount == 1 ? "powerup" : "powerups"}. You now have ${coin}\`${alicecoins - 100}\` Alice coins.**`);
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
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
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
                    let totransfer = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
                    if (!totransfer) return message.channel.send("❎ **| Hey, please enter a valid user to transfer the clan leadership to!**");
                    query = {discordid: message.author.id};
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        let clan = userres[0].clan;
                        pointdb.find(query).toArray((err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres[0]) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to transfer clan leadership! A clan leadership transfer costs ${coin}\`500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            let alicecoins = pointres[0].alicecoins;
                            if (alicecoins < 500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to transfer clan leadership! A clan leadership transfer costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${alicecoins}\` Alice coins.**`);
                            query = {name: clan};
                            clandb.find(query).toArray((err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                if (message.author.id != clanres[0].leader) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                if (message.author.id == totransfer.id) return message.channel.send("❎ **| You cannot transfer clan leadership to yourself!**");
                                let memberlist = clanres[0].member_list;
                                if (memberlist.length == 1) return message.channel.send("❎ **| I'm sorry, looks like you are alone in your clan! Who would you transfer leadershp to?**");
                                if (clanres[0].power < 300) return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 300!**");
                                let found = false;
                                for (let i = 0; i < memberlist.length; i++) {
                                    if (memberlist[i][0] == totransfer.id) {
                                        found = true;
                                        break
                                    }
                                }
                                if (!found) return message.channel.send("❎ **| I'm sorry, this user is not in your clan!");
                                message.channel.send(`❗**| ${message.author}, are you sure you want to transfer clan leadership to ${totransfer} for ${coin}\`500\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        let updateVal = {
                                            $set: {
                                                leader: totransfer.id
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            message.channel.send(`✅ **| ${message.author}, successfully transfered clan leadership to ${totransfer}. You now have ${coin}\`${alicecoins - 500}\` Alice coins.**`)
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
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
                                        }
                                    })
                                })
                            })
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your argument is invalid! Accepted arguments are `color`, `leader`, `powerup`, `rename`, `role`, and `special`.**")
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
            if ((message.member.roles == null || !message.member.roles.find(r => r.name === 'Referee')) && isEligible(message.member) != -1) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
            switch (args[1]) {
                case "give": {
                    // adds power points to a clan
                    // =======================================
                    // this must be carefully watched as abuse
                    // can be easily done
                    let togive = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
                    if (!togive) return message.channel.send("❎ **| Hey, please give me a valid user to give power points to!**");
                    let amount = parseInt(args[3]);
                    if (!amount) return message.channel.send("❎ **| Hey, I don't know how many points do I need to add!**");
                    if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Invalid amount to add.**");
                    query = {discordid: togive.id};
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = userres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let newpower = clanres[0].power + amount;
                            let updateVal = {
                                $set: {
                                    power: newpower
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully given \`${amount}\` power points to \`${clan}\` clan. The clan now has \`${newpower}\` power points.**`)
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
                    let totake = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
                    if (!totake) return message.channel.send("❎ **| Hey, please give me a valid user to take power points from!**");
                    let amount = parseInt(args[3]);
                    if (isNaN(amount) || amount <= 0) return message.channel.send("❎ **| Invalid amount to take.**");
                    query = {discordid: totake.id};
                    binddb.find(query).toArray((err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!userres[0]) return message.channel.send("❎ **| I'm sorry, that account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!userres[0].clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = userres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            let newpower = clanres[0].power - amount;
                            if (newpower < 0) return message.channel.send("❎ **| I'm sorry, this clan doesn't have as many power points as the amount you mentioned!**");
                            let updateVal = {
                                $set: {
                                    power: newpower
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully taken \`${amount}\` power points from \`${clan}\` clan. The clan now has \`${newpower}\` power points.**`)
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
                    let totake = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
                    if (!totake) return message.channel.send("❎ **| Hey, please give me a valid user to take power points from!**");
                    let togive = message.guild.member(message.mentions.users.last() || message.guild.members.get(args[3]));
                    if (totake.id == togive.id) return message.channel.send("❎ **| Hey, you cannot transfer power points to the same user!**");
                    let challengepass = args[4];
                    query = {discordid: totake.id};
                    binddb.find(query).toArray((err, takeres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!takeres[0]) return message.channel.send("❎ **| I'm sorry, the account to take power points from is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!takeres[0].clan) return message.channel.send("❎ **| I'm sorry, the user to take is not in a clan!**");
                        let takeclan = takeres[0].clan;
                        query = {discordid: togive.id};
                        binddb.find(query).toArray((err, giveres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!giveres[0]) return message.channel.send("❎ **| I'm sorry, the account to give power points to is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                            if (!giveres[0].clan) return message.channel.send("❎ **| I'm sorry, the user to give is not in a clan!**");
                            let giveclan = giveres[0].clan;
                            if (takeclan == giveclan) return message.channel.send("❎ **| Hey, you cannot transfer power points to the same clan!**");
                            query = {name: takeclan};
                            clandb.find(query).toArray((err, tclanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!tclanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan to take power points from!**");
                                if (!tclanres[0].isMatch) return message.channel.send("❎ **| I'm sorry, the clan to take power points from is not in match mode!**");
                                let t_power = tclanres[0].power;
                                let t_activepowerups = tclanres[0].active_powerups;
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
                                clandb.find(query).toArray((err, gclanres) => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    if (!gclanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan to give power points to!**");
                                    if (!gclanres[0].isMatch) return message.channel.send("❎ **| I'm sorry, the clan to give power points to is not in match mode!**");
                                    let g_power = gclanres[0].power;
                                    let g_activepowerups = gclanres[0].active_powerups;
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
                                    message.channel.send(`❗**| ${message.author}, are you sure you want to transfer \`${totalpower}\` power points from \`${takeclan}\` clan to \`${giveclan}\` clan?**`).then(msg => {
                                        msg.react("✅").catch(console.error);
                                        let confirmation = false;
                                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                        confirm.on("collect", () => {
                                            confirmation = true;
                                            msg.delete();
                                            let updateVal = {
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
                                                message.channel.send(`✅ **| ${message.author}, successfully transferred \`${totalpower}\` power points from \`${takeclan}\` clan to \`${giveclan}\` clan.**`)
                                            })
                                        });
                                        confirm.on("end", () => {
                                            if (!confirmation) {
                                                msg.delete();
                                                message.channel.send("❎ **| Timed out.**").then(m => m.delete(5000))
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    });
                    break
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your argument is invalid! Accepted arguments are `give`, `take`, and `transfer`.**")
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
            if ((message.member.roles == null || !message.member.roles.find(r => r.name === 'Referee')) && isEligible(message.member) != -1) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
            switch (args[1]) {
                // add clan
                case "add": {
                    let tomatch = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
                    if (!tomatch) return message.channel.send("❎ **| Hey, please give me a valid user!**");
                    query = {discordid: tomatch.id};
                    binddb.find(query).toArray((err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!clanres[0].clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = clanres[0].clan;
                        query = {name: clan};
                        clandb.find(query).toArray((err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            if (clanres[0].power == 0) return message.channel.send("❎ **| I'm sorry, the user's clan has 0 power points!**");
                            let updateVal = {
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
                    let tomatch = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[2]));
                    if (!tomatch) return message.channel.send("❎ **| Hey, please give me a valid user!**");
                    query = {discordid: tomatch.id};
                    binddb.find(query).toArray((err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        if (!clanres[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        if (!clanres[0].clan) return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        let clan = clanres[0].clan;
                        let updateVal = {
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your argument is invalid! Accepted arguments are `add` and `remove`.**")
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id)
            }, 2500);
            break
        }
        default: return message.channel.send("❎ **| I'm sorry, looks like your argument is invalid! Accepted arguments are `accept`, `create`, `disband`, `lb`, `icon`, `info`, `kick`, `leave`, `match`, `members`, `power`, `powerup`, and `shop`.**")
    }
};

module.exports.config = {
    description: "Main command for clans.",
    usage: "clan accept <user>\nclan create <name>\nclan disband [name]\nclan lb [page]\nclan icon <remove/set>\nclan info [name]\nclan kick <user>\nclan leave\nclan match <add/remove>\nclan members [name]\nclan power <give/take/transfer>\nclan powerup <activate/activelist/list>\nclan shop <color/leader/powerup/rename/role>\nclan upkeep",
    detail: "`accept`: Accepts a user into your clan\n`create`: Creates a clan with given name\n`disband`: Disbands your clan. Name is required if mod wants to disband another clan (leader/mod only)\n`lb`: Views leaderboard for clans based on power points\n`icon`: Sets/removes an icon for your clan from a given image URL. Clan name must be specified if mod wants to clear a clan's icon (leader/mod only)\n`info`: Views info about a clan\n`kick`: Kicks a user out from your clan. If mod and clan name is specified, will kick the user out from the given clan (leader/mod only)\n`leave`: Leaves your current clan\n`match`: Adds/removes a clan to match mode. Prevents the clan from activating powerups mid-match (referee/mod only)\n`members`: Views members of a clan\n`power`: Main hub for power points (referee/mod only)\n`powerup`: Main hub for clan powerups\n`shop`: Main hub for clan shop\n`upkeep`: Views the user's clan weekly upkeep pickup",
    permission: "None / Clan Leader / Referee / Moderator"
};

module.exports.help = {
    name: "clan"
};
