var Discord = require('discord.js');
var http = require('http');
var droidapikey = process.env.DROID_API_KEY;

function modname(mod) {
    var res = '';
    var count = 0;
    if (mod.includes("-")) {res += 'None '; count++}
    if (mod.includes("n")) {res += 'NoFail '; count++}
    if (mod.includes("e")) {res += 'Easy '; count++}
    if (mod.includes("t")) {res += 'HalfTime '; count++}
    if (mod.includes("r")) {res += 'HardRock '; count++}
    if (mod.includes("h")) {res += 'Hidden '; count++}
    if (mod.includes("d")) {res += 'DoubleTime '; count++}
    if (mod.includes("c")) {res += 'NightCore '; count++}
    if (count > 1) return res.trimRight().split(" ").join(", ");
    else return res.trimRight()
}

function rankread(imgsrc) {
    let rank="";
    switch(imgsrc) {
        case 'S':rank="http://ops.dgsrz.com/assets/images/ranking-S-small.png";break;
        case 'A':rank="http://ops.dgsrz.com/assets/images/ranking-A-small.png";break;
        case 'B':rank="http://ops.dgsrz.com/assets/images/ranking-B-small.png";break;
        case 'C':rank="http://ops.dgsrz.com/assets/images/ranking-C-small.png";break;
        case 'D':rank="http://ops.dgsrz.com/assets/images/ranking-D-small.png";break;
        case 'SH':rank="http://ops.dgsrz.com/assets/images/ranking-SH-small.png";break;
        case 'X':rank="http://ops.dgsrz.com/assets/images/ranking-X-small.png";break;
        case 'XH':rank="http://ops.dgsrz.com/assets/images/ranking-XH-small.png";break;
        default: rank="unknown"
    }
    return rank
}

module.exports.run = (client, message = "", args = {}, maindb) => {
    let trackdb = maindb.collection("tracking");
    trackdb.find({}).toArray(function(err, res) {
        if (err) throw err;
        res.forEach(function(player) {
            var options = {
                host: "ops.dgsrz.com",
                port: 80,
                path: "/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + player.uid
            };
            var content = '';

            var req = http.request(options, function(res) {
                res.setEncoding("utf8");
                res.on("data", function(chunk) {
                    content += chunk
                });
                res.on("end", function() {
                    var resarr = content.split("<br>");
                    var headerres = resarr[0].split(" ");
                    var name = headerres[2];
                    var obj;
                    try {
                        obj = JSON.parse(resarr[1])
                    } catch (e) {
                        return
                    }
                    var play = obj.recent;
                    for (var i = 0; i < play.length; i++) {
                        let timeDiff = Math.floor(Date.now() / 1000) - play[i].date;
                        if (timeDiff > 600) break;
                        let title = play[i].filename;
                        let score = play[i].score.toLocaleString();
                        let ptime = new Date(play[i].date * 1000);
                        ptime.setUTCHours(ptime.getUTCHours() + 7);
                        let acc = (play[i].accuracy / 1000).toFixed(2);
                        let mod = modname(play[i].mode);
                        let miss = play[i].miss;
                        let rank = rankread(play[i].mark);
                        let combo = play[i].combo;

                        let embed = new Discord.RichEmbed()
                            .setAuthor(`Recent play for ${name}`, rank)
                            .setTitle(title)
                            .setColor(8311585)
                            .setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod}\`\nTime: \`${ptime.toUTCString()}\``);

                        client.channels.get("664880705372684318").send({embed: embed})
                    }
                })
            });
            req.end()
        })
    })
};

module.exports.config = {
    description: "Function for tracking recent plays.",
    usage: "None",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "trackfunc"
};
