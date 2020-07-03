const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = async (guild, user) => {
    const auditLog = await guild.fetchAuditLogs({user: user, limit: 1, type: "MEMBER_BAN_REMOVE"}).entries.first();
    const executor = auditLog.executor;
    const reason = auditLog.reason ? auditLog.reason : "Not specified.";
    
    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setTitle("Unban executed")
        .setAuthor(executor.tag, executor.avatarURL({dynamic: true}))
        .setThumbnail(user.avatarURL({dynamic: true}))
        .setFooter("Alice Synthesis Thirty", footer[index])
        .setTimestamp(new Date())
        .addField(`Banned user: ${user.tag}`, `User ID: ${user.id}`)
        .addField("=========================", `Reason: ${reason}`);
        
    guild.channels.cache.find(c => c.name === config.management_channel).send({embed: embed})
};

module.exports.config = {
    name: "unbanNotification"
};