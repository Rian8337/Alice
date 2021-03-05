const { Client, TextChannel } = require("discord.js");
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, alicedb) => {
    const muteDb = alicedb.collection("punishmentconfig");
    const muteEntries = await muteDb.find({}, {projection: {_id: 0, guildID: 1, currentMutes: 1}}).toArray();

    for await (const entry of muteEntries) {
        const guild = await client.guilds.fetch(entry.guildID).catch();

        if (!guild) {
            continue;
        }

        const muteRole = guild.roles.cache.find(r => r.name === "elaina-muted");
        if (!muteRole) {
            continue;
        }

        const currentMutes = entry.currentMutes ?? [];
        const guildQuery = {guildID: entry.guildID};

        for await (const currentMute of currentMutes) {
            const guildUpdateQuery = {$pull: {currentMutes: {userID: currentMute.userID}}};
            const guildMember = await guild.members.fetch(currentMute.userID).catch();
            if (!guildMember) {
                await muteDb.updateOne(guildQuery, guildUpdateQuery);
                continue;
            }

            guildUpdateQuery.$pull.currentMutes.userID = guildMember.id;
            const endTime = currentMute.muteEndTime;

            // Just end mute if time left is less than 10 seconds
            if (endTime - Math.floor(Date.now() / 1000) < 10) {
                await guildMember.roles.remove(muteRole);
                await muteDb.updateOne(guildQuery, guildUpdateQuery);
                continue;
            }

            const logChannel = guild.channels.resolve(currentMute.logChannelID);

            if (!(logChannel instanceof TextChannel)) {
                await guildMember.roles.remove(muteRole);
                await muteDb.updateOne(guildQuery, guildUpdateQuery);
                continue;
            }

            const logMessage = await logChannel.messages.fetch(currentMute.logMessageID).catch();
            if (!logMessage) {
                await guildMember.roles.remove(muteRole);
                await muteDb.updateOne(guildQuery, guildUpdateQuery);
                continue;
            }

            const muteEmbed = logMessage.embeds[0];
            setTimeout(async () => {
                await guildMember.roles.remove(muteRole);
                muteEmbed.setFooter(muteEmbed.footer.text + " | User unmuted", muteEmbed.footer.iconURL);
                logMessage.edit(muteEmbed);
                await muteDb.updateOne(guildQuery, guildUpdateQuery);
            }, endTime * 1000 - Date.now());
        }
    }
};

module.exports.config = {
    name: "muteResume"
};