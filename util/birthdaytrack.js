const { Client } = require("discord.js");
const { Db } = require("mongodb");

/**
 * @param {Client} client 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, maindb, alicedb) => {
    let d = new Date();
    let date = d.getUTCDate();
    let month = d.getUTCMonth();

    const guild = client.guilds.cache.get('316545691545501706');
    const role = guild.roles.cache.get("695201338182860860");
    if (!role) {
        return;
    }

    const binddb = maindb.collection("userbind");
    const birthday = alicedb.collection("birthday");
    const points = alicedb.collection("playerpoints");

    const query = {
        $and: [
            {date: {$gte: date - 1, $lte: date + 1}},
            {month: {$gte: month - 1, $lte: month + 1}}
        ]
    };

    birthday.find(query).toArray((err, res) => {
        if (err) {
            return console.log(err);
        }
        if (res.length === 0) {
            return;
        }
        let current_birthday = [];

        for (let timezone = -12; timezone < 13; ++timezone) {
            d = new Date();
            date = d.getUTCDate();
            month = d.getUTCMonth();

            // detect if it's leap year and if it is detect if current date is 29 Feb
            if (d.getUTCFullYear() % 4 === 0 && month === 1 && date === 29) {
                date = 1;
                month = 2;
                d.setUTCMonth(month, date);
            }

            const entries = res.filter((entry) => entry.timezone === timezone);
            d.setUTCHours(d.getUTCHours() + timezone);
            date = d.getUTCDate();
            month = d.getUTCMonth();
            for (let i = 0; i < entries.length; ++i) {
                let entry = entries[i];
                if (entry.date !== date || entry.month !== month) {
                    continue;
                }
                current_birthday.push(entry);
            }
        }

        role.members.forEach((member) => {
            let index = current_birthday.findIndex((entry) => entry.discordid === member.id);
            if (index === -1) {
                member.roles.remove(role, "Not birthday anymore").catch(console.error);
            }
        });

        current_birthday.forEach(async (entry) => {
            const user = await guild.members.fetch(entry.discordid).catch();
            if (!user) {
                return;
            }
            let roles = user.roles;
            let birthday_role = roles.cache.get(role.id);
            if (birthday_role) {
                return;
            }

            roles.add(role, "Happy birthday!").catch(console.error);
            if (user.user.bot) {
                return;
            }
            user.send("🎂 **| Hey, I want to wish you a happy birthday! Hopefully you have a happy day with your family, friends, and relatives. Please accept this gift of `1,000` Alice coins and a temporary birthday role from me.**").catch(console.error);
            console.log(`Added 1000 coins to ${user.user.username} as birthday prize`);

            points.findOne({discordid: entry.discordid}, (err, userres) => {
                if (err) {
                    return console.log(err);
                }
                if (userres) {
                    let updateVal = {
                        $inc: {
                            alicecoins: 1000
                        }
                    };
                    points.updateOne({discordid: entry.discordid}, updateVal, err => {
                        if (err) {
                            return console.log(err);
                        }
                    });
                } else {
                    binddb.findOne({discordid: entry.discordid}, (err, ures) => {
                        if (err) return console.log(err);
                        let username = ures.username;
                        let uid = ures.uid;
                        let insertVal = {
                            username: username,
                            uid: uid,
                            discordid: entry.discordid,
                            challenges: [],
                            points: 0,
                            dailycooldown: 0,
                            alicecoins: 1000
                        };

                        points.insertOne(insertVal, err => {
                            if (err) {
                                return console.log(err);
                            }
                        });
                    });
                }
            });
        });
    });
};

module.exports.config = {
    name: 'birthdaytrack'
};
