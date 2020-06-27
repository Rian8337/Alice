const osudroid = require('osu-droid');
const {createCanvas, loadImage} = require('canvas');
const canvas = createCanvas(500, 500);
const c = canvas.getContext('2d');
c.imageSmoothingQuality = "high";

async function drawImage(properties, template = false) {
    // background
    let backgroundImage = properties.pictureConfig.activeBackground;
    if (!backgroundImage) backgroundImage = 'bg';
    else backgroundImage = backgroundImage.id;
    const bg = await loadImage(`./img/${backgroundImage}.png`);
    c.drawImage(bg, 0, 0);

    // player avatar
    const avatar = await loadImage(properties.player.avatarURL);
    c.drawImage(avatar, 9, 9, 150, 150);

    // area
    // user profile
    c.globalAlpha = 0.9;
    c.fillStyle = '#bbbbbb';
    c.fillRect(164, 9, 327, 185);

    // player flag
    c.globalAlpha = 1;
    let flag = properties.player.location !== "LL" ? await loadImage(`https://osu.ppy.sh/images/flags/${properties.player.location}.png`) : undefined;
    if (flag) c.drawImage(flag, 440, 15, flag.width / 1.5, flag.height / 1.5);

    // player rank
    c.globalAlpha = 0.9;
    c.fillStyle = '#cccccc';
    c.fillRect(9, 164, 150, 30);

    // description box
    c.globalAlpha = 0.85;
    let bgColor = properties.pictureConfig.bgColor;
    if (!bgColor) bgColor = 'rgb(0,139,255)';
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

    let progress = (properties.level - Math.floor(properties.level)) * 401;
    c.globalAlpha = 1;
    c.fillStyle = '#e1c800';
    if (progress > 0) c.fillRect(79, 208, progress, 26);

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
        default: c.fillStyle = '#787878'
    }
    c.fillText(`#${properties.player.rank.toLocaleString()}`, 12, 187);

    // profile
    c.fillStyle = "#000000";
    c.font = 'bold 25px Exo';
    c.fillText(properties.player.name, 169, 45, 243);

    c.font = '18px Exo';
    c.fillText(`Total Score: ${properties.player.score.toLocaleString()}`, 169, 84);
    c.fillText(`Ranked Score: ${properties.score.toLocaleString()}`, 169, 104);
    c.fillText(`Accuracy: ${properties.player.accuracy}%`, 169, 124);
    c.fillText(`Play Count: ${properties.player.play_count.toLocaleString()}`, 169, 144);
    if (properties.res && properties.res.pptotal) c.fillText(`Droid pp: ${properties.res.pptotal.toFixed(2)}pp`, 169, 164);
    if (properties.res && properties.res.clan) c.fillText(`Clan: ${properties.res.clan}`, 169, 184);
    if (flag) c.fillText(properties.player.location, 451, flag.height + 20);

    // ranked level
    let textColor = properties.pictureConfig.textColor;
    if (!textColor) textColor = "#000000";
    c.fillStyle = textColor;
    c.fillText(((properties.level - Math.floor(properties.level)) * 100).toFixed(2) + "%", 245, 226);
    c.font = '19px Exo';
    c.fillText(`Lv${Math.floor(properties.level)}`, 15, 230);

    // alice coins
    c.fillText(`${properties.coins.toLocaleString()} Alice Coins | ${properties.points} Challenge Points`, 75, 285);

    // badges
    if (template) {
        // line
        c.globalAlpha = 0.7;
        c.fillStyle = '#000000';
        c.beginPath();
        c.moveTo(15, 397);
        c.lineTo(485, 397);
        for (let i = 15 + 94; i < 15 + 94 * 6; i += 94) {
            c.moveTo(i, 312);
            c.lineTo(i, 482)
        }
        c.stroke();

        c.font = 'bold 12px Exo';
        for (let i = 0; i < 10; i++) {
            if (i / 5 < 1) c.fillText((i+1).toString(), 45 + i * 47, 352);
            else c.fillText((i+1).toString(), 45 + (i - 5) * 47, 437)
        }
    } else {
        let badges = properties.pictureConfig.activeBadges;
        if (!badges) badges = [];
        for (let i = 0; i < badges.length; i++) {
            let badge = await loadImage(`./img/badges/${badges[i].id}.png`);
            if (i / 5 < 1) c.drawImage(badge, i * 94 + 19.5, 312, 85, 85);
            else c.drawImage(badge, (i - 5) * 94 + 19.5, 397, 85, 85)
        }
    }

    return canvas.toBuffer()
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

    binddb.findOne({discordid: message.author.id}, async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!res) return message.channel.send("❎ **| I'm sorry, your account is not binded. You need to bind your account using `a!userbind <uid/username>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res.uid;
        let username = res.username;
        let pp = res.pptotal;
        const player = await new osudroid.PlayerInfo().get({uid: uid});
        if (player.error) return message.channel.send("❎ **| I'm sorry, I couldn't fetch your profile! Perhaps osu!droid server is down?**");
        if (!player.name) return message.channel.send("❎ **| I'm sorry, I couldn't find your profile!**");
        scoredb.findOne({discordid: message.author.id}, (err, playerres) => {
            if (err) {
                console.log(err);
                return message.channel.send("Error: Empty database response. Please try again!")
            }
            let level = 1;
            let score = 0;
            if (playerres) {
                score = playerres.score;
                level = playerres.level;
            }
            pointdb.findOne({discordid: message.author.id}, async (err, pointres) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                let coins = 0;
                let points = 0;
                let pictureConfig = {};
                if (pointres) {
                    points = pointres.points;
                    coins = pointres.alicecoins;
                    pictureConfig = pointres.picture_config;
                    if (!pictureConfig) pictureConfig = {}
                }

                switch (args[0]) {
                    case "background": {
                        switch (args[1]) {
                            case "change": {
                                let type = args.slice(2).join(" ");
                                if (!type) return message.channel.send("❎ **| Hey, please enter a background name!**");
                                let id = '';
                                for (let i = 0; i < backgroundList.length; i++) {
                                    let bg = backgroundList[i];
                                    if (bg.name !== type) continue;
                                    id = bg.id;
                                    break
                                }
                                if (!id) return message.channel.send(`❎ **| I'm sorry, the background you have mentioned (${type}) is invalid!**`);
                                let owned_list = pictureConfig.backgrounds;
                                if (!owned_list) owned_list = [];
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
                                    confirm_string += `${message.author}, you don't have this background yet! Are you sure you want to purchase this background for ${coin}\`500\` Alice coins and change your background profile picture to the background?**`;
                                }
                                if (!pictureConfig.activeBackground) pictureConfig.activeBackground = {};
                                pictureConfig.activeBackground.id = id;
                                let properties = {
                                    res: res,
                                    player: player,
                                    coinImage: coinImage,
                                    level: level,
                                    pp: pp,
                                    points: points,
                                    score: score,
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
                                                    badges: pictureConfig.badges ? pictureConfig.badges : [],
                                                    activeBadges: pictureConfig.activeBadges ? pictureConfig.activeBadges : [],
                                                    activeBackground: {
                                                        id: id,
                                                        name: type
                                                    },
                                                    backgrounds: owned_list,
                                                    bgColor: pictureConfig.bgColor ? pictureConfig.bgColor : "#008bff",
                                                    textColor: pictureConfig.textColor ? pictureConfig.textColor : "#000000"
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
                                if (!owned || owned.length === 0) return message.channel.send(`✅ **| There are ${backgroundList.length} available backgrounds: ${background_list}. You own 1 background: \`${backgroundList[0].name}\`**`);
                                for (let i = 0; i < owned.length; i++) {
                                    owned_list += `\`${owned[i].name}\``;
                                    if (i + 1 < owned.length) owned_list += ', '
                                }

                                message.channel.send(`✅ **| There are ${backgroundList.length} available backgrounds: ${background_list}. You own ${owned.length + 1} backgrounds: ${owned_list}.**`);
                                break
                            }
                            default: return message.channel.send(`❎ **| I'm sorry, looks like your second argument (${args[1]}) is invalid! Accepted arguments are \`change\` and \`list\`.**`)
                        }
                        break
                    }
                    case "badges": {
                        //TODO: add badges
                        switch (args[1]) {
                            case "template": {
                                let properties = {
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
                                let attachment = await drawImage(properties, true);
                                message.channel.send(attachment);
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
                                        if (color.includes(",")) return message.channel.send(`✅ **| Your description box RGBA color is \`${color}\`.**`);
                                        message.channel.send(`✅ **| Your description box color hex code is \`${color}\`.**`);
                                        break
                                    }
                                    case "change": {
                                        let color = args[3];
                                        if (!color) color = "#008bff";
                                        if (pictureConfig.bgColor && pictureConfig.bgColor === color) return message.channel.send("❎ **| Hey, you cannot change your description box color to the same color!**");
                                        if (color.includes(",")) {
                                            let color_entry = color.split(",");
                                            if (color_entry.length !== 4) return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            color_entry = color_entry.map((x) => parseFloat(x));
                                            if (color_entry.slice(0, 3).some(value => isNaN(value) || value < 0 || value > 255)) return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            if (color_entry[3] < 0 || color_entry[3] > 1) return message.channel.send("❎ **| I'm sorry, that RGBA color format is invalid!**");
                                            color = `rgba(${color_entry.join(",")})`
                                        }
                                        else if (!(/^#[0-9A-F]{6}$/i.test(color))) return message.channel.send("❎ **| I'm sorry, this hex code is invalid!**");
                                        pictureConfig.bgColor = color;
                                        let properties = {
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
                                        let attachment = await drawImage(properties);
                                        message.channel.send(`❗**| ${message.author}, are you sure you want to change your profile picture description box color to \`${color}\`?**`, {files: [attachment]}).then(msg => {
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
                                                                badges: pictureConfig.badges ? pictureConfig.badges : [],
                                                                activeBadges: pictureConfig.activeBadges ? pictureConfig.activeBadges : [],
                                                                activeBackground: pictureConfig.activeBackground ? pictureConfig.activeBackground : {id: "bg", name: "Default"},
                                                                backgrounds: pictureConfig.backgrounds ? pictureConfig.backgrounds : [],
                                                                bgColor: color,
                                                                textColor: pictureConfig.textColor ? pictureConfig.textColor : "#000000"
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
                                    default: return message.channel.send(`❎ **| I'm sorry, looks like your third argument (${args[2]}) is invalid! Accepted arguments are \`change\` and \`view\`.**`)
                                }
                                break
                            }
                            case "textcolor": {
                                switch (args[2]) {
                                    case "view": {
                                        let color = '#000000';
                                        if (pictureConfig.textColor) color = pictureConfig.textColor;
                                        if (color.includes(",")) return message.channel.send(`✅ **| Your description box text RGBA color is \`${color}\`.**`);
                                        message.channel.send(`✅ **| Your description box text color hex code is \`${color}\`.**`);
                                        break
                                    }
                                    case "change": {
                                        let color = args[3];
                                        if (!color) color = '#000000';
                                        if (pictureConfig.bgColor && pictureConfig.bgColor === color) return message.channel.send("❎ **| Hey, you cannot change your description box text color to the same color!**");
                                        if (color.includes(",")) {
                                            let color_entry = color.split(",");
                                            if (color_entry.length !== 4) return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            color_entry = color_entry.map((x) => parseFloat(x));
                                            if (color_entry.slice(0, 3).some(value => isNaN(value) || value < 0 || value > 255)) return message.channel.send("❎ **| I'm sorry, that's an invalid RGBA color format!**");
                                            if (color_entry[3] < 0 || color_entry[3] > 1) return message.channel.send("❎ **| I'm sorry, that RGBA color format is invalid!**");
                                            color = `rgba(${color_entry.join(",")})`
                                        }
                                        if (!(/^#[0-9A-F]{6}$/i.test(color))) return message.channel.send("❎ **| I'm sorry, this hex code is invalid!**");
                                        pictureConfig.textColor = color;
                                        let properties = {
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
                                        let attachment = await drawImage(properties);
                                        message.channel.send(`❗**| ${message.author}, are you sure you want to change your profile picture description box text color to \`${color}\`?**`, {files: [attachment]}).then(msg => {
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
                                                                badges: pictureConfig.badges ? pictureConfig.badges : [],
                                                                activeBadges: pictureConfig.activeBadges ? pictureConfig.activeBadges : [],
                                                                activeBackground: pictureConfig.activeBackground ? pictureConfig.activeBackground : {id: "bg", name: "Default"},
                                                                backgrounds: pictureConfig.backgrounds ? pictureConfig.backgrounds : [],
                                                                bgColor: pictureConfig.bgColor ? pictureConfig.bgColor : "#008bff",
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
                                    default: return message.channel.send(`❎ **| I'm sorry, looks like your third argument (${args[2]}) is invalid! Accepted arguments are \`change\` and \`view\`**`)
                                }
                                break
                            }
                            default: return message.channel.send(`❎ **| I'm sorry, looks like your second argument (${args[1]}) is invalid! Accepted arguments are \`bgcolor\` and \`textcolor\`.**`)
                        }
                        break
                    }
                    default: return message.channel.send(`❎ **| I'm sorry, looks like your first argument (${args[0]}) is invalid! Accepted arguments are \`background\`, \`badges\`, and \`descriptionbox\`.**`)
                }
            })
        })
    })
};

module.exports.config = {
    name: "profilepicture",
    description: "Modify your profile picture.",
    usage: "profilepicture background <change/list>\nprofilepicture badges <change/list/template>\nprofilepicture descriptionbox <bgcolor/textcolor> <change/view>",
    detail: "`background change`: Change your profile picture background.\n`background list`: List all available backgrounds and those you currently have\n`badges change`: Change your badge depending on position\n`badges list`: List all the badges you currently own\n`badges template`: Show the template number for each badge slot\n`descriptionbox change`: Change background color/text color of your profile picture description box. Supports hex code and RGBA\n`descriptionbox view`: Show your current description box background/text color",
    permission: "None"
};