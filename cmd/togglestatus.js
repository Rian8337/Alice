let config = require('../config.json');

module.exports.run = (client, message, args) => {
    if (message.author.id != '386742340968120321') return;
    let x = args[0];
    if (!x || x < 0 || isNaN(x)) return;
    let activity = config.activity_list;
    if (x == 1) {
        let episode = args[1];
        if (episode <= 0 || isNaN(episode)) return;
        client.setActivity(activity[x][0] + episode, {type: activity[x][1], url: "https://github.com/Rian8337/Alice"}).catch()
    }
    else client.setActivity(activity[x][0], {type: activity[x][1], url: "https://github.com/Rian8337/Alice"}).catch()
};

module.exports.help = {
    name: "togglestatus"
};