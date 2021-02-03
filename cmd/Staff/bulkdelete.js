const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    const perms = message.channel.permissionsFor(message.member);
    if (!perms.any("MANAGE_MESSAGES")) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }

    const todelete = parseInt(args[0]);
    if (!todelete) {
        return message.channel.send("❎ **| Hey, I don't know the amount of messages to delete!**");
    }
    if (isNaN(todelete) || todelete < 2 || todelete > 100) {
        return message.channel.send("❎ **| I'm sorry, looks like the number of messages to delete is invalid. Must be in range of 2-100!**");
    }

    message.delete().then(() => {
        message.channel.bulkDelete(todelete).then(() => {
            const footer = config.avatar_list;
            const index = Math.floor(Math.random() * footer.length);
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
                .setDescription("**Bulk delete executed**")
                .setColor(message.member.roles.color?.hexColor || "#000000")
                .setTimestamp(new Date())
                .setFooter("Alice Synthesis Thirty", footer[index])
                .addField("Amount of messages", todelete);

            message.channel.send({embed: embed}).then(msg => {
                msg.delete({timeout: 10000});
            }).catch(console.error);
        });
    });
};

module.exports.config = {
    name: "bulkdelete",
    description: "Deletes a specified amount of messages.",
    usage: "bulkdelete <amount>",
    detail: "`amount`: Amount of messages to delete. Must be in range of 2-100. [Integer]",
    permission: "Manage Messages"
};