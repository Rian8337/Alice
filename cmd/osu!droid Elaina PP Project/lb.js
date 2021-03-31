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

function editpp(res, page) {
    let output = '#    | Username         | UID    | Play | PP \n';
    for (let i = page * 20; i < page * 20 + 20; i++) {
        if (res[i]) {
            output += spaceFill((i+1).toString(), 5) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 5) + ' | ' + "0.00" + '\n';
        } else {
            output += spaceFill("-", 5) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 5) + ' | ' + "-" + '\n';
        }
    }
    output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
    return output;
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 */
module.exports.run = (client, message, args, maindb) => {
    if (cd.has(message.author.id)) {
        return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    }
    let page = 0;
    if (parseInt(args[0]) > 0) page = parseInt(args[0]) - 1;
    let binddb = maindb.collection('userbind');
    let query = {};
    
    if (args[1]) {
        query.clan = args.slice(1).join(" ");
    }

    binddb.find(query, { projection: { _id: 0, discordid: 1, uid: 1, pptotal: 1 , playc: 1, username: 1}}).sort({pptotal: -1}).toArray(function(err, res) {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
        }
        if (res.length === 0 && query.clan) {
            return message.channel.send("❎ **| I'm sorry, I cannot find the clan!**");
        }
        if (!(res[page*20])) {
            return message.channel.send("❎ **| Nah, we don't have that much player. :p**");
        }
        let output = editpp(res, page);
        message.channel.send('```c\n' + output + '```').then((msg) => {
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
                page = Math.max(0, page - 10);
                output = editpp(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
            });

            back.on('collect', () => {
                if (page === 0) {
                    page = Math.floor(res.length / 20);
                } else {
                    page--;
                }
                output = editpp(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
            });

            next.on('collect', () => {
                if ((page + 1) * 20 >= res.length) {
                    page = 0;
                } else {
                    page++;
                }
                output = editpp(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                if (message.channel.type === "text") {
                    msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                }
            });

            forward.on('collect', () => {
                page = Math.min(page + 10, Math.floor(res.length / 20));
                output = editpp(res, page);
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
        }, 5000);
    });
};

module.exports.config = {
    name: "lb",
    description: "Views droid pp leaderboard.",
    usage: "lb [page] [clan]",
    detail: "`clan`: The clan to view, if present [String]\n`page`: Page of leaderboard [Integer]",
    permission: "None"
};