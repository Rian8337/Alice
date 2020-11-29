const Discord = require('discord.js');
const config = require('../../config.json');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
module.exports.run = async (client, message, args) => {
    if (message.channel instanceof Discord.DMChannel) return message.channel.send("This command is not avaiable in DMs");
    if (!message.member.roles.cache.find((r) => r.name === 'Moderator')) return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");

    let logchannel = message.guild.channels.cache.find((c) => c.name === config.management_channel);
    if (!logchannel) return message.channel.send(`Please create #${config.management_channel} first!`);

    const tokick = await message.guild.members.fetch(message.mentions.users.first() || args[0]).catch(console.error);
    if (!tokick) return message.channel.send("❎ **| I can't find the user. Can you make sure you have entered a correct one?**");

    let immune = config.mute_immune;
    for (let i = 0; i < immune; i++) if (tokick.roles.cache.has(immune[i])) return message.channel.send("❎ **| I'm sorry, this user cannot be kicked!**");

    let reason = args.slice(1).join(" ");
    if (!reason) reason = 'Not specified.';

    message.channel.send(`❗**| ${message.author}, are you sure you want to kick the user?**`).then(msg => {
        msg.react("✅").catch(console.error);
        let confirmation = false;
        let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});

        confirm.on("collect", () => {
            confirmation = true;
            msg.delete();
            tokick.kick(reason).then(() => {
                let embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .setColor(message.member.roles.color.hexColor)
                    .setTimestamp(new Date())
                    .setTitle("Kick executed")
                    .addField("Kicked user: " + tokick.user.username, "User ID: " + tokick.id)
                    .addField("=========================", "Reason:\n" + reason);
        
                logchannel.send({embed: embed})
            })
        });

        confirm.on("end", () => {
            if (!confirmation) {
                msg.delete();
                message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
            }
        })
    })
};

module.exports.config = {
    name: "kick",
    description: "Kicks a user.",
    usage: "kick <user> [reason]",
    detail: "`user`: The user to kick [UserResolvable (mention or user ID)]\n`reason`: Reason for kicking [String]",
    permission: "Moderator"
};
