const Discord = require('discord.js');

module.exports.run = (client, alicedb) => {
    let guild = client.guilds.cache.get("316545691545501706");
    let channel = guild.channels.cache.get("360716684174032896");
    let unverified = guild.members.cache.filter((member) => !member.roles.cache.find((r) => r.name === 'Member') && !member.user.bot);
    if (unverified.size === 0) return;
    let count = 0;
    let unverified_db = alicedb.collection("unverified");
    for (const [, member] of unverified.entries()) {
        if (Date.now() - member.joinedTimestamp > 86400 * 1000 * 7) {
            count++;
            let join_date = member.joinedAt;
            member.kick(`Unverified prune${join_date != null ? `(user joined at ${join_date.toUTCString()})` : ""}`).catch(console.error);
            unverified_db.findOne({discordid: member.id}, (err, res) => {
                if (err) console.log(err);
                if (res) unverified_db.deleteOne({discordid: member.id}, err => {
                    if (err) console.log(err)
                })
            });
            continue
        }
        if (Date.now() - member.joinedTimestamp > 86400 * 1000 * 5) {
            unverified_db.findOne({discordid: member.id}, (err, res) => {
                if (err) console.log(err);
                if (!res) {
                    let verify_date = Math.floor((member.joinedTimestamp + 86400 * 1000 * 7 - Date.now()) / 1000);
                    let hour = Math.floor(verify_date / 3600);
                    let minute = Math.floor((verify_date - hour * 3600) / 60);
                    let second = verify_date - hour * 3600 - minute * 60;
                    let time_string = `${hour === 0 ? "" : `${hour} ${hour === 1 ? "hour" : "hours"}`}${minute === 0 ? "" : `, ${minute} ${minute === 1 ? "minute" : "minutes"}`}${second === 0 ? "" : `, ${second} ${second === 1 ? "second" : "seconds"}`}`;
                    channel.send(`❗**| ${member}, you have ${time_string} to verify before you get kicked for being unverified for too long!**`);
                    unverified_db.insertOne({discordid: member.id}, err => {
                        if (err) console.log(err)
                    })
                }
            })
        }
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
