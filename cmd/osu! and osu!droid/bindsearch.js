const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb) => {
    const uid = args[0];
    if (isNaN(uid)) return message.channel.send("❎ **| Hey, can you at least give me a valid uid?**");
    const binddb = maindb.collection("userbind");
    const query = {previous_bind: {$all: [uid.toString()]}};
    let rolecheck;
    try {
        rolecheck = message.member.roles.color.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    const embed = new Discord.MessageEmbed()
        .setColor(rolecheck);

    binddb.findOne(query, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm not receiving any response from database. Perhaps try again?**")
        }
        if (!res) {
            embed.setDescription(`**Uid ${uid} is not binded**`);
            return message.channel.send({embed: embed})
        }
        const bind = `Uid ${uid} is binded to <@${res.discordid}>.\nUser ID: ${res.discordid}`;
        embed.setDescription(`**${bind}**`);
        message.channel.send({embed: embed}).catch(console.error)
    })
};

module.exports.config = {
    name: "bindsearch",
    description: "Checks if specific uid is binded to a Discord account.",
    usage: "bindsearch <uid>",
    detail: "`uid`: The uid to check [Integer]",
    permission: "None"
};
