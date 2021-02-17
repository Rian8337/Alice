const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');
const cd = new Set();
const {createCanvas, loadImage} = require('canvas');
const { Db } = require('mongodb');
const canvas = createCanvas(900, 250);
const c = canvas.getContext("2d");
c.imageSmoothingQuality = "high";

/**
 * @param {string} string 
 */
function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {string} str 
 */
function hasUnicode(str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127) return true;
    }
    return false;
}

/**
 * @param {Discord.GuildMember} member 
 */
function isEligible(member) {
    let res = 0;
    let eligibleRoleList = config.mute_perm;
    for (const id of eligibleRoleList) {
        if (res === -1) {
            break;
        }
        if (member.roles.cache.has(id[0])) {
            if (id[1] === -1) {
                res = id[1];
            } else {
                res = Math.max(res, id[1]);
            }
        }
    }
    return res;
}

/**
 * @param {number} num 
 */
function timeConvert(num) {
    const days = Math.floor(num / 86400);
    const hours = Math.floor((num - days * 86400) / 3600);
    const minutes = Math.floor((num - days * 86400 - hours * 3600) / 60);
    const seconds = num - days * 86400 - hours * 3600 - minutes * 60;
    let string = '';

    if (days > 0) {
        string += `${days} ${days === 1 ? "day" : "days"}`;
    }
    if (hours > 0) {
        if (days > 0) string += ', ';
        string += `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    if (minutes > 0) {
        if (days + hours > 0) string += ', ';
        string += `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    }
    if (seconds > 0) {
        if (days + hours + minutes > 0) string += ', ';
        string += `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
    }

    return string;
}

function editMember(clanres, page, color, footer, index, coin) {
    const embed = new Discord.MessageEmbed()
        .setTitle(`${clanres.name} Members (Page ${page}/5)`)
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(color);

    if (clanres.icon) embed.setThumbnail(clanres.icon);
    
    let list = clanres.member_list;
    let leader = clanres.leader;
    let memberstring = '';
    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!list[i]) break;
        memberstring += `**${i+1}. <@${list[i].id}> (#${list[i].rank})**\n**Discord ID**: ${list[i].id}\n**Uid**: ${list[i].uid}\n**Role**: ${list[i].hasPermission ? `${list[i].id === leader ? "Leader" : "Co-Leader"}` : "Member"}\n**Upkeep Value**: ${coin}${(500 - Math.floor(34.74 * Math.log(list[i].rank))).toLocaleString()} Alice coins\n\n`;
    }
    embed.setDescription(memberstring);
    return embed;
}

/**
 * @param {string} s 
 * @param {number} l 
 */
function spaceFill(s, l) {
    const a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

function editLeaderboard(res, page) {
    let output = '#   | Clan Name                 | Members | Power\n';
    for (let i = 20 * (page - 1); i < (page - 1) * 20 + 20; i++) {
        if (res[i]) {
            if (res[i].power && res[i].name) output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].name, 26) + ' | ' + spaceFill(res[i].member_list.length.toLocaleString(), 8) + ' | ' + res[i].power.toLocaleString() + '\n';
            else output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].name, 26) + ' | ' + spaceFill(res[i].member_list.length.toLocaleString(), 8) + ' | ' + res[i].power.toLocaleString() + '\n';
        }
        else output += spaceFill("-", 4) + ' | ' + spaceFill("-", 26) + ' | ' + spaceFill("-", 8) + ' | - \n';
    }
    output += "Current page: " + page + "/" + (Math.ceil(res.length / 20));
    return output;
}

