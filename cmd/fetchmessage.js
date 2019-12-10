module.exports.run = (client, message, args) => {
    if (message.author.id !== '386742340968120321') return message.channel.send("You don't have permission to do this");
    let guild = client.guilds.get("316545691545501706");
    let channel = guild.channels.find(c => c.name === 'voting');
    if (!channel) return;

    let startid = args[0];
    if (isNaN(startid)) return message.channel.send("Please enter valid message ID!");

    let limit = args[1];
    if (isNaN(limit)) return message.channel.send("Please enter valid limit!");

    let filter = args.slice(2).join(" ");
    if (!filter) return message.channel.send("Please insert filter!");

    channel.fetchMessages({limit: limit, after: startid}).then (msg => {
        console.log(msg.filter(m => m.content === filter && !m.author.bot));
    }).catch(() => message.channel.send("Message not found!"))
};

module.exports.help = {
    name: "fetchmessage"
};