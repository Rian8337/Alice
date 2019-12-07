let config = require('../config.json');

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");
    let x = args[0];
    if (!x || x < 0 || isNaN(x)) return message.channel.send("Invalid input");
    let activity = config.activity_list;
    if (!activity[x]) return message.channel.send("There is no activity!");
    if (x == 1) {
        let episode = args[1];
        if (episode <= 0 || isNaN(episode)) return;
        client.user.setActivity(activity[x][0] + episode, {type: activity[x][1], url: "https://github.com/Rian8337/Alice"}).catch();
        message.channel.send("Status changed to " + activity[x][0] + episode + ", activity type: " + activity[x][1])
    }
    else {
        client.user.setActivity(activity[x][0], {type: activity[x][1], url: "https://github.com/Rian8337/Alice"}).catch();
        message.channel.send("Status changed to " + activity[x][0] + ", activity type: " + activity[x][1])
    }
};

module.exports.help = {
    name: "togglestatus"
};
