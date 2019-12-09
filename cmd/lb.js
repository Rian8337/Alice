var cd = new Set();

function spaceFill (s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

module.exports.run = (client, message, args, maindb) => {
    if (cd.has(message.author.id)) return message.channel.send("Please wait for a bit before using this command again!");
    var page = 0;
    if (parseInt(args[0]) > 0) page = parseInt(args[0]) - 1;
    var output = '#  | Username         | UID    | Play | PP \n';
    var binddb = maindb.collection('userbind');
    var ppsort = { pptotal: -1 };
    binddb.find({}, { projection: { _id: 0, discordid: 1, uid: 1, pptotal: 1 , playc: 1, username: 1}}).sort(ppsort).toArray(function(err, res) {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (!(res[page*20])) return message.channel.send("Nah we don't have that much player :p");
        for (var i = page * 20; i < page * 20 + 20; i++) {
            if (res[i]) {
                if (res[i].pptotal && res[i].playc) {output += spaceFill((parseInt(i)+1).toString(),3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].playc.toString(), 5) + ' | ' + res[i].pptotal.toFixed(2) + '\n';}
                else {output += spaceFill((parseInt(i)+1).toString(), 3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 5) + ' | ' + "0.00" + '\n';}
            }
            else {output += spaceFill("-", 3) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 5) + ' | ' + "-" + '\n';}
        }
        output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
        message.channel.send('```' + output + '```').then (msg => {
            msg.react("⬅️").then (() => {
                msg.react("➡️").catch(e => console.log(e))
            });
            let back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 120000});
            let next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 120000});

            back.on('collect', () => {
                if (page === 0) page = (Math.floor(res.length / 20));
                else page--;
                output = '#  | Username         | UID    | Play | PP \n';
                for (var i = page * 20; i < page * 20 + 20; i++) {
                    if (res[i]) {
                        if (res[i].pptotal && res[i].playc) output += spaceFill((parseInt(i)+1).toString(),3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].playc.toString(), 5) + ' | ' + res[i].pptotal.toFixed(2) + '\n';
                        else output += spaceFill((parseInt(i)+1).toString(), 3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 5) + ' | ' + "0.00" + '\n';
                    }
                    else {output += spaceFill("-", 3) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 5) + ' | ' + "-" + '\n';}
                }
                output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
                msg.edit('```' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id))
            });

            next.on('collect', () => {
                if ((page + 1) * 20 >= res.length) page = 0;
                else page++;
                output = '#  | Username         | UID    | Play | PP \n';
                for (var i = page * 20; i < page * 20 + 20; i++) {
                    if (res[i]) {
                        if (res[i].pptotal && res[i].playc) output += spaceFill((parseInt(i)+1).toString(),3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].playc.toString(), 5) + ' | ' + res[i].pptotal.toFixed(2) + '\n';
                        else output += spaceFill((parseInt(i)+1).toString(), 3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 5) + ' | ' + "0.00" + '\n';
                    }
                    else {output += spaceFill("-", 3) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 5) + ' | ' + "-" + '\n';}
                }
                output += "Current page: " + (page + 1) + "/" + (Math.floor(res.length / 20) + 1);
                msg.edit('```' + output + '```').catch(e => console.log(e));
                msg.reactions.forEach(reaction => reaction.remove(message.author.id).catch(e => console.log(e)))
            })
        });
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 10000)
    })
};

module.exports.help = {
	name: "lb"
};
