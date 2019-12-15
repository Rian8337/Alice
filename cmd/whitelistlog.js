let Discord = require("discord.js");
let https = require("https");
let apikey = process.env.OSU_API_KEY;
let config = require('../config.json');

module.exports.run = (client, message, args) => {
    if (message.author.id !== '386742340968120321') return;
    if (!args[0]) return;
    let guild = client.guilds.get('528941000555757598');
    let logchannel = guild.channels.get('638671295470370827');
    if (!logchannel) return;
    let beatmapid = args[0].split("/");
    beatmapid = beatmapid[beatmapid.length - 1];

    var options = new URL("https://osu.ppy.sh/api/get_beatmaps?k=" + apikey + "&b=" + beatmapid);
    var content = '';

    var req = https.get(options, res => {
        res.setEncoding("utf8");
        res.on("data", chunk => {
            content += chunk;
        });
        res.on("error", err => {
            return console.log(err)
        });
        res.on("end", () => {
            var obj;
            try {
                obj = JSON.parse(content)
            } catch (e) {
                return
            }
            if (!obj[0]) return;
            var mapinfo = obj[0];
            var mapstring = mapinfo.artist + " - " + mapinfo.title + " (" + mapinfo.creator + ") [" + mapinfo.version + "] ";
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * (footer.length - 1) + 1);
            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setTitle(mapstring)
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setColor("#00cb16")
                .setTimestamp(new Date())
                .setThumbnail(`https://b.ppy.sh/thumb/ + ${mapinfo.beatmapset_id} + .jpg`)
                .setDescription(`[Map Link](https://osu.ppy.sh/beatmapsets/${mapinfo.beatmapset_id}) | [Go to Message](${message.url})`)
                .addField(`CS: ${mapinfo.diff_size} - AR: ${mapinfo.diff_approach} - OD: ${mapinfo.diff_overall} - HP: ${mapinfo.diff_drain}`, `BPM: ${mapinfo.bpm} - Length: ${mapinfo.hit_length}/${mapinfo.total_length} s`)
                .addField(`Last Update: ${mapinfo.last_update}`, `Star Rating: ${parseFloat(mapinfo.difficultyrating).toFixed(2)}`);
            logchannel.send({embed: embed})
        })
    });
    req.end()
};

module.exports.help = {
    name: "whitelistlog"
};
