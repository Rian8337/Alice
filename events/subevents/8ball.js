module.exports.run = (client, message, msgArray, alicedb) => {
    if (message.channel.type === "dm") return message.channel.send("I do not want to respond in DMs!");
    let args = msgArray.slice(0);
    let cmd = client.utils.get("response");
    cmd.run(message, args, alicedb)
};

module.exports.config = {
    name: "8ball"
};
