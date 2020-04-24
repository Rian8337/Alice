const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('../../modules/osu!droid');

module.exports.run = async (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
    if (message.member.roles == null || !message.member.roles.cache.find((r) => r.name === 'pp-project Map Validator')) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

    let whitelist = maindb.collection("mapwhitelist");
    let link_in = args[0];
    let hash_in = args[1];
    await whitelistInfo(client, link_in, hash_in, message, (res, mapid = "", hashid = "", mapstring = "") => {
        if (res > 0) {
            let dupQuery = {mapid: parseInt(mapid)};
            whitelist.findOne(dupQuery, (err, wlres) => {
                console.log(wlres);
                if (err) {
                    console.log(err);
                    return message.channel.send("Error: Empty database response. Please try again!")
                }
                if (!wlres) {
                    let insertData = {
                        mapid: parseInt(mapid),
                        hashid: hashid,
                        mapname: mapstring
                    };
                    whitelist.insertOne(insertData, () => {
                        console.log("Whitelist entry added");
                        message.channel.send("Whitelist entry added | `" + mapstring + "`");
                        client.channels.cache.get("638671295470370827").send("Whitelist entry added | `" + mapstring + "`")
                    })
                }
                else {
                    let updateData = { $set: {
                        mapid: parseInt(mapid),
                        hashid: hashid,
                        mapname: mapstring
                    }};
                    whitelist.updateOne(dupQuery, updateData, () => {
                        console.log("Whitelist entry updated");
                        message.channel.send("Whitelist entry updated | `" + mapstring + "`");
                        client.channels.cache.get("638671295470370827").send("Whitelist entry updated | `" + mapstring + "`")
                    })
                }
            })
        }
        else message.channel.send("❎ **| I'm sorry, beatmap white-listing failed.**")
    })
};

async function whitelistInfo(client, link_in, hash_in, message, callback) {
    let beatmapid = "";
    let hashid = "";
    let query = {};
    if (link_in) { //Normal mode
        let line_sep = link_in.split('/');
        beatmapid = line_sep[line_sep.length-1];
        query = {beatmap_id: beatmapid}
    }
    if (hash_in) {hashid = hash_in; query = {hash: hashid}} //Override mode (use for fixed map)

    const mapinfo = await new osudroid.MapInfo().get(query).catch(console.error);
    if (!mapinfo.title || !mapinfo.objects) {
        message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API now. Please try again later!**");
        return callback(0)
    }
    beatmapid = mapinfo.beatmap_id;
    hashid = mapinfo.hash;
    let mapstring = mapinfo.full_title;
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
        .setColor(mapinfo.statusColor())
        .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
        .setTitle(mapinfo.showStatistics("", 0))
        .setDescription(mapinfo.showStatistics("", 1))
        .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
        .addField(mapinfo.showStatistics("", 2), mapinfo.showStatistics("", 3))
        .addField(mapinfo.showStatistics("", 4), `Star Rating: ${mapinfo.diff_total}`);

    message.channel.send({embed: embed}).catch(console.error);
    client.channels.cache.get("638671295470370827").send({embed: embed}).catch(console.error);
    callback(1, beatmapid, hashid, mapstring)
}

module.exports.config = {
    name: "whitelist",
    description: "Whitelists a beatmap.",
    usage: "whitelist <map link/map ID>",
    detail: "`map link/map ID`: The beatmap link or ID to whitelist [String]",
    permission: "pp-project Map Validator"
};