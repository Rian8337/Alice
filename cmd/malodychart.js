var http = require('http');

function moderead(modesrc) {
	let mode ="";
	switch(modesrc) {
		case '<img src="/static/img/mode/mode-0.png" />': mode = "Key";break;
		case '<img src="/static/img/mode/mode-1.png" />': mode = "Step";break;
		case '<img src="/static/img/mode/mode-2.png" />': mode = "DJ";break;
		case '<img src="/static/img/mode/mode-3.png" />': mode = "Catch";break;
		case '<img src="/static/img/mode/mode-4.png" />': mode = "Pad";break;
		case '<img src="/static/img/mode/mode-5.png" />': mode = "Taiko";break;
		case '<img src="/static/img/mode/mode-6.png" />': mode = "Ring";break;
		default: mode = "unknown"
	}
	return mode;
}

function htmlDecode (input) {
  return input.replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&#39;/g, "'")
			  .replace(/&quot;/g, '"');
}

module.exports.run = (client, message, args) => {
    let msgArray = message.content.split(/\s+/g);		
    chartid = "";
    for(i in msgArray) {
        if (msgArray[i].includes("m.mugzone.net/chart/")) {
            let linkArray = msgArray[i].split('/');
            for (var j = 0; j<linkArray.length; j++) {
                if (linkArray[j]==='chart') chartid = linkArray[j+1];
            }
        }
    }
	if (!chartid) chartid = msgArray[1];
    console.log(chartid);
    var options = {
        host: "m.mugzone.net",
        port: 80,
        path: "/chart/"+chartid
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
            let status = ''; let cname = ''; let cdiff = ''; let cmode = '';
            let creator = ''; let publisher = ''; let lastupdate = '';
            let clength = ''; let cbpm = ''; let bglink = '';
            let pcount = ''; let like = ''; let dislike = '';
            let topresult = '';
            for(var i = 0; i<b.length; i++) {
                if (b[i].includes('<div class="cover" style="background-image:url(')) {
                    bglink = b[i];
                    bglink = bglink.replace('<div class="cover" style="background-image:url(','');
                    bglink = bglink.replace(')"></div>','');
					bglink = bglink.replace('http','https');
                    continue;
                }
                if (b[i].includes('<h2 class="textfix title">')) {
                    status = b[i+1]; cname = b[i+2]; cmode = b[i+4]; cdiff = b[i+5]; creator = b[i+8];
                    let statusarr = status.split('>'); status = statusarr[1].replace('</em','');
                    cname = cname.replace('</h2>','');
					cname = htmlDecode(cname);
                    cmode = moderead(cmode);
                    cdiff = cdiff.replace('<span>',''); cdiff = cdiff.replace('</span>','');
					cdiff = htmlDecode(cdiff);
                    let creatorarr = creator.split('>'); creator = creatorarr[1].replace('</a','')
                    continue;
                }
                if (b[i].includes('Stabled by:')) {
                    publisher = b[i+2];
                    publisherarr = publisher.split('>'); publisher = publisherarr[1].replace('</a','')
                }
                if (b[i].includes('<label>ID</label>')) {
                    clength = b[i+1]; cbpm = b[i+2]; lastupdate = b[i+3];
                    clength = clength.replace('<label>Length</label>:<span>',''); clength = clength.replace('</span>&nbsp;&nbsp;','');
                    cbpm = cbpm.replace('<label>BPM</label>:<span>',''); cbpm = cbpm.replace('</span>','');
                    lastupdate = lastupdate.replace('<label>Last updated</label>:<span class="textfix">','');
                    lastupdate = lastupdate.replace('</span>','');
                    continue;
                }
                if (b[i].includes('<div class="g_cont2 g_rblock like_area">')) {
                    pcount = b[i+2]; like = b[i+5]; dislike = b[i+8];
                    pcount = pcount.replace('<img src="/static/img/icon-play.png" /><span>Hot</span><span class="l">',''); pcount = pcount.replace('</span>','');
                    like = like.replace('<img src="/static/img/icon-love.png" /><span>Recommended</span><span class="l">',''); like = like.replace('</span>','');
                    dislike = dislike.replace('<img src="/static/img/icon-bad.png" /><span>Not Recommended</span><span class="l">',''); dislike = dislike.replace('</span>','');
                    continue;
                }
            }
            if (!publisher) publisher = "none"
            const embed = {
                "title": cname,
                "description": status+" - "+cmode+" - "+cdiff,
                "color": 8311585,
                "footer": {
                  "icon_url": "https://s9.postimg.org/xxwhjp7qn/JPEG_20171205_001507.jpg",
                  "text": "Elaina owo"
                },
                "author": {
                  "name": "Malody Chart",
                  "url": "https://m.mugzone.net/chart/"+chartid,
                  "icon_url": "https://m.mugzone.net/static/img/icon-64.png"
                },
                "fields": [
                  {
                    "name": "Created by / Stabled by",
                    "value": creator + " / " + publisher
                  },
                  {
                    "name": "Length: "+clength+" | BPM: "+cbpm,
                    "value": "Last update: " + lastupdate
                  },
                  {
                    "name": "Play count: " + pcount,
                    "value": "~~=======================~~"
                  },
                  {
                    "name": "Like / Dislike",
                    "value": like + "   /   " + dislike,
                    "inline": true
                  }
				]
              };
              message.channel.send({ embed });
        });
    });
    req.end();
}

module.exports.help = {
	name: "malodychart"
}
