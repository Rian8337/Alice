const cd = new Set();

function spaceFill(s, l) {
    let a = s.length;
    for (let i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s
}

function editscore(res, page) {
    let output = '#   | Username         | UID    | Play  | Score (Lv)\n';
    for (let i = page * 20; i < page * 20 + 20; i++) {
        if (res[i]) {
            if (res[i].score && res[i].playc) {output += spaceFill((i+1).toString(),4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].playc.toString(), 6) + ' | ' + parseInt(res[i].score).toLocaleString() + ' (' + Math.floor(res[i].level).toString() + ')\n';}
            else {output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 6) + ' | ' + '0 (0)\n';}
        }
        else {output += spaceFill("-", 4) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 6) + ' | -\n';}
    }
    output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
    return output
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
    let page = 0;
    if (parseInt(args[0]) > 0) page = parseInt(args[0]) - 1;
    let scoredb = alicedb.collection("playerscore");
    let scoresort = {score: -1};
    scoredb.find({}, {projection: {_id: 0, uid: 1, score: 1, playc: 1, username: 1, level: 1}}).sort(scoresort).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!res[page*20]) return message.channel.send("❎ **| Eh, we don't have that many players.**");
        let output = editscore(res, page);
        message.channel.send('```c\n' + output + '```').then (msg => {
            msg.react("⏮️").then(() => {
                msg.react("⬅️").then(() => {
                    msg.react("➡️").then(() => {
                        msg.react("⏭️").catch(console.error)
                    })
                })
            });

            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

            backward.on('collect', () => {
                page = 0;
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            back.on('collect', () => {
                if (page === 0) page = Math.floor(res.length / 20);
                else page--;
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            next.on('collect', () => {
                if ((page + 1) * 20 >= res.length) page = 0;
                else page++;
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            forward.on('collect', () => {
                page = Math.floor(res.length / 20);
                output = editscore(res, page);
                msg.edit('```c\n' + output + '```').catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            backward.on("end", () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error));
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
            })
        });
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 10000)
    })
};

module.exports.config = {
    name: "scorelb",
    description: "Views ranked score leaderboard.",
    usage: "scorelb [page]",
    detail: "`page`: Page of leaderboard [Integer]",
    permission: "None"
};
