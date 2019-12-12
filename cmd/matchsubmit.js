var mongodb = require('mongodb');
var http = require ("http");

function statusread(status) {
	let code = 0;
	switch (status) {
		case "scheduled": code = 16776960; break;
		case "on-going": code = 65280; break;
		case "completed": code = 16711680; break;
	}
	return code;
}

function convertTimeDiff(playTime) {
	year = parseInt(playTime.split(" ")[0].split("-")[0]);
	month = parseInt(playTime.split(" ")[0].split("-")[1])-1;
	day = parseInt(playTime.split(" ")[0].split("-")[2]);
	hour = parseInt(playTime.split(" ")[1].split(":")[0]);
	minute = parseInt(playTime.split(" ")[1].split(":")[1]);
	second = parseInt(playTime.split(" ")[1].split(":")[2]);
	var convertedTime = new Date(year, month, day, hour, minute, second);
	var timeDiff = Date.now()-convertedTime;
	return timeDiff;
}

function rankread(imgsrc) {
	let rank="";
	switch(imgsrc) {
		case '<img src="assets/images/ranking-S-small.png"/>':rank="S";break;
		case '<img src="assets/images/ranking-A-small.png"/>':rank="A";break;
		case '<img src="assets/images/ranking-B-small.png"/>':rank="B";break;
		case '<img src="assets/images/ranking-C-small.png"/>':rank="C";break;
		case '<img src="assets/images/ranking-D-small.png"/>':rank="D";break;
		case '<img src="assets/images/ranking-SH-small.png"/>':rank="SH";break;
		case '<img src="assets/images/ranking-X-small.png"/>':rank="X";break;
		case '<img src="assets/images/ranking-XH-small.png"/>':rank="XH";break;
		default: rank="unknown";
	}
	return rank;
}

function getRecentPlay(i, uid, cb) {
	
	let playInfo = [];

	var options = {
    	host: "ops.dgsrz.com",
    	port: 80,
    	path: "/profile.php?uid=" + uid + ".html"
	};

	var content = "";   

	var req = http.request(options, function(res) {
    	res.setEncoding("utf8");
    	res.on("data", function (chunk) {
        	content += chunk;
    	});

    	res.on("end", function () {
		const a = content;
		let b = a.split('\n'), d = []; 
		let name=""; let title =""; let score=""; let ptime = ""; let acc=""; let miss=""; let rank ="";let combo=""; let mod="";
		for (x = 0; x < b.length; x++) {
    	if (b[x].includes('<small>') && b[x - 1].includes('class="block"')) {
			b[x-1]=b[x-1].replace("<strong class=\"block\">","");
			b[x-1]=b[x-1].replace("<\/strong>","");
			b[x]=b[x].replace("<\/small>","");
			b[x]=b[x].replace("<small>","");
			b[x+1]=b[x+1].replace('<span id="statics" class="hidden">{"miss":','');
			b[x+1]=b[x+1].replace('}</span>','')
			title=b[x-1].trim();
			b[x]=b[x].trim();
			miss=b[x+1].trim().split(',')[0];
			d = b[x].split("/"); ptime = convertTimeDiff(d[0]); score = d[1]; mod = d[2]; combo = d[3]; acc = d[4];
			b[x-5]=b[x-5].trim();
			rank=rankread(b[x-5]);
			break;
    		}
		if (b[x].includes('h3 m-t-xs m-b-xs')) {
			b[x]=b[x].replace('<div class="h3 m-t-xs m-b-xs">',"");
			b[x]=b[x].replace('<\/div>',"");
			b[x]=b[x].trim();
			name = b[x]
			}
		}
		playInfo = [i, name, title, score, ptime, acc, miss, rank, combo, mod];
		cb(playInfo)
		});
	});
	req.end();
}

function scoreCalc(score, maxscore, accuracy, misscount) {
	let newscore = score/maxscore*600000 + (Math.pow((accuracy/100), 4)*400000);
	newscore = newscore - (misscount*0.003*newscore);
	return newscore;
}

function scoreConvert(score) {
	score = score.replace(/,/g,"");
	return score
}

function modValid(input, required) {
	input = input.trim();
	if (required == "nm") return input == "None";
	if (required == "hr") return input == "HardRock";
	if (required == "hd") return input == "Hidden";
	if (required == "ez") return input == "Easy";
	if (required == "dt") return (input == "DoubleTime" || input == "Hidden, DoubleTime");
	if (required == "fm") return ((input.includes("HardRock") || input.includes("Hidden") || input.includes("Easy"))&&(!(input.includes("DoubleTime") || input.includes("HalfTime"))))
	else return true;
}

