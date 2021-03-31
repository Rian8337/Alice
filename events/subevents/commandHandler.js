const Discord = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');

/**
 * @param {number} num 
 */
function timeConvert(num) {
    num = Math.ceil(num);
    return [Math.floor(num / 60), Math.ceil(num - Math.floor(num / 60) * 60).toString().padStart(2, "0")].join(":");
}

/**
 * @param {number} min 
 * @param {number} max 
 */
function createRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * @param {number} num 
 */
function isPrime(num) {
    if (num < 2) {
        return false;
    }

    let sqrt_num = Math.floor(Math.sqrt(num));
    for (let i = 2; i < sqrt_num; i++) {
        if (num % i === 0) {
            return false;
        }
    }
    
    return true;
}

/**
 * @param {number} level 
 * @param {string} operator 
 */
function generateNumber(level, operator) {
    switch (operator) {
        case "+":
        case "-":
            return createRandomNumber(Math.random() * 2.5 * level, Math.max(2.5 * level, Math.random() * 7.5 * level));
        case "/":
        case "*":
            return createRandomNumber(Math.random() * 5 * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.max(1, Math.random() * level / 2));
        case "!":
            return createRandomNumber(Math.random() * (level - 10) / 5, Math.random() * 3 * Math.max(1 + (level - 10) / 5, Math.random() * (level - 10) / 5));
    }
}

function generateEquation() {
    const level = 1;
    let operator_amount = 4;
    const operators = ['/', '*', '+', '-'];
    let prev_operator_amount = operator_amount;
    let equation = '';
    let real_equation = '';
    let answer = Number.NaN;
    let prime_count = 0;
    let last_operator = '';
    let attempts = 0;
    const maxThreshold = 10 * level * operator_amount;
    const minThreshold = maxThreshold / 2;

    while (!Number.isInteger(answer)) {
        if (attempts === 500) {
            break;
        }

        while (operator_amount > 0) {
            const index = Math.floor(Math.random() * operators.length);
            const operator = operators[index];
            let number = generateNumber(level, operator);
            const mul_or_div = operator === '/' || operator === '*' || last_operator === '/' || last_operator === '*';
            if (mul_or_div) {
                while (!isPrime(number) && prime_count < Math.floor(level / 10)) {
                    number = generateNumber(level, operator);
                }
                ++prime_count;
            }

            last_operator = operator;
            equation += `${number} ${operator} `;
            real_equation += `${number} ${operator} `;

            --operator_amount;
        }

        let number = generateNumber(level, last_operator);
        const mul_or_div = last_operator === '/' || last_operator === '*';
        if (mul_or_div) {
            while (!isPrime(number) && prime_count < Math.floor(level / 5)) {
                number = generateNumber(level, last_operator);
            }
        }

        equation += number;
        real_equation += number;
        answer = eval(equation);

        if (
            !Number.isInteger(answer) ||
            // checks if min < answer < max for positive value
            (answer > 0 && (answer > maxThreshold || answer < minThreshold)) ||
            // checks if -max < answer < -min for negative value
            (answer < 0 && (answer < -maxThreshold || answer > -minThreshold))
        ) {
            answer = Number.NaN;
            equation = '';
            real_equation = '';
            operator_amount = prev_operator_amount;
        }
        ++attempts;
    }

    return [real_equation, answer];
}

/**
 * @param {Discord.Message} message 
 * @returns {Promise<boolean>}
 */
function generateMathQuestion(message) {
    return new Promise(resolve => {
        const [equation, answer] = generateEquation();

        message.channel.send(`❗**| ${message.author}, solve this equation within 30 seconds to access the command:\n\`\`\`fix\n${equation} = ...\`\`\`**`).then(msg => {
            const collector = message.channel.createMessageCollector(m => parseInt(m.content) === answer && m.author.id === message.author.id, {time: 30000, max: 1});

            let correct = false;
            collector.on('collect', () => {
                msg.delete().catch(() => {});
                correct = true;
                collector.stop();
            });

            collector.on("end", () => {
                if (!correct) {
                    message.channel.send(`❎ **| ${message.author}, timed out. The correct answer is:\n\`\`\`fix\n${equation} = ${answer}\`\`\`**`)
                        .then(m => m.delete({timeout: 5000}));
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
    if (!message.isOwner && !(await generateMathQuestion(message))) {
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