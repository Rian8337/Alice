const Discord = require('discord.js');
const osudroid = require('../../modules/osu!droid');
const {createCanvas, loadImage} = require('canvas');
const canvas = createCanvas(300, 300);
const c = canvas.getContext('2d');

async function drawImage(properties, template = false) {
    // background
    let backgroundImage = properties.pictureConfig.activeBackground;
    if (!backgroundImage) backgroundImage = 'bg';
    else backgroundImage = backgroundImage.id;
    backgroundImage = `./img/${backgroundImage}.png`;
    const bg = await loadImage(backgroundImage);
    c.drawImage(bg, 0, 0);

    // player avatar
    const avatar = await loadImage(properties.player.avatarURL);
    c.drawImage(avatar, 9, 9, 70, 70);

    // area
    c.globalAlpha = 0.7;
    c.fillStyle = '#bbbbbb';
    c.fillRect(84, 9, 207, 95);

    c.globalAlpha = 0.9;
    c.fillStyle = '#cccccc';
    c.fillRect(9, 84, 70, 20);

    c.globalAlpha = 0.8;
    let bgColor = properties.pictureConfig.bgColor;
    if (!bgColor) bgColor = 'rgb(0,139,255)';
    c.fillStyle = bgColor;
    c.fillRect(9, 109, 282, 182);

    c.globalAlpha = 0.6;
    c.fillStyle = '#b9a29b';
    c.fillRect(15, 191, 270, 90);

    c.fillRect(50, 115, 195, 20);
    c.fillStyle = '#979797';
    c.fillRect(52, 117, 191, 16);

    let progress = (properties.level - Math.floor(properties.level)) * 191;
    c.globalAlpha = 0.9;
    c.fillStyle = '#e1c800';
    if (progress > 0) c.fillRect(52, 117, progress, 16);

    // line
    c.globalAlpha = 0.7;
    c.fillStyle = '#000000';
    c.beginPath();
    c.moveTo(15, 236);
    c.lineTo(285, 236);
    for (let i = 60; i < 285; i += 45) {
        c.moveTo(i, 191);
        c.lineTo(i, 281)
    }
    c.stroke();

    // player flag
    c.globalAlpha = 1;
    const flag = await loadImage(`https://osu.ppy.sh/images/flags/${properties.player.location}.png`);
    c.drawImage(flag, 253, 12, flag.width / 2, flag.height / 2);

    // text
    // player rank
    c.font = 'bold 14px Exo';
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
        default: c.fillStyle = '#787878'
    }
    c.fillText(`#${properties.player.rank.toLocaleString()}`, 12, 99);

    // profile
    c.fillStyle = '#000000';
    c.font = 'bold 15px Exo';
    c.fillText(properties.player.name, 89, 24, 243);

    c.font = '13px Exo';
    c.fillText(`Score: ${properties.player.score.toLocaleString()}`, 89, 39, 243);
    c.fillText(`Accuracy: ${properties.player.accuracy}%`, 89, 53, 243);
    c.fillText(`Play Count: ${properties.player.play_count.toLocaleString()}`, 89, 67, 243);
    c.fillText(properties.player.location, 265, flag.height + 5);
    if (properties.res) c.fillText(`Droid pp: ${properties.res.pptotal.toFixed(2)}pp`, 89, 81, 243);
    if (properties.res.clan) c.fillText(`Clan: ${properties.res.clan}`, 89, 95, 243);

    // ranked level
    let textColor = properties.pictureConfig.textColor;
    if (!textColor) textColor = "#000000";
    c.fillStyle = textColor;
    c.font = '13px Exo';
    c.fillText(`Lv${Math.floor(properties.level)}`, 15, 128.5);
    c.fillText(`Lv${properties.next_level}`, 255, 128.5);

    // alice coins
    c.globalAlpha = 1;
    c.drawImage(properties.coinImage, 15, 145, 30, 30);
    c.font = '12px Exo';
    c.fillText(`${properties.coins.toLocaleString()} Alice Coins`, 50, 165);

    // badges
    if (template) {
        c.font = 'bold 12px Exo';
        for (let i = 0; i < 12; i++) {
            if (i % 2 === 0) c.fillText((i+1).toString(), 37.5 + Math.floor(i / 2) * 45, 213.5 + Math.floor(i / 2) * 45);
            else c.fillText((i+1).toString(), 82.5 + Math.floor(i / 2) * 45, 258.5 + Math.floor(i / 2) * 45)
        }
    } else {
        let badges = properties.pictureConfig.activeBadges;
        if (!badges) badges = [];
        if (badges.length > 0) {
            for (let i = 0; i < badges.length; i++) {
                let badge = await loadImage(`./img/badges/${badges[i].id}.png`);
                if (i % 2 === 0) c.drawImage(badge, Math.floor(i / 2) * 45 + 15, 191, 45, 45);
                else c.drawImage(badge, Math.floor(i / 2) * 45 + 15, 236, 45, 45)
            }
        }
    }

    return new Discord.MessageAttachment(canvas.toBuffer())
}

