let Discord = require('discord.js');

async function filterMessage(message, channel, filter, i, count, embed, startid) {
    let final = await channel.fetchMessages({limit: 100, after: startid});

    let lastid = final.first();
    if (!lastid) return message.channel.send(embed);
    lastid = lastid.id;
    console.log("Start ID: " + startid);
    console.log("Last ID: " + lastid);

    final = final.filter(m => m.content == filter && !m.author.bot);
    final.forEach(msg => {
        let link = `https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
        embed.addField(`${count}. ${msg.author.tag} (User ID: ${msg.author.id})`, `${msg.content}\n[Go to Message](${link})`);
        i++;
        count++;
        if (i >= 20) {
            message.channel.send(embed);
            i = 1;
            embed = new Discord.RichEmbed()
                .setTitle("Users who sent `" + filter + "`:")
                .setColor(message.member.highestRole.hexColor);
        }
    });
    return filterMessage(message, channel, filter, i, count, embed, lastid)
}

module.exports.run = async (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");
    let guild = client.guilds.get("316545691545501706");
    let channel = guild.channels.find(c => c.name === 'voting');
    if (!channel) return message.channel.send("Channel is not available");

    let startid = args[0];
    if (isNaN(startid)) return message.channel.send("Please enter valid message ID!");

    let filter = args.slice(1).join(" ");
    if (!filter) return message.channel.send("Please insert filter!");

    let embed = new Discord.RichEmbed()
        .setTitle("Users who sent `" + filter + "`:")
        .setColor(message.member.highestRole.hexColor);
    let i = 1;
    let count = 1;

    await filterMessage(message, channel, filter, i, count, embed, startid);
};

module.exports.help = {
    name: "fetchmessage"
};
