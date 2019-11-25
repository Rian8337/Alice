var http = require('http');

function moderead(modesrc) {
	let mode ="";
	switch(modesrc) {
		case '<img src="/static/img/mode/mode-0.png">': mode = "Key";break;
		case '<img src="/static/img/mode/mode-1.png">': mode = "Step";break;
		case '<img src="/static/img/mode/mode-2.png">': mode = "DJ";break;
		case '<img src="/static/img/mode/mode-3.png">': mode = "Catch";break;
		case '<img src="/static/img/mode/mode-4.png">': mode = "Pad";break;
		case '<img src="/static/img/mode/mode-5.png">': mode = "Taiko";break;
		case '<img src="/static/img/mode/mode-6.png">': mode = "Ring";break;
		default: mode = "unknown"
	}
	return mode;
}

module.exports.run = (client, message, args) => {
	if (args.length==2) {
    let username = args[0];let selectedMode= args[1].toLowerCase();
		var options = {
    		host: "m.mugzone.net",
    		port: 80,
    		path: "/page/search?keyword="+username
		};

		var content = "";   

		var req = http.request(options, function(res) {
    		res.setEncoding("utf8");
    		res.on("data", function (chunk) {
        		content += chunk;
    		});
			res.on("end", function () {
				const a = content;
				let b = a.split('\n'); let found=false; let id=''; let foundplayer=''; idfound=[];pfound=[];
				for (x = 0; x < b.length; x++) {
    				if (b[x].includes("Players (10 limit)")) {
						for (var t=1;t<10;t++) {
							if (!b[x+t].includes('<a class="textfix" href="')) break;
							b[x+t]=b[x+t].replace('<a class="textfix" href="','');
							let c= b[x+t].split('">');
							idfound.push(c[0]);
							pfound.push(c[1].replace("</a>",''));
							console.log(pfound);
						}
						for (i in idfound) {
							if (pfound[i]===username) {
								id=idfound[i];
								foundplayer=pfound[i];
								found=true;
							}
						}
						if (!found) {
							id=idfound[0];
							foundplayer=pfound[0];
							found=true;
						}
						var options2 = {
    						host: "m.mugzone.net",
    						port: 80,
    						path: id
						};

						var content2 = "";   

						var req2 = http.request(options2, function(res) {
    						res.setEncoding("utf8");
    						res.on("data", function (chunk) {
        						content2 += chunk;
    						});
							res.on("end", function () {
								const a2 = content2;
								let b2 = a2.split('\n'); playmode=[];
								for (x2 = 0; x2 < b2.length; x2++) {
    								if (b2[x2].includes('img src="/static/img/mode')&&b2[x2+1].includes('div class="right"')) {
										var info = moderead(b2[x2]);
										b2[x2+2]=b2[x2+2].replace('<p class="rank">','');b2[x2+2]=b2[x2+2].replace('</p>','');
										b2[x2+4]=b2[x2+4].replace('<span>','');b2[x2+4]=b2[x2+4].replace('</span>','');
										b2[x2+5]=b2[x2+5].replace('<span>','');b2[x2+5]=b2[x2+5].replace('</span>','');
										b2[x2+8]=b2[x2+8].replace('<span>','');b2[x2+8]=b2[x2+8].replace('</span>','');
										b2[x2+9]=b2[x2+9].replace('<span>','');b2[x2+9]=b2[x2+9].replace('</span>','');
										info = info+" - "+b2[x2+2]+"\n"+b2[x2+4]+" - "+b2[x2+5]+"\n"+b2[x2+8]+" - "+b2[x2+9];
										playmode.push(info);
									}
								}
								let result="";
								for (i in playmode) {
									switch (selectedMode) {
									case "all": result+=playmode[i]+"\n\n";break;
									case "key": if(playmode[i].includes("Key")) {result+=playmode[i]};break;
									case "step": if(playmode[i].includes("Step")) {result+=playmode[i]};break;
									case "dj": if(playmode[i].includes("DJ")) {result+=playmode[i]};break;
									case "catch": if(playmode[i].includes("Catch")) {result+=playmode[i]};break;
									case "pad": if(playmode[i].includes("Pad")) {result+=playmode[i]};break;
									case "taiko": if(playmode[i].includes("Taiko")) {result+=playmode[i]};break;
									case "ring": if(playmode[i].includes("Ring")) {result+=playmode[i]};break;
									default:
									}
								}
								if (result) {
									message.channel.send("```Malody profile result for "+foundplayer+"\n\n"+result+"```");
								}
								else message.channel.send("Look like the user you search havent played this mode yet");
							});
						});
						req2.end()
					}
				}
				if (!found) {message.channel.send("user not found, remember the search is CaSe sensitive");}
			});
		});
		req.end();
		}
}

module.exports.help = {
	name: "malodyprofile"
}
