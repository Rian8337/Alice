let Discord = require('discord.js');

module.exports.run = (client, message, args, maindb) => {
    let uid = args[0];
    if (isNaN(uid)) return message.channel.send("❎ **| Hey, can you at least give me a valid uid?**");
    let binddb = maindb.collection("userbind");
    let query = {uid: uid};
    let embed = new Discord.RichEmbed()
        .setColor(message.member.highestRole.hexColor);

    binddb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm not receiving any response from database. Perhaps try again?**")
        }
        if (res[0]) {
            let discordid = res[0].discordid;
            embed.setDescription(`**Uid ${uid} is binded to <@${discordid}>**`);
            message.channel.send({embed: embed})
        }
        else {
            embed.setDescription(`**Uid ${uid} is not binded**`);
            message.channel.send({embed: embed})
        }
    })
};

module.exports.config = {
    description: "Checks if specific uid is binded.",
    usage: "usersearch <uid>",
    detail: "`uid`: The uid to check [Integer]",
    permission: "None"
};

module.exports.help = {
    name: "usersearch"
};
