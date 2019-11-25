var fs = require('fs');

module.exports.run = (client, message, args) => {
	 fs.readFile("emotelist.txt", function(err, data2) {
        if (err) throw err;
        else message.channel.send("Emote List\n"+data2); 
    });
}

module.exports.help = {
	name: "emotelist"
}
