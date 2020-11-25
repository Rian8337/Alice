const Discord = require('discord.js');

function getLastMessage(channel_list, i, cb) {
    if (!channel_list[i]) return cb(0, true);
    channel_list[i].messages.fetch({limit: 1}).then((message) => {
        if (message.size) cb(message.first().id);
        else cb(0)
    })
}

function countAllMessage(channel, last_msg, date, daily_counter, cb) {
    channel.messages.fetch({limit: 100, before: last_msg})
        .then((messages) => {
            if (!messages.size) return cb(0, null, true);
            let bot_messages_amount = messages.filter(message => message.author.bot).size * 2;
            daily_counter -= bot_messages_amount;
            for (const [snowflake, message] of messages.entries()) {
                if (message.createdTimestamp < date) {
                    daily_counter = Math.max(0, daily_counter);
                    console.log(channel.name + ": " + daily_counter);
                    return cb(daily_counter, snowflake, true)
                }
                if (message.createdTimestamp - date > 86400 * 1000) continue;
                ++daily_counter
            }
            cb(daily_counter, messages.last().id)
        }).catch(console.error)
}

module.exports.run = (client, message, args, maindb, alicedb) => {
    if (message.channel instanceof Discord.DMChannel) return;
    if (!message.isOwner) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
    let current_date = new Date();
    current_date.setUTCHours(0, 0, 0, 0);
    if (args[0]) current_date.setUTCDate(current_date.getUTCDate() - 1);
    current_date = current_date.getTime();
    console.log(current_date);

    let channel_list = [];
    for (const [snowflake, channel] of message.guild.channels.cache.entries()) {
        if (channel.type !== "text") continue;
        if (['360714803691388928', '415559968062963712', '360715303149240321', '360715871187894273', '360715992621514752'].includes(channel.parentID)) continue;
        if (['326152555392532481', '361785436982476800', '316863464888991745', '549109230284701718', '468042874202750976', '430002296160649229', '430939277720027136', '757137265351721001', '757135236659413033', '757136393142010027', '757137031162888223', '757137127652982846'].includes(snowflake)) continue;
        channel_list.push(channel)
    }
    let list = [];
    let daily_counter = 0;
    let i = 0;
    let channeldb = alicedb.collection("channeldata");
    getLastMessage(channel_list, i, function testChannel(message_id, stopSign = false) {
        if (stopSign) {
            let query = {timestamp: current_date};
            channeldb.findOne(query, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                }
                if (res) {
                    let updateVal = {
                        $set: {
                            channels: list
                        }
                    };
                    channeldb.updateOne(query, updateVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        message.channel.send(`✅ **| ${message.author}, message logging done!**`)
                    })
                } else {
                    let insertVal = {
                        timestamp: current_date,
                        channels: list
                    };
                    channeldb.insertOne(insertVal, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**")
                        }
                        message.channel.send(`✅ **| ${message.author}, message logging done!**`)
                    })
                }
            });
            return
        }
        if (!message_id) {
            i++;
            return getLastMessage(channel_list, i, testChannel)
        }
        countAllMessage(channel_list[i], message_id, current_date, daily_counter, function testResult(count, last_id, stopFlag = false) {
            if (stopFlag) {
                daily_counter += count;
                list.push([channel_list[i].id, daily_counter]);
                i++;
                daily_counter = 0;
                return getLastMessage(channel_list, i, testChannel)
            }
            countAllMessage(channel_list[i], last_id, current_date, count, testResult)
        })
    })
};

module.exports.config = {
    name: "fetchmessages",
    description: "Fetches all messages in that day in a specific channel.",
    usage: "fetchmessages",
    detail: "None",
    permission: "Specific person (<@132783516176875520> and <@386742340968120321>)"
};
