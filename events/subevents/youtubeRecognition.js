const { Client, Message } = require("discord.js");

/**
 * @param {Client} client 
 * @param {Message} message 
 * @param {[string, string][]} current_map 
 */
module.exports.run = (client, message, current_map) => {
    const ytRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*/;
    let msgArray = message.content.split(/\s+/g);
    for (let i = 0; i < msgArray.length; i++) {
        const msg = msgArray[i];
        const match = msg.match(ytRegex);
        if (!match) {
            continue;
        }
        const videoID = match[1];
        console.log(videoID);
        if (videoID) {
            client.utils.get("youtube").run(client, message, videoID, current_map);
        }
    }
};

module.exports.config = {
    name: "youtubeRecognition"
};