let Discord = require('discord.js');
let config = require('../config.json');

module.exports.run = (client, message, args) => {
    try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not available in DMs");
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have permission to do this");

    let todelete = parseInt(args[0]);
    if (!todelete) return message.channel.send("Please specify number of messages to delete");
    if (isNaN(todelete)) return message.channel.send("Invalid number of messages to delete");
    if (todelete < 2 || todelete > 100) return message.channel.send("Invalid number of messages to delete, must be in range of 2-100");

    message.author.lastMessage.delete().then (() => {
        message.channel.bulkDelete(todelete).then(() => {
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * (footer.length - 1) + 1);

            const embed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setDescription("**Bulk delete executed**")
                .setColor(message.member.highestRole.hexColor)
                .setTimestamp(new Date())
                .setFooter("Alice Synthesis Thirty", footer[index])
                .addField("Amount of messages", todelete);

            message.channel.send({embed}).then(msg => {
                msg.delete(10000)
            }).catch(e => console.log(e))
        })
    })
};

module.exports.config = {
    description: "Deletes a specified amount of messages.",
    usage: "bulkdelete <amount of messages to delete>",
    detail: "Amount of messages must be an integer between 2 and 100.",
    permission: "Manage Messages"
};

module.exports.help = {
    name: "bulkdelete"
};
