module.exports.run = client => {
    let guild = client.guilds.cache.get("316545691545501706");
    let unverified = guild.members.cache.filter((member) => !member.roles.cache.find((r) => r.name === 'Member') && !member.user.bot);
    if (unverified.size === 0) return;
    let count = 0;
    for (const [, member] of unverified.entries()) {
        if (Date.now() - member.joinedTimestamp < 86400000) continue;
        count++;
        let join_date = member.joinedAt;
        member.kick(`Unverified prune${join_date instanceof Date ? ` (user joined at ${join_date.toUTCString()})` : ""}`).catch(console.error);
    }
    if (count > 0) console.log(`Pruned ${count} user(s)`)
};

module.exports.config = {
    name: "unverified",
    description: "Kicks users that are unverified for a day or longer after their join time.",
    usage: "None",
    detail: "None",
    permission: "None"
};
