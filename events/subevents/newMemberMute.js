const { GuildMember, TextChannel } = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {GuildMember} member 
 * @param {Db} alicedb 
 */
module.exports.run = (member, alicedb) => {
    const punishmentDb = alicedb.collection("punishmentconfig");
    const guildQuery = {guildID: member.guild.id};
    const muteRole = member.guild.roles.cache.find(r => r.name === "elaina-muted");

    punishmentDb.findOne(guildQuery, async (err, res) => {
        if (err) {
            return console.log(err);
        }
        if (!res) {
            return;
        }

        const currentMutes = res.currentMutes ?? [];
        const mute = currentMutes.find(v => v.userID === member.id);

        if (!mute) {
            return;
        }

        if (!muteRole) {
            await punishmentDb.updateOne(guildQuery, {$pull: {currentMutes: {userID: member.id}}});
            return;
        }
        
        const endTime = mute.muteEndTime;

        if (endTime === Number.POSITIVE_INFINITY) {
            await member.roles.add(muteRole);
            return;
        }

        // Just end mute if time left is less than 5 seconds
        if (endTime - Math.floor(Date.now() / 1000) < 5) {
            await punishmentDb.updateOne(guildQuery, {$pull: {currentMutes: {userID: member.id}}});
            return;
        }

        const logChannel = member.guild.channels.resolve(mute.logChannelID);
        if (!(logChannel instanceof TextChannel)) {
            await punishmentDb.updateOne(guildQuery, {$pull: {currentMutes: {userID: member.id}}});
            return;
        }

        const logMessage = await logChannel.messages.fetch(mute.logMessageID).catch();
        if (!logMessage) {
            await punishmentDb.updateOne(guildQuery, {$pull: {currentMutes: {userID: member.id}}});
            return;
        }

        await member.roles.add(muteRole);
        const muteEmbed = logMessage.embeds[0];
        setTimeout(async () => {
            await member.roles.remove(muteRole);
            muteEmbed.setFooter(muteEmbed.footer.text + " | User unmuted", muteEmbed.footer.iconURL);
            logMessage.edit(muteEmbed);
            await punishmentDb.updateOne(guildQuery, {$pull: {currentMutes: {userID: member.id}}});
        }, endTime * 1000 - Date.now());
    });
};

module.exports.config = {
    name: "newMemberMute"
};