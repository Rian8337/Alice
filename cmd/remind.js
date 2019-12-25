let Discord = require('discord.js');

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return;
    let user = args[0];
    if (!user) {
        message.channel.send("Please specify correct user to remind!");
        return
    }
    user = user.replace('<@', '');
    user = user.replace('>', '');
    let toremind = message.guild.members.get(user);
    if (!toremind) {
        message.channel.send("User not found");
        return
    }

    let time = args[1];
    if (!time) {
        message.channel.send("Please specify remind time!");
        return
    }
    time = time.toString();

    if (time.indexOf("h") == -1) {
        message.channel.send("Please enter hours!");
        return
    }
    if (time.indexOf("m") == -1) {
        message.channel.send("Please enter minutes!");
        return
    }

    let hours = time.toString().split("h");
    if (!Number.isInteger(Number(hours[0]))) {
        message.channel.send("Invalid hours");
        return
    }
    let hour = parseInt(hours[0]) * 3600;

    let minutes = hours[1].split("m");
    if (!Number.isInteger(Number(minutes[0]))) {
        message.channel.send("Invalid minutes");
        return
    }
    let minute = parseInt(minutes[0]) * 60;

    let second = 0;
    if (minutes[1].indexOf("s") != -1) {
        let seconds = minutes[1].split("s");
        if (Number.isInteger(Number(seconds[0]))) second = parseInt(seconds[0])
    }

    let timer = hour + minute + second;
    if (timer == 0) {
        message.channel.send("Invalid time");
        return
    }

    let remind = args.slice(2).join(" ");
    if (!remind) {
        message.channel.send("Please enter remind message!");
        return
    }

    message.channel.send("Got it! I will remind the user!");

    const embed = new Discord.RichEmbed()
        .setTitle("Reminder!")
        .setTimestamp(new Date())
        .setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
        .setColor("#527ea3")
        .setDescription(`${remind} (from ${message.author})`);

    setTimeout(() => {
        toremind.send(embed).catch(e => console.log(e))
    }, timer * 1000)
};

module.exports.config = {
    description: "Reminds a user about an activity.",
    usage: "remind [hours]h[minutes]m<seconds>s <reminder>",
    detail: "`hours`: Time to remind in hours [Integer]\n`minutes`: Time to remind in minutes [Integer]\n`seconds`: Time to remind in seconds [Integer]",
    permission: "Bot Owner"
};

module.exports.help = {
    name: "remind"
};
