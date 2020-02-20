const Discord = require('discord.js');

module.exports.run = (client, message, args, maindb) => {
    let username = args[0];
    if (!username) return message.channel.send("❎ **| Hey, can you at least give me a valid username?**");
    let binddb = maindb.collection("userbind");
    let query = {username: username};
    let rolecheck;
    try {
        rolecheck = message.member.highestRole.hexColor
    } catch (e) {
        rolecheck = "#000000"
    }
    let embed = new Discord.RichEmbed()
        .setColor(rolecheck);

    binddb.find(query).toArray((err, res) => {
        if (err) {
            console.log(err);
            return message.channel.send("❎ **| I'm not receiving any response from database. Perhaps try again?**")
        }
        if (!res[0]) {
            embed.setDescription(`**Username ${username} is not binded**`);
            return message.channel.send({embed: embed})
        }
        let bind = "Username " + username + " is binded to ";
        let accounts = '';
        let userid = '';
        let acc = 0;
        res.forEach(x => {
            accounts += `<@${x.discordid}>`;
            userid += `\`${x.discordid}\``;
            acc++;
            if (acc == res.length) {
                accounts = accounts.trimRight().split(" ").join(", ");
                userid = `.\nUser ID: ${userid.trimRight().split(" ").join(", ")}`;
                bind += accounts + userid;
                embed.setDescription(`**${bind}**`);
                message.channel.send({embed: embed}).catch(console.error)
            }
        })
    })
};

module.exports.config = {
    name: "usersearch",
    description: "Checks if specific username is binded.",
    usage: "usersearch <username>",
    detail: "`username`: The username to check [String]",
    permission: "None"
};
