const Discord = require('discord.js');
const request = require('request');
const cd = new Set();
const { rankedStatus } = require('osu-droid');
const config = require('../../config.json');

/**
 * @param {string} string 
 */
function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * @param {number} status 
 */
function getBeatmapStatus(status) {
    for (const stat in rankedStatus) {
        if (parseInt(stat) === status) {
            return rankedStatus[stat] !== "WIP" ? capitalizeString(rankedStatus[stat]) : rankedStatus[stat];
        }
    }

    return "Unknown";
}

/**
 * @param {Discord.MessageEmbed} embed 
 * @param {any[]} mapList 
 * @param {number} page 
 * @param {string} footerImage 
 * @param {boolean} showDownloadLink
 */
function editEmbed(embed, mapList, page, footerImage, showDownloadLink) {
    embed.spliceFields(0, embed.fields.length)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(mapList.length / 5)} (provided by sayobot)`, footerImage);

    for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
        if (!mapList[i]) {
            break;
        }
        const d = mapList[i];
        const title = `${i + 1}. ${d.artist} - ${d.title} (${d.creator})`;
        const content = `${showDownloadLink ? `**Download**: [osu! page](https://osu.ppy.sh/beatmapsets/${d.sid}) - [Chimu](https://chimu.moe/en/d/${d.sid}) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${d.sid}) [(no video)](https://txy1.sayobot.cn/beatmaps/download/novideo/${d.sid}) - [Beatconnect](https://beatconnect.io/b/${d.sid}/)${d.approved >= rankedStatus.RANKED && d.approved !== rankedStatus.QUALIFIED ? ` - [Ripple](https://storage.ripple.moe/d/${d.sid})` : ""}\n` : ""}**Last Update**: ${new Date(d.lastupdate * 1000).toUTCString()} | **${getBeatmapStatus(d.approved)}**\n❤️ **${d.favourite_count.toLocaleString()}** - ▶️ **${d.play_count.toLocaleString()}**`;

        embed.addField(title, content);
    }
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = (client, message, args) => {
    const searchQuery = args.join(" ");

    // documentation: https://docs.qq.com/doc/DS0lDWndpc0FlVU5B
    // default to std, type "search for", limit at 100 beatmaps
    const url = `https://api.sayobot.cn/beatmaplist?T=4&L=100&M=1${searchQuery ? `&K=${encodeURIComponent(searchQuery)}` : ""}`;

    if (!message.isOwner) {
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id);
        }, 15000);
    }

    let content = "";
    request(url, {encoding: "utf-8"})
        .on("data", chunk => {
            content += chunk;
        })
        .on("complete", resp => {
            if (resp.statusCode !== 200) {
                return message.channel.send("❎ **| I'm sorry, sayobot returned an error!**");
            }
            const data = JSON.parse(content);
            const mapList = data.data || [];
            if (mapList.length === 0) {
                return message.channel.send("❎ **| I'm sorry, your search does not return any result!**");
            }

            let page = 1;
            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            const embed = new Discord.MessageEmbed()
                .setAuthor(`Map Search Result for ${message.author.username}`, message.author.avatarURL({dynamic: true}))
                .setDescription(`Beatmaps found: **${data.results.toLocaleString()}**\nUse 📥 to toggle beatmap download link.`)
                .setColor(message.member?.roles.color?.hexColor || "#000000");

            editEmbed(embed, mapList, page, footer[index]);

            message.channel.send({embed: embed}).then(msg => {
                const maxPage = Math.ceil(mapList.length / 5);

                msg.react("⏮️").then(() => {
                    msg.react("⬅️").then(() => {
                        msg.react("➡️").then(() => {
                            msg.react("⏭️").then(() => {
                                msg.react("📥").catch(console.error);
                            });
                        });
                    });
                });
                let showDownloadLink = false;
                
                const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 150000});
                const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 150000});
                const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 150000});
                const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 150000});
                const downloadLinkToggle = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '📥' && user.id === message.author.id, {time: 150000});

                backward.on('collect', () => {
                    page = Math.max(1, page - 10);
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    showDownloadLink = false;
                    editEmbed(embed, mapList, page, footer[index]);
                    msg.edit({embed: embed}).catch(console.error);
                });
    
                back.on('collect', () => {
                    if (page === 1) page = maxPage;
                    else page--;
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    showDownloadLink = false;
                    editEmbed(embed, mapList, page, footer[index]);
                    msg.edit({embed: embed}).catch(console.error);
                });
    
                next.on('collect', () => {
                    if (page === maxPage) page = 1;
                    else page++;
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    showDownloadLink = false;
                    editEmbed(embed, mapList, page, footer[index]);
                    msg.edit({embed: embed}).catch(console.error);
                });
    
                forward.on('collect', () => {
                    page = Math.min(maxPage, page + 10);
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    showDownloadLink = false;
                    editEmbed(embed, mapList, page, footer[index]);
                    msg.edit({embed: embed}).catch(console.error);
                });

                downloadLinkToggle.on('collect', () => {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    showDownloadLink = !showDownloadLink;
                    editEmbed(embed, mapList, page, footer[index], showDownloadLink);
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
};

module.exports.config = {
    name: "mapsearch",
    aliases: "ms",
    description: "Searches for beatmaps. Useful if you do not own an osu! account to download beatmaps from official osu! site.\nA search is limited to 100 beatmaps.\n\nService provided by [sayobot](https://osu.sayobot.cn/). All credits go to them.",
    usage: "mapsearch [keywords]",
    detail: "`keywords`: The keywords (artist, title, etc) to search for [String]",
    permission: "None"
};