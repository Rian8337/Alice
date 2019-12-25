let Discord = require("discord.js");
let https = require("https");
let apikey = process.env.OSU_API_KEY;
let config = require('../config.json');

function time(second) {
    return [Math.floor(second / 60), (second - Math.floor(second / 60) * 60).toString().padStart(2, "0")].join(":")
}

module.exports.run = (client, message, args) => {
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
                .setTitle("Map whitelisted")
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setColor("#00cb16")
                .setTimestamp(new Date())
                .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                .setDescription(`**${mapstring}**\n[Map Link](https://osu.ppy.sh/beatmapsets/${mapinfo.beatmapset_id}) | [Go to Message](${message.url})`)
                .addField(`CS: ${mapinfo.diff_size} - AR: ${mapinfo.diff_approach} - OD: ${mapinfo.diff_overall} - HP: ${mapinfo.diff_drain}`, `BPM: ${mapinfo.bpm} - Length: ${time(mapinfo.hit_length)}/${time(mapinfo.total_length)}`)
                .addField(`Last Update: ${mapinfo.last_update}`, `Star Rating: ${parseFloat(mapinfo.difficultyrating).toFixed(2)}`);
            logchannel.send({embed: embed})
        })
    });
    req.end()
};

module.exports.config = {
    description: "Logging whitelists.",
    usage: "None",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "whitelistlog"
};
