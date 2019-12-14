module.exports.run = async (client, message, args, maindb) => {
    let user = message.author.id;
    if (args[0]) {
        user = args[0];
        user = user.replace("<@", "");
        user = user.replace(">", "")
    }
    let skindb = maindb.collection("skin");
    let query = {discordid: user};
    skindb.find(query).toArray(async (err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("Error: Empty database response. Please try again!")
        }
        if (res[0]) {
            let name = await client.fetchUser(user);
            name = name.username;
            let skinlink = res[0].skin;
            message.channel.send(`✅  **| ${name}'s skin: ${skinlink}.**`)
        }
        else {
            if (args[0]) message.channel.send("❎  **| The user hasn't set their skin yet! He/she must use `a!setskin <skin link>` first.**");
            else message.channel.send("❎  **| You haven't set your skin yet! You must use `a!setskin <skin link>` first.**")
        }
    })
};

module.exports.help = {
    name: "skin"
};