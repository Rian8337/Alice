const Discord = require('discord.js');
const config = require('../../config.json');
let cd = new Set();

function timeConvert(num) {
    let sec = parseInt(num);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
}

function createRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function isPrime(num) {
    if (num < 2)
        return false;

    let sqrt_num = Math.floor(Math.sqrt(num));
    for (let i = 2; i < sqrt_num; i++)
        if (num % i === 0) return false;

    return true
}

function calculateFactorial(num) {
    let result = num;
    while (num > 1) {
        --num;
        result *= num
    }
    return result
}

function generateNumber(level, operator) {
    switch (operator) {
        case "+":
        case "-":
            return createRandomNumber(Math.random() * 5 * level / 2, Math.max(5 * level / 2, Math.random() * 15 * level / 2));
        case "/":
        case "*":
            return createRandomNumber(Math.random() * 5 * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.max(1, Math.random() * level / 2));
        case "!":
            return createRandomNumber(Math.random() * (level - 10) / 5, Math.random() * 3 * Math.max(1 + (level - 10) / 5, Math.random() * (level - 10) / 5));
    }
}

function generateEquation(level, operator_amount, callback) {
    let prev_operator_amount = operator_amount;
    let operators = ['/', '*', '+', '-'];
    let equation = '';
    let real_equation = '';
    let answer = Number.NaN;
    let prime_count = 0;
    let last_operator = '';
    let infinity_count = 0;

    while (!Number.isInteger(answer)) {
        if (infinity_count === 50) break;

        while (operator_amount > 0) {
            const index = Math.floor(Math.random() * operators.length);
            let operator = operators[index];
            let number = generateNumber(level, operator);
            let mul_or_div = operator === '/' || operator === '*' || last_operator === '/' || last_operator === '*';
            if (mul_or_div) {
                while ((!isPrime(number) && prime_count < Math.floor(level / 10)))
                    number = generateNumber(level, operator);
                ++prime_count
            }

            // use RNG to determine putting factorial
            let factorial = level > 10 && level + Math.random() * level >= 20;
            if (factorial) {
                // nerf number for factorials
                number = generateNumber(level, "!");
                while (number < 2 || number > 4)
                    number = generateNumber(level, "!")
            }

            last_operator = operator;

            if (factorial) {
                equation += `${calculateFactorial(number)} ${operator} `;
                real_equation += `${number}! ${operator} `
            } else {
                equation += `${number} ${operator} `;
                real_equation += `${number} ${operator} `
            }

            --operator_amount
        }

        let number = generateNumber(level, last_operator);
        let mul_or_div = last_operator === '/' || last_operator === '*';
        if (mul_or_div)
            while ((!isPrime(number) && prime_count < Math.floor(level / 5)))
                number = generateNumber(level, last_operator);

        // use RNG to determine putting factorial
        let factorial = level > 10 && Math.random() >= 1 - level / 25;
        if (factorial) {
            // nerf number for factorials
            number = generateNumber(level, "!");
            while (number < 2 || number > 4)
                number = generateNumber(level, "!")
        }

        if (factorial) {
            equation += calculateFactorial(number);
            real_equation += `${number}!`
        } else {
            equation += number;
            real_equation += number
        }
        answer = eval(equation);

        const min_mul_div_threshold = Math.min(prev_operator_amount, Math.floor(level / 10));
        const max_mul_div_threshold = level / 5;
        const mul_div_amount = (equation.match(/\//g)||[]).length + (equation.match(/\*/g)||[]).length;
        if (answer === Infinity || answer === -Infinity) ++infinity_count;
        if (
            !Number.isInteger(answer) ||
            (level >= 5 && mul_div_amount < min_mul_div_threshold && mul_div_amount > max_mul_div_threshold)
        ) {
            answer = Number.NaN;
            equation = '';
            real_equation = '';
            operator_amount = prev_operator_amount
        }
    }

    callback(real_equation, answer)
}

module.exports.run = (client, message, args) => {
    let mode = args[0];
    if (!mode) mode = 'single';
    mode = mode.toLowerCase();

    switch (mode) {
        case "single":
            if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, you still have a game ongoing! Play that one instead!**");
            cd.add(message.author.id);
            break;
        case "multi":
            if (cd.has(message.channel.id)) return message.channel.send("❎ **| Hey, there is a game ongoing in this channel! Play that one instead!**");
            cd.add(message.channel.id);
            break;
        default: return message.channel.send("❎ **| I'm sorry, that mode is invalid! Accepted modes are \`single\` and \`multi\`.**")
    }

    let operator_amount = 1;
    let level = 1;
    let answer_list = [];
    let prev_equation_list = [];
    let total_answer = 0;

    generateEquation(level, operator_amount, function createCollector(equation, answer) {
        if (prev_equation_list.includes(equation)) return generateEquation(level, operator_amount, createCollector);
        else prev_equation_list.push(equation);

        let correct = false;

        let string = '❗**| ';
        if (mode === 'single') string += `${message.author}, solve this equation within 30 seconds!\n\`Operator count ${operator_amount}, level ${level}\`\n\`${equation} = ...\`**`;
        else string += `Solve this equation within 30 seconds (level ${level}, ${operator_amount} operator(s))!\n\`${equation} = ...\``;

        message.channel.send(string).then(msg => {
            let collector;
            switch (mode) {
                case "single":
                    collector = message.channel.createMessageCollector(m => parseFloat(m.content) === answer && m.author.id === message.author.id, {time: 30000, max: 1});
                    break;
                case "multi":
                    collector = message.channel.createMessageCollector(m => parseFloat(m.content) === answer, {time: 30000, max: 1})
            }

            collector.on('collect', m => {
                msg.delete().catch(console.error);
                correct = true;
                let timeDiff = Date.now() - msg.createdTimestamp;

                let user_index = answer_list.findIndex(answer => answer.id === m.author.id);
                if (user_index !== -1) {
                    ++answer_list[user_index].count;
                } else {
                    answer_list.push({id: m.author.id, count: 1});
                }
                ++total_answer;

                if (mode === 'multi') message.channel.send(`✅ **| ${m.author.username} got the correct answer! That took ${timeDiff / 1000}s.\n\`${equation} = ${answer}\`**`);
                else message.channel.send(`✅ **| ${m.author.username}, you got the correct answer! That took ${timeDiff / 1000}s.\n\`${equation} = ${answer}\`**`);
                collector.stop()
            });
            collector.on('end', () => {
                if (!correct) {
                    msg.delete().catch(console.error);
                    let string = '✅ **| ';
                    switch (mode) {
                        case 'single':
                            string += `${message.author}, game ended! The correct answer is:\n\`\`\`fix\n${equation} = ${answer}\`\`\`Game statistics can be found in embed.**`;
                            cd.delete(message.author.id);
                            break;
                        case 'multi':
                            string += `Game ended! The correct answer is:\n\`\`\`fix\n${equation} = ${answer}\`\`\`Game statistics can be found in embed.**`;
                            cd.delete(message.channel.id)
                    }

                    let answer_string = '';
                    answer_list.sort((a, b) => {return b - a});
                    for (let i = 0; i < answer_list.length; i++) answer_string += `#${i+1}: <@${answer_list[i].id}> - ${answer_list[i].count} ${answer_list[i].count === 1 ? "answer" : "answers"}\n`;

                    let rolecheck;
                    try {
                        rolecheck = message.member.roles.highest.hexColor
                    } catch (e) {
                        rolecheck = "#000000"
                    }
                    let footer = config.avatar_list;
                    const index = Math.floor(Math.random() * footer.length);
                    let embed = new Discord.MessageEmbed()
                        .setTitle("Math Game Statistics")
                        .setFooter("Alice Synthesis Thirty", footer[index])
                        .setTimestamp(new Date())
                        .setColor(rolecheck)
                        .setDescription(`**Game starter**: ${message.author}\n**Time started**: ${message.createdAt.toUTCString()}\n**Duration**: ${timeConvert(Math.floor((Date.now() - message.createdTimestamp) / 1000))}\n**Level reached**: Operator count ${operator_amount}, level ${level}\n\n**Total correct answers**: ${total_answer} ${total_answer === 1 ? "answer" : "answers"}\n${answer_string}`);

                    message.channel.send(string, {embed: embed});
                } else {
                    if (level === 20) {
                        ++operator_amount;
                        level = 1
                    } else {
                        ++level
                    }
                    setTimeout(() => {
                        generateEquation(level, operator_amount, createCollector)
                    }, 500)
                }
            })
        })
    })
};

module.exports.config = {
    name: "mathgame",
    description: "A math game! Creates a simple math equation that you have to solve within 30 seconds. If not answered, the game will end. The equation goes more difficult as time progresses.\n\nFor reference:\n`+`: addition\n`-`: subtraction\n`*`: multiplication\n`/`: division\n`!`: factorial\nOperator precedence: `*`/`/` -> `+`/`-`",
    usage: "mathgame [mode]",
    detail: "`mode`: Whether to play the game by yourself (singleplayer) or with others (multiplayer). Use `single` for singleplayer and `multi` for multiplayer. Defaults to `single` [String]",
    permission: "None"
};
