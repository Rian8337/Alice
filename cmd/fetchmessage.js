let Discord = require('discord.js');

module.exports.run = async (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");

    let startid = args[0];
    if (isNaN(startid)) return message.channel.send("Please enter valid message ID!");

    let limit = args[1];
    if (isNaN(limit)) return message.channel.send("Please enter valid limit!");
    if (limit < 0 || limit > 100) return message.channel.send("Limit must be in range of 1-100");

    let filter = args.slice(2).join(" ");
    if (!filter) return message.channel.send("Please insert filter!");

    let embed = new Discord.RichEmbed()
        .setTitle("Users who sent `" + filter + "`:")
        .setColor(message.member.highestRole.hexColor);
    let i = 1;

    let final = await message.channel.fetchMessages({limit: limit, after: startid});

    let lastid = final.first().id;
    embed.setFooter(`Last message ID: ${lastid}`);

    final = final.filter(m => m.content == filter && !m.author.bot);
    final.forEach(msg => {
        embed.addField(`${i}. ${msg.author.tag} (Message ID: ${msg.id})`, msg.content);
        i++
    });
    await message.channel.send({embed})
};

module.exports.help = {
    name: "fetchmessage"
};
