var fs = require('fs');
var http = require('http');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;

function deprecatedSearch(username, message, cb) {
	var notFound=0;
	fs.readFile("profileDataDump(2417-30000).txt", 'utf8', function(err, data) {
		if (err) throw err;
		var u = data;
		let b = u.split('\n'); c=[];
		for (x = 0; x < b.length; x++) {
			if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
				b[x-1]="\n"+b[x-1];
				c.push([b[x],b[x-1]]);
			}
		}
		if (c.length!=0) foundPrint(message, c[0]);
		else {
			notFound++;
			if (notFound==4) {
				notFound=0;
				cb();
			}
		}
	});
	fs.readFile("profileDataDump(30000-100000).txt", 'utf8', function(err, data) {
		if (err) throw err;
		var u = data;
		let b = u.split('\n'); d=[];
		for (x = 0; x < b.length; x++) {
			if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
				b[x-1]="\n"+b[x-1];
				d.push([b[x],b[x-1]]);
			}
		}
		if (d.length!=0) foundPrint(message, d[0]);
		else {
			notFound++;
			if (notFound==4) {
				notFound=0;
				cb();
			}
		}
	});
	fs.readFile("profileDataDump(100000-150000).txt", 'utf8', function(err, data) {
		if (err) throw err;
		var u = data;
		let b = u.split('\n');e=[];
		for (x = 0; x < b.length; x++) {
			if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
				b[x-1]="\n"+b[x-1];
				e.push([b[x],b[x-1]]);
			}
		}
		if (e.length!=0) foundPrint(message, e[0]);
		else {
			notFound++;
			if (notFound==4) {
				notFound=0;
				cb();
			}
		}
	});
	fs.readFile("profileDataDump(150000-200000).txt", 'utf8', function(err, data) {
		if (err) throw err;
		var u = data;
		let b = u.split('\n'); f=[];
		for (x = 0; x < b.length; x++) {
			if (b[x].startsWith(username+" /") && b[x - 1].includes('http')) {
				b[x-1]="\n"+b[x-1];
				f.push([b[x],b[x-1]]);
			}
		}
		if (f.length!=0) foundPrint(message, f[0]);
		else {
			notFound++;
			if (notFound==4) {
				notFound=0;
				cb();
			}
		}
	})
}

function apiSearch(username, message) {
	var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&username=" + username);
	var content = "";

	var req = http.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var resarr = content.split('<br>');
			var headerres = resarr[0].split(' ');
			if (headerres[0] == 'FAILED') return message.channel.send("❎  **| I'm sorry, I cannot find the user. Please make sure that the name is correct (including upper and lower case).**");
			var uid = headerres[1];
			foundPrint(message, [], username, uid)
		})
	})
}

function foundPrint(message, outString, username = "", uid = -1) {
	if (outString[0]) {
		console.log(outString);
		uid = outString[1].split("?uid=")[1];
		username = outString[0].split(" / ")[0]
	}
	var embed = {
		"title": username + "'s uid is " + uid,
		"color": 1900288,
		"url": "http://ops.dgsrz.com/profile.php?uid=" + uid
	};
	message.channel.send({embed})
}

module.exports.run = (client, message, args) => {
	var username = args[0];
	if (!args[0]) return message.channel.send("❎  **| Hey, can you at least tell me what username I need to search for?**");
	deprecatedSearch(username, message, () => {
		console.log("local mode not found");
		apiSearch(username, message)
	})
};

module.exports.help = {
	name: "profilesearch"
};
