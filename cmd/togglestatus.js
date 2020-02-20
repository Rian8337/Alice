const config = require('../config.json');

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return message.channel.send("You don't have permission to do this");
    let x = args[0];
    if (!isNaN(x)) {
        let activity = config.activity_list;
        if (!activity[x]) return message.channel.send("There is no activity!");
        if (x == 1) {
            let episode = args[1];
            if (episode <= 0 || isNaN(episode)) return;
            client.user.setActivity(activity[x][0] + episode, {
                type: activity[x][1],
                url: "https://github.com/Rian8337/Alice"
            }).catch(e => console.log(e));
            message.channel.send("Status changed to " + activity[x][0] + episode + ", activity type: " + activity[x][1])
        } else {
            client.user.setActivity(activity[x][0], {
                type: activity[x][1],
                url: "https://github.com/Rian8337/Alice"
            }).catch(e => console.log(e));
            message.channel.send("Status changed to " + activity[x][0] + ", activity type: " + activity[x][1])
        }
    }
    else {
        if (x == 'c') {
            let type = args[1].toUpperCase();
            if (!type) return message.channel.send("Please provide activity type!");
            let activity = args.slice(2).join(" ");
            if (!activity) return message.channel.send("Please provide activity!");
            client.user.setActivity(activity, {type: type, url: "https://github.com/Rian8337/Alice"}).catch(e => console.log(e));
            message.channel.send("Status changed to " + activity + ", activity type: " + type)
        }
        else message.channel.send("Invalid input")
    }
};

module.exports.config = {
    name: "togglestatus",
    description: "Toggles bot status.",
    usage: "togglestatus <list>\ntogglestatus c <type> <activity>",
    detail: "`list`: Activity order in config file [Integer]\n`type`: Activity type [String]. Accepted arguments are `playing`, `streaming`, `watching`, `listening`\n`activity`: Activity [String]",
    permission: "Bot Owner"
};
