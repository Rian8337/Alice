const { Client, Message } = require("discord.js");

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {[string, string][]} current_map 
 * @param {boolean} calculate 
 */
module.exports.run = (client, message, current_map, calculate) => {
    let msgArray = message.content.split(/\s+/g);
    for (let i = 0; i < msgArray.length; i++) {
        if (!msgArray[i].startsWith("https://osu.ppy.sh/") && !msgArray[i].startsWith("https://bloodcat.com/osu")) {
            continue;
        }
        let a = msgArray[i].split("/");
        let id = parseInt(a[a.length - 1]);
        if (isNaN(id)) {
            continue;
        }
        const map_index = current_map.findIndex(map => map[0] === message.channel.id);
        if (map_index === -1) {
            current_map.push([message.channel.id, mapinfo.hash]);
        } else {
            current_map[map_index][1] = mapinfo.hash;
        }
        if (calculate) {
            if (msgArray[i].indexOf("#osu/") !== -1 || msgArray[i].indexOf("/b/") !== -1 || msgArray[i].indexOf("/beatmaps/") !== -1) {
                client.utils.get("autocalc").run(client, message, msgArray.slice(i));
            } else if (msgArray[i].indexOf("/beatmapsets/") !== -1 || msgArray[i].indexOf("/s/") !== -1 || msgArray[i].indexOf("/m/") !== -1) {
                client.utils.get("autocalc").run(client, message, msgArray.slice(i), true);
            }
        }
    }
};

module.exports.config = {
    name: "osuRecognition"
};
