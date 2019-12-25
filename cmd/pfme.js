var http = require('http');
require('mongodb');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;
let config = require('../config.json');

module.exports.run = (client, message, args, maindb) => {
	let ufind = message.author.id;
	if (args[0]) {
		ufind = args[0];
		ufind = ufind.replace('<@!','');
		ufind = ufind.replace('<@','');
		ufind = ufind.replace('>','');
	}
	console.log(ufind);
	let binddb = maindb.collection("userbind");
	let query = { discordid: ufind };
	binddb.find(query).toArray(function(err, res) {
		if (err) {
			console.log(err);
			return message.channel.send("Error: Empty database response. Please try again!")
		}
		if (res[0]) {
			let uid = res[0].uid;
			var options = {
				host: "ops.dgsrz.com",
				port: 80,
				path: "/profile.php?uid="+uid+".html"
			};

			var content = "";   

			var req = http.request(options, function(res) {
				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					content += chunk;
				});

				res.on("end", function () {
					const a = content;
					let b = a.split('\n');
					let avalink=""; let location="";
					for (x = 0; x < b.length; x++) {
						if (b[x].includes('h3 m-t-xs m-b-xs')) {
							b[x-3]=b[x-3].replace('<img src="',"");
							b[x-3]=b[x-3].replace('" class="img-circle">',"");
							b[x-3]=b[x-3].trim();
							avalink = b[x-3];
							b[x+1]=b[x+1].replace('<small class="text-muted"><i class="fa fa-map-marker"><\/i>',"");
							b[x+1]=b[x+1].replace("<\/small>","");
							b[x+1]=b[x+1].trim();
							location=b[x+1]
						}
					}
					apiFetch(uid, avalink, location, message)
				})
			});
			req.end()
		}
		else message.channel.send("❎ **| I'm sorry, the account is not binded. He/she/you need to use `a!userbind <uid>` first. To get uid, use `a!profilesearch <username>`.**")
	})
};

function apiFetch(uid, avalink, location, message) {
	var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid);
	var content = "";   

	var req = http.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});
		res.on("error", err => {
			console.log(err);
			return message.channel.send("Error: Empty API response. Please try again!")
		});
		res.on("end", function () {
			var resarr;
			try {
				resarr = content.split('<br>');
			} catch (e) {
				return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from osu!droid API now. Please try again later!**")
			}
			var headerres = resarr[0].split(' ');
			if (headerres[0] == 'FAILED') {message.channel.send("User not exist"); return;}
			resarr.shift();
			content = resarr.join("");
			var obj = JSON.parse(content);
			var name = headerres[2];
			var tscore = headerres[3];
			var pcount = headerres[4];
			var oacc = parseFloat(headerres[5])*100;
			var rank = obj.rank;
			let footer = config.avatar_list;
			const index = Math.floor(Math.random() * (footer.length - 1) + 1);
			const embed = {
				"description": "**Username: **"+name+"  /  **Rank**: "+rank + "\n" + location,
				"color": 8102199,
					"thumbnail": {
						"url": avalink
				},
				"footer": {
					"icon_url": footer[index],
					"text": "Alice Synthesis Thirty"
				},
				"author": {
					"name": "osu!droid profile (click here to view profile)",
					"url": "http://ops.dgsrz.com/profile.php?uid="+uid,
						"icon_url": "https://image.frl/p/beyefgeq5m7tobjg.jpg"
				},
				"fields": [
					{
						"name": "Total Score: " + parseInt(tscore).toLocaleString(),
						"value": "Play Count: " + pcount + "\n" + "Overall Accuracy: " + oacc.toFixed(2) + "%"
					}
				]
			};
			message.channel.send({ embed });
		})
	});
	req.end()
}

module.exports.config = {
	description: "Retrieves an osu!droid profile.",
	usage: "pfme [user]",
	detail: "`user`: The user to retrieve profile from [UserResolvable (mention or user ID)]",
	permission: "None"
};

module.exports.help = {
	name: "pfme"
};
