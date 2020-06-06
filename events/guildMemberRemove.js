module.exports.run = (client, member, maindb) => {
    if (member.guild.id !== '316545691545501706') return;
    client.subevents.get("clancheck").run(client, member, maindb)
};

module.exports.config = {
    name: "guildMemberRemove"
};