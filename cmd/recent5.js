var http = require('http');
require("dotenv").config();
var droidapikey = process.env.DROID_API_KEY;

function modread(input) {
	var res = '';
	if (input.includes('n')) res += 'NF';
	if (input.includes('h')) res += 'HD';
	if (input.includes('r')) res += 'HR';
	if (input.includes('e')) res += 'EZ';
	if (input.includes('t')) res += 'HT';
	if (input.includes('c')) res += 'NC';
	if (input.includes('d')) res += 'DT';
	if (res) res = '+' + res;
	return res;
}

function rankEmote(input) {
	if (!input) return;
	switch (input) {
		case 'A': return '611559473236148265';
		case 'B': return '611559473169039413';
		case 'C': return '611559473328422942';
		case 'D': return '611559473122639884';
		case 'S': return '611559473294606336';
		case 'X': return '611559473492000769';
		case 'SH': return '611559473361846274';
		case 'XH': return '611559473479155713';
		default : return;
	}
}

module.exports.run = (client, message, args) => {
	let uid = parseInt(args[0]);
	if (isNaN(uid)) {message.channel.send("Invalid uid"); return;}
	let page = 1;
	if (args[1]) page = parseInt(args[1]);
	if (isNaN(args[1]) || page <= 0 || page > 10) page = 1;
	var options = new URL("http://ops.dgsrz.com/api/getuserinfo.php?apiKey=" + droidapikey + "&uid=" + uid);
	var content = "";   

	var req = http.get(options, function(res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			content += chunk;
		});

		res.on("end", function () {
			var resarr = content.split('<br>');
			var headerres = resarr[0].split(' ');
			if (headerres[0] == 'FAILED') {message.channel.send("User doesn't exist"); return;}
			resarr.shift();
			content = resarr.join("");
			var obj = JSON.parse(content);
			var name = headerres[2];
			var entries = [];
			var rplay = obj.recent;
			for (var i = 5 * (page - 1); i < 5 + 5 * (page - 1); i++) {
				if (!rplay[i]) break;
				var date = new Date(rplay[i].date*1000);
				date.setUTCHours(date.getUTCHours() + 8);
				var entry = {
					"name": client.emojis.get(rankEmote(rplay[i].mark)).toString() + " | " + rplay[i].filename + " " + modread(rplay[i].mode),
					"value": rplay[i].score.toLocaleString() + ' / ' + rplay[i].combo + 'x / ' + parseFloat(rplay[i].accuracy)/1000 + '% / ' + rplay[i].miss + ' miss(es) \n `' + date.toUTCString() + '`'
				};
				entries.push(entry);
			}
			if (!rplay[0]) {message.channel.send("This player haven't submitted any play"); return;}
			const embed = {
				"description": "Recent play for **" + name + " (Page " + page + ")**",
				"color": 8102199,
				"footer": {
					"icon_url": "https://i.imgur.com/S5yspQs.jpg",
					"text": "Alice Synthesis Thirty"
				},
				"fields": entries
			};
			
			message.channel.send({ embed });
		})
	});
	req.end();
};

module.exports.help = {
	name: "recent5"
};
