let cd = new Set();

function createRandomNumber(min, max) {
    min = Math.floor(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports.run = (client, message, args) => {
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, you still have an equation to solve! Please solve that one first before creating another equation!**");
    let level = args[0];
    if (!level) level = 1;
    if (isNaN(level)) return message.channel.send("❎ **| I'm sorry, that's an invalid level!**");
    if (level <= 0 || level > 20) return message.channel.send("❎ **| I'm sorry, level range is from 1-20!**");
    level = parseInt(level);

    let operator_amount = args[1];
    if (!operator_amount) operator_amount = 4;
    if (isNaN(operator_amount)) return message.channel.send("❎ **| I'm sorry, that's an invalid operator amount!**");
    if (operator_amount < 1 || operator_amount > 10) return message.channel.send("❎ **| I'm sorry, operator amount range is from 1-10!**");
    operator_amount = parseInt(operator_amount);

    let prev_operator_amount = operator_amount;
    let operators = ['/', '*', '+', '-'];
    let equation = '';
    let answer = Number.NaN;

    while (!Number.isInteger(answer)) {
        while (operator_amount > 0) {
            let number = createRandomNumber(Math.random() * 5 * Math.max(1, level / 2), Math.max(5 * Math.max(1, level / 2), Math.random() * 15 * level / 2));
            const index = Math.floor(Math.random() * operators.length);
            if (operators[index] === '/' || operators[index] === '*') {
                number = createRandomNumber(Math.random() * 5 * Math.random() * Math.max(1, (level / 2)), Math.random() * 10 * Math.max(1, Math.random() * level / 2));
                if (level >= 3 || operators[index] === '/') {
                    while (number === 0) number = createRandomNumber(Math.random() * 5 * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.max(1, Math.random() * level / 2));
                }
            }
            equation += `${number} ${operators[index]} `;
            --operator_amount
        }
        let last_operator = equation.substring(equation.length - 2).trim();
        if (last_operator === '/' || last_operator === '*') {
            let number = createRandomNumber(Math.random() * 5 * Math.random() * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.random() * Math.max(1, Math.random() * level / 2));
            if (last_operator === '/') {
                while (number === 0) {
                    number = createRandomNumber(Math.random() * 5 * Math.random() * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.random() * Math.max(1, Math.random() * level / 2));
                }
            }
            equation += number
        }
        else equation += createRandomNumber(Math.random() * 5 * level, Math.max(5 * Math.max(1, level / 2), Math.random() * 15 * Math.max(1, level / 2)));
        answer = eval(equation);
        if (
            !Number.isInteger(answer) ||
            (level >= 5 && (
                        (equation.match(/\//g)||[]).length + (equation.match(/\*/g)||[]).length !== Math.min(prev_operator_amount, Math.floor(level / 5))
                )
            )
        ) {
            answer = Number.NaN;
            equation = '';
            operator_amount = prev_operator_amount
        }
    }

    message.channel.send(`❗**| ${message.author}, here is your equation:\n\`Operator count ${prev_operator_amount}, level ${level}\`\n\`${equation} = ...\`\n\nYou have 30 seconds to solve it.**`).then(msg => {
        cd.add(message.author.id);
        let collector = message.channel.createMessageCollector(m => parseInt(m.content) === answer && m.author.id === message.author.id, {time: 30000, max: 1});
        let correct = false;
        collector.on('collect', () => {
            msg.delete().catch(console.error);
            correct = true;
            let timeDiff = Date.now() - msg.createdTimestamp;
            message.channel.send(`✅ **| ${message.author}, your answer is correct! It took you ${timeDiff / 1000}s!\n\`${equation} = ${answer}\`**`);
            cd.delete(message.author.id)
        });
        collector.on('end', () => {
            if (!correct) {
                msg.delete().catch(console.error);
                message.channel.send(`❎ **| ${message.author}, timed out. The correct answer is\n\`${equation} = ${answer}\`.**`);
                cd.delete(message.author.id)
            }
        })
    })
};

module.exports.config = {
    name: "mathquiz",
    description: "Creates a simple math equation that you have to solve within 30 seconds.",
    usage: "mathquiz [level] [n operators]",
    detail: "`level`: Difficulty level of equation, defaults to 1, range is from 1 to 20 [Integer]\n`n operators`: The amount of operators to be used in the equation. Defaults to 4, range is from 1 to 10 [Integer]",
    permission: "None"
};
