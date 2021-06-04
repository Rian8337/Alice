const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

function editEmbed(res, page, color, footer, index) {
    const embed = new Discord.MessageEmbed()
        .setTitle(`Name History for uid ${res.uid}`)
        .setFooter(`Alice Synthesis Thirty | Page ${page}/${Math.ceil(res.previous_usernames.length / 10)}`, footer[index])
        .setColor(color);
    
    let string = `**Current username:** ${res.current_username}\n\n__**Name History**__\n`;
    
    let prev_names = res.previous_usernames;
    for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); i++) {
        if (!prev_names[i]) break;
        string += `**${i+1}.** ${prev_names[i]}\n`;
    }
    
    embed.setDescription(string);
    return embed;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    const uid = parseInt(args[0]);
    if (isNaN(uid)) {
        return message.channel.send("❎ **| Hey, please enter a valid uid!**");
    }

    const namedb = alicedb.collection("namechange");
    namedb.findOne({uid: uid}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res) {
            return message.channel.send("❎ **| I'm sorry, this uid doesn't have any name history!**");
        }

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const color = message.member?.roles.color?.hexColor || "#000000";
        
        let page = 1;
        let embed = editEmbed(res, page, color, footer, index);

        message.channel.send({embed: embed}).then(msg => {
            const max_page = Math.ceil(res.previous_usernames.length / 10);
            if (max_page === page) return;
            msg.react("⏮️").then(() => {
                msg.react("⬅️").then(() => {
                    msg.react("➡️").then(() => {
                        msg.react("⏭️").catch(console.error);
                    });
                });
            });

            const backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 60000});
            const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
            const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});
            const forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 60000});

            backward.on('collect', () => {
                if (page === 1) {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    return;
                }
                page = Math.max(1, page - 10);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
                embed = editEmbed(res, page, color, footer, index);
                msg.edit({embed: embed}).catch(console.error);
            });

            back.on('collect', () => {
                if (page === 1) page = max_page;
                else --page;
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
                embed = editEmbed(res, page, color, footer, index);
                msg.edit({embed: embed}).catch(console.error);
            });

            next.on('collect', () => {
                if (page === max_page) page = 1;
                else ++page;
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
                embed = editEmbed(res, page, color, footer, index);
                msg.edit({embed: embed}).catch(console.error);
            });

            forward.on('collect', () => {
                if (page === max_page) {
                    if (message.channel.type === "text") {
                        msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                    }
                    return;
                }
                page = Math.min(page + 10, max_page);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                embed = editEmbed(res, page, color, footer, index);
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
    name: "namehistory",
    description: "Checks name history of an osu!droid account.",
    usage: "namehistory <uid>",
    detail: "`uid`: Uid of the osu!droid account [Integer]",
    permission: "None"
};