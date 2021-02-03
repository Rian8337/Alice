const Discord = require('discord.js');
const { Db } = require('mongodb');

function voteStringProcessing(topic, choices) {
    let string = `**Topic: ${topic}**\n\n`;
    for (let i = 0; i < choices.length; i++) string += `\`[${i+1}] ${choices[i].choice} - ${choices[i].voters.length}\`\n\n`;
    return string;
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
        return message.channel.send("❎ **| I'm sorry, this command is not available in DMs.**");
    }
    const votedb = alicedb.collection("voting");

    switch (args[0]) {
        case "start": {
            votedb.findOne({channel: message.channel.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (res) {
                    return message.channel.send("❎ **| I'm sorry, a vote is active in this channel!**");
                }

                const entry = args.slice(1).join(" ");
                if (entry.indexOf("|") === -1) {
                    return message.channel.send("❎ **| I'm sorry, your format is invalid!**");
                }
                const topic = entry.substring(0, entry.indexOf("|")).trim();
                const choices = entry.substring(entry.indexOf("|") + 1).trim().split("|");
                const choice_list = [];
                for (let i = 0; i < choices.length; i++) {
                    if (!choices[i].trim()) {
                        continue;
                    }
                    choice_list.push({
                        choice: choices[i].trim(),
                        voters: []
                    });
                }

                const insertVal = {
                    initiator: message.author.id,
                    channel: message.channel.id,
                    topic: topic,
                    xp: xp_req,
                    choices: choice_list
                };

                votedb.insertOne(insertVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    message.channel.send(`✅ **| Successfully started vote.**\n${voteStringProcessing(topic, choice_list)}`);
                });
            });
            break;
        }
        case "end": {
            votedb.findOne({channel: message.channel.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, there is no ongoing vote in this channel!**");
                }
                if (message.author.id != res.initiator && !message.channel.permissionsFor(message.member).any("MANAGE_CHANNELS")) {
                    return message.channel.send("❎ **| I'm sorry, you don't have the permission to end ongoing vote!**");
                }
                const topic = res.topic;
                const choices = res.choices;
                votedb.deleteOne({initiator: res.initiator}, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    message.channel.send(`✅ **| Vote ended!**\n${voteStringProcessing(topic, choices)}`);
                });
            });
            break;
        }
        case "check": {
            votedb.findOne({channel: message.channel.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, there is no ongoing vote in this channel!**");
                }
                message.channel.send(voteStringProcessing(res.topic, res.choices));
            });
            break;
        }
        default: {
            votedb.findOne({channel: message.channel.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (!res) {
                    return message.channel.send("❎ **| I'm sorry, there is no ongoing vote in this channel!**");
                }
                const choice = parseInt(args[0]) - 1;
                const choices = res.choices;
                if (isNaN(choice) || choice < 0 || choice >= choices.length) {
                    return message.channel.send("❎ **| I'm sorry, that vote option is invalid!**");
                }

                const choice_index = choices.findIndex(choice => choice.voters.includes(message.author.id));
                if (choice === choice_index) {
                    return message.channel.send("❎ **| I'm sorry, you have voted for that option!**");
                }
                if (choice_index !== -1) {
                    const user_index = choices[choice_index].voters.findIndex(u => u === message.author.id);
                    choices[choice_index].voters.splice(user_index, 1);
                }
                choices[choice].voters.push(message.author.id);

                const updateVal = {
                    $set: {
                        choices: choices
                    }
                };

                votedb.updateOne({channel: message.channel.id}, updateVal, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    message.channel.send(`✅ **| ${message.author}, ${choice_index === -1 ? "your vote has been registered" : `your vote has been moved from option \`${choice_index + 1}\` to \`${choice + 1}\``}!**\n${voteStringProcessing(res.topic, choices)}`);
                });
            });
        }
    }
};

module.exports.config = {
    name: "vote",
    description: "Main voting command.",
    usage: "vote <option>\nvote check\nvote end\nvote start <topic> | <choice 1> | <choice 2> | <choice n> | ...",
    detail: "`choice n`: The vote's choices [Any]\n`option`: The vote option to vote for [Integer]\n`topic`: The vote's topic [String]",
    permission: "None"
};