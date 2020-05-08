let cd = new Set();

function createRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min)
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

async function generateEquation(level, operator_amount) {
    let operators = ['/', '*', '+', '-'];
    let prev_operator_amount = operator_amount;
    let equation = '';
    let real_equation = '';
    let answer = Number.NaN;
    let prime_count = 0;
    let last_operator = '';
    let attempts = 0;

    while (!Number.isInteger(answer)) {
        if (attempts === 500) break;

        while (operator_amount > 0) {
            const index = Math.floor(Math.random() * operators.length);
            let operator = operators[index];
            let number = generateNumber(level, operator);
            let mul_or_div = operator === '/' || operator === '*' || last_operator === '/' || last_operator === '*';
            if (mul_or_div) {
                while (!isPrime(number) && prime_count < Math.floor(level / 10))
                    number = generateNumber(level, operator);
                ++prime_count
            }

            // use RNG to determine putting factorial
            let factorial = level >= 11 && level + Math.random() * level >= 20;
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
            while (!isPrime(number) && prime_count < Math.floor(level / 5))
                number = generateNumber(level, last_operator);

        // use RNG to determine putting factorial
        let factorial = level >= 10 && Math.random() >= 1 - level / 25;
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
        if (
            !Number.isInteger(answer) ||
            (level >= 5 && mul_div_amount < min_mul_div_threshold && mul_div_amount > max_mul_div_threshold)
        ) {
            answer = Number.NaN;
            equation = '';
            real_equation = '';
            operator_amount = prev_operator_amount;
        }
        ++attempts
    }

    return [real_equation, answer]
}

module.exports.run = async (client, message, args) => {
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

    let val = await generateEquation(level, operator_amount);
    let equation = val[0];
    if (!equation) return message.channel.send("❎ **| I'm sorry, the equation generator had problems generating your equation, please try again!**");
    let answer = val[1];

    message.channel.send(`❗**| ${message.author}, here is your equation:\n\`Operator count ${operator_amount}, level ${level}\`\n\`\`\`fix\n${equation} = ...\`\`\`You have 30 seconds to solve it.**`).then(msg => {
        cd.add(message.author.id);
        let collector = message.channel.createMessageCollector(m => parseInt(m.content) === answer && m.author.id === message.author.id, {time: 30000, max: 1});
        let correct = false;
        collector.on('collect', () => {
            msg.delete().catch(console.error);
            correct = true;
            let timeDiff = Date.now() - msg.createdTimestamp;
            message.channel.send(`✅ **| ${message.author}, your answer is correct! It took you ${timeDiff / 1000}s!\n\`\`\`fix\n${equation} = ${answer}\`\`\`**`);
            cd.delete(message.author.id)
        });
        collector.on('end', () => {
            if (!correct) {
                msg.delete().catch(console.error);
                message.channel.send(`❎ **| ${message.author}, timed out. The correct answer is:\n\`\`\`fix\n${equation} = ${answer}\`\`\`**`);
                cd.delete(message.author.id)
            }
        })
    })
};

module.exports.config = {
    name: "mathquiz",
    description: "Creates a simple math equation that you have to solve within 30 seconds.\n\nFor reference:\n`+`: addition\n`-`: subtraction\n`*`: multiplication\n`/`: division\n`!`: factorial\nOperator precedence: `*`/`/` -> `+`/`-`",
    usage: "mathquiz [level] [n operators]",
    detail: "`level`: Difficulty level of equation, defaults to 1, range is from 1 to 20 [Integer]\n`n operators`: The amount of operators to be used in the equation. Defaults to 4, range is from 1 to 10 [Integer]",
    permission: "None"
};