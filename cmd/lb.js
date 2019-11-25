var mongodb = require('mongodb');

function spaceFill (s, l) {
    var a = s.length;
    for (var i = 1; i < l-a; i++) {
        s += ' ';
    }
    return s;
}

module.exports.run = (client, message, args, maindb) => {
    var page = 0
    if (parseInt(args[0]) > 0) page = parseInt(args[0]) - 1;
    var output = '#  | Username         | UID    | Play | PP \n'
    var binddb = maindb.collection('userbind')
    var ppsort = { pptotal: -1 };
    binddb.find({}, { projection: { _id: 0, discordid: 1, uid: 1, pptotal: 1 , playc: 1, username: 1}}).sort(ppsort).toArray(function(err, res) {
        if (err) throw err;
        if (!(res[page*20])) {message.channel.send("Nah we don't have that much player :p"); return;}
        for (var i = page * 20; i < page * 20 + 20; i++) {
            if (res[i]) {
                if (res[i].pptotal && res[i].playc) {output += spaceFill((parseInt(i)+1).toString(),3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill(res[i].playc.toString(), 5) + ' | ' + res[i].pptotal.toFixed(2) + '\n';}
                else {output += spaceFill((parseInt(i)+1).toString(), 3) + ' | ' + spaceFill(res[i].username, 17) + ' | ' + spaceFill(res[i].uid, 7) + ' | ' + spaceFill("0", 5) + ' | ' + "0.00" + '\n';}
            }
            else {output += spaceFill("-", 3) + ' | ' + spaceFill("-", 17) + ' | ' + spaceFill("-", 7) + ' | ' + spaceFill("-", 5) + ' | ' + "-" + '\n';}
        }
        output += "Current page: " + (page + 1)
        message.channel.send('```' + output + '```')
    });
}

module.exports.help = {
	name: "lb"
}