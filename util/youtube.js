const request = require('request');
const youtube_key = process.env.YOUTUBE_API_KEY;

module.exports.run = (client, message, video_id, current_map) => {
    let url = `https://www.googleapis.com/youtube/v3/videos?key=${youtube_key}&part=snippet&id=${video_id}`;
    request(url, (err, response, data) => {
        if (!data) return;

        let info;
        try {
            info = JSON.parse(data);
        } catch (e) {
            return
        }
        let items = info.items[0].snippet;
        let description = items.description;
        let desc_entry = description.split("\n");

        for (let i = 0; i < desc_entry.length; i++) {
            let entry = desc_entry[i];
            if (entry.indexOf("https://osu.ppy.sh/") === -1 && entry.indexOf("https://bloodcat.com/osu/s/") === -1) continue;
            entry = entry.replace("\r", "");

            let link_entry = entry.split(" ");
            for (let i = 0; i < link_entry.length; i++) {
                let msg = link_entry[i];
                if (!msg.startsWith("https://osu.ppy.sh/") && !msg.startsWith("https://bloodcat.com/osu/s/")) continue;
                let a = msg.split("/");
                let id = parseInt(a[a.length - 1]);
                if (isNaN(id)) continue;
                if (msg.indexOf("#osu/") !== -1 || msg.indexOf("/b/") !== -1 || msg.indexOf("/beatmaps/") !== -1) client.utils.get("autocalc").run(client, message, [msg], current_map);
                else if (msg.indexOf("/beatmapsets/") !== -1 || msg.indexOf("/s/") !== -1) client.utils.get("autocalc").run(client, message, [msg], current_map, true)
            }
        }
    })
};

module.exports.config = {
    name: "youtube",
    description: "Utility to detect map links from a YouTube video.",
    usage: "None",
    detail: "None",
    permission: "None"
};