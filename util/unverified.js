module.exports.run = async client => {
    let guild = client.guilds.cache.get("316545691545501706");
    let unverified = guild.members.cache.filter((member) => !member.roles.cache.find((r) => r.name === 'Member') && !member.user.bot);
    if (unverified.size === 0) return;
    let count = 0;
    for await (const [, member] of unverified.entries()) {
        if (member.joinedTimestamp == null || member.joinedAt == null) continue;
        if (Date.now() - member.joinedTimestamp < 86400000) continue;
        count++;
        member.kick(`Unverified prune (user joined at ${member.joinedAt.toUTCString()})`).catch(console.error);
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
