const Discord = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');

/**
 * @param {number} second 
 */
function timeString(second) {
    return [Math.floor(second / 60), Math.ceil(second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":");
}

/**
 * @param {{pick: string, title: string, length: number}[]} mapinfoArray 
 * @param {Discord.MessageEmbed} embed 
 * @param {number} page 
 * @param {string[]} footer
 * @param {number} index
 */
function editMapList(mapinfoArray, embed, page, footer, index) {
    embed.spliceFields(0, embed.fields.length)
    .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(mapinfoArray.length / 4)}`, footer[index]);

    for (let i = 4 * (page - 1); i < 4 + 4 * (page - 1); ++i) {
        if (!mapinfoArray[i]) {
            break;
        }
        embed.addField(mapinfoArray[i].title, `**Length**: ${timeString(mapinfoArray[i].length)}`);
    }
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb
 * @param {Db} alicedb
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    const poolID = args[0];
    if (!poolID) {
        return message.channel.send("❎ **| Hey, please enter a pool ID!**");
    }

    let page = 1;

    maindb.collection("mapinfo").findOne({poolid: poolID}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, I cannot find the pool that you are looking for!**");
        }

        const mapinfo = res.map;

        alicedb.collection("mapinfolength").findOne({poolid: poolID}, (err, mres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
            }
            if (!mres) {
                return message.channel.send("❎ **| I'm sorry, I cannot find the pool that you are looking for!**");
            }

            const lengthinfo = mres.map;

            const mapinfoArray = [];
            for (let i = 0; i < mapinfo.length; ++i) {
                mapinfoArray.push({
                    pick: mapinfo[i][0],
                    title: mapinfo[i][1],
                    length: lengthinfo[i][1]
                });
            }

            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            const embed = new Discord.MessageEmbed()
                .setAuthor("Map Information for Pool " + poolID)
                .setColor(message.member?.roles.highest?.hexColor || "#000000");

            editMapList(mapinfoArray, embed, page, footer, index);

            message.channel.send({embed: embed}).then(msg => {
                const maxPage = Math.ceil(mapinfoArray.length / 4);
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

                const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 90000});
                const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 90000});
                const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 90000});
                const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 90000});

                backward.on("collect", () => {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    if (page === 1) {
                        return;
                    }
                    page = Math.max(1, page - 10);
                    editMapList(mapinfoArray, embed, page, footer, index);
                    msg.edit({embed: embed}).catch(console.error);
                });
        
                back.on('collect', () => {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    if (page === 1) {
                        page = maxPage;
                    } else {
                        --page;
                    }
                    editMapList(mapinfoArray, embed, page, footer, index);
                    msg.edit({embed: embed}).catch(console.error);
                });

                next.on("collect", () => {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    if (page === maxPage) {
                        page = 1;
                    } else {
                        ++page;
                    }
                    editMapList(mapinfoArray, embed, page, footer, index);
                    msg.edit({embed: embed}).catch(console.error);
                });

                forward.on('collect', () => {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    page = Math.min(page + 10, maxPage);
                    editMapList(mapinfoArray, embed, page, footer, index);
                    msg.edit({embed: embed}).catch(console.error);
                });

                backward.on("end", () => {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
                });
            });
        });
    });
};

module.exports.config = {
    name: "pool",
    description: "Retrieves the list of maps in a mappool.",
    usage: "pool <pool id>",
    detail: "`pool id`: The ID of the mappool [String]",
    permission: "None"
};