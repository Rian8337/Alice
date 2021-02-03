const Discord = require('discord.js');
const { Db } = require('mongodb');

/**
 * Fetches the last 100 messages from a given message ID of a channel.
 *
 * @param {Discord.TextChannel} channel The channel to fetch
 * @param {string} last_msg The ID of last message
 * @param {number} date Current time
 * @param {number} daily_counter Counter for the message amount
 * @param {function} cb Callback function
 */
function count_all_message(channel, last_msg, date, daily_counter, cb) {
    channel.messages.fetch({limit: 100, before: last_msg})
        .then(messages => {
            if (!messages.size) return cb(0, null, false, true);
            let bot_messages_amount = messages.filter(message => message.author.bot).size * 2;
            daily_counter -= bot_messages_amount;
            for (const [snowflake, message] of messages.entries()) {
                if (message.createdTimestamp < date) {
                    daily_counter = Math.max(0, daily_counter);
                    console.log(new Date(date).toUTCString() + ": " + daily_counter);
                    return cb(daily_counter, snowflake, true);
                }
                ++daily_counter;
            }
            cb(daily_counter, messages.last().id);
        }).catch(console.error);
}

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) {
        return;
    }
    if (!message.isOwner) {
        return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
    }
    let current_date = new Date();
    current_date.setUTCHours(0, 0, 0, 0);
    current_date = current_date.getTime();
    let time_limit = Number.NEGATIVE_INFINITY;
    if (args[0]) {
        time_limit = new Date();
        time_limit.setUTCHours(0, 0, 0, 0);

        let entry = args[0].split("-");
        if (entry.length !== 3) {
            return message.channel.send("❎ **| I'm sorry, that date format is invalid!**");
        }
        let year = parseInt(entry[0]);
        let month = parseInt(entry[1]) - 1;
        let date = parseInt(entry[2]);
        if ([year, month, date].some(isNaN)) {
            return message.channel.send("❎ **| I'm sorry, one of the date formats is invalid!**");
        }

        time_limit.setUTCFullYear(parseInt(entry[0]), parseInt(entry[1]) - 1, parseInt(entry[2]));
        time_limit = time_limit.getTime();
        if (time_limit < message.guild.createdTimestamp) {
            return message.channel.send("❎ **| Hey, the server didn't even exist back then!**")
        }
    }

    let daily_counter = 0;
    let channeldb = alicedb.collection("channeldata");
    let total = 0;
    message.channel.messages.fetch({limit: 1}).then(last_message => {
        let message_id = last_message.first().id;
        count_all_message(message.channel, message_id, current_date, daily_counter, function testResult(count, last_id, iterateDate = false, stopSign = false) {
            if (current_date < time_limit) stopSign = true;
            if (stopSign) {
                return message.channel.send(`✅ **| ${message.author}, successfully logged ${total.toLocaleString()} messages!**`);
            }
            if (iterateDate) {
                daily_counter += count;
                total += count;
                let query = {timestamp: current_date};
                channeldb.findOne(query, (err, res) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res) {
                        let channels = res.channels;
                        let dup = false;
                        for (let i = 0; i < channels.length; i++) {
                            if (channels[i][0] != message.channel.id) {
                                continue;
                            }
                            channels[i][1] = daily_counter;
                            dup = true;
                            break;
                        }
                        if (!dup) {
                            channels.push([message.channel.id, daily_counter]);
                        }
                        let updateVal = {
                            $set: {
                                channels: channels
                            }
                        };
                        channeldb.updateOne(query, updateVal, err => {
                            if (err) {
                                return console.log(err);
                            }
                            current_date -= 24 * 3600000;
                            daily_counter = 0;
                            count_all_message(message.channel, last_id, current_date, daily_counter, testResult);
                        });
                    } else {
                        let insertVal = {
                            timestamp: current_date,
                            channels: [[message.channel.id, daily_counter]]
                        };
                        channeldb.insertOne(insertVal, err => {
                            if (err) {
                                return console.log(err);
                            }
                            current_date -= 24 * 3600000;
                            daily_counter = 0;
                            count_all_message(message.channel, last_id, current_date, daily_counter, testResult);
                        });
                    }
                });
            }
            else count_all_message(message.channel, last_id, current_date, count, testResult);
        });
    });
};

module.exports.config = {
    name: "completefetch",
    description: "Fetches all messages in a channel for channel statistics.",
    usage: "completefetch [<year>-<month>-<date>]",
    detail: "`date`: UTC date limit [Integer]\n`month`: UTC month limit [Integer]\n`year`: UTC year limit [Integer]",
    permission: "Bot Creators"
};