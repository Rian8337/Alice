const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    if (!message.member.hasPermission("MANAGE_MESSAGES", {checkAdmin: true, checkOwner: true})) return message.channel.send("❎ **| I'm sorry, you don't have permission to do this.**");

    let todelete = parseInt(args[0]);
    if (!todelete) return message.channel.send("❎ **| Hey, I don't know the amount of messages to delete!**");
    if (isNaN(todelete) || todelete < 2 || todelete > 100) return message.channel.send("❎ **| I'm sorry, looks like the number of messages to delete is invalid. Must be in range of 2-100!**");

    message.author.lastMessage.delete().then(() => {
        message.channel.bulkDelete(todelete).then(() => {
            let footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            let rolecheck;
            try {
                rolecheck = message.member.roles.highest.hexColor
            } catch (e) {
                rolecheck = "#000000"
            }

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                .setDescription("**Bulk delete executed**")
                .setColor(rolecheck)
                .setTimestamp(new Date())
                .setFooter("Alice Synthesis Thirty", footer[index])
                .addField("Amount of messages", todelete);

            message.channel.send({embed: embed}).then(msg => {
                msg.delete({timeout: 10000})
            }).catch(console.error)
        })
    })
};

module.exports.config = {
    name: "bulkdelete",
    description: "Deletes a specified amount of messages.",
    usage: "bulkdelete <amount>",
    detail: "`amount`: Amount of messages to delete. Must be in range of 2-100. [Integer]",
    permission: "Manage Messages Permission"
};
