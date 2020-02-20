const Discord = require('discord.js');
const {createWorker} = require('tesseract.js');
const https = require('https');
const osudroid = require('../modules/osu!droid');
const config = require('../config.json');

function imageValidation(url) {
    let length = url.length;
    return url.indexOf("png", length - 3) !== -1 || url.indexOf("jpg", length - 3) !== -1 || url.indexOf("jpeg", length - 4) !== -1
}

module.exports.run = (client, message) => {
    if (message.attachments.size === 0) return;
    const rectangle = [{left: 0, top: 0, width: 2000, height: 60}, {left: 0, top: 60, width: 750, height: 45}];
    message.attachments.forEach(async attachment => {
        let url = attachment.url;
        if (!imageValidation(url)) return;
        const worker = createWorker();
        await worker.load().catch(console.error);
        await worker.loadLanguage('eng').catch(console.error);
        await worker.initialize('eng').catch(console.error);
        let values = [];
        for (let i = 0; i < rectangle.length; i++) {
            const { data: { text } } = await worker.recognize(url, {rectangle: rectangle[i]}).catch(async() => {
                url = attachment.proxyURL;
                await worker.recognize(url, {rectangle: rectangle[i]}).catch(() => console.log("Unable to download map"))
            });
            if (text) values.push(text);
        }
        await worker.terminate();
        if (values.length < 2) return;
        let title = '';
        let artist = '';
        let creator = '';
        let difficulty = '';
        if (values[0].includes("-") || values[0].includes("—")) {
            artist = values[0].substring(2, values[0].indexOf("-") || values[0].indexOf("—")).trim();
            title = values[0].substring((values[0].indexOf("-") || values[0].indexOf("—")) + 1, values[0].lastIndexOf("[")).trim();
            if (values[0].lastIndexOf("]") !== -1) difficulty = values[0].substring(values[0].lastIndexOf("[") + 1, values[0].lastIndexOf("]"))
        }
        if (values[1].includes("by")) creator = values[1].split("by")[1].trim();
        if (creator.indexOf("(") !== -1) creator = creator.substring(0, creator.indexOf("(")).trim();
        if ([title, artist, creator, difficulty].some(value => !value)) return;

        let options = new URL(`https://osusearch.com/query/?title=${title}&artist=${artist}&mapper=${creator}&diff_name=${difficulty}&statuses=Ranked,Qualified,Loved`);
        let content = '';
        let req = https.get(options, res => {
            res.setEncoding("utf8");
            res.setTimeout(10000);
            res.on("data", chunk => {
                content += chunk
            });
            res.on("error", err => {
                console.log("Unable to retrieve map");
                console.log(err)
            });
            res.on("end", () => {
                let obj;
                try {
                    obj = JSON.parse(content)
                } catch (e) {
                    return console.log("Unable to retrieve map")
                }
                if (!obj.result_count) return;
                let beatmaps = obj.beatmaps;
                let beatmapid;
                for (let i = 0; i < beatmaps.length; i++) {
                    if (beatmaps[i].difficulty_name === difficulty && beatmaps[i].mapper === creator) {
                        beatmapid = beatmaps[i].beatmap_id;
                        break
                    }
                }
                if (!beatmapid) return console.log("Map not found");
                new osudroid.MapInfo().get({beatmap_id: beatmapid}, mapinfo => {
                    let footer = config.avatar_list;
                    const index = Math.floor(Math.random() * (footer.length - 1) + 1);
                    let embed = new Discord.RichEmbed()
                        .setFooter("Alice Synthesis Thirty", footer[index])
                        .setAuthor("Map Found", "https://image.frl/p/aoeh1ejvz3zmv5p1.jpg")
                        .setTitle(`${mapinfo.artist} - ${mapinfo.title} by ${mapinfo.creator}`)
                        .setColor(mapinfo.statusColor())
                        .setURL(`https://osu.ppy.sh/b/${mapinfo.beatmap_id}`)
                        .setThumbnail(`https://b.ppy.sh/thumb/${mapinfo.beatmapset_id}.jpg`)
                        .setDescription(mapinfo.showStatistics("", 1))
                        .addField("Map Info", `${mapinfo.showStatistics("", 2)}\n${mapinfo.showStatistics("", 3)}\n${mapinfo.showStatistics("", 4)}\n${mapinfo.showStatistics("", 5)}`);


                    let star = new osudroid.MapStars().calculate({file: mapinfo.osu_file, mods: ""});
                    let acc_list = [95, 98, 99, 100];
                    let i = 0;
                    let pp_entries = [];
                    acc_list.forEach(acc => {
                        let npp = osudroid.ppv2({
                            stars: star.droid_stars,
                            combo: mapinfo.max_combo,
                            acc_percent: acc,
                            miss: 0,
                            mode: "droid"
                        });
                        let pcpp = osudroid.ppv2({
                            stars: star.pc_stars,
                            combo: mapinfo.max_combo,
                            acc_percent: acc,
                            miss: 0,
                            mode: "osu"
                        });
                        let dpp = parseFloat(npp.toString().split(" ")[0]);
                        let pp = parseFloat(pcpp.toString().split(" ")[0]);
                        let pp_entry = [acc, dpp, pp];
                        pp_entries.push(pp_entry);
                        i++;
                        if (i === acc_list.length) {
                            pp_entries.sort((a, b) => {return a[0] - b[0]});
                            let pp_string = '';
                            for (let i = 0; i < pp_entries.length; i++) pp_string += `**▸ ${pp_entries[i][0]}%**: __${pp_entries[i][1]}__dpp • ${pp_entries[i][2]}pp\n`;
                            let star_rating = mapinfo.diff_total;
                            let diff_icon = '';
                            switch (true) {
                                case star_rating < 2: diff_icon = client.emojis.get("679325905365237791"); break; // Easy
                                case star_rating < 2.7: diff_icon = client.emojis.get("679325905734205470"); break; // Normal
                                case star_rating < 4: diff_icon = client.emojis.get("679325905658708010"); break; // Hard
                                case star_rating < 5.3: diff_icon = client.emojis.get("679325905616896048"); break; // Insane
                                case star_rating < 6.5: diff_icon = client.emojis.get("679325905641930762"); break; // Expert
                                default: diff_icon = client.emojis.get("679325905645993984") // Extreme
                            }
                            embed.addField(`${diff_icon} __${mapinfo.version}__`, pp_string);
                            message.channel.send({embed: embed}).catch(console.error)
                        }
                    })
                })
            })
        });
        req.end()
    })
};

module.exports.config = {
    name: "title",
    description: "Loads map info based on screenshot",
    usage: "title",
    detail: "None",
    permission: "None"
};