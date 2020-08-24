const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
    let user = message.author;
    let rolecheck;
    try {
        rolecheck = message.member.roles.color.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    let embed = new Discord.MessageEmbed()
        .setColor(rolecheck)
        .setFooter("Alice Synthesis Thirty", footer[index]);

    if (args[0]) {
        user = args[0].replace("<@!", "").replace("<@", "").replace(">", "");
        if (isNaN(user)) return message.channel.send("❎ **| I'm sorry, that is not a valid user ID!**");
        user = await client.users.fetch(user);
        if (!user) return message.channel.send("❎ **| I'm sorry, I cannot find the user you are looking for!**")
    }
    embed.setAuthor(user.tag)
        .setDescription(`[Avatar Link](${user.avatarURL({dynamic: true, size: 1024})})`)
        .setImage(user.avatarURL({dynamic: true, size: 1024}));

    await message.channel.send({embed: embed})
};

module.exports.config = {
    name: "avatar",
    description: "Retrieves a user's avatar.",
    usage: "avatar [user]",
    detail: "`user`: UserResolvable (mention or user ID)",
    permission: "None"
};
