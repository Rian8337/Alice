const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

/**
 * @param {Discord.Guild} guild 
 * @param {Discord.User} user 
 * @param {Db} alicedb 
 */
module.exports.run = (guild, user, alicedb) => {
    alicedb.collection("punishmentconfig").findOne({guildID: guild.id}, async (err, res) => {
        if (err || !res) {
            return;
        }

        const channel = guild.channels.resolve(res.logChannel);
        if (!(channel instanceof Discord.TextChannel)) {
            return;
        }

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setTitle("Unban executed")
            .setThumbnail(user.avatarURL({ dynamic: true }))
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setTimestamp(new Date())
            .addField(`Unbanned user: ${user.tag}`, `User ID: ${user.id}`);

        channel.send({embed: embed});
    });
};

module.exports.config = {
    name: "unbanNotification"
};
