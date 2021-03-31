const Discord = require('discord.js');
const { Db } = require('mongodb');
const cd = new Set();

function spaceFill(s, l) {
    let a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

function editscore(res, page) {
    let output = '#   | Username         | UID    | Play  | Score (Lv)\n';
    for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); i++) {
        if (res[i]) {
            output += spaceFill((i+1).toString(),4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 6) + ' | ' + "0" + ' (' + "0" + ')\n';
        } else {
            output += spaceFill("-", 4) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 6) + ' | -\n';
        }
    }
    output += `Current Page: ${page}/${Math.ceil(res.length / 20)}`;
    return output;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }

    let page = 1;
    if (parseInt(args[0]) > 1) {
        page = parseInt(args[0]);
    }
    
    const scoredb = alicedb.collection("playerscore");
    scoredb.find({}, {projection: {_id: 0, uid: 1, score: 1, playc: 1, username: 1, level: 1}}).sort({score: -1}).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (!res[page*20]) {
            return message.channel.send("❎ **| Eh, we don't have that many players.**");
        }
        let output = editscore(res, page);
        message.channel.send('```c\n' + output + '```').then(msg => {
            const max_page = Math.ceil(res.length / 20);
            if (page === max_page) {
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
                page = Math.max(1, page - 10);
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
                }
            });

            back.on('collect', () => {
                if (page === 1) page = max_page;
                else page--;
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
                }
            });

            next.on('collect', () => {
                if (page === max_page) page = 1;
                else page++;
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));   
                }
            });

            forward.on('collect', () => {
                page = Math.min(page + 10, max_page);
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
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
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id);
        }, 10000);
    });
};

module.exports.config = {
    name: "scorelb",
    description: "Views ranked score leaderboard.",
    usage: "scorelb [page]",
    detail: "`page`: Page of leaderboard [Integer]",
    permission: "None"
};