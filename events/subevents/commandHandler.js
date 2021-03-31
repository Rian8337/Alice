const Discord = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');
const fs = require('fs');

/**
 * @param {any[]} input 
 */
function shuffle(input) {
    let temp; let rpick;
    for (var i = 0; i < input.length*2; i++) {
        rpick = Math.floor(Math.random() * input.length);
        temp = input[rpick];
        input[rpick] = input[i % input.length];
        input[i % input.length] = temp;
    }
}

/**
 * @param {number} num 
 */
function timeConvert(num) {
    num = Math.ceil(num);
    return [Math.floor(num / 60), Math.ceil(num - Math.floor(num / 60) * 60).toString().padStart(2, "0")].join(":");
}

/**
 * @param {Discord.Message} message 
 * @returns {Promise<boolean>}
 */
function askQuestion(message) {
    return new Promise(async resolve => {
        const files = await fs.promises.readdir(`${process.cwd()}/trivia`);
        const fileIndex = Math.floor(Math.random() * files.length);
        const file = files[fileIndex];

        const data = await fs.promises.readFile(`${process.cwd()}/trivia/${file}`, {encoding: "utf-8"});

        const entries = data.split("\n");
        const entryIndex = Math.floor(Math.random() * entries.length);
        const entry = entries[entryIndex];

        const informations = entry.split("|").map(v => v = v.trim());
        const type = parseInt(informations[1]);
        const imageLink = informations[2];

        informations.splice(0, 3);

        const question = informations[0];
        const correctAnswers = type === 2 ? informations.slice(1) : [informations[1]];
        const answers = informations.slice(1);
        shuffle(answers);
        let answerString = "";
        for (let i = 0; i < answers.length; ++i) {
            if (type === 3 && i === 0) {
                continue;
            }
            answerString += `${String.fromCharCode(65 + i)}. ${answers[i]}\n`;
        }
        const correctAnswerIndex = type === 2 ? -1 : answers.findIndex(v => v.toLowerCase() === correctAnswers[0].toLowerCase());

        const embed = new Discord.MessageEmbed()
            .setAuthor(`Trivia question for ${message.author.tag}`, message.author.avatarURL({dynamic: true}))
            .setDescription(question);

        if (type === 1 || type === 3) {
            embed.addField("Answers", answerString);
        }
        if (imageLink !== "-") {
            embed.setImage(imageLink);
        }

        message.channel.send(`❗**| ${message.author}, solve this trivia question within 20 seconds to access the command:**`, {embed: embed}).then(msg => {
            const collector = message.channel.createMessageCollector(m => correctAnswers.map(v => v = v.toLowerCase()).includes(m.content.toLowerCase()), {time: 20000, max: 1});
            let correct = false;

            collector.on('collect', () => {
                correct = true;
                collector.stop();
            });

            collector.on("end", () => {
                msg.delete().catch(() => {});
                if (!correct) {
                    message.channel.send(`❎ **| ${message.author}, timed out. ${type === 1 || type === 3 ? `The correct answer is: ${String.fromCharCode(65 + correctAnswerIndex)}. ${correctAnswers[0]}` : `The correct ${correctAnswers.length === 1 ? "answer is" : "answers are"}: ${correctAnswers.join(", ")}`}**`)
                        .then(m => m.delete({timeout: 10000}));
                }
                resolve(correct);
            });
        });
    });
}

/**
 * @type {Map<string, number>}
 */
const cd = new Map();

/**
 * @param {Object} obj
 * @param {Discord.Client} obj.client
 * @param {Discord.Message} obj.message
 * @param {string[]} obj.args
 * @param {Db} obj.maindb
 * @param {Db} obj.alicedb
 * @param {string} obj.command
 * @param {[string, string][]} obj.current_map
 * @param {string[]} obj.globally_disabled_commands
 * @param {{channelID: string, disabledCommands: {name: string, cooldown: number}[]}[]} obj.channel_disabled_commands
 * @param {number} obj.command_cooldown
 * @param {boolean} obj.maintenance
 * @param {string} obj.maintenance_reason
 * @param {boolean} obj.main_bot
 */
module.exports.run = async obj => {
    const {
        client,
        message,
        args,
        maindb,
        alicedb,
        command,
        current_map,
        globally_disabled_commands,
        channel_disabled_commands,
        command_cooldown,
        maintenance,
        maintenance_reason,
        main_bot
    } = obj;

    const cmd = client.commands.get(command.slice(main_bot ? config.prefix.length : 1)) || client.aliases.get(command.slice(main_bot ? config.prefix.length : 1));
    if (!cmd) {
        return;
    }
    
    let finalCommandCooldown = command_cooldown;
    if (!message.isOwner && !message.member?.hasPermission("ADMINISTRATOR")) {
        if (maintenance) {
            return message.channel.send(`❎ **| I'm sorry, I'm currently under maintenance due to \`${maintenance_reason}\`. Please try again later!**`);
        }
        if (globally_disabled_commands.find(c => c === cmd.config.name)) {
            return message.channel.send("❎ **| I'm sorry, this command is disabled temporarily!**");
        }

        const channelSetting = channel_disabled_commands.find(v => v.channelID === message.channel.id);
        if (channelSetting) {
            for (const c of channelSetting.disabledCommands) {
                if (c.name === cmd.config.name) {
                    if (c.cooldown === -1) {
                        message.delete();
                        return message.channel.send(`❎ **| I'm sorry, ${message.author}, \`${cmd.config.name}\` is disabled in this channel!**`)
                            .then(m => m.delete({timeout: 5000}));
                    }
                    finalCommandCooldown = Math.max(command_cooldown, c.cooldown);
                }
            }
        }
    }
    if (!message.isOwner && !(await askQuestion(message))) {
        return;
    }
    message.channel.startTyping().catch(console.error);
    setTimeout(() => {
        message.channel.stopTyping(true);
    }, 5000);
    const cooldownMapKey = `${message.author.id}:${message.channel.id}:${cmd.config.name}`;
    const cooldownLeft = cd.get(cooldownMapKey);
    if (cooldownLeft) {
        return message.channel.send(`❎ **| Hey, calm down with the command (${timeConvert(cooldownLeft)})! I need to rest too, you know.**`);
    }
    if (message.channel.type === "text") {
        console.log(`${message.author.tag} (#${message.channel.name}): ${message.content}`);
    } else {
        console.log(`${message.author.tag} (DM): ${message.content}`);
    }
    cmd.run(client, message, args, maindb, alicedb, current_map);
    if (finalCommandCooldown && !message.isOwner) {
        cd.set(cooldownMapKey, finalCommandCooldown);
        const interval = setInterval(() => {
            const cooldown = cd.get(cooldownMapKey) - 0.1;
            if (cooldown <= 0) {
                cd.delete(cooldownMapKey);
                return clearInterval(interval);
            }
            cd.set(cooldownMapKey, cooldown);
        }, 100);
    }
};

module.exports.config = {
    name: "commandHandler"
};