const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    let birthday = alicedb.collection("birthday");

    let month = parseInt(args[0]);
    if (isNaN(month) || month < 1 || month > 12) return message.channel.send("❎ **| Hey, that's an invalid month!**");
    let date = parseInt(args[1]);
    if (isNaN(date) || date < 1 || date > 31) return message.channel.send("❎ **| I'm sorry, that's an invalid date!**");
    --month;

    let max_date;
    if (month % 2 === 0) max_date = 31;
    else if (month === 1) max_date = 29;
    else max_date = 30;

    if (date > max_date) return message.channel.send("❎ **| Hey, that's an invalid date!**");

    let string = '';
    switch (month) {
        case 0: string += 'January'; break;
        case 1: string += 'February'; break;
        case 2: string += 'March'; break;
        case 3: string += 'April'; break;
        case 4: string += 'May'; break;
        case 5: string += 'June'; break;
        case 6: string += 'July'; break;
        case 7: string += 'August'; break;
        case 8: string += 'September'; break;
        case 9: string += 'October'; break;
        case 10: string += 'November'; break;
        case 11: string += 'December'
    }
    string += ' ' + date.toString()

    birthday.findOne({discordid: message.author.id}, (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (res) return message.channel.send("❎ **| I'm sorry, you've set your birthday date before!**");
        message.channel.send(`❗**| ${message.author}, are you sure you want to set your birthday to \`${string}\`? You won't be able to change it afterwards!**`).then(msg => {
            msg.react("✅").catch(console.error);
            let confirmation = false;
            let confirm = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {time: 20000});
            confirm.on("collect", () => {
                confirmation = true;
                msg.delete();

                // detect if date entry is 29 Feb
                const isLeapYear = month === 1 && date === 29;
                if (isLeapYear) {
                    month = 2;
                    date = 1
                }

                let insertVal = {
                    discordid: message.author.id,
                    date: date,
                    month: month,
                    isLeapYear: isLeapYear
                };
                birthday.insertOne(insertVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                    }
                    message.channel.send(`✅ **| ${message.author}, successfully set your birthday to \`${string}\`.**`)
                })
            });
            confirm.on("end", () => {
                if (!confirmation) {
                    msg.delete();
                    message.channel.send("❎ **| Timed out.**").then(m => m.delete({timeout: 5000}))
                }
            })
        })
    })
};

module.exports.config = {
    name: "birthday",
    description: "Sets your birthday date. Get 1000 Alice coins and a happy birthday role in your birthday!\n\nIf someone's birthday is February 29, it will be celebrated in March 1 in nonleap years.",
    usage: "birthday <month> <date>",
    detail: "`date`: Date of birthday [Integer]\n`month`: Month of birthday [Integer]",
    permission: "None"
};