module.exports.run = async (client, message, args, maindb, alicedb) => {
    let binddb = maindb.collection("userbind");
    let scoredb = alicedb.collection("playerscore");
    let pointdb = alicedb.collection("playerpoints");
    let coin = client.emojis.cache.get("669532330980802561");
    let coinImage = await loadImage(coin.url);
    let insertVal;
    let updateVal;
    let backgroundList = [
        {id: 'bg', name: "Default"},
        {id: 'sky', name: 'Clear Sky'},
        {id: "torch", name: "Torch"},
        {id: "village", name: "Village"},
        {id: "church", name: "Church"},
        {id: "ricefield", name: "Ricefield"},
        {id: "tree", name: "Tree"},
        {id: "lookout", name: "Morning Star Lookout"},
        {id: "iceroom", name: "Ice Room"}
    ];

    binddb.findOne({discordid: message.author.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res.uid;
        let username = res.username;
        let pp = res.pptotal;
        new osudroid.PlayerInfo().get({uid: uid}, player => {
            if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
            scoredb.findOne({discordid: message.author.id}, (err, playerres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                let level = 1;
                if (playerres) level = playerres.level;
                let next_level = Math.floor(level) + 1;
                pointdb.findOne({discordid: message.author.id}, async (err, pointres) => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("Error: Empty database response. Please try again!")
                    }
                    let coins = 0;
                    if (pointres) coins = pointres.alicecoins;
                    let pictureConfig = pointres.picture_config;
                    if (!pictureConfig) pictureConfig = {};

                    switch (args[0]) {
                        case "background": {
                            switch (args[1]) {
                                case "change": {
                                    let type = args.slice(2).join(" ");
                                    let id = '';
                                    for (let i = 0; i < backgroundList.length; i++) {
                                        let bg = backgroundList[i];
                                        if (bg.name !== type) continue;
                                        id = bg.id;
                                        break
                                    }
                                    if (!id) return message.channel.send("❎ **| I'm sorry, the background you have mentioned is invalid!**");
                                    let owned_list = pictureConfig.backgrounds;
                                    let owned = false;
                                    if (id === 'bg') owned = true;
                                    for (let i = 0; i < owned_list.length; i++) {
                                        if (owned_list[i].id !== id) continue;
                                        owned = true;
                                        break
                                    }
                                    let confirm_string = '❗**| ';
                                    if (owned) confirm_string += `${message.author}, are you sure you want to change your background profile picture?**`;
                                    else {
                                        if (coins < 500) return message.channel.send(`❎ **| I'm sorry, you don't have enough ${coin}Alice coins to perform this action! A background costs ${coin}\`500\` Alice coins. You currently have ${coin}\`${coins}\` Alice coins.**`);
                                        confirm_string += `${message.author}, you don't have this background yet! Are you sure you want to purchase this background and change your background profile picture to the background?**`;
                                    }
                                    pictureConfig.activeBackground.id = id;
                                    let properties = {
                                        res: res,
                                        player: player,
                                        coinImage: coinImage,
                                        level: level,
                                        next_level: next_level,
                                        pp: pp,
                                        coins: coins,
                                        pictureConfig: pictureConfig
                                    };
                                    let attachment = await drawImage(properties);
                                    message.channel.send(confirm_string, {files: [attachment]}).then(msg => {
                                        msg.react("✅").catch(console.error);
                                        let confirmation = false;
                                        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
                                        confirm.on("collect", () => {
                                            confirmation = true;
                                            msg.delete();
                                            if (!owned) {
                                                coins -= 500;
                                                owned_list.push({id: id, name: type})
                                            }
                                            updateVal = {
                                                $set: {
                                                    alicecoins: coins,
                                                    picture_config: {
                                                        activeBackground: {
                                                            id: id,
                                                            name: type
                                                        },
                                                        backgrounds: owned_list
                                                    }
                                                }
                                            };
                                            pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                if (err) {
                                                    console.log(err);
                                                    return message.channel.send("Error: Empty database response. Please try again!")
                                                }
                                                message.channel.send(`✅ **| ${message.author}, successfully set your background profile picture to \`${type}\`.${!owned ? ` You have ${coin}\`${coins}\` Alice coins.` : ""}**`)
                                            })
                                        });
                                        confirm.on("end", () => {
                                            if (!confirmation) {
                                                msg.delete();
                                                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                            }
                                        })
                                    });
                                    break
                                }
                                case "list": {
                                    let background_list = '';
                                    let owned_list = `\`${backgroundList[0].name}\`, `;
                                    for (let i = 0; i < backgroundList.length; i++) {
                                        background_list += `\`${backgroundList[i].name}\``;
                                        if (i + 1 < backgroundList.length) background_list += ', '
                                    }
                                    background_list = background_list.trimEnd();
                                    let owned = pictureConfig.backgrounds;
                                    if (owned.length === 0) return message.channel.send(`✅ **| There are ${backgroundList.length} available backgrounds: ${background_list}. You own 1 background: \`${backgroundList[0].name}\`**`);
                                    for (let i = 0; i < owned.length; i++) owned_list += `\`${owned[i].name}\` `;

                                    message.channel.send(`✅ **| There are ${backgroundList.length} available backgrounds: ${background_list}. You own ${owned.length} backgrounds: ${owned_list}.**`);
                                    break
                                }
                                default: return message.channel.send(`❎ **| I'm sorry, looks like your argument (${args[1]}) is invalid! Accepted arguments are \`change\` and \`list\`.**`)
                            }
                            break
                        }
                        case "badges": {
                            //TODO: add badges
                            switch (args[1]) {
                                case "template": {
                                    /*let properties = {
                                        res: res,
                                        player: player,
                                        coinImage: coinImage,
                                        level: level,
                                        next_level: next_level,
                                        pp: pp,
                                        coins: coins,
                                        pictureConfig: pictureConfig
                                    };
                                    let attachment = await drawImage(properties, true);
                                    message.channel.send(attachment);*/
                                    message.channel.send("❎ **| I'm sorry, badges will be coming soon!**");
                                    break
                                }
                                case "change": {
                                    message.channel.send("❎ **| I'm sorry, badges will be coming soon!**");
                                    break
                                }
                                default: return message.channel.send("❎ **| I'm sorry, badges will be coming soon!**")
                            }
                            break
                        }
                        case "descriptionbox": {
                            switch (args[1]) {
                                case "bgcolor": {
                                    switch (args[2]) {
                                        case "view": {
                                            let color = "#008BFF";
                                            if (pictureConfig.bgColor) color = pictureConfig.bgColor;
                                            message.channel.send(`✅ **| Your description box color hex code is \`${color}\`.**`);
                                            break
                                        }
                                        case "change": {
                                            let color = args[2];
                                            if (!color) color = "#008bff";
                                            if (pictureConfig.bgColor && pictureConfig.bgColor === color) return message.channel.send("❎ **| Hey, you cannot change your description box color to the same color!**");
                                            if (!(/^#[0-9A-F]{6}$/i.test(color))) return message.channel.send("❎ **| I'm sorry, this hex code is invalid!**");
                                            pictureConfig.bgColor = color;
                                            let properties = {
                                                res: res,
                                                player: player,
                                                coinImage: coinImage,
                                                level: level,
                                                next_level: next_level,
                                                pp: pp,
                                                coins: coins,
                                                pictureConfig: pictureConfig
                                            };
                                            let attachment = await drawImage(properties);
                                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your profile picture description box color to ${color}?**`, {files: [attachment]}).then(msg => {
                                                msg.react("✅").catch(console.error);
                                                let confirmation = false;
                                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
                                                confirm.on("collect", () => {
                                                    confirmation = true;
                                                    msg.delete();
                                                    if (pointres) {
                                                        updateVal = {
                                                            $set: {
                                                                picture_config: {
                                                                    bgColor: color
                                                                }
                                                            }
                                                        };
                                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                            if (err) {
                                                                console.log(err);
                                                                return message.channel.send("Error: Empty database response. Please try again!")
                                                            }
                                                            message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`)
                                                        })
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
                                                        pointdb.insertOne(insertVal, err => {
                                                            if (err) {
                                                                console.log(err);
                                                                return message.channel.send("Error: Empty database response. Please try again!")
                                                            }
                                                            message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`)
                                                        })
                                                    }
                                                });
                                                confirm.on("end", () => {
                                                    if (!confirmation) {
                                                        msg.delete();
                                                        message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                                    }
                                                })
                                            });
                                            break
                                        }
                                        default: return message.channel.send(`❎ **| I'm sorry, looks like your argument (${args[2]}) is invalid! Accepted arguments are \`change\` and \`view\`.**`)
                                    }
                                    break
                                }
                                case "textcolor": {
                                    switch (args[2]) {
                                        case "view": {
                                            let color = '#000000';
                                            if (pictureConfig.textColor) color = pictureConfig.textColor;
                                            message.channel.send(`✅ **| Your description box text color hex code is \`${color}\`.**`);
                                            break
                                        }
                                        case "change": {
                                            let color = args[2];
                                            if (!color) color = '#000000';
                                            if (pictureConfig.bgColor && pictureConfig.bgColor === color) return message.channel.send("❎ **| Hey, you cannot change your description box text color to the same color!**");
                                            if (!(/^#[0-9A-F]{6}$/i.test(color))) return message.channel.send("❎ **| I'm sorry, this hex code is invalid!**");
                                            pictureConfig.textColor = color;
                                            let properties = {
                                                res: res,
                                                player: player,
                                                coinImage: coinImage,
                                                level: level,
                                                next_level: next_level,
                                                pp: pp,
                                                coins: coins,
                                                pictureConfig: pictureConfig
                                            };
                                            let attachment = await drawImage(properties);
                                            message.channel.send(`❗**| ${message.author}, are you sure you want to change your profile picture description box text color to ${color}?**`, {files: [attachment]}).then(msg => {
                                                msg.react("✅").catch(console.error);
                                                let confirmation = false;
                                                let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 15000});
                                                confirm.on("collect", () => {
                                                    confirmation = true;
                                                    msg.delete();
                                                    if (pointres) {
                                                        updateVal = {
                                                            $set: {
                                                                picture_config: {
                                                                    textColor: color
                                                                }
                                                            }
                                                        };
                                                        pointdb.updateOne({discordid: message.author.id}, updateVal, err => {
                                                            if (err) {
                                                                console.log(err);
                                                                return message.channel.send("Error: Empty database response. Please try again!")
                                                            }
                                                            message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`)
                                                        })
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
                                                        pointdb.insertOne(insertVal, err => {
                                                            if (err) {
                                                                console.log(err);
                                                                return message.channel.send("Error: Empty database response. Please try again!")
                                                            }
                                                            message.channel.send(`✅ **| ${message.author}, successfully changed your profile picture description box color to \`${color}\`.**`)
                                                        })
                                                    }
                                                });
                                                confirm.on("end", () => {
                                                    if (!confirmation) {
                                                        msg.delete();
                                                        message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                                                    }
                                                })
                                            });
                                            break
                                        }
                                        default: return message.channel.send(`❎ **| I'm sorry, looks like your argument (${args[2]}) is invalid! Accepted arguments are \`change\` and \`view\`**`)
                                    }
                                    break
                                }
                                default: return message.channel.send(`❎ **| I'm sorry, looks like your argument (${args[1]}) is invalid! Accepted arguments are \`bgcolor\` and \`textcolor\`.**`)
                            }
                            break
                        }
                        default: return message.channel.send(`❎ **| I'm sorry, looks like your argument (${args[0]}) is invalid! Accepted arguments are \`background\`, \`badges\`, and \`descriptionbox\`.**`)
                    }
                })
            })
        })
    })
};

module.exports.config = {
    name: "profilepicture",
    description: "Modify your profile picture.",
    usage: "profilepicture background <change/list>\nprofilepicture badges <change/list/template>\nprofilepicture descriptionbox <bgcolor/textcolor> <change/view>",
    detail: "`background change`: Change your profile picture background.\n`background list`: List all available backgrounds and those you currently have\n`badges change`: Change your badge depending on position\n`badges list`: List all the badges you currently own\n`badges template`: Show the template number for each badge slot\n`descriptionbox change`: Change background color/text color of your profile picture description box\n`descriptionbox view`: Show your current description box background/text color",
    permission: "None"
};
