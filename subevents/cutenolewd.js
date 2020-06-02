const picture_cooldown = new Set();

module.exports.run = (client, message) => {
    if (message.attachments.size > 1) message.delete().catch(console.error);

    const images = [];
    for (let i = 0; i < msgArray.length; i++) {
        let part = msgArray[i];
        let length = part.length;
        if (!part.startsWith("http") && (part.indexOf("png", length - 3) === -1 && part.indexOf("jpg", length - 3) === -1 && part.indexOf("jpeg", length - 4) === -1 && part.indexOf("gif", length - 3) === -1)) continue;
        try {
            encodeURI(part)
        } catch (e) {
            continue
        }
        images.push(part)
    }
    if (images.length > 0 || message.attachments.size > 0) {
        if (picture_cooldown.has(message.author.id)) {
            client.commands.get("tempmute").run(client, message, [message.author.id, 600, `Please do not spam images in ${message.channel}!`])
        }
        else {
            picture_cooldown.add(message.author.id);
            setTimeout(() => {
                picture_cooldown.delete(message.author.id)
            }, 5000);
        }
        if (message.attachments.size <= 1) message.react("👍").then(() => message.react("👎").catch(console.error)).catch(console.error)
    }
};

module.exports.config = {
    name: "cutenolewd"
};