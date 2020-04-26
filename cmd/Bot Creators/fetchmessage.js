const Discord = require('discord.js');

async function filterMessage(message, filter, i, count, embed, startid) {
    let final = await message.channel.messages.fetch({limit: 100, after: startid});
    let lastid = final.first();
    if (!lastid) {
        console.log("Complete!");
        if (count === 1) return message.channel.send("No users have sent that message!");
        if (count % 25 !== 0) return message.channel.send(embed);
        else return
    }
    lastid = lastid.id;
    console.log("Start ID: " + startid);
    console.log("Last ID: " + lastid + "\n");

    final = final.filter((m) => m.content.toLowerCase() == filter && !m.author.bot);
    final.forEach(msg => {
        let d = new Date(msg.createdAt);
        d = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('/')+' '+ [d.getHours(), d.getMinutes().toString().padStart(2, "0"), d.getSeconds().toString().padStart(2, "0")].join(':');

        embed.addField(`${count}. ${msg.author.tag} (created at ${d} UTC)`, `${msg.author} | [Go to Message](${msg.url})\nUser ID: ${msg.author.id}`);
        i++;
        count++;

        if (i > 25) {
            message.channel.send(embed);
            i = 1;
            embed = new Discord.MessageEmbed()
                .setTitle("Users who sent `" + filter + "`:")
                .setColor(message.member.roles.highest.hexColor)
        }
    });
    return filterMessage(message, filter, i, count, embed, lastid)
}

module.exports.run = async (client, message, args) => {
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let startid = args[0];
    if (isNaN(startid)) return message.channel.send("❎ **| Please enter valid message ID!**");

    let filter = args.slice(1).join(" ");
    if (!filter) return message.channel.send("❎ **| Please insert filter!**");

    let embed = new Discord.MessageEmbed()
        .setTitle("Users who sent `" + filter + "`:")
        .setColor(message.member.roles.highest.hexColor);

    await filterMessage(message, filter, 1, 1, embed, startid);
};

module.exports.config = {
    name: "fetchmessage",
    description: "Fetches messages after a specified message with specific filter.",
    usage: "fetchmessage <id> <filter>",
    detail: "`id`: The message's ID [Snowflake (String)]\n`filter`: The filter to only search messages containing the filter [String]",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};