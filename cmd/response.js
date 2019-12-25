let Discord = require('discord.js');
let config = require("../config.json");
let cd = new Set();
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
    if (msg.toLowerCase().includes("rian") || msg.toLowerCase().includes("you")) res = 4;
    let badword = config.responses.badword;
    badword.forEach((word) => {
        if (msg.toLowerCase().includes(word)) res = 4
    });
    return res
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the question! I need to rest too, you know.**");
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
    console.log(factor);

    if (factor === 1) answer = "Yes, absolutely.";
    if (factor === 2) answer = "N... No! I would never think of that...";
    if (factor === 3) answer = "Um... Uh...";
    if (factor === 4) answer = "Uh, I don't think I want to answer that.";

    const embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(message.member.highestRole.hexColor)
        .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
        .addField(`**Q**: ${msg}`, `**A**: ${answer}`);

    message.channel.send({embed: embed});

    let askdb = alicedb.collection("askcount");
    let query = {discordid: message.author.id};
    askdb.find(query).toArray((err, res) => {
        if (err) return console.log(err);
        if (res[0]) {
            var count = parseInt(res[0].count) + 1;
            var updateVal = {
                $set: {
                    discordid: message.author.id,
                    count: count
                }
            };
            askdb.updateOne(query, updateVal, err => {
                if (err) return console.log(err);
                console.log("Ask data updated")
            })
        }
        else {
            var insertVal = {
                discordid: message.author.id,
                count: 1
            };
            askdb.insertOne(insertVal, err => {
                if (err) return console.log(err);
                console.log("Ask data updated")
            })
        }
    });
    cd.add(message.author.id);
    setTimeout(() => {
        cd.delete(message.author.id)
    }, 2000)
};

module.exports.config = {
    description: "List of 8ball responses.",
    usage: "None",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "response"
};
