var fs = require('fs');

module.exports.run = (client, message, args) => {
	fs.readFile("help.txt", function(err, data1) {
        if (err) throw err;
        else message.channel.send("```"+data1+"```");
	});
};

module.exports.help = {
	name: "help"
};