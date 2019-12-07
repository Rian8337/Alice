let config = require('../config.json');
let cd = new Set();

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");
    let x = args[0];
    if (cd.has(message.author.id)) return message.channel.send("Please wait for a bit before using this command again!");
    if (isNaN(x)) return message.channel.send("Invalid input");
    let avatar = config.avatar_list;
    if (!avatar[x]) return message.channel.send("There is no avatar!");
    client.user.setAvatar(avatar[x]).then (() => {
        message.channel.send(`Changed avatar to ${avatar[x]}`)
        cd.add(message.author.id);
        setTimeout(() => {
            cd.delete(message.author.id)
        }, 5000)
    }).catch(() => message.channel.send("You are changing avatar too fast!"));
};

module.exports.help = {
    name: "changeavatar"
};
