module.exports.run = (client, message, args, maindb, alicedb) => {
    let askdb = alicedb.collection("askcount");
    let query = {discordid: message.author.id};

    askdb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm sorry I'm having trouble receiving response from database. Please try again!**")
        }
        if (res[0]) {
            let count = res[0].count;
            if (count === 1) message.channel.send(`✅ **| ${message.author.username}, you have asked me \`${count}\` time.**`);
            else message.channel.send(`✅ **| ${message.author.username}, you have asked me \`${count}\` times.**`)
        }
        else message.channel.send("❎ **| I'm sorry, looks like you haven't asked me yet!**")
    })
};

module.exports.config = {
    name: "askcount",
    description: "See how many times you have asked me.",
    usage: "askcount",
    detail: "None",
    permission: "None"
};
