let Discord = require('discord.js');

async function filterMessage(message, filter, i, count, embed, startid) {
    let final = await message.channel.fetchMessages({limit: 100, after: startid});
    let lastid = final.first();
    if (!lastid) {
        console.log("Complete!");
        if (count % 25 !== 0) return message.channel.send(embed);
        else return
    }
    lastid = lastid.id;
    console.log("Start ID: " + startid);
    console.log("Last ID: " + lastid + "\n");

    final = final.filter(m => m.content.toLowerCase() == filter && !m.author.bot);
    final.forEach(msg => {
        let d = new Date(msg.createdAt);
        d = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('/')+' '+ [d.getHours(), d.getMinutes().toString().padStart(2, "0"), d.getSeconds().toString().padStart(2, "0")].join(':');

        embed.addField(`${count}. ${msg.author.tag} (created at ${d} UTC)`, `${msg.author} | [Go to Message](${msg.url})\nUser ID: ${msg.author.id}`);
        i++;
        count++;

        if (i > 25) {
            message.channel.send(embed);
            i = 1;
            embed = new Discord.RichEmbed()
                .setTitle("Users who sent `" + filter + "`:")
                .setColor(message.member.highestRole.hexColor);
        }
    });
    return filterMessage(message, filter, i, count, embed, lastid)
}

module.exports.run = async (client, message, args) => {
    try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
    if (!message.member.roles.find(r => r.name === 'Owner')) return message.channel.send("❎  **| I'm sorry, you don't have the permission to use this.**");

    let startid = args[0];
    if (isNaN(startid)) return message.channel.send("Please enter valid message ID!");

    let filter = args.slice(1).join(" ");
    if (!filter) return message.channel.send("Please insert filter!");

    let embed = new Discord.RichEmbed()
        .setTitle("Users who sent `" + filter + "`:")
        .setColor(message.member.highestRole.hexColor);
    let i = 1;
    let count = 1;

    await filterMessage(message, filter, i, count, embed, startid);
};

module.exports.help = {
    name: "fetchmessage"
};
