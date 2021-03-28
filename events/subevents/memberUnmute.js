const { GuildMember } = require("discord.js");
const { Db } = require("mongodb");
const { prefix } = require('../../config.json');

/**
 * @param {GuildMember} oldMember 
 * @param {GuildMember} newMember 
 * @param {Db} alicedb
 */
module.exports.run = (oldMember, newMember, alicedb) => {
    const muteRole = oldMember.guild.roles.cache.find(r => r.name === "elaina-muted");

    if (!muteRole) {
        return;
    }

    if (!oldMember.roles.cache.has(muteRole.id) || newMember.roles.cache.has(muteRole.id)) {
        return;
    }

    const muteDb = alicedb.collection("punishmentconfig");
    muteDb.findOne({guildID: oldMember.guild.id}, (err, res) => {
        if (err || !res) {
            return;
        }

        const { currentMutes } = res;

        if (!currentMutes) {
            return;
        }

        const muteEntry = currentMutes.find(v => v.userID === oldMember.id);
        if (!muteEntry) {
            return;
        }

        setTimeout(async () => {
            const auditLogEntries = await newMember.guild.fetchAuditLogs({user: newMember, limit: 1, type: "MEMBER_ROLE_UPDATE"});
            if (auditLogEntries.entries.size === 0) {
                return;
            }
            const auditLogEntry = auditLogEntries.entries.first();
            if (auditLogEntry.executor.bot) {
                return;
            }

            if (muteEntry.muteEndTime > Math.floor(Date.now() / 1000)) {
                newMember.roles.add(muteRole, `Mute time isn't over, please use ${prefix}unmute to unmute the user!`);
            }
        }, 1000);
    });
};

module.exports.config = {
    name: "memberUnmute"
};