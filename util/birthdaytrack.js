module.exports.run = (client, maindb, alicedb) => {
    let d = new Date();
    let date = d.getUTCDate();
    let month = d.getUTCMonth();
    let year = d.getUTCFullYear();
    const hour = d.getUTCHours();

    // detect if it's leap year and if it is detect if current date is 29 Feb
    const isLeapYear = year % 4 === 0;
    if (isLeapYear && month === 1 && date === 29) {
        date = 1;
        month = 2
    }

    let guild = client.guilds.cache.get('316545691545501706');
    let role = guild.roles.cache.get("695201338182860860");
    if (!role) return;

    let binddb = maindb.collection("userbind");
    let birthday = alicedb.collection("birthday");
    let points = alicedb.collection("playerpoints");

    birthday.find({}).toArray((err, res) => {
        if (err) return console.log(err);
        let current_birthday = [];
        let timezone = -12;

        for (timezone; timezone < 13; ++timezone) {
            d.setUTCHours(hour + timezone);
            date = d.getUTCDate();
            month = d.getUTCMonth();
            if (isLeapYear) {
                if (month === 1 && date === 29) {
                    date = 1;
                    month = 2
                }
                current_birthday.push(res.filter((entry) => entry.date === date && entry.month === month && entry.timezone === timezone && entry.isLeapYear === isLeapYear))
            } else current_birthday.push(res.filter((entry) => entry.date === date && entry.month === month && entry.timezone === timezone ));

            current_birthday.flat();
        }

        let i = 0;
        role.members.forEach((member) => {
            let index = current_birthday.findIndex((entry) => entry.discordid = member.id);
            if (index === -1) member.roles.remove(role, "Not birthday anymore").catch(console.error);
            ++i;
            if (i !== role.members.size) return;

            current_birthday.forEach((entry) => {
                let roles = member.roles;
                let birthday_role = roles.cache.get(role.id);
                if (birthday_role) return;

                roles.add(role, "Happy birthday!").catch(console.error);
                if (member.user.bot) return;
                points.findOne({discordid: entry.discordid}, (err, userres) => {
                    if (err) return console.log(err);
                    if (userres) {
                        let coins = userres.alicecoins;
                        coins += 1000;
                        let updateVal = {
                            $set: {
                                alicecoins: coins
                            }
                        };
                        points.updateOne({discordid: entry.discordid}, updateVal, err => {
                            if (err) return console.log(err)
                        })
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
                                if (err) return console.log(err)
                            })
                        })
                    }
                })
            })
        })
    })
};

module.exports.config = {
    name: 'birthdaytrack'
};
