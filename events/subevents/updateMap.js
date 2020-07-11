const osudroid = require('osu-droid');

module.exports.run = async (message, current_map) => {
    const embed = message.embeds[0];
    const author = embed.author;
    if (!author) return;

    const url = author.url;
    if (!url || !url.includes("https://osu.ppy.sh/b/")) return;
    
    const a = url.split("/");
    const beatmap_id = parseInt(a[a.length - 1]);
    if (isNaN(beatmap_id)) return;

    const mapinfo = await new osudroid.MapInfo().get({beatmap_id: beatmap_id});
    if (!mapinfo.title) return;

    const entry = [message.channel.id, mapinfo.hash];
    const map_index = current_map.findIndex(map => map[0] === message.channel.id);
    if (map_index === -1) current_map.push(entry);
    else current_map[map_index][1] = mapinfo.hash;
};

module.exports.config = {
    name: "updateMap"
};