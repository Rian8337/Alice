const Discord = require('discord.js');
const config = require('../../config.json');
const osudroid = require('osu-droid');

module.exports.run = async (client, message, args, maindb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not allowed in DMs.**");
    }
    if (!message.isOwner && message.author.id !== "293340533021999105") {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    }

    let whitelist = maindb.collection("mapwhitelist");
    let link_in = args[0];
    let hash_in = args[1];
    await whitelistInfo(link_in, hash_in, message, (res, mapid = "", hashid = "", mapstring = "") => {
        if (res > 0) {
            let dupQuery = {mapid: parseInt(mapid)};
            whitelist.findOne(dupQuery, (err, wlres) => {
                console.log(wlres);
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!wlres) return message.channel.send("❎ **| I'm sorry, the beatmap is not whitelisted!**");
                let updateData = { $set: {
                        mapid: parseInt(mapid),
                        hashid: hashid,
                        mapname: mapstring
                    }};
                try {
                    whitelist.deleteOne(dupQuery, updateData, () => {
                        console.log("Whitelist entry removed");
                        message.channel.send("Whitelist entry removed | `" + mapstring + "`");
                    });
                } catch (e) {}
            });
        }
        else message.channel.send("Beatmap white-listing failed");
    });
};

async function whitelistInfo(link_in, hash_in, message, callback) {
    let beatmapid = "";
    let hashid = "";
    let query = {};
    if (link_in) { //Normal mode
        let line_sep = link_in.split('/');
        beatmapid = line_sep[line_sep.length-1];
        query = {beatmapID: beatmapid};
    }
    if (hash_in) {
        hashid = hash_in;
        query = {hash: hashid};
    } //Override mode (use for fixed map)

    const mapinfo = await osudroid.MapInfo.getInformation(query);

    if (mapinfo.error) {
        message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu! API now. Please try again later!**");
        return callback(0);
    }
    if (!mapinfo.title || !mapinfo.objects) {
        message.channel.send("❎ **| I'm sorry, I couldn't find the beatmap!**");
        return callback(0);
    }
    beatmapid = mapinfo.beatmapID;
    hashid = mapinfo.hash;
    let mapstring = mapinfo.showStatistics("", 0);
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapsetID}.jpg`)
        .setColor(mapinfo.statusColor())
        .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
        .setTitle(mapstring)
        .setDescription(mapinfo.showStatistics("", 1))
        .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmapID}`)
        .addField(mapinfo.showStatistics("", 2), mapinfo.showStatistics("", 3))
        .addField(mapinfo.showStatistics("", 4), `Star Rating: ${mapinfo.totalDifficulty}`);

    message.channel.send({embed: embed}).catch(console.error);
    callback(1, beatmapid, hashid, mapstring);
}

module.exports.config = {
    name: "unwhitelist",
    description: "Unwhitelists a beatmap.",
    usage: "unwhitelist <map link/map ID>",
    detail: "`map link/map ID`: The beatmap link or ID to unwhitelist [String]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};