var cd = new Set();

function spaceFill(s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s
}

function editpoint(res, page) {
    var output = '#   | Username         | UID    | Challenges | Points\n';
    for (var i = page * 20; i < page * 20 + 20; i++) {
        if (res[i]) {
            if (res[i].points && res[i].challenges) output += spaceFill((i+1).toString(),4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].challenges.length.toString(), 11) + ' | ' + parseInt(res[i].points).toString() + '\n';
            else {output += spaceFill((i+1).toString(), 4) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 11) + ' | 0\n';}
        }
        else {output += spaceFill("-", 4) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 11) + ' | -\n';}
    }
    output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
    return output
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    let pointdb = alicedb.collection("playerpoints");
    let page = 0;
    if (parseInt(args[0]) > 0) page = parseInt(args[0]) - 1;
    let pointsort = {points: -1};
    pointdb.find({}, {projection: {_id: 0, uid: 1, points: 1, username: 1, challenges: 1}}).sort(pointsort).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!res[page*20]) return message.channel.send("Nah we don't have that much player :p");
        let output = editpoint(res, page);
        message.channel.send('```c\n' + output + '```').then (msg => {
            msg.react("⏮️").then(() => {
                msg.react("⬅️").then(() => {
                    msg.react("➡️").then(() => {
                        msg.react("⏭️").catch(e => console.log(e))
                    })
                })
            });

            let backward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id, {time: 120000});
            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});
            let forward = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id, {time: 120000});

            backward.on('collect', () => {
                page = 0;
                output = editpoint(res, page);
                msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
            });

            back.on('collect', () => {
                if (page === 0) page = Math.floor(res.length / 20);
                else page--;
                output = editpoint(res, page);
                msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
            });

            next.on('collect', () => {
                if ((page + 1) * 20 >= res.length) page = 0;
                else page++;
                output = editpoint(res, page);
                msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
            });

            forward.on('collect', () => {
                page = Math.floor(res.length / 20);
                output = editpoint(res, page);
                msg.edit('```c\n' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch (e => console.log(e)))
            })
        });
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 10000)
    })
};

module.exports.config = {
    description: "Views challenge points leaderboard.",
    usage: "pointlb [page]",
    detail: "`page`: Page of leaderboard [Integer]",
    permission: "None"
};

module.exports.help = {
    name: "pointlb"
};

module.exports.help = {
    name: "pointlb"
};
