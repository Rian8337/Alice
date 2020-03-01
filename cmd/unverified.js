const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message && (message.channel instanceof Discord.DMChannel || ![client.user.id, '386742340968120321', '132783516176875520'].includes(message.author.id))) return;
    let guild = client.guilds.get("316545691545501706");
    let channel = guild.channels.get("360716684174032896");
    let unverified = guild.members.filter(member => !member.roles.find(r => r.name === 'Member') && !member.user.bot);
    if (unverified.size == 0) {
        if (message && message.author.id != client.user.id) message.channel.send("❎ **| I'm sorry, I don't detect any unverified members!**");
        return
    }
    let count = 0;
    let unverified_db = alicedb.collection("unverified");
    for (const [snowflake, member] of unverified.entries()) {
        if (Date.now() - member.joinedTimestamp > 86400 * 1000 * 7) {
            count++;
            let join_date = member.joinedAt.toUTCString();
            member.kick(`Unverified prune (user joined at ${join_date})`).catch(console.error);
            unverified_db.findOne({discordid: member.id}, (err, res) => {
                if (err) console.log(err);
                if (res) unverified_db.deleteOne({discordid: member.id}, err => {
                    if (err) console.log(err);
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
                    let time_string = `${hour == 0 ? "" : `${hour} ${hour == 1 ? "hour" : "hours"}`}${minute == 0 ? "" : `, ${minute} ${minute == 1 ? "minute" : "minutes"}`}${second == 0 ? "" : `, ${second} ${second == 1 ? "second" : "seconds"}`}`;
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
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
