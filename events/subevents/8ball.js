module.exports.run = (client, message, msgArray, alicedb) => {
    let args = msgArray.slice(0);
    let cmd = client.utils.get("response");
    cmd.run(message, args, alicedb)
};

module.exports.config = {
    name: "8ball"
};
