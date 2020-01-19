let Discord = require('discord.js');
let cd = new Set();
let config = require('../config.json');

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

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the question! I need to rest too, you know.**");
    if (!args[0]) return;
    let filterdb = alicedb.collection("responsefilter");
    let askdb = alicedb.collection("askcount");
    filterdb.find({name: "response"}).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        let like = res[0].like;
        let hate = res[0].hate;
        let badword = res[0].badwords;
        let response = res[0].response;
        const index = Math.max(1, Math.floor(Math.random() * (response.length - 1) + 1));
        let answer = response[index];
        let msg = args.join(" ");
        if (message.author.id == '386742340968120321') message.author.lastMessage.delete().catch(console.error);
        let factor = responseFactor(message, msg, like, hate, badword);
        console.log(factor);
        if (factor === 1) answer = "Yes, absolutely.";
        if (factor === 2) answer = "N... No! I would never think of that...";
        if (factor === 3) answer = "Um... Uh...";
        if (factor === 4) answer = "Uh, I don't think I want to answer that.";
        askdb.find({discordid: message.author.id}).toArray((err, askres) => {
            if (err) {
                console.log(err);
                return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
            }
            var count = 0;
            if (askres[0]) count = askres[0].count;
            let footer = config.avatar_list;
            const footerindex = Math.floor(Math.random() * (footer.length - 1) + 1);
            var rolecheck;
            try {
                rolecheck = message.member.highestRole.hexColor
            } catch (e) {
                rolecheck = "#000000"
            }

            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor(rolecheck)
                .setFooter("Alice Synthesis Thirty", footer[footerindex])
                .addField(`Question #${count + 1}`, `**Q**: ${msg}\n**A**: ${answer}`);

            message.channel.send({embed: embed}).catch(console.error);
            if (askres[0]) {
                var updateVal = {
                    $set: {
                        count: count + 1
                    }
                };
                askdb.updateOne({discordid: message.author.id}, updateVal, err => {
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
        })
    })
};

module.exports.config = {
    description: "Configuration for 8ball responses.",
    usage: "None",
    detail: "None",
    permission: "None"
};

module.exports.help = {
    name: "response"
};
