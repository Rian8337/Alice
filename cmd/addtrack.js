var mongodb = require('mongodb');

module.exports.run = (client, message, args, maindb) => {
	if (message.member.roles.find("name", "Owner")) {
		let uid = args[0];
		if (isNaN(parseInt(uid))) {message.channel.send("Your uid please!")}
		else {
			let trackdb = maindb.collection("tracking");
			let query = { uid: uid };
			var track = { uid: uid };
			trackdb.find(query).toArray(function(err, res) {
				if (err) throw err;
				if (!res[0]) {
					trackdb.insertOne(track, function(err, res) {
						if (err) throw err;
						console.log("track added");
						message.channel.send("Now tracking uid "+uid);
					});
				}
				else {
					console.log("duplicated");
					message.channel.send("this uid has been already added");
				}
			});
		}
	}
	else message.channel.send("You don't have enough permission to use this :3");
};

module.exports.help = {
	name: "addtrack"
};
