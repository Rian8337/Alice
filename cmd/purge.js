module.exports.run = (client, message) => {
    if (message.member.highestRole.name !== "Owner") return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this.**");
    let time = Math.floor(Date.now() / 1000);
    let members = message.guild.members.filter(m => !m.roles.has("353397345636974593") && !m.user.bot);
    console.log(members.find(m => m.user.username === '2003'))
    /*var membercount = 0;
    var kickcount = 0;
    members.forEach(member => {
        if (time - member.joinedTimestamp > 604800) {
            member.kick("Not verified after a week or more").catch(console.error);
            kickcount++
        }
        membercount++;
        if (membercount == members.size) message.channel.send("✅ **| Successfully kicked " + kickcount + " unverified  members!")
    })*/
};

module.exports.config = {
    description: "Purges members that are unverified (not assigned to any role) for more than a week.\n**Do not use this if you don't have a role-verification system in your server.**",
    usage: "purge",
    detail: "None",
    permission: "Owner"
};

module.exports.help = {
    name: "purge"
};
