module.exports.run = message => {
    const images = [
        "https://cdn.discordapp.com/attachments/440319362407333939/666825359198519326/unknown.gif",
        "https://cdn.discordapp.com/attachments/316545691545501706/667287014152077322/unknown.gif",
        "https://cdn.discordapp.com/attachments/635532651779981313/666825419298701325/unknown.gif",
        "https://cdn.discordapp.com/attachments/635532651779981313/662844781327810560/unknown.gif",
        "https://cdn.discordapp.com/attachments/635532651779981313/637868500580433921/unknown.gif"
    ];
    const index = Math.floor(Math.random() * (images.length - 1) + 1);
    message.channel.send({files: [images[index]]}).catch(console.error)
};

module.exports.config = {
    name: "brbshower"
};