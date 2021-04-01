const Discord = require('discord.js');
const config = require('../config.json');

function responseFactor(message, msg, like, hate, badword) {
    let res = 0;
    if (message.author.id == '386742340968120321') {
        like.forEach(word => {
            if (msg.includes(word)) res = 1
        });
        hate.forEach(word => {
            if (msg.includes(word)) res = 2
        });
        badword.forEach(word => {
            if (msg.toLowerCase().includes(word)) res = 3
        })
    }
    else badword.forEach(word => {
            if (msg.toLowerCase().includes(word)) res = 4
    });
    return res
}

module.exports.run = (message, args, alicedb) => {
    if (!args[0]) return;
    let filterdb = alicedb.collection("responsefilter");
    let askdb = alicedb.collection("askcount");
    filterdb.findOne({name: "response"}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        let like = res.like;
        let hate = res.hate;
        let badword = res.badwords;
        let response = res.response;
        const index = Math.max(1, Math.floor(Math.random() * response.length));
        let answer = response[index];
        let msg = args.join(" ");
        if (message.author.id == '386742340968120321') message.author.lastMessage.delete().catch(console.error);
        let factor = responseFactor(message, msg, like, hate, badword);
        if (factor === 1) answer = "Yes, absolutely.";
        if (factor === 2) answer = "N... No! I would never think of that...";
        if (factor === 3) answer = "Um... Uh...";
        if (factor === 4) answer = "Uh, I don't think I want to answer that.";
        askdb.findOne({discordid: message.author.id}, (err, askres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            let count = 0;
            if (askres) count = askres.count;
            let footer = config.avatar_list;
            const footerindex = Math.floor(Math.random() * footer.length);
            let rolecheck;
            try {
                rolecheck = message.member.roles.color.hexColor
            } catch (e) {
                rolecheck = "#000000"
            }

            let embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                .setColor(rolecheck)
                .setFooter("Alice Synthesis Thirty", footer[footerindex])
                .setDescription(`**Q**: ${msg}\n**A**: ${answer}`);

            message.channel.send({embed: embed}).catch(console.error);
            if (askres) {
                let updateVal = {
                    $set: {
                        count: count + 1
                    }
                };
                askdb.updateOne({discordid: message.author.id}, updateVal, err => {
                    if (err) return console.log(err);
                });
            }
            else {
                let insertVal = {
                    discordid: message.author.id,
                    count: 1
                };
                askdb.insertOne(insertVal, err => {
                    if (err) return console.log(err);
                });
            }
        });
    });
};

module.exports.config = {
    name: "response",
    description: "Configuration for 8ball responses.",
    usage: "None",
    detail: "None",
    permission: "None"
};