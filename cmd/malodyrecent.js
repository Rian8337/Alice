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

function gmodread (modsrc) {
	let gmod ="";
	switch(modsrc) {
		case '<i class="g_mod g_mod_1"></i>': gmod = "Luck";break;
		case '<i class="g_mod g_mod_2"></i>': gmod = "Flip";break;
		case '<i class="g_mod g_mod_3"></i>': gmod = "Const";break;
		case '<i class="g_mod g_mod_4"></i>': gmod = "Dash";break;
		case '<i class="g_mod g_mod_5"></i>': gmod = "Rush";break;
		case '<i class="g_mod g_mod_6"></i>': gmod = "Slow";break;
		case '<i class="g_mod g_mod_7"></i>': gmod = "Hide";break;
		case '<i class="g_mod g_mod_8"></i>': gmod = "Origin";break;
		default: gmod="unknown";
	}
	return gmod;
}

function htmlDecode (input) {
  return input.replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&#39;/g, "'")
			  .replace(/&quot;/g, '"');
}

module.exports.run = (client, message, args) => {
	if (args.length==3) {
        let username = args[0];let selectedMode= args[1].toLowerCase();let limitRecent= parseInt(args[2]);
		if (limitRecent>10||limitRecent<=0) {
			message.channel.send("Please select recent limit between 1 and 10");
			return;
		}
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
				const a = content;pfound=[];idfound=[];
				let b = a.split('\n'); let found=false; let id=""; let foundplayer="";
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
								let b2 = a2.split('\n'); recentplay=[];
								for (y = 0; y < b2.length; y++) {
    								if (b2[y].includes('<p class="textfix title"><img src="/static/img/mode')&&b2[y+1].includes("Score")) {
										let d=b2[y].split('>');
										d[1]=d[1].replace(' /','>');
										var info= moderead(d[1])
										d[3]=d[3].replace('</a','');
										info+=" - "+htmlDecode(d[3]);
										b2[y+1]=b2[y+1].replace('&nbsp;&nbsp;','');b2[y+1]=b2[y+1].replace('<p>Score: ','');
										b2[y+2]=b2[y+2].replace('&nbsp;&nbsp;','');b2[y+2]=b2[y+2].replace('Combo: ','');
										b2[y+3]=b2[y+3].replace('&nbsp;&nbsp;','');b2[y+3]=b2[y+3].replace('Acc. :','');
										b2[y+7]=b2[y+7].replace('</span>','');b2[y+7]=b2[y+7].replace('<span class="mod">','');if (!b2[y+7]) {b2[y+7]="None"} else {b2[y+7]=gmodread(b2[y+7])};
										b2[y+8]=b2[y+8].replace('</span>','');b2[y+8]=b2[y+8].replace('<span class="time">','');
										let e=b2[y+4].split('>');e[1]=e[1].replace('</em','');
										info+="\n"+b2[y+1]+" / "+b2[y+2]+" combo / "+b2[y+3]+"\nJudge: "+e[1]+" / Mod: "+b2[y+7]+" / Played "+b2[y+8]+ " ago";
										console.log(info);
										recentplay.push(info);
									}
								}
								let result=""; let display=0;
								for (i in recentplay) {
									if (display==limitRecent) break;
									switch (selectedMode) {
										case "all": result+=recentplay[i]+"\n\n";display++;break;
										case "key": if(recentplay[i].includes("Key")) {result+=recentplay[i]+"\n\n"};display++;break;
										case "step": if(recentplay[i].includes("Step")) {result+=recentplay[i]+"\n\n"};display++;break;
										case "dj": if(recentplay[i].includes("DJ")) {result+=recentplay[i]+"\n\n"};display++;break;
										case "catch": if(recentplay[i].includes("Catch")) {result+=recentplay[i]+"\n\n"};display++;break;
										case "pad": if(recentplay[i].includes("Pad")) {result+=recentplay[i]+"\n\n"};display++;break;
										case "taiko": if(recentplay[i].includes("Taiko")) {result+=recentplay[i]+"\n\n"};display++;break;
										case "ring": if(recentplay[i].includes("Ring")) {result+=recentplay[i]+"\n\n"};display++;break;
										default:
										}
									}
								
								if (result) {
									message.channel.send("```Malody recent result for "+foundplayer+" in "+selectedMode+" mode\n\n"+result+"```");
								}
								else message.channel.send("Look like the user you search havent played this mode recently");
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
	name: "malodyrecent"
}
