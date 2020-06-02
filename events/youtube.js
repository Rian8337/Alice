module.exports.run = (client, message, current_map) => {
    let msgArray = message.content.split(/\s+/g);
    for (let i = 0; i < msgArray.length; i++) {
        let msg = msgArray[i];
        if (!msg.startsWith("https://youtu.be/") && !msg.startsWith("https://youtube.com/watch?v=") && !msg.startsWith("https://www.youtube.com/watch?v=")) continue;
        let video_id;
        let a = msg.split("/");
        if (msg.startsWith("https://youtu.be")) video_id = a[a.length - 1];
        if (!video_id) {
            let params = a[a.length - 1].split("?");
            params = params[params.length - 1].split("&");
            for (let i = 0; i < params.length; i++) {
                let param = params[i];
                if (!param.startsWith("v=")) continue;
                video_id = param.slice(2);
                break;
            }
        }
        if (!video_id) continue;
        client.utils.get("youtube").run(client, message, video_id, current_map)
    }
};

module.exports.config = {
    name: "youtube"
};