module.exports.run = (client, message, args, maindb) => {
	try {
        let rolecheck = message.member.roles
    } catch (e) {
        return
    }
	if (!message.member.roles.find("name", "Referee")) {
		message.channel.send("You don't have enough permission to use this :3");
		return;
	}
	let id = args[0];
	if (id) {
		let matchdb = maindb.collection("matchinfo");
		let mapdb = maindb.collection("mapinfo");
		let query = { matchid: id };
		let mapplay = [];
		matchdb.find(query).toArray(function(err, res) {
			if (err) throw err;
			if (!res[0]) {
				message.channel.send("Can't found the match");
			}
			else {
				let reqFetch = res[0].player.length; let curFetch = 0; let i = -1; let minTimeDiff = -1; let minTimeDiffPos = -1;
				var allScoreFetch = []
				res[0].player.forEach(function(x) {
					i++
					getRecentPlay(i, x[1], function(playInfo) {
						//[1] is player name
						//[2] is map's title + difficulty
						//[3] is total score
						//[4] is play time
						//[5] is accuracy
						//[6] is miss count
						//[9] is mod combination
						if (minTimeDiff == -1 || playInfo[4] < minTimeDiff) {minTimeDiff = playInfo[4]; minTimeDiffPos = playInfo[0];}
						allScoreFetch.push(playInfo)
						curFetch++;
						if (curFetch == reqFetch) {
							let mappick = "";
							console.log("All retrived");
							allScoreFetch.sort(function(a, b){return a[0] - b[0]});
							console.log(allScoreFetch);
							console.log(minTimeDiff + " " + minTimeDiffPos);
							let poolid = id.split(".")[0];
							let poolquery = { poolid: poolid }
							mapdb.find(poolquery).toArray(function(err, poolres) {
								if (err) throw err;
								if (!poolres[0]) {
									message.channel.send("Can't found the pool");
								}
								else {
									let mapfound = false
									for (k in poolres[0].map)
										if (allScoreFetch[minTimeDiffPos][2] == poolres[0].map[k][1]) {mapplay = poolres[0].map[k]; mapfound = true; break;}
									if (mapfound) {
										let pscore = [];
										let t1score = 0; let t2score = 0;
										let displayRes1 = ""; let displayRes2 = ""; let displayRes3 = ""; let color = 0;
										for (m in allScoreFetch) {
											//formular notScorev2 = score/maxscore*600000 + (acc^4)*400000 - misscount*(currentscore*0.002)
											if (allScoreFetch[m][2] == mapplay[1] && modValid(allScoreFetch[m][9], mapplay[0])) {
												//TODO: input score
												//		escape this nested hell (if false return)
												var temp_score = scoreCalc(parseInt(scoreConvert(allScoreFetch[m][3])), parseInt(mapplay[2]), parseFloat(allScoreFetch[m][5]), parseInt(allScoreFetch[m][6]))
												if (allScoreFetch[m][9] == "Hidden, DoubleTime") temp_score = Math.round(temp_score/1.036);
												pscore.push(temp_score)
											}
											else {
												pscore.push(0)
											}
										}
										//team score calculation
										for (n in pscore) {
											if (n % 2 == 0) {
												t1score += pscore[n]
												if (pscore[n] == 0) displayRes1 += res[0].player[n][0] + " (N/A):\t0 - Failed\n"
												else displayRes1 += res[0].player[n][0] + " (" + allScoreFetch[n][9] + "):\t" + Math.round(pscore[n]) + " - **" + allScoreFetch[n][7] +"** - " + allScoreFetch[n][5] + " - " + allScoreFetch[n][6] + " miss\n"
											}
											else {
												t2score += pscore[n]
												if (pscore[n] == 0) displayRes2 += res[0].player[n][0] + " (N/A):\t0 - Failed\n"
												else displayRes2 += res[0].player[n][0] + " (" + allScoreFetch[n][9] + "):\t" + Math.round(pscore[n]) + " - **" + allScoreFetch[n][7] +"** - " + allScoreFetch[n][5] + " - " + allScoreFetch[n][6] + " miss\n"
											}
										}
										t1score = Math.round(t1score);
										t2score = Math.round(t2score);
										if (t1score > t2score) {displayRes3 = "Red Team won by " + Math.abs(t1score - t2score); color = 16711680;}
										else if (t1score < t2score) {displayRes3 = "Blue Team won by " + Math.abs(t1score - t2score); color = 262399;}
										else displayRes3 = "It's a Draw";
										var embed = {
											"title": mapplay[1],
											"color": color,
											"thumbnail": {
												"url": "https://cdn.discordapp.com/embed/avatars/0.png"
											},
											"author": {
												"name": res[0].name
											},
											"fields": [
												{
													"name": "Red Team: " + t1score,
													"value": displayRes1
												},
												{
													"name": "Blue Team: " + t2score,
													"value": displayRes2
												},
												{
													"name": "=================================",
													"value": "**" + displayRes3 + "**"
												}
											]
										};
										message.channel.send({ embed });
										let name = res[0].name;
										let t1name = res[0].team[0][0];
										let t2name = res[0].team[1][0];
										let t1win = res[0].team[0][1] + (t1score > t2score);
										let t2win = res[0].team[1][1] + (t1score < t2score);
										res[0].team[0][1] = t1win;
										res[0].team[1][1] = t2win;
										let result = res[0].result;
										let status = statusread(res[0].status);
										var embed = {
											"title": name,
											"color": 65280,
											"fields": [
												{
													"name": t1name,
													"value": "**" + t1win + "**",
													"inline": true
												},
												{
													"name": t2name,
													"value": "**" + t2win + "**",
													"inline": true
												}
											]
										};
										message.channel.send({ embed });
										for (p in pscore) result[p].push(pscore[p])
										let update = {
											$set: {
												status: "on-going",
												team: res[0].team,
												result: result
											}
										}
										matchdb.updateOne(query, update, function(err, res) {
											if (err) throw err;
											console.log("match info updated");
										});
									}
									else message.channel.send("Can't found the map");
								}
							});
						}
					});
				});
			}
		});
	}
	else message.channel.send("Please specify match id");
	
}

module.exports.help = {
	name: "matchsubmit"
}
