const Discord = require('discord.js');
const {createCanvas} = require('canvas');
const canvas = createCanvas(200, 200);
const c = canvas.getContext('2d');
c.imageSmoothingQuality = "high";

module.exports.run = (client, message, args) => {
    const color = args[0];
    if (!(/^#[0-9A-F]{6}$/i.test(color))) return message.channel.send("❎ **| I'm sorry, that doesn't look like a valid hex code color!**");
    c.fillStyle = color;
    c.fillRect(0, 0, 200, 200);
    const attachment = new Discord.MessageAttachment(canvas.toBuffer());
    message.channel.send(`✅ **| ${message.author}, showing color with hex code \`${color}\`:**`, {files: [attachment]})
};

module.exports.config = {
	name: "color",
	description: "Sends a color based on given hex code.",
	usage: "color <hex code>",
	detail: "`hex code`: The hex code of the color [String]",
	permission: "None"
};