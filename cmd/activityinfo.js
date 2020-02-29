const Discord = require('discord.js');
const config = require('../config.json');

function listEntries(mode, res, time_limit) {
    let list = [];
    let limit = 1;
    if (mode == "weekly") limit = 7;
    if (mode == "monthly") limit = 30;
    for (let i = 0; i < res.length; i++) {
        if (res[i].timestamp == time_limit) {
            res = res.slice(i, Math.min(i + limit, res.length + 1));
            break
        }
    }

    for (let i = 0; i < res.length; i++) {
        let channels = res[i].channels;
        for (let j = 0; j < channels.length; j++) {
            let found = false;
            for (let k = 0; k < list.length; k++) {
                if (list[k][0] == channels[j][0]) {
                    list[k][1] += channels[j][1];
                    found = true;
                    break
                }
            }
            if (!found) list.push(channels[j])
        }
    }
    return list
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    let date = new Date();
    if (args[1]) {
        let entry = args[1].split("-");
        if (entry.length != 3) return;
        date.setUTCFullYear(parseInt(entry[0]), parseInt(entry[1]) - 1, parseInt(entry[2]))
    }
    date.setUTCHours(0, 0, 0, 0);
    if (date.getTime() < message.guild.createdTimestamp) return message.channel.send("❎ **| Hey, the server didn't exist back then!**");
    if (date.getTime() > Date.now()) return message.channel.send("❎ **| You're in the future already, are you? Unfortunately I'm not.**");
    
    let channeldb = alicedb.collection("channeldata");
    channeldb.find({}).sort({timestamp: -1}).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        let entries;
        let type = '';
        switch (args[0]) {
            case "weekly": {
                let time_limit = date.getTime();
                switch (date.toUTCString().substr(0, 3)) {
                    case "Mon": time_limit -= 24 * 3.6e6; break;
                    case "Tue": time_limit -= 24 * 3.6e6 * 2; break;
                    case "Wed": time_limit -= 24 * 3.6e6 * 3; break;
                    case "Thu": time_limit -= 24 * 3.6e6 * 4; break;
                    case "Fri": time_limit -= 24 * 3.6e6 * 5; break;
                    case "Sat": time_limit -= 24 * 3.6e6 * 6
                }
                type = 'Weekly';
                entries = listEntries(args[0], res, time_limit);
                break
            }
            case "monthly": {
                date.setUTCDate(1);
                let time_limit = date.getTime();
                type = 'Monthly';
                entries = listEntries(args[0], res, time_limit);
                break
            }
            default: {
                type = 'Daily';
                entries = listEntries("daily", res, date.getTime())
            }
        }
        entries.sort((a, b) => {return b[1] - a[1]})
        let description = `**${type} channel activity per ${date.getUTCDate()} `;
        switch (date.getUTCMonth()) {
            case 0: description += 'Jan '; break;
            case 1: description += 'Feb '; break;
            case 2: description += 'Mar '; break;
            case 3: description += 'Apr '; break;
            case 4: description += 'May '; break;
            case 5: description += 'Jun '; break;
            case 6: description += 'Jul '; break;
            case 7: description += 'Aug '; break;
            case 8: description += 'Sep '; break;
            case 9: description += 'Oct '; break;
            case 10: description += 'Nov '; break;
            case 11: description += 'Des '
        }
        description += `${date.getUTCFullYear()}**\n\n`;
        for (let i = 0; i < entries.length; i++) description += `<#${entries[i][0]}>: **${entries[i][1].toLocaleString()}** messages\n`;

        let footer = config.avatar_list;
        const index = Math.floor(Math.random() * (footer.length - 1) + 1);
        let embed = new Discord.RichEmbed()
            .setColor("#b58d3c")
            .setFooter("Alice Synthesis Thirty", footer[index])
            .setDescription(description);

        message.channel.send({embed: embed}).catch(console.error)
    })
};

module.exports.config = {
    name: "activityinfo",
    description: "Retrieves channel activities.",
    usage: "activityinfo [mode] [<year>-<month>-<date>]",
    detail: "`mode`: Mode to use. Accepted arguments are `daily`, `weekly`, and `monthly`. Defaults to `daily` [String]\n`year`: UTC year to retrieve [Integer]\n`month`: UTC month to retrieve [Integer]\n`date`: UTC date to retrieve [Integer]",
    permission: "None"
};
