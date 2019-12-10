let Discord = require('discord.js');
let config = require("../config.json");

let like = config.responses.like;
let hate = config.responses.hate;
let response = config.responses.response;

function responseFactor(msg) {
    let res = 0;
    like.forEach((word) => {
        if (msg.includes(word)) res = 1
    });
    hate.forEach((word) => {
        if (msg.includes(word)) res = 2
    });
    let badword = config.responses.badword;
    badword.forEach((word) => {
       if (msg.toLowerCase().includes(word)) res = 3
    });
    return res
}

function responsefactor(msg) {
    let res = 0;
    if (msg.toLowerCase().includes("rian")) res = 4;
    let badword = config.responses.badword;
    badword.forEach((word) => {
        if (msg.toLowerCase().includes(word)) res = 4
    });
    return res
}

module.exports.run = (client, message, args) => {
    if (!args[0]) return;
    let factor = 0;
    const index = Math.floor(Math.random() * (response.length - 1) + 1);
    let answer = response[index];
    let msg = args.join(" ");
    if (message.author.id == '386742340968120321') {
        message.author.lastMessage.delete().then (() => {
            factor = responseFactor(msg)
        })
    }
    else factor = responsefactor(msg);

    if (factor === 1) answer = "Yes, absolutely.";
    if (factor === 2) answer = "N... No! I would never think of that...";
    if (factor === 3) answer = "Um... Uh...";
    if (factor === 4) answer = "Uh, I don't think I want to answer that.";

    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * (footer.length - 1) + 1)
    const embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(message.member.highestRole.hexColor)
        .setFooter("Alice Synthesis Thirty", footer[index])
        .addField(`**Q**: ${msg}`, `**A**: ${answer}`);

    message.channel.send({embed})
};

module.exports.help = {
    name: "response"
};
