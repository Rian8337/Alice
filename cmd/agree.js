module.exports.run = (client, message) => {
    let channel = message.guild.channels.get("640469832625815553");
    if (!channel) {
        message.author.lastMessage.delete();
        return;
    }
    if (message.channel.id !== "640469832625815553") {
        message.author.lastMessage.delete();
        message.channel.send(`${message.author}, that command is only allowed in <#${channel}>!`).then (message => {
            message.delete(5000)
        });
        return;
    }
    let role = message.guild.roles.find("name", "Mudae Player");
    if (!role) return message.channel.send("There is no Mudae in this server!");
    let user = message.guild.member(message.author);
    if (!message.member.roles.has(role.id)) {
        user.addRole(role.id).catch(console.error);
        message.channel.send(`Added Mudae Player role for ${message.author}.`)
    } else {
        message.author.lastMessage.delete();
        message.channel.send(`${message.author}, you already have Mudae Player role!`).then (message => {
            message.delete(5000)
        })
    }
};

module.exports.config = {
    description: "Mudae-role toggle (only applies in droid cafe).",
    usage: "agree",
    permission: "Owner"
};

module.exports.help = {
    name: "agree"
};
