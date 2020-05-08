module.exports.run = async (client, alicedb) => {
    let unverifieddb = alicedb.collection("unverified");
    let guild = client.guilds.cache.get("316545691545501706");
    let curtime = Date.now();
    let unverified = guild.members.cache.filter((member) => !member.roles.cache.find((r) => r.name === 'Member') && !member.user.bot && (member.joinedTimestamp != null || member.joinedAt != null) && curtime - member.joinedTimestamp > 43200000);
    if (unverified.size === 0) return;
    let count = 0;
    for await (const [, member] of unverified.entries()) {
        unverifieddb.findOne({discordid: member.id}, (err, res) => {
            if (err) continue;
            count++;
            if (!res) {
                unverifieddb.insertOne({discordid: member.id}, err => {
                    if (!err) member.send("❗**| Hey, you have 12 hours left to verify yourself in osu!droid International Discord server! Please head to <#360716684174032896> and read the channel's pinned message for how to verify.**").catch(console.error);
                    continue
                })
            }
            else if (curtime - member.joinedTimestamp > 86400000) {
                unverifieddb.deleteOne({discordid: member.id}, err => {
                    if (err) continue;
                    member.kick(`Unverified prune (user joined at ${member.joinedAt.toUTCString()})`).catch(console.error);
                })
            }
        });
    }
    if (count > 0) console.log(`Pruned ${count} user(s)`)
};

module.exports.config = {
    name: "unverified",
    description: "Kicks users that are unverified for a week or longer after their join time.",
    usage: "None",
    detail: "None",
    permission: "None"
};
