let Discord = require('discord.js');

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return;
    let todelete = parseInt(args[0]);
    if (!todelete) {
        message.channel.send("Please specify number of messages to delete");
        return;
    }
    if (isNaN(todelete)) {
        message.channel.send("Invalid number of messages to delete");
        return;
    }
    if (todelete < 2 || todelete > 100) {
        message.channel.send("Invalid number of messages to delete, must be in range of 2-100");
        return;
    }
    message.author.lastMessage.delete().catch(e => console.log(e));
    message.channel.bulkDelete(todelete).then (() => {
        const embed = new Discord.RichEmbed()
          .setAuthor(message.author.tag, message.author.avatarURL)
          .setDescription("**Bulk delete executed**")
          .setColor(message.member.highestRole.hexColor)
          .setTimestamp(new Date())
          .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
          .addField("Amount of messages", todelete);

      message.channel.send({embed})
  })
};

module.exports.help = {
    name: "bulkdelete"
};