function editAuction(res, coin, page, color, footer, index) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.floor(res.length / 5)}`, footer[index])
        .setDescription(`**${res.length === 1 ? "Auction" : "Auctions"}**: ${res.length.toLocaleString()}`);

    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
        if (!res[i]) break;
        embed.addField(`**${i+1}. ${res[i].name}**`, `**Auctioneer**: ${res[i].auctioneer}\n**Created at**: ${new Date(res[i].creationdate * 1000).toUTCString()}\n**Expires at**: ${new Date(res[i].expirydate * 1000).toUTCString()}\n\n**Powerup**: ${capitalizeString(res[i].powerup)}\n**Amount**: ${res[i].amount.toLocaleString()}\n**Minimum bid amount**: ${coin}**${res[i].min_price.toLocaleString()}** Alice coins\n**Bidders**: ${res[i].bids.length.toLocaleString()}`);
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
module.exports.run = async (client, message, args, maindb, alicedb) => {
    if (message.channel.type !== "text") {
        return;
    }
    if (args[0] !== "about" && message.channel.parentID !== '696646649128288346') {
        return message.channel.send("❎ **| I'm sorry, this command is only allowed in Clans category!**");
    }
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }

    const binddb = maindb.collection("userbind");
    const clandb = maindb.collection("clandb");
    const pointdb = alicedb.collection("playerpoints");
    const auctiondb = alicedb.collection("auction");
    const coin = client.emojis.cache.get("669532330980802561");
    const curtime = Math.floor(Date.now() / 1000);
    const perm = message.isOwner || isEligible(message.member) !== 0;
    let query = {};
    let updateVal;
    let insertVal;
    let color = message.member?.roles.color?.hexColor || "#000000";
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setColor(color);

    switch (args[0]) {
        case "about": {
            // about section
            embed.setDescription(`Please go to [this](https://osudroidfaq.wordpress.com/clans/) website for guidelines.`);
            message.channel.send({embed: embed});
            break;
        }

        case "info": {
            // view info of a clan
            // ============================
            // if args[1] is not specified,
            // it will search for the user's
            // clan
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    if (args[1]) {
                        message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                    } else {
                        message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <<username>`.**");
                    }
                    return;
                }
                const clan = args[1] ? args.slice(1).join(" ") : userres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, you are currently not in a clan! Please enter a clan name!**");
                }
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, you are currently not in a clan! Please enter a clan name!**");
                }
                query = {name: clan};
                clandb.findOne(query, async (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!clanres) return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    const power = clanres.power;
                    const clandate = clanres.createdAt * 1000;
                    const members = clanres.member_list;
                    const clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                    if (clanrole) {
                        embed.setColor(clanrole.hexColor);
                    }
                    let upkeep = 200;
                    for (const member of members) {
                        upkeep += 500 - Math.floor(34.74 * Math.log(member.rank));
                    }
                    embed.setTitle(clan)
                        .addField("Clan Leader", `<@${clanres.leader}>\n(${clanres.leader})`, true)
                        .addField("Power", power.toLocaleString(), true)
                        .addField("Members", `${members.length}/25`, true)
                        .addField("Created at", new Date(clandate).toUTCString(), true)
                        .addField("Total Upkeep Estimation", `${coin}${upkeep.toLocaleString()} Alice coins`, true);
                    if (clanres.icon) {
                        embed.setThumbnail(clanres.icon);
                    }
                    if (clanres.description) {
                        embed.setDescription(clanres.description);
                    }
                    if (clanres.banner) {
                        try {
                            const image = await loadImage(clanres.banner);
                            c.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 900, 250);
                            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'banner.png');
                            embed.attachFiles([attachment])
                                .setImage("attachment://banner.png");
                        } catch (e) {}
                    }
                    message.channel.send({embed: embed}).catch(console.error);
                });
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 4000);
            break;
        }

        case "members": {
            // view members of a clan
            // =================================
            // not really special, just
            // like other lbs one it uses paging
            let page = 1;
            query = {discordid: message.author.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                const clan = args[1] ? args.slice(1).join(" ") : userres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, you are currently not in a clan! Please enter a clan name!**");
                }
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    }
                    const clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                    if (clanrole) {
                        color = clanrole.hexColor;
                    }
                    embed = editMember(clanres, page, color, footer, index, coin);
                    message.channel.send({embed: embed}).then(msg => {
                        msg.react("⏮️").then(() => {
                            msg.react("⬅️").then(() => {
                                msg.react("➡️").then(() => {
                                    msg.react("⏭️").catch(console.error);
                                });
                            });
                        });

                        const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 45000});
                        const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 45000});
                        const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 45000});
                        const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 45000});

                        backward.on('collect', () => {
                            if (page === 1) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            else page = 1;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editMember(clanres, page, color, footer, index, coin);
                            msg.edit({embed: embed}).catch(console.error);
                        });

                        back.on('collect', () => {
                            if (page === 1) page = 5;
                            else page--;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editMember(clanres, page, color, footer, index, coin);
                            msg.edit({embed: embed}).catch(console.error);
                        });

                        next.on('collect', () => {
                            if (page === 5) page = 1;
                            else page++;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editMember(clanres, page, color, footer, index, coin);
                            msg.edit({embed: embed}).catch(console.error);
                        });

                        forward.on('collect', () => {
                            if (page === 5) return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            else page = 5;
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                            embed = editMember(clanres, page, color, footer, index, coin);
                            msg.edit({embed: embed}).catch(console.error);
                        });

                        backward.on("end", () => {
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                        });
                    });
                });
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 5000);
            break;
        }

        case "lb": {
            // views leaderboard of clans based on power points
            // ================================================
            // will be able to specify page
            let page = 1;
            if (parseInt(args[1]) > 0) page = parseInt(args[1]);
            clandb.find({}, {projection: {_id: 0, name: 1, member_list: 1, power: 1}}).sort({power: -1}).toArray((err, clanres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!clanres[(page - 1)*20]) {
                    return message.channel.send("❎ **| Nah, we don't have that much clan :p**");
                }
                let output = editLeaderboard(clanres, page);
                message.channel.send('```c\n' + output + '```').then(msg => {
                    msg.react("⏮️").then(() => {
                        msg.react("⬅️").then(() => {
                            msg.react("➡️").then(() => {
                                msg.react("⏭️").catch(console.error);
                            });
                        });
                    });

                    const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
                    const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
                    const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
                    const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

                    backward.on('collect', () => {
                        page = Math.max(1, page - 10);
                        output = editLeaderboard(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    back.on('collect', () => {
                        if (page === 1) page = Math.ceil(clanres.length / 20);
                        else page--;
                        output = editLeaderboard(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    next.on('collect', () => {
                        if (page * 20 >= clanres.length) page = 0;
                        else page++;
                        output = editLeaderboard(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    forward.on('collect', () => {
                        page = Math.min(page + 10, Math.ceil(clanres.length / 20));
                        output = editLeaderboard(clanres, page);
                        msg.edit('```c\n' + output + '```').catch(console.error);
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    });

                    backward.on("end", () => {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                    });
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
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                if (!userres.clan) {
                    return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                }
                const clan = userres.clan;
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find your clan!**");
                    }
                    const time = timeConvert(clanres.weeklyfee - curtime);
                    const members = clanres.member_list;
                    const member = members.find(m => m.id === message.author.id);
                    const upkeep = 500 - Math.floor(34.74 * Math.log(member.rank));
                    let total_upkeep = 200;
                    const equal_distribution = Math.floor(total_upkeep / members.length);
                    total_upkeep += equal_distribution;
                    const mod = total_upkeep % members.length;
                    for (const member of members) {
                        total_upkeep += 500 - Math.floor(34.74 * Math.log(member.rank));
                    }
                    message.channel.send(`✅ **| ${message.author}, your upkeep cost is ${mod ? `somewhere between ${coin}\`${upkeep.toLocaleString()}-${(upkeep + 1).toLocaleString()}\`` : `${coin}\`${upkeep.toLocaleString()}\``} Alice coins, which will be taken from you in ${time}. Your clan's estimated total weekly upkeep is ${coin}\`${total_upkeep.toLocaleString()}\` Alice coins.**`)
                });
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 4000);
            break;
        }


        // accepts a user as clan member
        case "accept": {
            const toaccept = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(console.error);
            if (!toaccept) {
                return message.channel.send("❎ **| Hey, please enter a correct user!**");
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
                if (!userres.clan) {
                    return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                }
                query = {discordid: toaccept.id};
                binddb.findOne(query, async (err, joinres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!joinres) {
                        return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                    }
                    if (joinres.clan) {
                        return message.channel.send("❎ **| I'm sorry, this user is already in a clan!**");
                    }
                    if (!joinres.joincooldown) joinres.joincooldown = 0;
                    const player = await osudroid.Player.getInformation({uid: joinres.uid});
                    if (player.error) {
                        return message.channel.send("❎ **| I'm sorry, I couldn't fetch the player's profile! Perhaps osu!droid server is down?**");
                    }
                    if (!player.username) {
                        return message.channel.send("❎ **| I'm sorry, I couldn't find the player's profile!**");
                    }
                    const cooldown = joinres.joincooldown - curtime;
                    if (cooldown > 0) {
                        const time = timeConvert(cooldown);
                        return message.channel.send(`❎ **| I'm sorry, that user is still in cooldown! Please wait for ${time}.**`);
                    }
                    const oldcooldown = (userres.oldjoincooldown ?? 0) - curtime;
                    if (oldcooldown > 0 && userres.oldclan === joinres.clan) {
                        const time = timeConvert(oldcooldown);
                        return message.channel.send(`❎ **| I'm sorry, that user is still in cooldown! Please wait for ${time}.**`);
                    }
                    query = {name: userres.clan};
                    clandb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!clanres) {
                            return message.channel.send("❎ **| I'm sorry, I cannot find your clan!**");
                        }

                        const memberlist = clanres.member_list;
                        const cl_index = memberlist.findIndex(member => member.id === message.author.id);
                        if (!memberlist[cl_index].hasPermission) {
                            return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
                        }

                        const member_index = memberlist.findIndex(member => member.id === toaccept.id);
                        if (member_index !== -1) {
                            return message.channel.send("❎ **| I'm sorry, this user is already in your clan!**");
                        }

                        if (memberlist.length >= 25) {
                            return message.channel.send("❎ **| I'm sorry, a clan can only have up to 25 members (including leader)!");
                        }

                        message.channel.send(`❗**| ${toaccept}, are you sure you want to join \`${userres.clan}\`?**`).then(msg => {
                            msg.react("✅").catch(console.error);
                            let confirmation = false;
                            let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === toaccept.id, {time: 20000});

                            confirm.on("collect", () => {
                                confirmation = true;
                                msg.delete();
                                const clanrole = message.guild.roles.cache.find((r) => r.name === userres.clan);
                                if (clanrole) {
                                    const role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                    toaccept.roles.add([role, clanrole], "Accepted into clan").catch(console.error);
                                }
                                memberlist.push({
                                    id: toaccept.id,
                                    uid: player.uid,
                                    rank: player.rank,
                                    hasPermission: false,
                                    battle_cooldown: curtime + 86400 * 4
                                });
                                updateVal = {
                                    $set: {
                                        member_list: memberlist
                                    }
                                };
                                clandb.updateOne(query, updateVal, err => {
                                    if (err) {
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    }
                                    console.log("Clan data updated");
                                });
                                updateVal = {
                                    $set: {
                                        clan: userres.clan
                                    }
                                };
                                binddb.updateOne({discordid: toaccept.id}, updateVal, err => {
                                    if (err) {
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| ${toaccept}, successfully joined \`${userres.clan}\`.**`);
                                    console.log("User data updated");
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
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
        }

        case "kick": {
            // kicks a user out of a clan
            // ===============================
            // for now this is only restricted
            // to clan leaders and server mods
            const tokick = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(console.error);
            if (!tokick) {
                return message.channel.send("❎ **| Hey, please enter a correct user!**");
            }
            if (message.author.id === tokick.id) {
                return message.channel.send("❎ **| Hey, you cannot kick yourself!**");
            }
            const reason = args.slice(2).join(" ");
            if (!reason) {
                return message.channel.send("❎ **| Hey, please enter a reason!**");
            }
            query = {discordid: tokick.id};
            binddb.findOne(query, (err, kickres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!kickres) {
                    return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                const clan = kickres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, this user is not in any clan!**");
                }
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    }
                    if (tokick.id === clanres.leader) {
                        return message.channel.send("❎ **| I'm sorry, you cannot kick the leader of the clan!**");
                    }

                    let memberlist = clanres.member_list;
                    let perm_index = memberlist.findIndex(member => member.id === message.author.id);
                    if (!memberlist[perm_index].hasPermission && !perm) {
                        return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                    }

                    let member_index = clanres.member_list.findIndex(member => member.id === tokick.id);
                    if (member_index === -1) {
                        return message.channel.send("❎ **| I'm sorry, this user is not in your clan!**");
                    }
                    if (memberlist[member_index].hasPermission && message.author.id !== clanres.leader) {
                        return message.channel.send("❎ **| I'm sorry, you cannot kick this clan member!**");
                    }

                    message.channel.send(`❗**| ${message.author}, are you sure you want to kick the user out from ${perm?`\`${clan}\``:"your"} clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            const clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                            if (clanrole) {
                                const role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                tokick.roles.remove([role, clanrole], "Kicked from clan").catch(console.error);
                            }

                            memberlist.splice(member_index, 1);

                            updateVal = {
                                $set: {
                                    member_list: memberlist
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                }
                                console.log("Clan data updated");
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
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully kicked user for ${reason}.**`);
                                console.log("User data updated");
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2500);
            break;
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
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                const clan = userres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                }
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    }
                    if (message.author.id === clanres.leader) {
                        return message.channel.send("❎ **| I'm sorry, you cannot leave as the leader of the clan!**");
                    }
                    message.channel.send(`❗**| ${message.author}, are you sure you want to leave your current clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            const clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                            if (clanrole) {
                                const role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                message.member.roles.remove([role, clanrole], "Left the clan").catch(console.error);
                            }
                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);

                            memberlist.splice(member_index, 1);

                            updateVal = {
                                $set: {
                                    member_list: memberlist
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                }
                                console.log("Clan data updated");
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
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully left \`${clan}\` clan.**`);
                                console.log("User clan data updated");
                            });
                        });
                        confirm.on("end", () => {
                            if (!confirmation) {
                                msg.delete();
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                            }
                        });
                    });
                });
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
        }

        case "create": {
            // creates a clan
            // =========================
            // this will use Alice coins
            // as currency
            const clanname = args.slice(1).join(" ");
            if (!clanname) {
                return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
            }
            if (clanname.length > 25) {
                return message.channel.send("❎ **| I'm sorry, clan names can only be 20 characters long!**");
            }
            if (hasUnicode(clanname)) {
                return message.channel.send("❎ **| I'm sorry, clan name must not contain any unicode characters!**");
            }
            query = {discordid: message.author.id};
            binddb.findOne(query, async (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                if (userres.clan) {
                    return message.channel.send("❎ **| I'm sorry, you are already in a clan!**");
                }
                const uid = userres.uid;
                const player = await osudroid.Player.getInformation({uid: uid});
                pointdb.findOne(query, (err, pointres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!pointres) {
                        return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan! Creating a clan costs ${coin}\`7,500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                    }
                    const alicecoins = pointres.alicecoins;
                    if (alicecoins < 7500) {
                        return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan! Creating a clan costs ${coin}\`7,500\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                    }
                    query = {name: clanname};
                    clandb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (clanres) {
                            return message.channel.send("❎ **| I'm sorry, that name is already taken by other clan!**");
                        }
                        message.channel.send(`❗**| ${message.author}, are you sure you want to create a clan named \`${clanname}\` for ${coin}\`7,500\` Alice coins?**`).then(msg => {
                            msg.react("✅").catch(console.error);
                            let confirmation = false;
                            const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                            confirm.on("collect", () => {
                                confirmation = true;
                                msg.delete();
                                query = {discordid: message.author.id};
                                updateVal = {
                                    $inc: {
                                        alicecoins: -7500
                                    }
                                };
                                pointdb.updateOne(query, updateVal, err => {
                                    if (err) {
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    }
                                    console.log("User coins data updated");
                                });
                                updateVal = {
                                    $set: {
                                        clan: clanname
                                    }
                                };
                                binddb.updateOne(query, updateVal, err => {
                                    if (err) {
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    }
                                    console.log("User data updated");
                                });
                                insertVal = {
                                    name: clanname,
                                    power: 0,
                                    createdAt: curtime,
                                    leader: message.author.id,
                                    description: "",
                                    icon: "",
                                    banner: "",
                                    iconcooldown: 0,
                                    namecooldown: 0,
                                    bannercooldown: 0,
                                    weeklyfee: curtime + 86400 * 7,
                                    isMatch: false,
                                    powerups: [
                                        {
                                            name: 'megabuff',
                                            amount: 0
                                        },
                                        {
                                            name: 'megadebuff',
                                            amount: 0
                                        },
                                        {
                                            name: 'megachallenge',
                                            amount: 0
                                        },
                                        {
                                            name: 'megabomb',
                                            amount: 0
                                        },
                                        {
                                            name: 'superbuff',
                                            amount: 0
                                        },
                                        {
                                            name: 'superdebuff',
                                            amount: 0
                                        },
                                        {
                                            name: 'superchallenge',
                                            amount: 0
                                        },
                                        {
                                            name: 'superbomb',
                                            amount: 0
                                        },
                                        {
                                            name: 'buff',
                                            amount: 0
                                        },
                                        {
                                            name: 'debuff',
                                            amount: 0
                                        },
                                        {
                                            name: 'challenge',
                                            amount: 0
                                        },
                                        {
                                            name: 'bomb',
                                            amount: 0
                                        }
                                    ],
                                    active_powerups: [],
                                    member_list: [
                                        {
                                            id: message.author.id,
                                            rank: player.rank,
                                            uid: player.uid,
                                            hasPermission: true,
                                            battle_cooldown: 0
                                        }
                                    ]
                                };
                                clandb.insertOne(insertVal, err => {
                                    if (err) {
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| ${message.author}, successfully created a clan named \`${clanname}\`. You now have ${coin}\`${(alicecoins - 7500).toLocaleString()}\` Alice coins.**`);
                                    console.log("Clan data added");
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
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2500);
            break;
        }

        // main hub for clan descriptions
        case "description": {
            switch (args[1]) {
                // clear a clan's description
                // moderators can specify clan to remove a clan's description
                case "clear": {
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        const clan = perm && args[2] ? args.slice(2).join(" ") : userres?.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }

                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!perm && !memberlist[member_index].hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            message.channel.send(`❗**| ${message.author}, are you sure you want to clear ${perm && args[2] ? `\`${clan}\` clan's description` : "your clan's description"}?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();

                                    updateVal = {
                                        $set: {
                                            description: ""
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully cleared ${perm && args[2] ? `\`${clan}\` clan's description` : "your clan's description"}.**`);
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

                case "edit": {
                    const cmd_length = message.content.split(" ").slice(0, 3).join(" ").length + 1;
                    const new_desc = message.content.substring(cmd_length);
                    if (!new_desc) {
                        return message.channel.send("❎ **| Hey, please enter a new description!**");
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
                        const clan = userres.clan;
                        if (!userres.clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }

                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            let memberlist = clanres.member_list;
                            let member_index = memberlist.findIndex(member => member.id === message.author.id);
                            let hasPermission = memberlist[member_index].hasPermission;
                            if (!hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            if (new_desc === clanres.description) {
                                return message.channel.send("❎ **| Hey, your new description is the same as the old description!**");
                            }

                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan's description?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();

                                    updateVal = {
                                        $set: {
                                            description: new_desc
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully changed your clan's description.**`);
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `clear` and `edit`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
        }

        case "promote": {
            // promotes a clan member to co-leader
            // ==================================================
            // co-leaders can do anything that a leader can
            // except changing clan name, disbanding it, changing
            // role color, and promoting other members
            const topromote = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(console.error);
            if (!topromote) {
                return message.channel.send("❎ **| Hey, please mention a valid user to promote!**");
            }
            if (topromote.id === message.author.id) {
                return message.channel.send("❎ **| Hey, you cannot promote yourself!**");
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
                const clan = userres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                }

                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    }
                    if (message.author.id !== clanres.leader) {
                        return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                    }

                    const member_list = clanres.member_list;
                    const member_index = member_list.findIndex(member => member.id === topromote.id);
                    if (member_index === -1) {
                        return message.channel.send("❎ **| I'm sorry, the user is not in your clan!**");
                    }
                    if (member_list[member_index].hasPermission) {
                        return message.channel.send("❎ **| I'm sorry, this user is already a co-leader!**");
                    }
                    member_list[member_index].hasPermission = true;

                    message.channel.send(`❗**| ${message.author}, are you sure you want to promote ${topromote} to co-leader?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
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
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully promoted ${topromote} to co-leader.**`);
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
        }



        case "demote": {
            // demotes a clan member to normal member
            // ======================================
            // moderators can demote a user to normal
            // member despite them being outside the
            // clan
            const todemote = await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(console.error);
            if (!todemote) {
                return message.channel.send("❎ **| Hey, please mention a valid user to demote!**");
            }
            if (todemote.id === message.author.id) {
                return message.channel.send("❎ **| Hey, you cannot demote yourself!**");
            }

            query = {discordid: todemote.id};
            binddb.findOne(query, (err, userres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (!userres) {
                    return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                const clan = userres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                }

                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the user's clan!**");
                    }
                    if (!perm && message.author.id !== clanres.leader) {
                        return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                    }

                    const member_list = clanres.member_list;
                    const member_index = member_list.findIndex(member => member.id === todemote.id);
                    if (!perm && member_index === -1) {
                        return message.channel.send("❎ **| I'm sorry, this user is not in a clan!**");
                    }
                    if (!member_list[member_index].hasPermission) {
                        return message.channel.send("❎ **| I'm sorry, this user is already a normal member!**");
                    }
                    member_list[member_index].hasPermission = false;

                    message.channel.send(`❗**| ${message.author}, are you sure you want to demote ${todemote} to normal member?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
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
                                message.channel.send(`✅ **| ${message.author}, successfully demoted ${todemote} to normal member.**`);
                            });
                        });
                        confirm.on("end", () => {
                            if (!confirmation) {
                                msg.delete();
                                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                            }
                        });
                    });
                });
            });
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
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
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!userres && !perm) {
                    return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                }
                if (!userres.clan && !perm) {
                    return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                }
                let clanname = '';
                if (perm) {
                    if (args[1]) {
                        clanname = args.slice(1).join(" ");
                    } else {
                        clanname = userres.clan;
                    }

                    if (!clanname) {
                        return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                    }
                } else {
                    clanname = userres.clan;
                }
                query = {name: clanname};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    }
                    if (message.author.id !== clanres.leader && !perm) {
                        return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
                    }
                    message.channel.send(`❗**| ${message.author}, are you sure you want to disband ${perm && args[1]?`\`${clanname}\` clan`:"your clan"}?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            const clanrole = message.guild.roles.cache.find((r) => r.name === clanname);
                            if (clanrole) {
                                clanrole.delete("Clan disbanded").catch(console.error);
                                const role = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                clanres.member_list.forEach(async (member) => {
                                    const guildMember = await message.guild.members.fetch(member.id).catch(console.error);
                                    if (guildMember) {
                                        guildMember.roles.remove(role, "Clan disbanded").catch(console.error);
                                    }
                                });
                            }
                            const clanChannel = message.guild.channels.cache.find(c => c.name === clanname);
                            if (clanChannel) {
                                clanChannel.delete("Clan disbanded").catch(console.error);
                            }
                            updateVal = {
                                $set: {
                                    clan: ""
                                }
                            };
                            binddb.updateMany({clan: clanname}, updateVal, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                            });
                            auctiondb.deleteMany({auctioneer: clanname}, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                            });
                            clandb.deleteOne({name: clanname}, err => {
                                if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                message.channel.send(`✅ **| ${message.author}, successfully disbanded ${perm && args[1]?`a clan named \`${clanname}\``:"your clan"}.**`);
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
        }

        case "banner": {
            // clan banner
            // ============================
            // mods are able to remove banners
            // that contradict server rules
            switch (args[1]) {

                case "set": {
                    // set banner
                    let banner = args[2];
                    if (!banner) {
                        if (message.attachments.size === 0) {
                            return message.channel.send("❎ **| Hey, please attach an image or enter an image URL!**");
                        }
                        if (message.attachments.size > 0) {
                            const attachment = message.attachments.first();
                            banner = attachment.url;
                            const length = banner.length;
                            if (
                                banner.indexOf("png", length - 3) === -1 &&
                                banner.indexOf("jpg", length - 3) === -1 &&
                                banner.indexOf("jpeg", length - 4) === -1
                            ) {
                                return message.channel.send("❎ **| Hey, please provide a valid image!**");
                            }
                        }
                    }
                    if (!banner.startsWith("http")) {
                        return message.channel.send("❎ **| Hey, I think that banner link is invalid!**");
                    }
                    let image;
                    try {
                        image = await loadImage(banner);
                    } catch (e) {
                        return message.channel.send("❎ **| I'm sorry, that banner link does not resolve to an image!**");
                    }
                    if (image.naturalWidth / image.naturalHeight !== 3.6) {
                        return message.channel.send("❎ **| I'm sorry, that image ratio is not properly set! I only accept 18:5 image ratio!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            const hasPermission = memberlist[member_index].hasPermission;
                            if (!hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            if (clanres.power < 500) {
                                return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 500!**");
                            }
                            let cooldown = clanres.bannercooldown - curtime;
                            if (cooldown > 0) {
                                const time = timeConvert(cooldown);
                                return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time}.**`)
                            }
                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan banner? You wouldn't be able to change it for 10 minutes!**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    updateVal = {
                                        $set: {
                                            banner: banner,
                                            bannercooldown: curtime + 600
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) {
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully set your clan banner.**`);
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

                case "remove": {
                    // remove banner
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres && !perm) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        if (!userres.clan && !perm) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        let clan = '';
                        if (perm) {
                            if (args[2]) {
                                clan = args.slice(2).join(" ");
                            } else {
                                clan = userres.clan;
                            }
                            
                            if (!clan) {
                                return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
                            }
                        } else {
                            clan = userres.clan;
                        }

                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!perm && !memberlist[member_index].hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }
                            message.channel.send(`❗**| ${message.author}, are you sure you want to remove ${perm && args[2]?`\`${clan}\``:"your clan"}'s banner?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    updateVal = {
                                        $set: {
                                            banner: ""
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        message.channel.send(`✅ **| ${message.author}, successfully removed banner from ${perm && args[2]?`\`${clan}\``:"your clan"}.**`);
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `remove` and `set`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
        }

        case "announce": {
            // used to announce something to clan members for clan co-leaders and leader
            // requires clan role to work
            const cmd_length = message.content.split(" ").slice(0, 2).join(" ").length + 1;
            const announcement_message = message.content.substring(cmd_length);
            if (!announcement_message) {
                return message.channel.send("❎ **| Hey, please enter an announcement message!**");
            }
            if (announcement_message.length > 1750) {
                return message.channel.send("❎ **| I'm sorry, your announcement message is too long! Announcement limit is 1750 characters.**")
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
                const clan = userres.clan;
                if (!clan) {
                    return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                }
                query = {name: clan};
                clandb.findOne(query, (err, clanres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    if (!clanres) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                    }

                    const memberlist = clanres.member_list;
                    const member_index = memberlist.findIndex(member => member.id === message.author.id);
                    if (!memberlist[member_index].hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                    let string = '';
                    const clanrole = message.guild.roles.cache.find(r => r.name === clan);
                    if (clanrole) {
                        string += `${clanrole}`;
                    } else {
                        for (const member of memberlist) {
                            string += `<@${member.id}>`;
                        }
                    }
                    string += `\n\n${announcement_message}\n\n- ${message.author}`;
                    message.channel.send(`❗**| ${message.author}, are you sure you want to send an announcement for your clan?**`).then(msg => {
                        msg.react("✅").catch(console.error);
                        let confirmation = false;
                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                        confirm.on("collect", () => {
                            confirmation = true;
                            msg.delete();
                            message.channel.send(string);
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
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2000);
            break;
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
                    const icon = args[2] ?? (message.attachments.first()?.url || "");
                    const length = icon.length;
                    if (
                        icon.indexOf("png", length - 3) === -1 &&
                        icon.indexOf("jpg", length - 3) === -1 &&
                        icon.indexOf("jpeg", length - 4) === -1
                    ) {
                        return message.channel.send("❎ **| Hey, please provide a valid image!**");
                    }
                    if (!icon.startsWith("http")) {
                        return message.channel.send("❎ **| Hey, I think that icon link is invalid!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!memberlist[member_index].hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            if (clanres.power < 250) {
                                return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 250!**");
                            }
                            const cooldown = clanres.iconcooldown - curtime;
                            if (cooldown > 0) {
                                const time = timeConvert(cooldown);
                                return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time}.**`);
                            }
                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan icon? You wouldn't be able to change it for 5 minutes!**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
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
                                    });
                                });
                                confirm.on("end", () => {
                                    if (!confirmation) {
                                        msg.delete();
                                        message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                    }
                                });
                            });
                        });
                    });
                    break;
                }

                case "remove": {
                    // remove icon
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres && !perm) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        if (!userres.clan && !perm) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        const clan = perm && args[2] ? args.slice(2).join(" ") : userres?.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| Hey, can you at least give me a clan name?**");
                        }

                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!perm && !memberlist[member_index].hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            message.channel.send(`❗**| ${message.author}, are you sure you want to remove ${perm && args[2]?`\`${clan}\``:"your clan"}'s icon?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                confirm.on("collect", () => {
                                    confirmation = true;
                                    msg.delete();
                                    updateVal = {
                                        $set: {
                                            icon: ""
                                        }
                                    };
                                    clandb.updateOne(query, updateVal, err => {
                                        if (err) {
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully removed icon from ${perm && args[2]?`\`${clan}\``:"your clan"}.**`);
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `remove` and `set`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 3000);
            break;
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
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }
                            const powerups = clanres.powerups;
                            embed.setTitle(`Currently owned powerups by ${clan}`);
                            for (const powerup of powerups) {
                                embed.addField(capitalizeString(powerup.name), powerup.amount, true);
                            }
                            message.channel.send({embed: embed}).catch(console.error);
                        });
                    });
                    break;
                }

                case "activelist": {
                    // views current active powerups of the user's clan
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }
                            const activepowerups = clanres.active_powerups;
                            if (activepowerups.length === 0) {
                                return message.channel.send(`❎ **| I'm sorry, your clan does not have any powerups active!**`);
                            }
                            embed.setTitle(`Currently active powerups for ${clan}`);
                            let description_string = '';
                            for (let i = 0; i < activepowerups.length; i++) {
                                description_string += `**${i+1}. ${capitalizeString(activepowerups[i])}**\n`;
                            }
                            embed.setDescription(description_string);
                            message.channel.send({embed: embed}).catch(console.error);
                        });
                    });
                    break;
                }

                case "activate": {
                    // activates a powerup
                    // ===============================
                    // can only be done by clan leader
                    const powertype = args[2]?.toLowerCase();
                    if (!powertype) {
                        return message.channel.send("❎ **| Hey, I don't know what powerup to activate!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!memberlist[member_index].hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            if (clanres.isMatch) {
                                return message.channel.send("❎ **| I'm sorry, your clan is currently in match mode, therefore you cannot activate powerups!**");
                            }

                            const powerups = clanres.powerups;
                            const activepowerups = clanres.active_powerups;
                            const powerup_index = powerups.findIndex(powerup => powerup.name === powertype);
                            if (powerup_index === -1) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the powerup type you are looking for!**");
                            }

                            if (powerups[powerup_index].amount === 0) {
                                return message.channel.send(`❎ **| I'm sorry, your clan doesn't have any \`${powertype}\` powerups! To view your clan's currently owned powerups, use \`a!clan powerup list\`.**`);
                            }
                            --powerups[powerup_index].amount;
                            const powercount = powerups[powerup_index].amount;

                            if (activepowerups.includes(powertype)) {
                                return message.channel.send(`❎ **| I'm sorry, your clan currently has an active \`${powertype}\` powerup!**`);
                            }
                            message.channel.send(`❗**| ${message.author}, are you sure you want to activate \`${powertype}\` powerup for your clan?**`).then(msg => {
                                msg.react("✅").catch(console.error);
                                let confirmation = false;
                                const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
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
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `activelist`, `activate`, and `list`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 3000);
            break;
        }

        case "shop": {
            // main hub for clan shops
            // =======================================================
            // players can buy clan channel, name change, custom role,
            // clan color change, powerups, etc in here, specified by
            // args[1]. also uses alice coins as currency
            switch (args[1]) {
                case "rename": {
                    // changes the clan name
                    // ============================================
                    // only works for clan leaders, mods can disband
                    // clans with inappropriate names
                    const newname = args.slice(2).join(" ");
                    if (!newname) {
                        return message.channel.send("❎ **| Hey, give me a new name for your clan!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a clan name change! A clan name change costs ${coin}\`2,500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < 2500) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a clan name change! A clan name change costs ${coin}\`2,500\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!clanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                }
                                if (message.author.id !== clanres.leader) {
                                    return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                }
                                if (clanres.power < 500) {
                                    return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 500!**");
                                }
                                if (clanres.name === newname) {
                                    return message.channel.send("❎ **| Hey, your new clan name must be different from your old clan name!**");
                                }
                                const cooldown = clanres.namecooldown - curtime;
                                if (cooldown > 0) {
                                    const time = timeConvert(cooldown);
                                    return message.channel.send(`❎ **| I'm sorry, your clan is still in cooldown! Please wait for ${time}.**`);
                                }
                                message.channel.send(`❗**| ${message.author}, are you sure you want to change your clan name to \`${newname}\` for ${coin}\`2,500\` Alice coins? You wouldn't be able to change it again for 3 days!**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        const clanrole = message.guild.roles.cache.find(r => r.name === clan);
                                        if (clanrole) clanrole.setName(newname, "Changed clan name").catch(console.error);
                                        const channel = message.guild.channels.cache.find(c => c.name === clan);
                                        if (channel) {
                                            channel.setName(newname, "Clan leader bought clan rename").catch(console.error);
                                            channel.setTopic(`Clan chat for ${newname} clan.`, "Clan leader bought clan rename").catch(console.error);
                                        }
                                        updateVal = {
                                            $set: {
                                                clan: newname
                                            }
                                        };
                                        binddb.updateMany({clan: clan}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
                                        });
                                        updateVal = {
                                            $set: {
                                                name: newname,
                                                namecooldown: curtime + 86400 * 3
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully changed your clan name to \`${newname}\`. You now have ${coin}\`${(alicecoins - 2500).toLocaleString()}\` Alice coins.**`);
                                        });
                                        updateVal = {
                                            $set: {
                                                auctioneer: newname
                                            }
                                        };
                                        auctiondb.updateMany({auctioneer: clan}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**")
                                            }
                                        });
                                        updateVal = {
                                            $inc: {
                                                alicecoins: -2500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving res;ponse from database now. Please try again!**")
                                            }
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
                    });
                    break;
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
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        const c_role = message.guild.roles.cache.find((r) => r.name === clan);
                        if (c_role) {
                            return message.channel.send("❎ **| I'm sorry, your clan already has a clan role!**");
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A custom role costs ${coin}\`5,000\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < 5000) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A custom role costs ${coin}\`5,000\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!clanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                }
                                if (message.author.id !== clanres.leader) {
                                    return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                }
                                if (clanres.power < 2000) {
                                    return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 2000!**");
                                }
                                const memberlist = clanres.member_list;
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a custom clan role for ${coin}\`5,000\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        const clanrole = message.guild.roles.cache.find((r) => r.name === 'Clans');
                                        message.guild.roles.create({data: {
                                            name: clan,
                                            color: "DEFAULT",
                                            permissions: [],
                                            position: clanrole.position
                                        }, reason: "Clan leader bought clan role"}).then(role => {
                                            memberlist.forEach(async (member) => {
                                                const guildMember = await message.guild.members.fetch(member.id).catch(console.error);
                                                if (guildMember) {
                                                    guildMember.roles.add([clanrole, role], "Clan leader bought clan role").catch(console.error);
                                                }
                                            });
                                        }).catch(console.error);
                                        updateVal = {
                                            $inc: {
                                                alicecoins: -5000
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully bought clan role for your clan. You now have ${coin}\`${(alicecoins - 5000).toLocaleString()}\` Alice coins.**`);
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
                    });
                    break;
                }

                case "color": {
                    // changes clan role color if one is available
                    // ===========================================
                    // does not affect embed message colors, only
                    // affects clan role color and only supports
                    // integer color format
                    const color = args[2];
                    if (!(/^#[0-9A-F]{6}$/i.test(color))) {
                        return message.channel.send("❎ **| I'm sorry, that does not look like a valid hex color!**");
                    }
                    // restrict reserved role color for admin/mod/helper/ref
                    if (["#3498DB", "#9543BA", "#FFD78C", "#4C6876"].includes(color)) {
                        return message.channel.send("❎ **| I'm sorry, you cannot change your role color into the same role color as referees and staff members!**");
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
                        const clan = userres.clan;
                        if (!userres.clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        const clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                        if (!clanrole) {
                            return message.channel.send("❎ **| I'm sorry, your clan doesn't have a custom clan role!**");
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to change your clan's custom role color! A role color change costs ${coin}\`500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < 500) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a custom role for your clan! A role color change costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!clanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                }
                                if (message.author.id !== clanres.leader) {
                                    return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                }
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a clan role color change for ${coin}\`500\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        clanrole.setColor(color, "Clan leader changed role color").catch(console.error);
                                        updateVal = {
                                            $inc: {
                                                alicecoins: -500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| Successfully changed clan role color. You now have ${coin}\`${(alicecoins - 500).toLocaleString()}\` Alice coins.**`);
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
                    });
                    break;
                }

                case "powerup": {
                    // buy powerups with Alice coins
                    // =============================
                    // lootbox (gacha) style
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a powerup! A powerup costs ${coin}\`100\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < 100) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to buy a powerup! A powerup costs ${coin}\`100\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!clanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                }
                                const powerups = clanres.powerups;
                                message.channel.send(`❗**| ${message.author}, are you sure you want to buy a powerup for ${coin}\`100\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        const gachanum = Math.random() * 100;
                                        let powerup = "";
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
                                                $inc: {
                                                    alicecoins: -100
                                                }
                                            };
                                            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                if (err) {
                                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                                }
                                            });
                                            return
                                        }
                                        const powerup_index = powerups.findIndex(pow => pow.name === powerup);
                                        ++powerups[powerup_index].amount;
                                        const powercount = powerups[powerup_index].amount;
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
                                            $inc: {
                                                alicecoins: -100
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
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
                    });
                    break;
                }

                case "leader": {
                    // changes the leader of a clan
                    // ============================
                    // only works for clan leaders
                    const totransfer = await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error);
                    if (!totransfer) {
                        return message.channel.send("❎ **| Hey, please enter a valid user to transfer the clan leadership to!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to transfer clan leadership! A clan leadership transfer costs ${coin}\`500\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < 500) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to transfer clan leadership! A clan leadership transfer costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!clanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                }
                                if (message.author.id !== clanres.leader) {
                                    return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                }
                                if (message.author.id === totransfer.id) {
                                    return message.channel.send("❎ **| You cannot transfer clan leadership to yourself!**");
                                }
                                const memberlist = clanres.member_list;
                                if (memberlist.length === 1) {
                                    return message.channel.send("❎ **| I'm sorry, looks like you are alone in your clan! Who would you transfer leadership to?**");
                                }
                                if (clanres.power < 300) {
                                    return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 300!**");
                                }

                                const member_index = memberlist.findIndex(member => member.id === totransfer.id);
                                if (member_index === -1) {
                                    return message.channel.send("❎ **| I'm sorry, this user is not in your clan!");
                                }

                                message.channel.send(`❗**| ${message.author}, are you sure you want to transfer clan leadership to ${totransfer} for ${coin}\`500\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();

                                        memberlist[member_index].hasPermission = true;
                                        updateVal = {
                                            $set: {
                                                leader: totransfer.id,
                                                member_list: memberlist
                                            }
                                        };
                                        clandb.updateOne(query, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully transfered clan leadership to ${totransfer}. You now have ${coin}\`${(alicecoins - 500).toLocaleString()}\` Alice coins.**`);
                                        });
                                        updateVal = {
                                            $inc: {
                                                alicecoins: -500
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                            }
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
                    });
                    break;
                }

                case "channel": {
                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        if (message.guild.channels.cache.find(c => c.name === clan)) {
                            return message.channel.send("❎ **| I'm sorry, your clan already has a clan channel!**")
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan channel! A clan channel costs ${coin}\`50,000\` Alice coins. You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < 50000) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to create a clan channel! A clan channel costs ${coin}\`50,000\` Alice coins. You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }
                            query = {name: clan};
                            clandb.findOne(query, (err, clanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!clanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                                }
                                if (message.author.id !== clanres.leader) {
                                    return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                                }
                                if (clanres.power < 5000) {
                                    return message.channel.send("❎ **| I'm sorry, your clan doesn't have enough power points! You need at least 5000!**");
                                }
                                const clanrole = message.guild.roles.cache.find((r) => r.name === clan);
                                if (!clanrole) {
                                    return message.channel.send("❎ **| I'm sorry, your clan must have a clan role to create a clan channel!**");
                                }
                                message.channel.send(`❗**| ${message.author}, are you sure you want to create a clan channel for ${coin}\`50,000\` Alice coins?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();

                                        const position = message.guild.channels.cache.get("696663321633357844").position;
                                        const options = {
                                            topic: `Clan chat for ${clan} clan.`,
                                            parent: "696646649128288346",
                                            permissionOverwrites: [
                                                {
                                                    id: clanrole,
                                                    allow: ["VIEW_CHANNEL"],
                                                    type: 'role'
                                                },
                                                {
                                                    id: "353397345636974593",
                                                    deny: ["VIEW_CHANNEL"],
                                                    type: 'role'
                                                },
                                                {
                                                    id: "369108742077284353",
                                                    allow: ["VIEW_CHANNEL"],
                                                    type: 'role'
                                                }
                                            ]
                                        };
                                        message.guild.channels.create(clan, options).then(c => c.setPosition(position));

                                        updateVal = {
                                            $inc: {
                                                alicecoins: -50000
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully created clan channel. You now have ${coin}\`${(alicecoins - 50000).toLocaleString()}\` Alice coins.**`);
                                        })
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
                    });
                    break;
                }

                case "special": {
                    message.channel.send("❎ **| I'm sorry, there is no ongoing special event now! Please check back soon!**");
                    break;
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `channel`, `color`, `leader`, `powerup`, `rename`, `role`, and `special`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 3000);
            break;
        }

        case "power": {
            // main hub for power points
            // ==========================================
            // gives power points if match commence, also
            // based on active powerups
            if ((message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'Referee')) && !perm) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

            switch (args[1]) {
                case "give": {
                    // adds power points to a clan
                    // =======================================
                    // this must be carefully watched as abuse
                    // can be easily done
                    const togive = await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error);
                    if (!togive) {
                        return message.channel.send("❎ **| Hey, please give me a valid user to give power points to!**");
                    }
                    const amount = parseInt(args[3]);
                    if (!amount) {
                        return message.channel.send("❎ **| Hey, I don't know how many points do I need to add!**");
                    }
                    if (isNaN(amount) || amount <= 0) {
                        return message.channel.send("❎ **| Invalid amount to add.**");
                    }
                    query = {discordid: togive.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }
                            updateVal = {
                                $inc: {
                                    power: amount
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully given \`${amount.toLocaleString()}\` power points to \`${clan}\` clan. The clan now has \`${newpower.toLocaleString()}\` power points.**`);
                            });
                        });
                    });
                    break;
                }

                case "take": {
                    // removes power points from a clan
                    // =========================================
                    // just like add cmd, this must be carefully
                    // watched as abuse can be easily done
                    const totake = await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error);
                    if (!totake) {
                        return message.channel.send("❎ **| Hey, please give me a valid user to take power points from!**");
                    }
                    const amount = parseInt(args[3]);
                    if (!amount) {
                        return message.channel.send("❎ **| Hey, I don't know how many points do I need to remove!**");
                    }
                    if (isNaN(amount) || amount <= 0) {
                        return message.channel.send("❎ **| Invalid amount to remove.**");
                    }
                    query = {discordid: totake.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }
                            if (clanres.power - amount < 0) {
                                return message.channel.send("❎ **| I'm sorry, this clan doesn't have as many power points as the amount you mentioned!**");
                            }
                            updateVal = {
                                $inc: {
                                    power: -amount
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully taken \`${amount.toLocaleString()}\` power points from \`${clan}\` clan. The clan now has \`${newpower.toLocaleString()}\` power points.**`);
                            });
                        });
                    });
                    break;
                }

                case "transfer": {
                    // transfers power points from one clan to another
                    // =======================================================
                    // main cmd to use during clan matches, will automatically
                    // convert total power points based on active powerups
                    if (args.length < 4) {
                        return message.channel.send("❎ **| Hey, I need more input!**");
                    }
                    const totake = await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error);
                    if (!totake) {
                        return message.channel.send("❎ **| Hey, please give me a valid user to take power points from!**");
                    }
                    const togive = await message.guild.members.fetch(message.mentions.users.last() || args[3]).catch(console.error);
                    if (totake.id === togive.id) {
                        return message.channel.send("❎ **| Hey, you cannot transfer power points to the same user!**");
                    }
                    const challengepass = args[4];
                    query = {discordid: totake.id};
                    binddb.findOne(query, (err, takeres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!takeres) {
                            return message.channel.send("❎ **| I'm sorry, the account to take power points from is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const takeclan = takeres.clan;
                        if (!takeclan) {
                            return message.channel.send("❎ **| I'm sorry, the user to take is not in a clan!**");
                        }
                        query = {discordid: togive.id};
                        binddb.findOne(query, (err, giveres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!giveres) {
                                return message.channel.send("❎ **| I'm sorry, the account to give power points to is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
                            }
                            const giveclan = giveres.clan;
                            if (!giveres.clan) {
                                return message.channel.send("❎ **| I'm sorry, the user to give is not in a clan!**");
                            }
                            if (takeclan === giveclan) {
                                return message.channel.send("❎ **| Hey, you cannot transfer power points to the same clan!**");
                            }
                            query = {name: takeclan};
                            clandb.findOne(query, (err, tclanres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                }
                                if (!tclanres) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find the clan to take power points from!**");
                                }
                                if (!tclanres.isMatch) {
                                    return message.channel.send("❎ **| I'm sorry, the clan to take power points from is not in match mode!**");
                                }
                                const t_power = tclanres.power;
                                const t_activepowerups = tclanres.active_powerups;
                                let givemultiplier = 0.1;
                                for (let i = 0; i < t_activepowerups.length; i++) {
                                    switch (t_activepowerups[i]) {
                                        case "megadebuff": {
                                            message.channel.send(`⬇️⬇️ **| \`${takeclan}\` has \`megadebuff\` powerup active!**`);
                                            givemultiplier /= 1.8;
                                            break;
                                        }
                                        case "megabomb": {
                                            message.channel.send(`⬇️ **| \`${takeclan}\` has \`megabomb\` powerup active${!challengepass?"":", but unfortunately their opponents have accomplished the task provided"}!**`);
                                            if (!challengepass) {
                                                givemultiplier /= 1.7;

                                            }
                                            break;
                                        }
                                        case "superdebuff": {
                                            message.channel.send(`⬇️⬇️ **| \`${takeclan}\` has \`superdebuff\` powerup active!**`);
                                            givemultiplier /= 1.5;
                                            break;
                                        }
                                        case "superbomb": {
                                            message.channel.send(`⬇️ **| \`${takeclan}\` has \`superbomb\` powerup active${!challengepass?"":", but unfortunately their opponents have accomplished the task provided"}!**`);
                                            if (!challengepass) {
                                                givemultiplier /= 1.3;
                                            }
                                            break;
                                        }
                                        case "debuff": {
                                            message.channel.send(`⬇️⬇️ **| \`${takeclan}\` has \`debuff\` powerup active!**`);
                                            givemultiplier /= 1.1;
                                            break;
                                        }
                                        case "bomb": {
                                            message.channel.send(`⬇️ **| \`${takeclan}\` has \`bomb\` powerup active${!challengepass?"":", but unfortunately their opponents have accomplished the task provided"}!**`);
                                            if (!challengepass) {
                                                givemultiplier /= 1.05;
                                            }
                                            break;
                                        }
                                    }
                                }
                                query = {name: giveclan};
                                clandb.findOne(query, (err, gclanres) => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                                    }
                                    if (!gclanres) {
                                        return message.channel.send("❎ **| I'm sorry, I cannot find the clan to give power points to!**");
                                    }
                                    if (!gclanres.isMatch) {
                                        return message.channel.send("❎ **| I'm sorry, the clan to give power points to is not in match mode!**");
                                    }
                                    const g_power = gclanres.power;
                                    const g_activepowerups = gclanres.active_powerups;
                                    for (let i = 0; i < g_activepowerups.length; i++) {
                                        switch (g_activepowerups[i]) {
                                            case "megabuff": {
                                                message.channel.send(`⬆️⬆️ **| \`${giveclan}\` has \`megabuff\` powerup active!**`);
                                                givemultiplier *= 2.0;
                                                break;
                                            }
                                            case "megachallenge": {
                                                message.channel.send(`⬆️ **| \`${giveclan}\` has \`megachallenge\` powerup active${challengepass?"":", but unfortunately they did not accomplish the task provided"}!**`);
                                                if (challengepass) {
                                                    givemultiplier *= 1.7;
                                                }
                                                break;
                                            }
                                            case "superbuff": {
                                                message.channel.send(`⬆️⬆️ **| \`${giveclan}\` has \`superbuff\` powerup active!**`);
                                                givemultiplier *= 1.6;
                                                break;
                                            }
                                            case "superchallenge": {
                                                message.channel.send(`⬆️ **| \`${giveclan}\` has \`superchallenge\` powerup active${challengepass?"":", but unfortunately they did not accomplish the task provided"}!**`);
                                                if (challengepass) {
                                                    givemultiplier *= 1.3;
                                                }
                                                break;
                                            }
                                            case "buff": {
                                                message.channel.send(`⬆️⬆️ **| \`${giveclan}\` has \`buff\` powerup active!**`);
                                                givemultiplier *= 1.2;
                                                break;
                                            }
                                            case "challenge": {
                                                message.channel.send(`⬆️ **| \`${giveclan}\` has \`challenge\` powerup active${challengepass?"":", but unfortunately they did not accomplish the task provided"}!**`);
                                                if (challengepass) {
                                                    givemultiplier *= 1.05;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                    const totalpower = Math.min(t_power, Math.floor(t_power * givemultiplier));
                                    message.channel.send(`❗**| ${message.author}, are you sure you want to transfer \`${totalpower.toLocaleString()}\` power points from \`${takeclan}\` clan to \`${giveclan}\` clan?**`).then(msg => {
                                        msg.react("✅").catch(console.error);
                                        let confirmation = false;
                                        const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
                                        confirm.on("collect", () => {
                                            confirmation = true;
                                            msg.delete();

                                            let t_memberlist = tclanres.member_list;
                                            let t_member_index = t_memberlist.findIndex(member => member.id === totake.id);
                                            t_memberlist[t_member_index].battle_cooldown = curtime + 86400 * 4;

                                            updateVal = {
                                                $set: {
                                                    isMatch: false,
                                                    active_powerups: [],
                                                    member_list: t_memberlist
                                                },
                                                $inc: {
                                                    power: -totalpower
                                                }
                                            };
                                            clandb.updateOne({name: takeclan}, updateVal, err => {
                                                if (err) {
                                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                                }
                                            });

                                            const g_memberlist = gclanres.member_list;
                                            const g_member_index = g_memberlist.findIndex(member => member.id === togive.id);
                                            g_memberlist[g_member_index].battle_cooldown = curtime + 86400 * 4;

                                            updateVal = {
                                                $set: {
                                                    isMatch: false,
                                                    active_powerups: [],
                                                    member_list: g_memberlist
                                                },
                                                $inc: {
                                                    power: totalpower
                                                }
                                            };
                                            clandb.updateOne({name: giveclan}, updateVal, err => {
                                                if (err) {
                                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database now. Please try again!**");
                                                }
                                                message.channel.send(`✅ **| ${message.author}, successfully transferred \`${totalpower.toLocaleString()}\` power points from \`${takeclan}\` clan to \`${giveclan}\` clan.**`);
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
                        });
                    });
                    break;
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `give`, `take`, and `transfer`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 3000);
            break;
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
                    const tomatch = await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error);
                    if (!tomatch) {
                        return message.channel.send("❎ **| Hey, please give me a valid user!**");
                    }
                    query = {discordid: tomatch.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }
                            if (clanres.power === 0) {
                                return message.channel.send("❎ **| I'm sorry, the user's clan has 0 power points!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === tomatch.id);
                            if (memberlist[member_index].battle_cooldown > curtime) {
                                return message.channel.send("❎ **| I'm sorry, this clan member is currently in cooldown!**");
                            }

                            updateVal = {
                                $set: {
                                    isMatch: true
                                }
                            };
                            clandb.updateOne(query, updateVal, err => {
                                if (err) {
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                message.channel.send(`✅ **| ${message.author}, successfully set \`${clan}\` clan in match mode.**`);
                            });
                        });
                    });
                    break;
                }

                case "remove": {
                    // remove clan
                    const tomatch = await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error);
                    if (!tomatch) {
                        return message.channel.send("❎ **| Hey, please give me a valid user!**");
                    }
                    query = {discordid: tomatch.id};
                    binddb.findOne(query, (err, clanres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!clanres) {
                            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = clanres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        }
                        updateVal = {
                            $set: {
                                isMatch: false
                            }
                        };
                        clandb.updateOne({name: clan}, updateVal, err => {
                            if (err) {
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            message.channel.send(`✅ **| ${message.author}, successfully removed \`${clan}\` clan from match mode.**`);
                        });
                    });
                    break;
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `add` and `remove`.**");
            }
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 2500);
            break;
        }

        // holds cooldown information such as
        // battle cooldown and join cooldown
        case "cooldown": {
            switch (args[1]) {
                case "join": {
                    const user = args[2] ? await message.guild.members.fetch(message.mentions.users.first() || args[2]).catch(console.error) : message.author;
                    if (!user) {
                        return message.channel.send("❎ **| Hey, please mention a valid user!**");
                    }
                    query = {discordid: user.id};

                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        if (userres.clan) {
                            return message.channel.send("❎ **| I'm sorry, this user is in a clan!**");
                        }
                        const cooldown = Math.max(0, (userres.joincooldown || 0) - curtime);
                        if (!cooldown) {
                            message.channel.send("✅ **| The user is currently not in cooldown to join a clan.**");
                        } else {
                            const time = timeConvert(cooldown);
                            message.channel.send(`✅ **| ${args[2] ? "The user" : "You"} cannot join a clan for ${time}.**`);
                        }

                        if (userres.oldclan) {
                            const old_cooldown = Math.max(0, (userres.oldjoincooldown || 0) - curtime);
                            if (!old_cooldown) {
                                message.channel.send("✅ **| The user is currently not in cooldown to join the user's old clan.**");
                            } else {
                                const time = timeConvert(old_cooldown);
                                message.channel.send(`✅ **| ${args[2] ? "The user": "You"} cannot join ${args[2] ? "the user's" : "your"} old clan for ${time}.**`);
                            }
                        }
                    });
                    break;
                }

                case "battle": {
                    // views a user's cooldown in participating a clan battle
                    const user = args[2] ? await message.guild.members.fetch(message.mentions.users.first() || args[1]).catch(console.error) : message.author;
                    if (!user) {
                        return message.channel.send("❎ **| Hey, please mention a valid user!**");
                    }
                    query = {discordid: user.id};

                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (!userres) {
                            return message.channel.send("❎ **| I'm sorry, that account is not binded. The user needs to bind his/her account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
                        }
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, that user is not in a clan!**");
                        }
                        query = {name: clan};

                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === user.id);
                            const cooldown = Math.max(0, memberlist[member_index].battle_cooldown - curtime);

                            if (!cooldown) {
                                message.channel.send(`✅ **| ${args[2] ? `${user} is` : "You are"} currently not in cooldown from participating in a clan battle.**`);
                            } else {
                                const time = timeConvert(cooldown);
                                message.channel.send(`✅ **| ${args[2] ? user : "You"} cannot participate in a clan battle for ${time}.**`);
                            }
                        });
                    });
                    break;
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `battle` and `join`.**");
            }
            break;
        }

        case "auction": {
            // auctions
            // =====================================
            // as of now only powerups are available
            // for auction
            switch (args[1]) {
                case "bid": {
                    const name = args[2];
                    if (!name) {
                        return message.channel.send("❎ **| Hey, please enter a name of the auction!**");
                    }
                    if (name.length > 20) {
                        return message.channel.send("❎ **| I'm sorry, an auction's name does not exceed 20 characters!**");
                    }

                    const amount = parseInt(args[3]);
                    if (isNaN(amount) || amount <= 0) {
                        return message.channel.send("❎ **| Hey, please enter a valid coin amount to bid!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        pointdb.findOne(query, (err, pointres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!pointres) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have that many ${coin}Alice coins to bid! You currently have ${coin}\`0\` Alice coins.**`);
                            }
                            const alicecoins = pointres.alicecoins;
                            if (alicecoins < amount) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have that many ${coin}Alice coins to bid! You currently have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.**`);
                            }

                            query = {name: name};
                            auctiondb.findOne(query, (err, auctionres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!auctionres) {
                                    return message.channel.send("❎ **| I'm sorry, that auction does not exist!**");
                                }
                                if (auctionres.auctioneer === clan) {
                                    return message.channel.send("❎ **| Hey, you cannot bid on your clan's auction!**");
                                }
                                if (auctionres.expirydate <= curtime) {
                                    return message.channel.send("❎ **| I'm sorry, this auction is over!**");
                                }

                                const bids = auctionres.bids;
                                let bid_index = bids.findIndex(bid => bid.clan === clan);
                                if (bid_index !== -1) {
                                    bids[bid_index].amount += amount;
                                } else {
                                    bids.push({
                                        clan: clan,
                                        amount: amount
                                    });
                                }
                                bids.sort((a, b) => {
                                    return b.amount - a.amount;
                                });
                                bid_index = bids.findIndex(bid => bid.clan === clan);
                                const cur_amount = bids[bid_index].amount;

                                message.channel.send(`❗**| ${message.author}, are you sure you want to create the auction?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

                                    confirm.on("collect", () => {
                                        msg.delete().catch(console.error);
                                        confirmation = true;

                                        updateVal = {
                                            $set: {
                                                bids: bids
                                            }
                                        };
                                        auctiondb.updateOne(query, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                        });
                                        updateVal = {
                                            $inc: {
                                                alicecoins: -amount
                                            }
                                        };
                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully bidded ${coin}\`${amount.toLocaleString()}\`Alice coins to auction \`${name}\`. Your clan is currently #${bid_index + 1} with ${coin}\`${cur_amount.toLocaleString()}\` Alice coins bidded. You now have ${coin}\`${alicecoins.toLocaleString()}\` Alice coins.\n\nUse \`a!clan auction status ${name}\` to check the auction's status.**`);
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
                        });
                    });
                    break;
                }

                case "create": {
                    const name = args[2];
                    if (!name) {
                        return message.channel.send("❎ **| Hey, please enter a name for your auction!**");
                    }
                    if (name.length > 20) {
                        return message.channel.send("❎ **| I'm sorry, an auction's name must not exceed 20 characters!**");
                    }

                    const powerup = args[3]?.toLowerCase();
                    if (!powerup) {
                        return message.channel.send("❎ **| Hey, please enter a powerup!**");
                    }

                    const amount = parseInt(args[4]);
                    if (isNaN(amount) || amount <= 0) {
                        return message.channel.send("❎ **| Hey, please enter a valid powerup amount to auction!**");
                    }

                    const min_price = parseInt(args[5]);
                    if (isNaN(min_price) || min_price < 0) {
                        return message.channel.send("❎ **| Hey, please enter a valid minimum price for other clans to bid!**");
                    }

                    const auction_duration = parseInt(args[6]);
                    if (isNaN(auction_duration)) {
                        return message.channel.send("❎ **| Hey, please enter a valid auction duration!**");
                    }
                    if (auction_duration < 60 || auction_duration > 86400) {
                        return message.channel.send("❎ **| I'm sorry, auction duration can only range from 60 (1 minute) to 86400 (1 day) seconds!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!memberlist[member_index].hasPermission) {
                                return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");
                            }

                            const powerups = clanres.powerups;
                            const powerup_index = powerups.findIndex(pow => pow.name === powerup);
                            if (powerup_index === -1) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the powerup you are looking for!**");
                            }
                            if (powerups[powerup_index].amount < amount) {
                                return message.channel.send(`❎ **| I'm sorry, you don't have that many \`${powerup}\` powerups! Your clan has \`${powerups[powerup_index][1].toLocaleString()}\` of it.**`);
                            }

                            query = {name: name};
                            auctiondb.findOne(query, (err, auctionres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (auctionres) {
                                    return message.channel.send("❎ **| I'm sorry, an auction with that name exists! Please choose another name!**");
                                }
                                powerups[powerup_index].amount -= amount;

                                message.channel.send(`❗**| ${message.author}, are you sure you want to create the auction?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

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
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
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
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully created auction \`${name}\`.**`);

                                            embed.setTitle("Auction Information")
                                                .setDescription(`**Name**: ${name}\n**Auctioneer**: ${clan}\n**Created at**: ${new Date(curtime * 1000).toUTCString()}\n**Expires at**: ${new Date((curtime + auction_duration) * 1000).toUTCString()}`)
                                                .addField("**Auction Item**", `**Powerup**: ${capitalizeString(powerup)}\n**Amount**: ${amount.toLocaleString()}\n**Minimum bid amount**: ${coin}**${min_price.toLocaleString()}** Alice coins`);
                                            client.channels.cache.get("696646867567640586").send(`❗**| An auction has started with the following details:**`, {embed: embed});
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
                        });
                    });
                    break;
                }

                case "list": {
                    let page = 1;
                    if (parseInt(args[1]) > 1) {
                        page = parseInt(args[1]);
                    }
                    auctiondb.find({}).sort({min_price: -1}).toArray((err, auctionres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        if (auctionres.length === 0) {
                            return message.channel.send("❎ **| I'm sorry, there are no ongoing auctions as of now!**");
                        }
                        if (!auctionres[(page - 1)*5]) {
                            return message.channel.send(`❎ **| I'm sorry, there aren't that many auctions available!**`);
                        }
                        embed = editAuction(auctionres, coin, page, color, footer, index);
                        message.channel.send({embed: embed}).then(msg => {
                            msg.react("⏮️").then(() => {
                                msg.react("⬅️").then(() => {
                                    msg.react("➡️").then(() => {
                                        msg.react("⏭️").catch(console.error);
                                    });
                                });
                            });

                            const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 180000});
                            const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 180000});
                            const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 180000});
                            const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 180000});

                            backward.on('collect', () => {
                                if (page === 1) {
                                    return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                } else {
                                    page = Math.max(1, page - 10);
                                }
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, color, footer, index);
                                msg.edit({embed: embed}).catch(console.error);
                            });

                            back.on('collect', () => {
                                if (page === 1) {
                                    page = Math.ceil(auctionres.length / 5);
                                } else {
                                    --page;
                                }
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, color, footer, index);
                                msg.edit({embed: embed}).catch(console.error);
                            });

                            next.on('collect', () => {
                                if (page === Math.ceil(auctionres.length / 5)) {
                                    page = 1;
                                } else {
                                    ++page;
                                }
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, color, footer, index);
                                msg.edit({embed: embed}).catch(console.error);
                            });

                            forward.on('collect', () => {
                                if (page === Math.ceil(auctionres.length / 5)) {
                                    return msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                } else {
                                    page = Math.min(page + 10, Math.ceil(auctionres.length / 5));
                                }
                                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                embed = editAuction(auctionres, coin, page, color, footer, index);
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

                case "status": {
                    const name = args[2];
                    if (!name) {
                        return message.channel.send("❎ **| Hey, please enter a name of the auction!**");
                    }
                    if (name.length > 20) {
                        return message.channel.send("❎ **| I'm sorry, an auction's name does not exceed 20 characters!**");
                    }

                    query = {discordid: message.author.id};
                    binddb.findOne(query, (err, userres) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        const clan = userres?.clan || "";

                        query = {name: name};
                        auctiondb.findOne(query, (err, auctionres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!auctionres) {
                                return message.channel.send("❎ **| I'm sorry, that auction does not exist!**");
                            }
                            const bids = auctionres.bids;
                            const bid_index = bids.findIndex(bid => bid.clan === clan);

                            embed.setTitle("Auction Information")
                                .setDescription(`**Name**: ${name}\n**Auctioneer**: ${auctionres.auctioneer}\n**Created at**: ${new Date(auctionres.creationdate * 1000).toUTCString()}\n**Expires at**: ${new Date(auctionres.expirydate * 1000).toUTCString()}`)
                                .addField("**Auction Item**", `**Powerup**: ${capitalizeString(auctionres.powerup)}\n**Amount**: ${auctionres.amount.toLocaleString()}\n**Minimum bid amount**: ${coin}**${auctionres.min_price.toLocaleString()}** Alice coins`);

                            let top_string = '';
                            for (let i = 0; i < 5; i++) {
                                if (bids[i]) {
                                    top_string += `#${i+1}: ${bids[i].clan} - ${coin}**${bids[i].amount}** Alice coins\n`;
                                } else {
                                    top_string += `#${i+1}: -\n`;
                                }
                            }
                            if (bid_index > 4) {
                                top_string += `${'.\n'.repeat(Math.min(bid_index - 4, 3))}#${bid_index + 1}: ${clan} - ${coin}**${bids[bid_index].amount.toLocaleString()}** Alice coins`;
                            }
                            embed.addField("**Bid Information**", `**Bidders**: ${bids.length.toLocaleString()}\n**Top bidders**:\n${top_string}`);
                            message.channel.send({embed: embed});
                        });
                    });
                    break;
                }

                case "cancel": {
                    const name = args[2];
                    if (!name) {
                        return message.channel.send("❎ **| Hey, please enter a name of your auction!**");
                    }
                    if (name.length > 20) {
                        return message.channel.send("❎ **| I'm sorry, an auction's name does not exceed 20 characters!**");
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
                        const clan = userres.clan;
                        if (!clan) {
                            return message.channel.send("❎ **| I'm sorry, you are not in a clan!**");
                        }
                        query = {name: clan};
                        clandb.findOne(query, (err, clanres) => {
                            if (err) {
                                console.log(err);
                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                            }
                            if (!clanres) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
                            }

                            const memberlist = clanres.member_list;
                            const member_index = memberlist.findIndex(member => member.id === message.author.id);
                            if (!memberlist[member_index].hasPermission) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

                            query = {name: name};
                            auctiondb.findOne(query, (err, auctionres) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!auctionres) {
                                    return message.channel.send("❎ **| I'm sorry, that auction does not exist!**");
                                }
                                if (auctionres.auctioneer !== clan) {
                                    return message.channel.send("❎ **| I'm sorry, that auction does not belong to your clan!**");
                                }
                                if (auctionres.bids.length > 0) {
                                    return message.channel.send("❎ **| I'm sorry, a clan has bidded for this auction, therefore you cannot cancel it!**");
                                }

                                const powerup = auctionres.powerup;
                                const amount = auctionres.amount;
                                const powerups = clanres.powerups;
                                const powerup_index = powerups.findIndex(pow => pow.name === powerup);
                                powerups[powerup_index].amount += amount;

                                message.channel.send(`❗**| ${message.author}, are you sure you want to cancel the auction?**`).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

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
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                        });
                                        auctiondb.deleteOne(query, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully cancelled auction \`${name}\`.**`);
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
                        });
                    });
                    break;
                }
                default: return message.channel.send("❎ **| I'm sorry, looks like your second argument is invalid! Accepted arguments are `bid`, `create`, `list`, and `status`.**");
            }
            break;
        }
        default: return message.channel.send("❎ **| I'm sorry, looks like your first argument is invalid! Accepted arguments are `about`, `accept`, `announce`, `auction`, `banner`, `cooldown`, `create`, `demote`, `description`, `disband`, `lb`, `icon`, `info`, `kick`, `leave`, `match`, `members`, `power`, `powerup`, `promote`, and `shop`.**");
    }
};

module.exports.config = {
    name: "clan",
    description: "Main command for clans.",
    usage: "clan about",
    detail: "Usage outputs the clans wiki which contains every information about clans.",
    permission: "None | Clan Co-Leader | Clan Leader | Referee | Helper | Moderator"
};