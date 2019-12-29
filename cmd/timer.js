var cd = new Set();

module.exports.run = (client, message, args) => {
    if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, you still have a timer active! Wait until that one is finished, please!**");
    try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
    if (!message.member.roles.find(r => r.name === 'Referee')) return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
    var timelimit = parseInt(args[0]);
    if (isNaN(timelimit)) return message.channel.send("❎ **| Hey, can you enter a valid time limit?**");
    if (timelimit < 1 || timelimit > 1800 || timelimit == Infinity) return message.channel.send("❎ **| Hey, my timer has a limit of 30 minutes!**");

    if (timelimit == 1) message.channel.send(`✅ **| Got it! Your timer has been set to ${timelimit} second!**`);
    else message.channel.send(`✅ **| Got it! Your timer has been set to  ${timelimit} seconds!**`);
    cd.add(message.author.id);
    setTimeout(() => {
        cd.delete(message.author.id);
        message.channel.send(`✅ **| ${message.author}, the time is up!**`)
    }, timelimit * 1000)
};

module.exports.config = {
    description: "Set a timer.\nIntended for tournament use.",
    usage: "timer <timelimit>",
    detail: "`timelimit`: The time limit in seconds from 1 to 1800 [Integer]",
    permission: "Referee"
};

module.exports.help = {
    name: "timer"
};
