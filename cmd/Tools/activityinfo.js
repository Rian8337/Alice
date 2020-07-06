const Discord = require('discord.js');
const config = require('../../config.json');

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel || message.guild.id !== '316545691545501706') return;
    let date = new Date();
    if (args[1]) {
        let entry = args[1].split("-");
        if (entry.length !== 3) return;
        date.setUTCFullYear(parseInt(entry[0]), parseInt(entry[1]) - 1, parseInt(entry[2]))
    }
    date.setUTCHours(0, 0, 0, 0);
    if (date.getTime() < message.guild.createdTimestamp) return message.channel.send("❎ **| Hey, the server didn't exist back then!**");
    if (date.getTime() > Date.now()) return message.channel.send("❎ **| You're in the future already, are you? Unfortunately I'm not.**");
    const general_parent = "360714965814083586";
    const clans_parent = "696646649128288346";
    const query = {
        timestamp: {
            $gte: 0,
            $lte: date.getTime()
        }
    };
    
    let type = "Overall";
    if (args[0]) {
        switch (args[0].toLowerCase()) {
            case "weekly": {
                type = "Weekly";
                query.timestamp.$gte = date.getTime() - 24 * 3.6e6 * date.getUTCDay();
                query.timestamp.$lte = query.timestamp.$gte + 24 * 3.6e6 * 6;
                break
            }
            case "monthly": {
                type = "Monthly";
                date.setUTCDate(1);
                query.timestamp.$gte = date.getTime();
                query.timestamp.$lte = date.getTime() + 24 * 3.6e6 * 30;
                break
            }
            case "daily": {
                type = "Daily";
                date.setUTCDate(date.getUTCDate() - 1);
                query.timestamp.$gte = date.getTime();
                query.timestamp.$lte = date.getTime() + 24 * 3.6e6
            }
            default: return message.channel.send("❎ **| Invalid mode! Accepted modes are `daily`, `monthly`, and `weekly`.**")
        }
    }
    console.log(query);
    const channeldb = alicedb.collection("channeldata");
    channeldb.find(query).sort({timestamp: -1}).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
        }
        if (res.length === 0) return message.channel.send("❎ **| I'm sorry, there are no message data on this date!**");
        console.log(res);
        let general_description = '';
        let clans_description = '';
        let language_description = '';
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

        const channel_array = [];
        for (const entry of res) {
            const channels = entry.channels;
            for (const channel of channels) {
                const index = channel_array.findIndex(c => c[0] === channel[0]);
                if (index === -1) channel_array.push(channel);
                else channel_array[index][1] += channel[1]
            }
        }

        channel_array.sort((a, b) => {return b[1] - a[1]});

        for (const channel_entry of channel_array) {
            const channel = message.guild.channels.cache.get(channel_entry[0]);
            const msg = `${channel}: ${channel_entry[1].toLocaleString()} messages\n`;
            if (channel.parentID === general_parent) general_description += msg;
            else if (channel.parentID === clans_parent) clans_description += msg;
            else language_description += msg
        }

        let page = 1;
        const description_list = [
            {
                category: "General Channels",
                description: general_description,
            },
            {
                category: "Language Channels",
                description: language_description
            },
            {
                category: "Clan Channels",
                description: clans_description
            }
        ];
        const max_page = description_list.length;

        const footer = config.avatar_list;
        const index = Math.floor(Math.random() * footer.length);
        const embed = new Discord.MessageEmbed()
            .setColor("#b58d3c")
            .setFooter(`Alice Synthesis Thirty | Page ${page}/${max_page}`, footer[index])
            .setTitle(description)
            .setDescription(`__**${description_list[(page - 1)].category}**__\n\n${description_list[(page - 1)].description}`)

        message.channel.send({embed: embed}).then(msg => {
            msg.react("⬅️").then(() => {
                msg.react("➡️")
            });

            const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id, {time: 60000});
            const next = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id, {time: 60000});

            back.on("collect", () => {
                if (page === 1) page = max_page;
                else --page;
                embed.setDescription(`**${description_list[(page - 1)].category}**\n\n${description_list[(page - 1)].description}`)
                    .setFooter(`Alice Synthesis Thirty | Page ${page}/2`, footer[index]);
                msg.edit({embed: embed}).catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            next.on("collect", () => {
                if (page === max_page) page = 1;
                else ++page;
                embed.setDescription(`**${description_list[(page - 1)].category}**\n\n${description_list[(page - 1)].description}`)
                    .setFooter(`Alice Synthesis Thirty | Page ${page}/2`, footer[index]);
                msg.edit({embed: embed}).catch(console.error);
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id).catch(console.error))
            });

            back.on("end", () => {
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(message.author.id));
                msg.reactions.cache.forEach((reaction) => reaction.users.remove(client.user.id))
            })
        })
    })
};

module.exports.config = {
    name: "activityinfo",
    description: "Retrieves channel activities.",
    usage: "activityinfo [mode] [<year>-<month>-<date>]",
    detail: "`mode`: Mode to use. Accepted arguments are `daily`, `weekly`, and `monthly`. Defaults to `daily` [String]\n`year`: UTC year to retrieve [Integer]\n`month`: UTC month to retrieve [Integer]\n`date`: UTC date to retrieve [Integer]",
    permission: "None"
};