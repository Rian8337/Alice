let config = require('../config.json');

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");
    let x = args[0];
    if (isNaN(x)) return message.channel.send("Invalid input");
    let avatar = config.avatar_list;
    if (!avatar[x]) return message.channel.send("There is no avatar!");
    client.user.setAvatar(avatar[x]).catch();
    message.channel.send(`Changed avatar to ${avatar[x]}`)
};

module.exports.help = {
    name: "changeavatar"
};