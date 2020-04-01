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
    if (operator_amount <= 1 || operator_amount > 10) return message.channel.send("❎ **| I'm sorry, operator amount range is from 2-10!**");
    operator_amount = parseInt(operator_amount);

    let prev_operator_amount = operator_amount;
    let operators = ['/', '*', '+', '-'];
    let equation = '';
    let result = Number.NaN;

    while (!Number.isInteger(result)) {
        while (operator_amount > 0) {
            let number = createRandomNumber(Math.random() * 5 * Math.max(1, level / 2), Math.max(5 * Math.max(1, level / 2), Math.random() * 15 * level / 2));
            const index = Math.floor(Math.random() * operators.length);
            if (operators[index] === '/' || operators[index] === '*') {
                number = createRandomNumber(Math.random() * 5 * Math.random() * Math.max(1, (level / 2)), Math.random() * 10 * Math.max(1, Math.random() * level / 2));
                if (level >= 3) {
                    while (number === 0) number = createRandomNumber(Math.random() * 5 * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.max(1, Math.random() * level / 2));
                }
            }
            equation += `${number} ${operators[index]} `;
            --operator_amount
        }
        let last_operator = equation.substring(equation.length - 2).trim();
        if (last_operator === '/' || last_operator === '*') equation += createRandomNumber(Math.random() * 5 * Math.random() * Math.max(1, Math.random() * level / 2), Math.random() * 10 * Math.random() * Math.max(1, Math.random() * level / 2));
        else equation += createRandomNumber(Math.random() * 5 * level, Math.max(5 * Math.max(1, level / 2), Math.random() * 15 * Math.max(1, level / 2)));
        result = eval(equation);
        if (!Number.isInteger(result)) {
            result = Number.NaN;
            equation = '';
            operator_amount = prev_operator_amount
        }
    }

    message.channel.send(`❗**| ${message.author}, here is your equation (level ${level}, ${prev_operator_amount} operators):\n\`${equation} = ...\`\nYou have 30 seconds to solve it.**`).then(msg => {
        cd.add(message.author.id);
        let collector = message.channel.createMessageCollector(m => parseFloat(m.content) === result && m.author.id === message.author.id, {time: 30000});
        let correct = false;
        collector.on('collect', () => {
            msg.delete().catch(console.error);
            correct = true;
            let timeDiff = Date.now() - msg.createdTimestamp;
            message.channel.send(`✅ **| ${message.author}, your answer is correct! It took you ${timeDiff / 1000}s!\n\`${equation} = ${result}\`**`);
            collector.stop();
            cd.delete(message.author.id)
        });
        collector.on('end', () => {
            if (!correct) {
                msg.delete().catch(console.error);
                message.channel.send(`❎ **| ${message.author}, timed out. The correct answer is\n\`${equation} = ${result}\`.**`);
                cd.delete(message.author.id)
            }
        })
    })
};

module.exports.config = {
    name: "mathquiz",
    description: "Creates a simple math equation that you have to solve within 30 seconds.",
    usage: "mathquiz [level] [n operators]",
    detail: "`level`: Difficulty level of equation, defaults to 1, range is from 1 to 20 [Integer]\n`n operators`: The amount of operators to be used in the equation. Defaults to 4, range is from 2 to 10 [Integer]",
    permission: "None"
};
