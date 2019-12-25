var mongodb = require('mongodb');

module.exports.run = (client, message, args, maindb) => {
	try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
	if (message.member.roles.find("name", "Owner")) {
		let uid = args[0];
		if (isNaN(parseInt(uid))) {message.channel.send("uid please!")}
		else {
		let trackdb = maindb.collection("tracking");
			let query = { uid: uid };
			trackdb.find(query).toArray(function(err, res) {
				if (err) throw err;
				if (!res[0]) {
					console.log("track not found");
					message.channel.send("uid " + uid + " is not tracked");
				}
				else {
					trackdb.deleteOne(query, function(err, res) {
						if (err) throw err;
						console.log("track deleted");
						message.channel.send("uid " + uid + " is deleted from tracking list");
					});
				}
			});
		}
	}
	else message.channel.send("You don't have enough permission to use this :3");
};

module.exports.config = {
	description: "Deletes a uid from tracking list.",
	usage: "deletetrack <uid>",
	detail: "`uid`: Uid to delete [Integer]",
	permission: "Owner"
};

module.exports.help = {
	name: "deletetrack"
};
