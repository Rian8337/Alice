const osudroid = require('osu-droid');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { Client, Message, MessageEmbed } = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');
const canvas = createCanvas(500, 500);
const c = canvas.getContext('2d');
c.imageSmoothingQuality = "high";

async function drawImage(properties, template = false) {
    // background
    const backgroundImage = properties.pictureConfig.activeBackground?.id ?? "bg";
    const bg = await loadImage(`${process.cwd()}/img/${backgroundImage}.png`);
    c.drawImage(bg, 0, 0);

    // player avatar
    const badgeImages = await fs.promises.readdir(`${process.cwd()}/img/badges`);
    const badgeImageIndex = Math.floor(Math.random() * badgeImages.length);
    const avatar = await loadImage(`${process.cwd()}/img/badges/${badgeImages[badgeImageIndex]}`);
    c.drawImage(avatar, 9, 9, 150, 150);

    // area
    // user profile
    c.globalAlpha = 0.9;
    c.fillStyle = '#bbbbbb';
    c.fillRect(164, 9, 327, 185);

    // player flag
    c.globalAlpha = 1;
    const flag = properties.player.location !== "LL" ? await loadImage(`https://osu.ppy.sh/images/flags/${properties.player.location}.png`) : undefined;
    if (flag) {
        c.drawImage(flag, 440, 15, flag.width / 1.5, flag.height / 1.5);
    }

    // player rank
    c.globalAlpha = 0.9;
    c.fillStyle = '#cccccc';
    c.fillRect(9, 164, 150, 30);

    // description box
    c.globalAlpha = 0.85;
    const bgColor = properties.pictureConfig.bgColor ?? "rgb(0,139,255)";
    c.fillStyle = bgColor;
    c.fillRect(9, 197, 482, 294);

    // badges
    c.globalAlpha = 0.6;
    c.fillStyle = '#b9a29b';
    c.fillRect(15, 312, 470, 170);

    // level
    c.fillRect(77, 206, 405, 30);
    c.fillStyle = '#979797';
    c.fillRect(79, 208, 401, 26);

    const progress = (properties.level - Math.floor(properties.level)) * 401;
    c.globalAlpha = 1;
    c.fillStyle = '#e1c800';
    if (progress > 0) {
        c.fillRect(79, 208, progress, 26);
    }

    // alice coins
    c.drawImage(properties.coinImage, 15, 255, 50, 50);

    // text
    // player rank
    c.globalAlpha = 1;
    c.font = 'bold 24px Exo';
    switch (true) {
        case properties.player.rank === 1:
            c.fillStyle = '#0009cd';
            break;
        case properties.player.rank <= 10:
            c.fillStyle = '#e1b000';
            break;
        case properties.player.rank <= 100:
            c.fillStyle = 'rgba(180, 44, 44, 0.81)';
            break;
        case properties.player.rank <= 1000:
            c.fillStyle = '#008708';
            break;
        default: c.fillStyle = '#787878';
    }
    c.fillText(`#${properties.player.rank.toLocaleString()}`, 12, 187);

    // profile
    c.fillStyle = "#000000";
    c.font = 'bold 25px Exo';
    c.fillText(properties.player.username, 169, 45, 243);

    c.font = '18px Exo';
    c.fillText(`Total Score: ${properties.player.score.toLocaleString()}`, 169, 84);
    c.fillText(`Ranked Score: ${properties.score.toLocaleString()}`, 169, 104);
    c.fillText(`Accuracy: ${properties.player.accuracy}%`, 169, 124);
    c.fillText(`Play Count: ${properties.player.playCount.toLocaleString()}`, 169, 144);
    if (properties.res?.pptotal) {
        c.fillText(`Droid pp: ${properties.res.pptotal.toFixed(2)}pp`, 169, 164);
    }
    if (properties.res?.clan) {
        c.fillText(`Clan: ${properties.res.clan}`, 169, 184);
    }
    if (flag) {
        c.fillText(properties.player.location, 451, flag.height + 20);
    }

    // ranked level
    c.fillStyle = properties.pictureConfig.textColor ?? "#000000";
    c.fillText(((properties.level - Math.floor(properties.level)) * 100).toFixed(2) + "%", 245, 226);
    c.font = '19px Exo';
    c.fillText(`Lv${Math.floor(properties.level)}`, 15, 230);

    // alice coins
    c.fillText(`${properties.coins.toLocaleString()} Alice Coins | ${properties.points} Challenge Points`, 75, 285);

    // badges
    if (template) {
        // Box area: 470x170 pixels, 15 pixels offset from edge of canvas
        // line
        c.globalAlpha = 0.7;
        c.fillStyle = '#000000';
        c.beginPath();
        c.moveTo(15, 397);
        c.lineTo(485, 397);
        for (let i = 15 + 94; i < 15 + 94 * 6; i += 94) {
            c.moveTo(i, 312);
            c.lineTo(i, 482);
        }
        c.stroke();

        c.save();
        c.font = 'bold 12px Exo';
        c.textAlign = "center";
        c.textBaseline = "middle";
        for (let i = 0; i < 10; i++) {
            if (i / 5 < 1) {
                c.fillText((i+1).toString(), 54.5 + i * 94, 353.5);
            } else {
                c.fillText((i+1).toString(), 54.5 + (i - 5) * 94, 439.5);
            }
        }
        c.restore();
    } else {
        const badges = properties.pictureConfig.activeBadges ?? [];
        for (let i = 0; i < badges.length; i++) {
            if (!badges[i]) {
                continue;
            }
            const badge = await loadImage(`${process.cwd()}/img/badges/${badges[i].id}.png`);
            if (i / 5 < 1) {
                c.drawImage(badge, i * 94 + 19.5, 312, 85, 85);
            } else {
                c.drawImage(badge, (i - 5) * 94 + 19.5, 397, 85, 85);
            }
        }
    }

    return canvas.toBuffer();
}

