module.exports.run = (client, message, current_map) => {
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
        if (msgArray[i].indexOf("#osu/") !== -1 || msgArray[i].indexOf("/b/") !== -1 || msgArray[i].indexOf("/beatmaps/") !== -1) {
            client.utils.get("autocalc").run(client, message, msgArray.slice(i), current_map);
        } else if (msgArray[i].indexOf("/beatmapsets/") !== -1 || msgArray[i].indexOf("/s/") !== -1 || msgArray[i].indexOf("/m/") !== -1) {
            client.utils.get("autocalc").run(client, message, msgArray.slice(i), current_map, true);
        }
    }
};

module.exports.config = {
    name: "osuRecognition"
};
