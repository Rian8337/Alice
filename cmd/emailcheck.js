var Discord = require('discord.js');
var http = require('http');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;
let config = require('../config.json');

module.exports.run = (client, message, args) => {
	try {
		let rolecheck = message.member.roles
	} catch (e) {
		return
	}
	if (!message.member.roles.find(r => r.name === 'Owner')) return message.channel.send("❎  **| I'm sorry, you don't have the permission to use this.**");
	let uid = args[0];
	if (isNaN(uid)) return message.channel.send("❎  **| I'm sorry, that uid is not valid.**");
	var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid);
	var content = "";

	var req = http.get(options, function (res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});
		res.on("error", err => {
			console.log(err);
			return message.channel.send("Error: Unable to retrieve user data. Please try again!")
		});
		res.on("end", function () {
			var resarr = content.split('<br>');
			var headerres = resarr[0].split(' ');
			if (headerres[0] == 'FAILED') return message.channel.send("❎  **| I'm sorry, it looks like the user doesn't exist.**");
			var name = headerres[2];
			var email = headerres[6];
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			let embed = new Discord.RichEmbed()
				.setTitle("User profile")
				.setColor(message.member.highestRole.hexColor)
				.setFooter("Alice Synthesis Thirty", footer[index])
				.addField("Username", name)
				.addField("Uid", uid)
				.addField("Email", email);

			try {
				message.author.send(embed)
			} catch (e) {
				return message.channel.send(`❎  **| ${message.author}, your DM is locked!**`);
			}
			message.channel.send(`✅  **| ${message.author}, the user info has been sent to you!**`);
		})
	});
	req.end()
};

module.exports.help = {
	name: "emailcheck"
};
