var fs = require('fs');

module.exports.run = (client, message) => {
	fs.readFile("help.txt", function(err, data1) {
		if (err) {
			console.log(err);
			return message.channel.send("Error retrieving data. Please try again!")
		}
		message.channel.send("Complete command list can be found at https://github.com/Rian8337/Alice\n```"+data1+"```");
	});
};

module.exports.help = {
	name: "help"
};
