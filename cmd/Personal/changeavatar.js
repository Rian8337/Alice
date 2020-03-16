const config = require('../../config.json');
const cd = new Set();

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");
    let ufind = message.author.id;
    if (cd.has(ufind)) return message.channel.send("Please wait for a bit before using this command again!");
    let x = args[0];
    if (isNaN(x)) return message.channel.send("Invalid input");
    let avatar = config.avatar_list;
    if (!avatar[x]) return message.channel.send("There is no avatar!");
    client.user.setAvatar(avatar[x]).then(() => {
        message.channel.send(`Changed avatar`, {file: avatar[x]});
        cd.add(ufind);
        setTimeout(() => {
            cd.delete(ufind)
        }, 5000)
    }).catch(() => message.channel.send("You are changing avatar too fast!"));
};

module.exports.config = {
    name: "changeavatar",
    description: "Changes the bot's avatar.",
    usage: "changeavatar <number>",
    detail: "`number`: Order in config file [Integer]",
    permission: "Bot Owner"
};
