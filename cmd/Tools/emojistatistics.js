const Discord = require('discord.js');
const { Db } = require('mongodb');
const cd = new Set();
const config = require('../../config.json');

/**
 * @param {Discord.MessageEmbed} embed 
 * @param {number} page 
 * @param {string} footerImage
 * @param {{emoji: Discord.GuildEmoji, count: number, averagePerMonth: number}[]} validEmojis 
 */
function modifyEmbed(embed, page, footerImage, validEmojis) {
    embed.spliceFields(0, embed.fields.length)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(validEmojis.length / 5)}`, footerImage);

    for (let i = 5 * (page - 1); i < Math.min(validEmojis.length, 5 + 5 * (page - 1)); ++i) {
        const validEmoji = validEmojis[i];
        embed.addField(`${i+1}. ${validEmoji.emoji.name}`, `**Emoji**: ${validEmoji.emoji}\n**Date created**: ${validEmoji.emoji.createdAt.toUTCString()}\n**Overall usage**: ${validEmoji.count.toLocaleString()}\n**Average per month usage**: ${validEmoji.averagePerMonth.toLocaleString()}`);
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
    if (!(message.channel instanceof Discord.TextChannel)) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DM.**");
    }

    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }

    const sortOption = args[0]?.toLowerCase() ?? "overall";

    alicedb.collection("emojistatistics").findOne({guildID: message.guild.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this server has no emoji usage statistics!**");
        }

        const emojis = res.emojiStats;
        const validEmojis = [];
        const currentDate = new Date();

        for (const emoji of emojis) {
            const actualEmoji = message.guild.emojis.resolve(emoji.id);

            if (!actualEmoji) {
                continue;
            }

            const dateCreation = actualEmoji.createdAt;
            const months = Math.max(1, (currentDate.getUTCFullYear() - dateCreation.getUTCFullYear()) * 12 + currentDate.getUTCMonth() - dateCreation.getUTCMonth());
            const averagePerMonth = Math.round(emoji.count / months);

            validEmojis.push({
                emoji: actualEmoji,
                count: emoji.count,
                averagePerMonth
            });
        }

        if (validEmojis.length === 0) {
            return message.channel.send("❎ **| I'm sorry, I couldn't find any valid emojis!**");
        }

        if (sortOption === "average") {
            validEmojis.sort((a, b) => {return b.averagePerMonth - a.averagePerMonth;});
        } else {
            validEmojis.sort((a, b) => {return b.count - a.count;});
        }

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setAuthor(`Emoji statistics for ${message.guild.name}`, message.guild.iconURL({dynamic: true}))
            .setDescription(`**Sort mode**: ${sortOption === "average" ? "Average per month" : "Overall"} usage`)
            .setColor(message.member.displayHexColor)
            .setFooter("Alice Synthesis Thirty", footer[index]);

        let page = 1;
        
        modifyEmbed(embed, page, footer[index], validEmojis);

        message.channel.send(embed).then(msg => {
            const maxPage = Math.ceil(validEmojis.length / 5);
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
    
            const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
            const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
            const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
            const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});
    
            backward.on('collect', () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                if (page === 1) {
                    return;
                }
                page = Math.max(1, page - 10);
                modifyEmbed(embed, page, footer[index], validEmojis);
                msg.edit(embed).catch(console.error);
            });
    
            back.on('collect', () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                if (page === 1) {
                    page = maxPage;
                } else {
                    page--;
                }
                modifyEmbed(embed, page, footer[index], validEmojis);
                msg.edit(embed).catch(console.error);
            });
    
            next.on('collect', () => {
                if (page === maxPage) {
                    page = 1;
                } else {
                    page++;
                }
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                modifyEmbed(embed, page, footer[index], validEmojis);
                msg.edit(embed).catch(console.error);
            });
    
            forward.on('collect', () => {
                page = Math.min(maxPage, page + 10);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                modifyEmbed(embed, page, footer[index], validEmojis);
                msg.edit(embed).catch(console.error);
            });
    
            backward.on("end", () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id));
            });
        });
        if (!message.isOwner) {
            cd.add(message.author.id);
            setTimeout(() => {
                cd.delete(message.author.id);
            }, 20000);
        }
    });
};

module.exports.config = {
    name: "emojistatistics",
    description: "Gives statistics for emoji usage of the server.",
	usage: "emojistatistics [sort option]",
	detail: "`sort option`: Whether to sort based on overall or average per month usage, with overall as default. Accepted arguments are `average` and `overall` [String]",
	permission: "None"
};