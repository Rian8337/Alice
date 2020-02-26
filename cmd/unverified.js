const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message && (message.channel instanceof Discord.DMChannel || ![client.user.id, '386742340968120321', '132783516176875520'].includes(message.author.id))) return;
    let guild = client.guilds.get("316545691545501706");
    let channel = guild.channels.get("360716684174032896");
    let unverified = guild.members.filter(member => !member.roles.find(r => r.name === 'Member') && !member.user.bot);
    if (unverified.size == 0) {
        if (message.author.id != client.user.id) message.channel.send("❎ **| I'm sorry, I don't detect any unverified members!**");
        return
    }
    let i = 0;
    let count = 0;
    let unverified_db = alicedb.collection("unverified");
    unverified.forEach((member) => {
        let kicked = false;
        if (Date.now() - member.joinedTimestamp > 86400 * 1000 * 7) {
            count++;
            kicked = true;
            member.kick(`Unverified prune (user joined at ${new Date(member.joinedTimestamp).toUTCString()})`).catch(console.error);
            unverified_db.find({discordid: member.id}).toArray((err, res) => {
                if (err) console.log(err);
                if (res[0]) unverified_db.deleteOne({discordid: member.id}, err => {
                    if (err) console.log(err)
                })
            })
        }
        if (!kicked && Date.now() - member.joinedTimestamp > 86400 * 1000 * 5) {
            unverified_db.find({discordid: member.id}).toArray((err, res) => {
                if (err) console.log(err);
                if (!res[0]) {
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
        i++;
        if (message.author.id != client.user.id && i == unverified.size && count) message.channel.send(`✅ **| Successfully pruned \`${count}\` ${count == 1 ? "user" : "users"}.**`)
    })
};

module.exports.config = {
    name: "unverified",
    description: "Kicks users that are unverified for a week or longer after their join time.",
    usage: "None",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};