let Discord = require('discord.js');
let osudroid = require('../modules/osu!droid');

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

function modname(mod) {
    let res = '';
    let count = 0;
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

module.exports.run = (client, message, args, maindb) => {
    let ufind = message.author.id;
    if (args[0]) ufind = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
    console.log(ufind);
    let binddb = maindb.collection("userbind");
    let query = {discordid: ufind};
    binddb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (!res[0]) return message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**");
        let uid = res[0].uid;
        new osudroid.PlayerInfo().get({uid: uid}, player => {
            if (!player.name) return message.channel.send("❎ **| I'm sorry, I cannot find the player!**");
            if (!player.recent_plays) return message.channel.send("❎ **| I'm sorry, this player hasn't submitted any play!**");
            let name = player.name;
            let play = player.recent_plays[0];
            let title = play.filename;
            let score = play.score.toLocaleString();
            let combo = play.combo;
            let rank = rankread(play.mark);
            let ptime = new Date(play.date * 1000);
            ptime.setUTCHours(ptime.getUTCHours() + 7);
            let acc = parseFloat((play.accuracy / 1000).toFixed(2));
            let miss = play.miss;
            let mod = play.mode;
            let hash = play.hash;
            let embed = new Discord.RichEmbed()
                .setAuthor(`Recent play for ${name}`, rank)
                .setTitle(title)
                .setColor(8311585);

            new osudroid.MapInfo().get({hash: hash}, mapinfo => {
                if (!mapinfo.title) {
                    embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\`x)\nMod: \`${modname(mod)}\`\nTime: \`${ptime.toUTCString()}\``);
                    return message.channel.send({embed: embed}).catch(console.error)
                }
                let beatmapid = mapinfo.beatmap_id;
                let mod_string = modname(mod);
                mod = mapinfo.modConvert(mod);
                new osudroid.MapStars().calculate({beatmap_id: beatmapid, mods: mod}, star => {
                    let starsline = parseFloat(star.droid_stars.toString().split(" ")[0]);
                    let pcstarsline = parseFloat(star.pc_stars.toString().split(" ")[0]);
                    let npp = new osudroid.MapPP().calculate({
                        stars: star.droid_stars,
                        combo: combo,
                        miss: miss,
                        acc_percent: acc,
                        mode: "droid"
                    });
                    let pcpp = new osudroid.MapPP().calculate({
                        stars: star.pc_stars,
                        combo: combo,
                        miss: miss,
                        acc_percent: acc,
                        mode: "osu"
                    });
                    let ppline = parseFloat(npp.pp.toString().split(" ")[0]);
                    let pcppline = parseFloat(pcpp.pp.toString().split(" ")[0]);

                    embed.setDescription(`**Score**: \`${score}\` - Combo: \`${combo}x\` - Accuracy: \`${acc}%\` (\`${miss}\` x)\nMod: \`${mod_string}\`\nTime: \`${ptime.toUTCString()}\`\n\`${starsline} droid stars - ${pcstarsline} PC stars\`\n\`${ppline} droid pp - ${pcppline} PC pp\``).setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`);
                    message.channel.send({embed: embed}).catch(console.error)
                })
            })
        })
    })
};

module.exports.config = {
    description: "Retrieves a user's most recent play.",
    usage: "rs [user]",
    detail: "`user`: The user to retrieve [UserResolvable (mention or user ID)]",
    permission: "None"
};

module.exports.help = {
    name: "rs"
};