/**
 * @param {MessageEmbed} embed 
 * @param {{id: string, name: string, description: string, isOwned: boolean}[]} badgeList 
 * @param {number} page 
 * @param {string} footerImage 
 */
function listBadge(embed, badgeList, page, footerImage) {
    embed.spliceFields(0, embed.fields.length)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(badgeList.length / 5)}`, footerImage);

    for (let i = 5 * (page - 1); i < Math.min(badgeList.length, 5 + 5 * (page - 1)); ++i) {
        embed.addField(`${i+1}. ${badgeList[i].name} (\`${badgeList[i].id}\`${badgeList[i].isOwned ? ", owned" : ""})`, `Rewarded for ${badgeList[i].description}`);
    }
}

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, args, maindb, alicedb) => {
    const bindDb = maindb.collection("userbind");
    const scoreDb = alicedb.collection("playerscore");
    const pointDb = alicedb.collection("playerpoints");
    const badgeDb = alicedb.collection("profilebadges");
    const coin = client.emojis.cache.get("669532330980802561");
    const coinImage = await loadImage(coin.url);
    let insertVal;
    let updateVal;

    bindDb.findOne({discordid: message.author.id}, async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        }
        const uid = res.uid;
        const username = res.username;
        const pp = res.pptotal;
        const player = await osudroid.Player.getInformation({uid});
        if (player.error) {
            return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
        }
        if (!player.username) {
            return message.channel.send("❎ **| I'm sorry, I couldn't find your profile!**");
        }
        scoreDb.findOne({uid}, (err, playerres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            const level = playerres?.level ?? 1;
            const score = playerres?.score ?? 0;
            pointDb.findOne({discordid: message.author.id}, async (err, pointres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                let coins = pointres?.alicecoins ?? 0;
                const points = pointres?.points ?? 0;
                const pictureConfig = pointres?.picture_config ?? {};

                switch (args[0]) {
                    case "background": {

                        const backgroundList = await alicedb.collection("profilebackgrounds").find({}, {projection: {_id: 0, id: 1, name: 1}}).toArray();
                        switch (args[1]) {
                            case "change": {
                                const type = args.slice(2)?.join(" ");
                                if (!type) {
                                    return message.channel.send("❎ **| Hey, please enter a background name!**");
                                }
                                
                                const id = backgroundList.find(v => v.name === type)?.id;
                                if (!id) {
                                    return message.channel.send(`❎ **| I'm sorry, the background you have mentioned (${type}) is invalid!**`);
                                }

                                const ownedList = pictureConfig.backgrounds ?? [];
                                const owned = !!ownedList.find(v => v.id === id) || id === "bg";
                                let confirm_string = '❗**| ';
                                if (owned) {
                                    confirm_string += `${message.author}, are you sure you want to change your background profile picture?**`;
                                } else {
                                    if (coins < 500) {
                                        return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to perform this action! A background costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${coins}\` Alice coins.**`);
                                    }
                                    confirm_string += `${message.author}, you don't have this background yet! Are you sure you want to purchase this background for ${coin}\`500\` Alice coins and change your background profile picture to the background?**`;
                                }
                                if (!pictureConfig.activeBackground) {
                                    pictureConfig.activeBackground = {};
                                }
                                pictureConfig.activeBackground.id = id;
                                const properties = {
                                    res,
                                    player,
                                    coinImage,
                                    level,
                                    pp,
                                    points,
                                    score,
                                    coins,
                                    pictureConfig
                                };
                                const attachment = await drawImage(properties);
                                message.channel.send(confirm_string, {files: [attachment]}).then(msg => {
                                    msg.react("✅").catch(console.error);
                                    let confirmation = false;
                                    const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

                                    confirm.on("collect", () => {
                                        confirmation = true;
                                        msg.delete();
                                        if (!owned) {
                                            coins -= 500;
                                            ownedList.push({id: id, name: type});
                                        }
                                        updateVal = {
                                            $set: {
                                                alicecoins: coins,
                                                picture_config: {
                                                    badges: pictureConfig.badges ?? [],
                                                    activeBadges: pictureConfig.activeBadges ?? [],
                                                    activeBackground: {
                                                        id: id,
                                                        name: type
                                                    },
                                                    backgrounds: ownedList,
                                                    bgColor: pictureConfig.bgColor ?? "#008bff",
                                                    textColor: pictureConfig.textColor ?? "#000000"
                                                }
                                            }
                                        };
                                        pointDb.updateOne({discordid: message.author.id}, updateVal, err => {
                                            if (err) {
                                                console.log(err);
                                                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                            }
                                            message.channel.send(`✅ **| ${message.author}, successfully set your background profile picture to \`${type}\`.${!owned ? ` You have ${coin}\`${coins}\` Alice coins.` : ""}**`);
                                        });
                                    });
                                    confirm.on("end", () => {
                                        if (!confirmation) {
                                            msg.delete();
                                            message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                                        }
                                    });
                                });
                                break;
                            }
                            case "list": {
                                let background_list = '';
                                let owned_list = `\`${backgroundList[0].name}\`, `;
                                for (let i = 0; i < backgroundList.length; i++) {
                                    background_list += `\`${backgroundList[i].name}\``;
                                    if (i + 1 < backgroundList.length) {
                                        background_list += ', ';
                                    }
                                }
                                background_list = background_list.trimEnd();
                                const owned = pictureConfig.backgrounds;
                                if (!owned || owned.length === 0) {
                                    return message.channel.send(`✅ **| There are ${backgroundList.length} available backgrounds: ${background_list}. You own 1 background: \`${backgroundList[0].name}\`**`);
                                }
                                for (let i = 0; i < owned.length; i++) {
                                    owned_list += `\`${owned[i].name}\``;
                                    if (i + 1 < owned.length) {
                                        owned_list += ', ';
                                    }
                                }

                                message.channel.send(`✅ **| There are ${backgroundList.length} available backgrounds: ${background_list}. You own ${owned.length + 1} backgrounds: ${owned_list}.**`);
                                break;
                            }
                            default: return message.channel.send(`❎ **| I'm sorry, looks like your second argument (${args[1]}) is invalid! Accepted arguments are \`change\` and \`list\`.**`);
                        }
                        break;
                    }
                    case "badges": {
                        switch (args[1]) {
                            case "template": {
                                const properties = {
                                    res,
                                    player,
                                    score,
                                    coinImage,
                                    level,
                                    pp,
                                    points,
                                    coins,
                                    pictureConfig
                                };
                                const attachment = await drawImage(properties, true);
                                message.channel.send("", {files: [attachment]});
                                break;
                            }
                            case "claim": {
                                const badgeID = args[2];
                                if (!badgeID) {
                                    return message.channel.send("❎ **| Hey, please enter a badge ID!**");
                                }

                                const ownedBadges = pictureConfig.badges ?? [];
                                if (ownedBadges.find(v => v.id.toLowerCase() === badgeID.toLowerCase())) {
                                    return message.channel.send("❎ **| I'm sorry, you have already owned the badge!**");
                                }

                                const badge = await badgeDb.findOne({id: new RegExp(badgeID, "i")});
                                if (!badge) {
                                    return message.channel.send("❎ **| I'm sorry, I cannot find a badge with that ID!**");
                                }

                                let isValid = false;
                                switch (badge.type) {
                                    case "dpp": {
                                        isValid = pp >= badge.requirement;
                                        break;
                                    }
                                    case "score_total": {
                                        isValid = player.score >= badge.requirement;
                                        break;
                                    }
                                    case "score_ranked": {
                                        isValid = score >= badge.requirement;
                                        break;
                                    }
                                    case "star_fc": {
                                        const beatmap = args[3];
                                        if (!beatmap) {
                                            return message.channel.send("❎ **| Hey, please enter the beatmap where you have achieved the full combo!**");
                                        }

                                        const a = beatmap.split("/");
                                        const beatmapID = parseInt(a[a.length - 1]);
                                        if (isNaN(beatmapID)) {
                                            return message.channel.send("❎ **| Hey, please enter a valid beatmap ID or link!**");
                                        }

                                        const mapinfo = await osudroid.MapInfo.getInformation({beatmapID});
                                        if (mapinfo.error) {
                                            return message.channel.send("❎ **| I'm sorry, I cannot fetch beatmap info from osu! API! Perhaps it is down?**");
                                        }
                                        if (!mapinfo.title) {
                                            return message.channel.send("❎ **| I'm sorry, I cannot find the map that you are looking for!**");
                                        }
                                        if (!mapinfo.objects) {
                                            return message.channel.send("❎ **| I'm sorry, it seems like the map has 0 objects!**");
                                        }
                                        if (mapinfo.approved !== osudroid.rankedStatus.RANKED && mapinfo.approved !== osudroid.rankedStatus.APPROVED) {
                                            return message.channel.send("❎ **| I'm sorry, only ranked or approved beatmaps count!**");
                                        }

                                        const score = await osudroid.Score.getFromHash({uid, hash: mapinfo.hash});
                                        if (score.error) {
                                            return message.channel.send("❎ **| I'm sorry, I couldn't check the beatmap's scores! Perhaps osu!droid server is down?**");
                                        }
                                        if (!score.title) {
                                            return message.channel.send("❎ **| I'm sorry, you don't have a score in the beatmap!**");
                                        }
                                        const stars = new osudroid.MapStars().calculate({file: mapinfo.osuFile, mods: score.mods});
                                        isValid = stars.pcStars.total >= badge.requirement;
                                        break;
                                    }
                                    case "unclaimable": {
                                        return message.channel.send("❎ **| I'm sorry, this badge cannot be claimed!**");
                                    }
                                }

                                if (!isValid) {
                                    return message.channel.send("❎ **| I'm sorry, you do not fulfill the requirement to get the badge!**");
                                }

                                ownedBadges.push({
                                    id: badge.id,
                                    name: badge.name
                                });

                                if (pointres) {
                                    updateVal = {
                                        $set: {
                                            picture_config: {
                                                badges: ownedBadges,
                                                activeBadges: pictureConfig.activeBadges ?? [],
                                                activeBackground: pictureConfig.activeBackground ?? {id: "bg", name: "Default"},
                                                backgrounds: pictureConfig.backgrounds ?? [],
                                                bgColor: pictureConfig.bgColor ?? "#008bff",
                                                textColor: pictureConfig.textColor ?? "#000000"
                                            }
                                        }
                                    };
                                    pointDb.updateOne({discordid: message.author.id}, updateVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully claimed badge \`${badge.id}\`.**`);
                                    });
                                } else {
                                    insertVal = {
                                        discordid: message.author.id,
                                        uid: uid,
                                        username: username,
                                        challenges: [],
                                        points: 0,
                                        dailycooldown: 0,
                                        alicecoins: 0,
                                        streak: 0,
                                        picture_config: {
                                            badges: ownedBadges,
                                            activeBadges: [],
                                            activeBackground: {
                                                id: "bg",
                                                name: "Default"
                                            },
                                            backgrounds: [],
                                            bgColor: "#008bff",
                                            textColor: "#000000"
                                        }
                                    };
                                    pointDb.insertOne(insertVal, err => {
                                        if (err) {
                                            console.log(err);
                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                        }
                                        message.channel.send(`✅ **| ${message.author}, successfully claimed badge \`${badge.id}\`.**`);
                                    });
                                }
                                break;
                            }
                            case "equip": {
                                const ownedBadges = pictureConfig.badges ?? [];
                                if (ownedBadges.length === 0) {
                                    return message.channel.send("❎ **| I'm sorry, you don't own any badges!**");
                                }

                                const badgeID = args[2]?.toLowerCase();
                                if (!badgeID) {
                                    return message.channel.send("❎ **| Hey, please enter a badge ID!**");
                                }

                                const badge = ownedBadges.find(v => v.id.toLowerCase() === badgeID);
                                if (!badge) {
                                    return message.channel.send("❎ **| I'm sorry, you don't own the badge with that ID!**");
                                }

                                const badgeIndex = parseInt(args[3]);
                                if (isNaN(badgeIndex)) {
                                    return message.channel.send("❎ **| Hey, please enter a valid badge slot!**");
                                }
                                if (badgeIndex < 1 || badgeIndex > 10) {
                                    return message.channel.send("❎ **| I'm sorry, valid badge index is from 1 to 10!**");
                                }

                                const activeBadges = pictureConfig.activeBadges ?? [];
                                activeBadges.length = 10;
                                activeBadges[badgeIndex - 1] = badge;

                                // No need to check if entry in database exists or not since
                                // they need to claim first anyway
                                updateVal = {
                                    $set: {
                                        picture_config: {
                                            badges: ownedBadges,
                                            activeBadges: activeBadges,
                                            activeBackground: pictureConfig.activeBackground ?? {id: "bg", name: "Default"},
                                            backgrounds: pictureConfig.backgrounds ?? [],
                                            bgColor: pictureConfig.bgColor ?? "#008bff",
                                            textColor: pictureConfig.textColor ?? "#000000"
                                        }
                                    }
                                };
                                pointDb.updateOne({discordid: message.author.id}, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| ${message.author}, successfully equip badge \`${badge.id}\` at slot ${badgeIndex}.**`);
                                });
                                break;
                            }
                            case "unequip": {
                                const ownedBadges = pictureConfig.badges ?? [];
                                if (ownedBadges.length === 0) {
                                    return message.channel.send("❎ **| I'm sorry, you don't own any badges!**");
                                }

                                const badgeIndex = parseInt(args[2]);
                                if (isNaN(badgeIndex)) {
                                    return message.channel.send("❎ **| Hey, please enter a valid badge slot!**");
                                }
                                if (badgeIndex < 1 || badgeIndex > 10) {
                                    return message.channel.send("❎ **| I'm sorry, valid badge index is from 1 to 10!**");
                                }

                                const activeBadges = pictureConfig.activeBadges ?? [];
                                activeBadges.length = 10;
                                activeBadges[badgeIndex - 1] = null;

                                // No need to check if entry in database exists or not since
                                // they need to claim first anyway
                                updateVal = {
                                    $set: {
                                        picture_config: {
                                            badges: ownedBadges,
                                            activeBadges: activeBadges,
                                            activeBackground: pictureConfig.activeBackground ?? {id: "bg", name: "Default"},
                                            backgrounds: pictureConfig.backgrounds ?? [],
                                            bgColor: pictureConfig.bgColor ?? "#008bff",
                                            textColor: pictureConfig.textColor ?? "#000000"
                                        }
                                    }
                                };
                                pointDb.updateOne({discordid: message.author.id}, updateVal, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| ${message.author}, successfully unequipped badge at slot ${badgeIndex}.**`);
                                });
                                break;
                            }
                            case "list": {
                                const badgeList = await badgeDb.find({}, {projection: {_id: 0, id: 1, name: 1, description: 1}}).sort({type: 1, name: 1}).toArray();
                                const ownedBadges = pictureConfig.badges ?? [];
                                badgeList.forEach(badge => {
                                    badge.isOwned = !!ownedBadges.find(v => v.id === badge.id);
                                });
                                badgeList.sort((a, b) => {return b.isOwned - a.isOwned;});

                                const maxPage = Math.ceil(badgeList.length / 5);
                                let page = Math.max(1, Math.min(parseInt(args[2]) || 1, maxPage));

                                const footer = config.avatar_list;
                                const index = Math.floor(Math.random() * footer.length);
                                const embed = new MessageEmbed()
                                    .setColor(message.member?.roles.color?.hexColor || "#000000")
                                    .setAuthor(`Badges for ${message.author.tag}`, message.author.avatarURL({dynamic: true}))
                                    .setDescription(`Total badges: **${badgeList.length.toLocaleString()}**\nEarned badges: **${badgeList.filter(v => v.isOwned).length.toLocaleString()}**\n\n**Credits to <@260736637116350465> for badge images!**`);
                                
                                listBadge(embed, badgeList, page, footer[index]);

                                message.channel.send(embed).then(msg => {
                                    if (page === maxPage) {
                                        return;
                                    }

                                    msg.react("⏮️").then(() => {
                                        msg.react("⬅️").then(() => {
                                            msg.react("➡️").then(() => {
                                                msg.react("⏭️").catch(console.error);
                                            });
                                        });
                                    });
                            
                                    const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 150000});
                                    const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 150000});
                                    const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 150000});
                                    const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 150000});
                            
                                    backward.on('collect', () => {
                                        if (message.channel.type === "text") {
                                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                        }
                                        if (page === 1) {
                                            return;
                                        }
                                        page = Math.max(1, page - 10);
                                        listBadge(embed, badgeList, page, footer[index]);
                                        msg.edit(embed).catch(console.error);
                                    });
                            
                                    back.on('collect', () => {
                                        if (message.channel.type === "text") {
                                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                                        }
                                        if (page !== 1) {
                                            page--;
                                        } else {
                                            page = maxPage;
                                        }
                                        listBadge(embed, badgeList, page, footer[index]);
                                        msg.edit(embed).catch(console.error);
                                    });
                            
                                    next.on('collect', () => {
                                        if (page === maxPage) {
                                            page = 1;
                                        } else {
                                            ++page;
                                        }
                                        listBadge(embed, badgeList, page, footer[index]);
                                        msg.edit(embed).catch(console.error);
                                        if (message.channel.type === "text") {
                                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
                                        }
                                    });
                            
                                    forward.on('collect', () => {
                                        page = Math.min(page + 10, maxPage);
                                        listBadge(embed, badgeList, page, footer[index]);
                                        msg.edit(embed).catch(console.error);
                                        if (message.channel.type === "text") {
                                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
                                        }
                                    });
                            
                                    backward.on("end", () => {
                                        if (message.channel.type === "text") {
                                            msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
                                        }
                                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                                    });
                                });
                                break;
                            }
                            default: return message.channel.send(`❎ **| I'm sorry, looks like your second argument (${args[1]}) is invalid! Accepted arguments are \`claim\`, \`equip\`, \`list\`, \`template\`, and \`unequip\`.**`);
                        }
                        break;
                    }
                    case "descriptionbox": {
                        switch (args[1]) {
                            case "bgcolor": {
                                switch (args[2]) {
                                    case "view": {
                                        const color = pictureConfig.bgColor ?? "#008BFF";
                                        // RGBA support
                                        if (color.includes(",")) {
                                            return message.channel.send(`✅ **| Your description box RGBA color is \`${color}\`.**`);
                                        }
                                        message.channel.send(`✅ **| Your description box color hex code is \`${color}\`.**`);
                                        break;
                                    }
                                    case "change": {
                                        let color = args[3] ?? "#008BFF";
                                        if (pictureConfig.bgColor === color) {
                                            return message.channel.send("❎ **| Hey, you cannot change your description box color to the same color!**");
                                        }
                                        // RGBA format
                                        if (color.includes(",")) {
                                            let color_entry = color.split(",");
                                            if (color_entry.length !== 4) {
                                                return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            }

                                            color_entry = color_entry.map((x) => parseFloat(x));

                                            if (color_entry.slice(0, 3).some(value => isNaN(value) || value < 0 || value > 255)) {
                                                return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            }

                                            if (color_entry[3] < 0 || color_entry[3] > 1) {
                                                return message.channel.send("❎ **| I'm sorry, that RGBA color format is invalid!**");
                                            }

                                            color = `rgba(${color_entry.join(",")})`;
                                        } else if (!(/^#[0-9A-F]{6}$/i.test(color))) {
                                            return message.channel.send("❎ **| I'm sorry, this hex code is invalid!**");
                                        }
                                        pictureConfig.bgColor = color;
                                        const properties = {
                                            res: res,
                                            player: player,
                                            score: score,
                                            coinImage: coinImage,
                                            level: level,
                                            pp: pp,
                                            points: points,
                                            coins: coins,
                                            pictureConfig: pictureConfig
                                        };
                                        const attachment = await drawImage(properties);
                                        message.channel.send(`❗**| ${message.author}, are you sure you want to change your profile picture description box color to \`${color}\`?**`, {files: [attachment]}).then(msg => {
                                            msg.react("✅").catch(console.error);
                                            let confirmation = false;
                                            const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

                                            confirm.on("collect", () => {
                                                confirmation = true;
                                                msg.delete();
                                                if (pointres) {
                                                    updateVal = {
                                                        $set: {
                                                            picture_config: {
                                                                badges: pictureConfig.badges ?? [],
                                                                activeBadges: pictureConfig.activeBadges ?? [],
                                                                activeBackground: pictureConfig.activeBackground ?? {id: "bg", name: "Default"},
                                                                backgrounds: pictureConfig.backgrounds ?? [],
                                                                bgColor: color,
                                                                textColor: pictureConfig.textColor ?? "#000000"
                                                            }
                                                        }
                                                    };
                                                    pointDb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                        if (err) {
                                                            console.log(err);
                                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                                        }
                                                        message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`);
                                                    });
                                                } else {
                                                    insertVal = {
                                                        discordid: message.author.id,
                                                        uid: uid,
                                                        username: username,
                                                        challenges: [],
                                                        points: 0,
                                                        dailycooldown: 0,
                                                        alicecoins: 0,
                                                        streak: 0,
                                                        picture_config: {
                                                            badges: [],
                                                            activeBadges: [],
                                                            activeBackground: {
                                                                id: "bg",
                                                                name: "Default"
                                                            },
                                                            backgrounds: [],
                                                            bgColor: color,
                                                            textColor: "#000000"
                                                        }
                                                    };
                                                    pointDb.insertOne(insertVal, err => {
                                                        if (err) {
                                                            console.log(err);
                                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                                        }
                                                        message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`);
                                                    });
                                                }
                                            });
                                            confirm.on("end", () => {
                                                if (!confirmation) {
                                                    msg.delete();
                                                    message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                                                }
                                            });
                                        });
                                        break;
                                    }
                                    default: return message.channel.send(`❎ **| I'm sorry, looks like your third argument (${args[2]}) is invalid! Accepted arguments are \`change\` and \`view\`.**`);
                                }
                                break;
                            }
                            case "textcolor": {
                                switch (args[2]) {
                                    case "view": {
                                        const color = pictureConfig.textColor ?? '#000000';
                                        if (color.includes(",")) {
                                            return message.channel.send(`✅ **| Your description box text RGBA color is \`${color}\`.**`);
                                        }
                                        message.channel.send(`✅ **| Your description box text color hex code is \`${color}\`.**`);
                                        break;
                                    }
                                    case "change": {
                                        let color = args[3] ?? '#000000';
                                        if (pictureConfig.bgColor === color) {
                                            return message.channel.send("❎ **| Hey, you cannot change your description box text color to the same color!**");
                                        }
                                        if (color.includes(",")) {
                                            let color_entry = color.split(",");
                                            if (color_entry.length !== 4) {
                                                return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            }

                                            color_entry = color_entry.map((x) => parseFloat(x));

                                            if (color_entry.slice(0, 3).some(value => isNaN(value) || value < 0 || value > 255)) {
                                                return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            }
                                            
                                            if (color_entry[3] < 0 || color_entry[3] > 1) {
                                                return message.channel.send("❎ **| I'm sorry, that RGBA color format is invalid!**");
                                            }

                                            color = `rgba(${color_entry.join(",")})`;
                                        } else if (!(/^#[0-9A-F]{6}$/i.test(color))) {
                                            return message.channel.send("❎ **| I'm sorry, this hex code is invalid!**");
                                        }
                                        pictureConfig.textColor = color;
                                        const properties = {
                                            res: res,
                                            player: player,
                                            score: score,
                                            coinImage: coinImage,
                                            level: level,
                                            points: points,
                                            pp: pp,
                                            coins: coins,
                                            pictureConfig: pictureConfig
                                        };
                                        const attachment = await drawImage(properties);
                                        message.channel.send(`❗**| ${message.author}, are you sure you want to change your profile picture description box text color to \`${color}\`?**`, {files: [attachment]}).then(msg => {
                                            msg.react("✅").catch(console.error);
                                            let confirmation = false;
                                            const confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});

                                            confirm.on("collect", () => {
                                                confirmation = true;
                                                msg.delete();
                                                if (pointres) {
                                                    updateVal = {
                                                        $set: {
                                                            picture_config: {
                                                                badges: pictureConfig.badges ?? [],
                                                                activeBadges: pictureConfig.activeBadges ?? [],
                                                                activeBackground: pictureConfig.activeBackground ?? {id: "bg", name: "Default"},
                                                                backgrounds: pictureConfig.backgrounds ?? [],
                                                                bgColor: pictureConfig.bgColor ?? "#008bff",
                                                                textColor: color
                                                            }
                                                        }
                                                    };
                                                    pointDb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                        if (err) {
                                                            console.log(err);
                                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                                        }
                                                        message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`);
                                                    });
                                                } else {
                                                    insertVal = {
                                                        discordid: message.author.id,
                                                        uid: uid,
                                                        username: username,
                                                        challenges: [],
                                                        points: 0,
                                                        dailycooldown: 0,
                                                        alicecoins: 0,
                                                        streak: 0,
                                                        picture_config: {
                                                            badges: [],
                                                            activeBadges: [],
                                                            activeBackground: {
                                                                id: "bg",
                                                                name: "Default"
                                                            },
                                                            backgrounds: [],
                                                            bgColor: "#008bff",
                                                            textColor: color
                                                        }
                                                    };
                                                    pointDb.insertOne(insertVal, err => {
                                                        if (err) {
                                                            console.log(err);
                                                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                                        }
                                                        message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`);
                                                    });
                                                }
                                            });
                                            confirm.on("end", () => {
                                                if (!confirmation) {
                                                    msg.delete();
                                                    message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}));
                                                }
                                            });
                                        });
                                        break;
                                    }
                                    default: return message.channel.send(`❎ **| I'm sorry, looks like your third argument (${args[2]}) is invalid! Accepted arguments are \`change\` and \`view\`**`);
                                }
                                break;
                            }
                            default: return message.channel.send(`❎ **| I'm sorry, looks like your second argument (${args[1]}) is invalid! Accepted arguments are \`bgcolor\` and \`textcolor\`.**`);
                        }
                        break;
                    }
                    default: return message.channel.send(`❎ **| I'm sorry, looks like your first argument (${args[0]}) is invalid! Accepted arguments are \`background\`, \`badges\`, and \`descriptionbox\`.**`);
                }
            });
        });
    });
};

module.exports.config = {
    name: "profilepicture",
    aliases: "pfp",
    description: "Modify your profile picture.",
    usage: "profilepicture background change <bg name>\nprofilepicture background list\nprofilepicture badges equip <badge ID> <badge slot>\nprofilepicture badges list\nprofilepicture badges template\nprofilepicture badges unequip <badge slot>\nprofilepicture descriptionbox bgcolor change <color (hex/RGBA)>\nprofilepicture descriptionbox bgcolor view\nprofilepicture descriptionbox textcolor change <color (hex/RGBA)>\nprofilepicture descriptionbox textcolor view",
    detail: "`background change`: Change your profile picture background.\n`background list`: List all available backgrounds and those you currently have\n`badges change`: Change your badge on badge slot\n`badges list`: List all the badges you currently own\n`badges template`: Show the template number for each badge slot\n`descriptionbox change`: Change background color/text color of your profile picture description box. Supports hex code and RGBA\n`descriptionbox view`: Show your current description box background/text color",
    permission: "None"
};