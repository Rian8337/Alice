const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const http = require("http");
const mongodb = require('mongodb');
require("dotenv").config();
const messageLog = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);
const elainadbkey = process.env.ELAINA_DB_KEY;
const alicedbkey = process.env.ALICE_DB_KEY;
const droidapikey = process.env.DROID_API_KEY;
const require_api = config.require_api;

let apidown = false;
let maintenance = false;
let maintenance_reason = '';
let current_map = [];
let picture_cooldown = new Set();
//let cd = new Set();

client.commands = client.utils = client.aliases = new Discord.Collection();
client.help = [];

console.log("Loading utilities and commands");
// Utility loading
fs.readdir("./util", (err, files) => {
	if (err) throw err;
	files.forEach((file, i) => {
		let props = require(`./util/${file}`);
		console.log(`${i+1}. ${file} loaded`);
		client.utils.set(props.config.name, props)
	})
});

// Command loading
fs.readdir('./cmd', (err, folders) => {
	if (err) throw err;
	folders.forEach((folder, i) => {
		console.log(`${i+1}. Loading folder ${folder}`);
		fs.readdir(`./cmd/${folder}`, (err, files) => {
			if (err) throw err;
			files = files.map((file) => file.substring(0, file.length - 3));
			let entry = {section: folder, commands: files};
			client.help.push(entry);
			files.forEach((file, j) => {
				const props = require(`./cmd/${folder}/${file}`);
				console.log(`${i+1}.${j+1}. ${file} loaded`);
				client.commands.set(props.config.name, props);
				if (props.config.aliases) client.aliases.set(props.config.aliases, props)
			})
		})
	})
});

// Elaina DB
let elainauri = 'mongodb://' + elainadbkey + '@elainadb-shard-00-00-r6qx3.mongodb.net:27017,elainadb-shard-00-01-r6qx3.mongodb.net:27017,elainadb-shard-00-02-r6qx3.mongodb.net:27017/test?ssl=true&replicaSet=ElainaDB-shard-0&authSource=admin&retryWrites=true';
let maindb = '';
let elainadb = new mongodb.MongoClient(elainauri, {useNewUrlParser: true, useUnifiedTopology: true});

elainadb.connect( function(err, db) {
	if (err) throw err;
	//if (db)
	maindb = db.db('ElainaDB');
	console.log("Elaina DB connection established")
});

// Alice DB
let aliceuri = 'mongodb+srv://' + alicedbkey + '@alicedb-hoexz.gcp.mongodb.net/test?retryWrites=true&w=majority';
let alicedb = '';
let alcdb = new mongodb.MongoClient(aliceuri, {useNewUrlParser: true, useUnifiedTopology: true});

alcdb.connect((err, db) => {
	if (err) throw err;
	alicedb = db.db("AliceDB");
	console.log("Alice DB connection established")
});

// Main client events
client.on("ready", () => {
    console.log("Alice Synthesis Thirty is up and running");
    client.user.setActivity("a!help");
    /*let i = 0;
    let activity_list = [
		{
			name: "a!help",
			type: "PLAYING"
		},
		{
			name: "Happy birthday to me!",
			type: "PLAYING"
		}
	];
    setInterval(() => {
		if (i === 0) ++i;
		else --i;
		client.user.setActivity(activity_list[i]).catch(console.error)
	}, 10000);*/
	
    // API check and unverified prune
	setInterval(() => {
		client.utils.get("unverified").run(client);
		http.request(`http://ops.dgsrz.com/api/getuserinfo.php?apiKey=${droidapikey}&uid=51076`, res => {
			res.setEncoding("utf8");
			res.setTimeout(5000);
			let content = '';
			res.on("data", chunk => {
				content += chunk
			});
			res.on("error", err => {
				console.log(err);
				apidown = true
			});
			res.on("end", () => {
				try {
					JSON.parse(content.split("<br>")[1]);
					if (apidown) console.log("API performance restored");
					apidown = false
				} catch (e) {
					if (!apidown) console.log("API performance degraded");
					apidown = true
				}
			})
		}).end()
	}, 10000);
	
	setInterval(() => {
		console.log("Utilities running");
		if (!apidown) client.utils.get("trackfunc").run(client, "", [], maindb);
		client.utils.get("dailytrack").run(client, "", [], maindb, alicedb);
		client.utils.get("weeklytrack").run(client, "", [], maindb, alicedb);
		client.utils.get('birthdaytrack').run(client, maindb, alicedb);
		// client.utils.get("clantrack").run(client, "", [], maindb, alicedb);
		// client.utils.get("auctiontrack").run(client, maindb, alicedb)
	}, 600000);

	// Mudae role assignment reaction-based on droid cafe
	let guild = client.guilds.cache.get("635532651029332000");
	let channel = guild.channels.cache.get("640165306404438026");
	channel.messages.fetch("657597328772956160").then(message => {
		message.react('639481086425956382').catch(console.error);
		let collector = message.createReactionCollector((reaction, user) => reaction.emoji.id === '639481086425956382' && user.id !== client.user.id);
		collector.on("collect", () => {
			message.reactions.cache.find((r) => r.emoji.id === '639481086425956382').users.fetch({limit: 10}).then(collection => {
				let user = guild.member(collection.find((u) => u.id !== client.user.id).id);
				let role = guild.roles.cache.get("640434406200180736");
				if (!user.roles.cache.has(role.id)) user.roles.add(role, "Agreed to Mudae rules").catch(console.error);
				else user.roles.remove(role, "Disagreed to Mudae rules").catch(console.error);
				message.reactions.cache.forEach((reaction) => reaction.users.remove(user.id).catch(console.error))
			})
		})
	}).catch(console.error);

	// Challenge role assignment (reaction-based)
	let interserver = client.guilds.cache.get("316545691545501706");
	let interchannel = interserver.channels.cache.get("669221772083724318");
	interchannel.messages.fetch("674626850164703232").then(message => {
		message.react("✅").catch(console.error);
		let collector = message.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && user.id !== client.user.id);
		collector.on("collect", () => {
			message.reactions.cache.find((r) => r.emoji.name === "✅").users.fetch({limit: 10}).then(collection => {
				let user = interserver.member(collection.find((u) => u.id !== client.user.id).id);
				let role = interserver.roles.cache.get("674918022116278282");
				if (!user.roles.cache.has(role.id)) user.roles.add(role, "Automatic role assignment").catch(console.error);
				else user.roles.remove(role, "Automatic role assignment").catch(console.error);
				message.reactions.cache.forEach((reaction) => reaction.users.remove(user.id).catch(console.error))
			})
		})
	}).catch(console.error)
});

client.on("message", message => {
	if (message.author.bot) return;
	let msgArray = message.content.split(/\s+/g);
	let command = msgArray[0];
	let args = msgArray.slice(1);
	if ((message.author.id == '111499800683216896' || message.author.id == '386742340968120321') && message.content.toLowerCase() == 'brb shower') {
		let images = [
			"https://cdn.discordapp.com/attachments/440319362407333939/666825359198519326/unknown.gif",
			"https://cdn.discordapp.com/attachments/316545691545501706/667287014152077322/unknown.gif",
			"https://cdn.discordapp.com/attachments/635532651779981313/666825419298701325/unknown.gif",
			"https://cdn.discordapp.com/attachments/635532651779981313/662844781327810560/unknown.gif",
			"https://cdn.discordapp.com/attachments/635532651779981313/637868500580433921/unknown.gif"
		];
		const index = Math.floor(Math.random() * images.length);
		message.channel.send({files: [images[index]]});
	}

	// #trash-talk spam reminder
	if (message.content.startsWith(".")) {
		if (message.guild.id != '316545691545501706') return;
		if (message.channel.name != 'trash-talk') return;
		args = command.slice(1);
		if (!args) return;
		message.channel.send("Hey, is that NSB command I'm seeing? Remember not to spam bots in here!")
	}
	
	// picture detector in #cute-no-lewd
	if (!(message.channel instanceof Discord.DMChannel) && message.channel.id === '686948895212961807') {
		if (message.attachments.size > 1) message.delete().catch(console.error);

		let images = [];
		for (let i = 0; i < msgArray.length; i++) {
			let part = msgArray[i];
			let length = part.length;
			if (!part.startsWith("http") && (part.indexOf("png", length - 3) === -1 && part.indexOf("jpg", length - 3) === -1 && part.indexOf("jpeg", length - 4) === -1 && part.indexOf("gif", length - 3) === -1)) continue;
			try {
				encodeURI(part)
			} catch (e) {
				continue
			}
			images.push(part)
		}
		if (images.length > 0 || message.attachments.size > 0) {
			if (picture_cooldown.has(message.author.id)) {
				client.commands.get("tempmute").run(client, message, [message.author.id, 600, `Please do not spam images in ${message.channel}!`])
			}
			else {
				picture_cooldown.add(message.author.id);
				setTimeout(() => {
					picture_cooldown.delete(message.author.id)
				}, 5000);
			}
			if (message.attachments.size <= 1) message.react("👍").then(() => message.react("👎").catch(console.error)).catch(console.error)
		}
	}
	
	// 8ball
	if ((message.content.startsWith("Alice, ") && message.content.endsWith("?")) || (message.author.id == '386742340968120321' && message.content.startsWith("Dear, ") && message.content.endsWith("?"))) {
		if (message.channel instanceof Discord.DMChannel) return message.channel.send("I do not want to respond in DMs!");
		let args = msgArray.slice(0);
		let cmd = client.utils.get("response");
		return cmd.run(client, message, args, maindb, alicedb)
	}
	
	// woi
	if (message.content.toLowerCase().includes("woi") && message.author.id == '386742340968120321') message.channel.send("woi");
	
	// osu! automatic recognition
	if (!message.content.startsWith("&") && !message.content.startsWith(config.prefix)) {
		for (let i = 0; i < msgArray.length; i++) {
			if (!msgArray[i].startsWith("https://osu.ppy.sh/") && !msgArray[i].startsWith("https://bloodcat.com/osu/s/")) continue;
			let a = msgArray[i].split("/");
			let id = parseInt(a[a.length - 1]);
			if (isNaN(id)) continue;
			if (msgArray[i].indexOf("#osu/") !== -1 || msgArray[i].indexOf("/b/") !== -1 || msgArray[i].indexOf("/beatmaps/") !== -1) client.utils.get("autocalc").run(client, message, msgArray.slice(i), current_map);
			else if (msgArray[i].indexOf("/beatmapsets/") !== -1 || msgArray[i].indexOf("/s/") !== -1) client.utils.get("autocalc").run(client, message, msgArray.slice(i), current_map, true)
		}
	}
	
	// YouTube link detection
	if (!message.content.startsWith("&") && !message.content.startsWith(config.prefix)) {
		for (let i = 0; i < msgArray.length; i++) {
			let msg = msgArray[i];
			if (!msg.startsWith("https://youtu.be/") && !msg.startsWith("https://youtube.com/watch?v=") && !msg.startsWith("https://www.youtube.com/watch?v=")) continue;
			let video_id;
			let a = msg.split("/");
			if (msg.startsWith("https://youtu.be")) video_id = a[a.length - 1];
			if (!video_id) {
				let params = a[a.length - 1].split("?");
				params = params[params.length - 1].split("&");
				for (let i = 0; i < params.length; i++) {
					let param = params[i];
					if (!param.startsWith("v=")) continue;
					video_id = param.slice(2);
					break;
				}
			}
			if (!video_id) continue;
			client.utils.get("youtube").run(client, message, video_id, current_map)
		}
	}
	
	// picture log
	if (message.attachments.size > 0 && message.channel.id !== '686948895212961807' && !(message.channel instanceof Discord.DMChannel) && message.guild.id == '316545691545501706') {
		let attachments = [];
		for (const [, attachment] of message.attachments.entries()) {
			let url = attachment.url;
			let length = url.length;
			if (url.indexOf("png", length - 3) === -1 && url.indexOf("jpg", length - 3) === -1 && url.indexOf("jpeg", length - 4) === -1 && url.indexOf("gif", length - 3) === -1) continue;
			attachments.push(attachment)
		}
		if (attachments.length === 0) return;
		let embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
			.setColor('#cb8900')
			.setTimestamp(new Date())
			.attachFiles(attachments)
			.setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
			.addField("Channel", `${message.channel} | [Go to message](${message.url})`);

		if (message.content) embed.addField("Content", message.content);
		client.channels.cache.get("684630015538626570").send({embed: embed});
	}
	
	// mention log
	if (message.mentions.users.size > 0 && message.guild.id == '316545691545501706') {
		let embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
			.setColor("#00cb16")
			.setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
			.setTimestamp(new Date())
			.addField("Channel", `${message.channel} | [Go to message](${message.url})`)
			.addField("Content", message.content.substring(0, 1024));

		client.channels.cache.get("683504788272578577").send({embed: embed})
	}
	
	// self-talking (for fun lol)
	if (message.author.id == '386742340968120321' && message.channel.id == '683633835753472032') client.channels.cache.get("316545691545501706").send(message.content);
	
	if (message.author.id === '386742340968120321' && command === 'a!maintenance') {
		maintenance_reason = args.join(" ");
		if (!maintenance_reason) maintenance_reason = 'Unknown';
		maintenance = !maintenance;
		message.channel.send(`✅ **| Maintenance mode has been set to \`${maintenance}\` for \`${maintenance_reason}\`.**`).catch(console.error);
		if (maintenance) client.user.setActivity("Maintenance mode").catch(console.error);
		else client.user.setActivity("a!help").catch(console.error)
	}
	
	// commands
	if (message.author.id == '386742340968120321' && message.content == "a!apidown") {
		apidown = !apidown;
		return message.channel.send(`✅ **| API down mode has been set to \`${apidown}\`.**`)
	}
	
	if (message.content.includes("m.mugzone.net/chart/")) {
		let cmd = client.commands.get("malodychart");
		cmd.run(client, message, args)
	}
	
	if (!(message.channel instanceof Discord.DMChannel) && message.content.startsWith("&")) {
		let mainbot = message.guild.members.cache.get("391268244796997643");
		if (!mainbot) return;
		let cmd = client.commands.get(command.slice(1)) || client.aliases.get(command.slice(1));
		if (cmd && mainbot.user.presence.status == 'offline') {
			if (maintenance) return message.channel.send(`❎ **| I'm sorry, I'm currently under maintenance due to \`${maintenance_reason}\`. Please try again later!**`);
			message.channel.startTyping().catch(console.error);
			setTimeout(() => {
				message.channel.stopTyping(true)
			}, 5000);
			//if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
			if (apidown && require_api.includes(cmd.config.name)) return message.channel.send("❎ **| I'm sorry, API is currently unstable or down, therefore you cannot use droid-related commands!**");
			console.log(`${message.author.tag}: ${message.content}`);
			cmd.run(client, message, args, maindb, alicedb, current_map);
			//cd.add(message.author.id);
			//setTimeout(() => {
			//	cd.delete(message.author.id)
			//}, 5000)
		}
	}
	
	if (message.content.startsWith(config.prefix)) {
		let cmd = client.commands.get(command.slice(config.prefix.length)) || client.aliases.get(command.slice(config.prefix.length));
		if (cmd) {
			if (maintenance) return message.channel.send(`❎ **| I'm sorry, I'm currently under maintenance due to \`${maintenance_reason}\`. Please try again later!**`);
			message.channel.startTyping().catch(console.error);
			setTimeout(() => {
				message.channel.stopTyping(true)
			}, 5000);
			//if (cd.has(message.author.id)) return message.channel.send("❎ **| Hey, calm down with the command! I need to rest too, you know.**");
			if (apidown && require_api.includes(cmd.help.name)) return message.channel.send("❎ **| I'm sorry, API is currently unstable or down, therefore you cannot use droid-related commands!**");
			console.log(`${message.author.tag}: ${message.content}`);
			cmd.run(client, message, args, maindb, alicedb, current_map);
			//cd.add(message.author.id);
			//setTimeout(() => {
			//	cd.delete(message.author.id)
			//}, 5000)
		}
	}
});

// welcome message for international server
client.on("guildMemberAdd", member => {
	let channel = member.guild.channels.cache.get("360716684174032896");
	if (!channel) return;
	let joinMessage = `Welcome to ${member.guild.name}'s ${channel}, <@${member.id}>.\nTo verify yourself as someone who plays osu!droid or interested in the game and open the rest of the server, you can follow *any* of the following methods:\n\n- post your osu!droid screenshot (main menu if you are an online player or recent result (score) if you are an offline player). If you've just created an osu!droid account, please submit a score to the account before verifying\n\n- post your osu! profile (screenshot or link to profile) and reason why you join this server\n\nafter that, you can ping Moderator or Helper role and wait for one to come to verify you.\n\n**Do note that you have 1 day to verify, otherwise you will be automatically kicked.**`;
	channel.send(joinMessage)
});

// introduction message
client.on("guildMemberUpdate", (oldMember, newMember) => {
	if (oldMember.user.bot) return;
	let general = oldMember.guild.channels.cache.get("316545691545501706");
	if (!general || oldMember.roles.cache.find((r) => r.name === "Member") || oldMember.roles.cache.size == newMember.roles.cache.size) return;
	fs.readFile("welcome.txt", 'utf8', (err, data) => {
		if (err) return console.log(err);
		let welcomeMessage = `Welcome to ${oldMember.guild.name}, <@${oldMember.id}>!`;
		setTimeout(() => {
			oldMember.user.send(data).catch(console.error);
			general.send(welcomeMessage, {files: ["https://i.imgur.com/LLzteLz.jpg"]})
		}, 100)
	})
});

// typing indicator
client.on("typingStart", (channel, user) => {
	if (channel.id != '683633835753472032' || user.id != '386742340968120321') return;
	let general = client.channels.cache.get('316545691545501706');
	general.startTyping().catch(console.error);
	setTimeout(() => {
		general.stopTyping(true)
	}, 5000)
});

// member ban detection
client.on("guildBanAdd", async (guild, user) => {
	let banInfo = await guild.fetchBan(user.id);
        let reason = banInfo.reason;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setTitle("Ban executed")
                .setThumbnail(user.avatarURL({dynamic: true}))
		.setFooter("Alice Synthesis Thirty", footer[index])
                .setTimestamp(new Date())
		.addField(`Banned user: ${user.tag}`, `User ID: ${user.id}`)
		.addField("=========================", `Reason: ${reason}`);
	
	guild.channels.cache.find((c) => c.name === config.management_channel).send({embed: embed})
});

// lounge ban detection
client.on("guildMemberUpdate", (oldMember, newMember) => {
	if (newMember.guild.id != '316545691545501706' || newMember.roles == null) return;
	let role = newMember.roles.cache.find((r) => r.name === 'Lounge Pass');
	if (!role) return;
	alicedb.collection("loungelock").find({discordid: newMember.id}).toArray((err, res) => {
		if (err) {
			console.log(err);
			console.log("Unable to retrieve ban data")
		}
		if (!res[0]) return;
		newMember.roles.remove(role, "Locked from lounge channel").catch(console.error);
		let embed = new Discord.MessageEmbed()
			.setDescription(`${newMember} is locked from lounge channel!`)
			.setColor("#b58d3c");
		newMember.guild.channels.cache.find(c => c.name === config.management_channel).send({embed: embed})
	})
});

// role logging
client.on("guildMemberUpdate", (oldMember, newMember) => {
	if (oldMember.guild.id != '316545691545501706') return;
	if (oldMember.roles.cache.size == newMember.roles.cache.size) return;
	let guild = client.guilds.cache.get('528941000555757598');
	let logchannel = guild.channels.cache.get('655829748957577266');
	let embed = new Discord.MessageEmbed()
		.setTitle("Member role updated")
		.setColor("#4c8fcb")
		.setDescription(newMember.user.username);
	let rolelist = '';
	let count = 0;

	if (oldMember.roles.cache.size > newMember.roles.cache.size) {
		oldMember.roles.cache.forEach((role) => {
			if (!newMember.roles.cache.get(role.id)) {
				rolelist += role.name + " ";
				count++
			}
		});
		if (count > 1) rolelist = rolelist.trimRight().split(" ").join(", ");
		else rolelist = rolelist.trimRight();
		embed.addField("Role removed", rolelist);
		logchannel.send({embed: embed})
	}
	else {
		newMember.roles.cache.forEach((role) => {
			if (!oldMember.roles.cache.get(role.id)) {
				rolelist += role.name + " ";
				count++
			}
		});
		if (count > 1) rolelist = rolelist.trimRight().split(" ").join(", ");
		else rolelist = rolelist.trimRight();
		embed.addField("Role added", rolelist);
		logchannel.send({embed: embed})
	}
});

// message logging
client.on("messageUpdate", (oldMessage, newMessage) => {
	if (oldMessage.author.bot) return;
	if (oldMessage.content == newMessage.content) return;
	let logchannel = oldMessage.guild.channels.cache.find((c) => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.MessageEmbed()
		.setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL({dynamic: true}))
		.setFooter(`Author ID: ${oldMessage.author.id} | Message ID: ${oldMessage.id}`)
		.setTimestamp(new Date())
		.setColor("#00cb16")
		.setTitle("Message edited")
		.addField("Channel", `${oldMessage.channel} | [Go to message](${oldMessage.url})`)
		.addField("Old Message", oldMessage.content.substring(0, 1024))
		.addField("New Message", newMessage.content.substring(0, 1024));
	logchannel.send({embed: embed})
});

client.on("messageDelete", message => {
	if (message.author.bot) return;
	let logchannel;
	if (message.guild.id == '316545691545501706') {
		if (message.attachments.size == 0) return;
		logchannel = message.guild.channels.cache.find((c) => c.name === 'dyno-log');
		if (!logchannel) return;
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL);
			if (attachments.length == message.attachments.size) messageLog.send("Image attached", {files: attachments})
		});
		return
	}
	logchannel = message.guild.channels.cache.find((c) => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
		.setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
		.setTimestamp(new Date())
		.setColor("#cb8900")
		.setTitle("Message deleted")
		.addField("Channel", message.channel);

	if (message.content) embed.addField("Content", message.content.substring(0, 1024));
	logchannel.send({embed: embed});

	if (message.attachments.size > 0) {
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL);
			if (attachments.length == message.attachments.size) logchannel.send("Image attached", {files: attachments})
		})
	}
});

client.on("messageDeleteBulk", messages => {
	let message = messages.first();
	let logchannel = message.guild.channels.cache.find((c) => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.MessageEmbed()
		.setTitle("Bulk delete performed")
		.setColor("#4354a3")
		.setTimestamp(new Date())
		.addField("Channel", message.channel)
		.addField("Amount of messages", messages.size);
	logchannel.send({embed: embed})
});

// role logging to keep watch on moderators in the server
// role create
client.on("roleCreate", role => {
	if (role.guild.id != '316545691545501706') return;
	let guild = client.guilds.cache.get('528941000555757598');
	let logchannel = guild.channels.cache.get('655829748957577266');
	if (!logchannel) return;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setTitle("Role created")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.setColor(role.hexColor)
		.addField("Name: " + role.name, "Hoisted: " + role.hoist, true)
		.addField("Mentionable: " + role.mentionable, "Position: " + role.position, true)
		.addField("=================", "Permission bitwise: " + role.permissions);
	logchannel.send({embed: embed})
});

// role update
client.on("roleUpdate", (oldRole, newRole) => {
	if (newRole.guild.id != '316545691545501706') return;
	let guild = client.guilds.cache.get('528941000555757598');
	let logchannel = guild.channels.cache.get('655829748957577266');
	if (!logchannel) return;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setTitle("Role updated")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.setColor(newRole.hexColor)
		.addField("Old name: " + oldRole.name, "New name: " + newRole.name, true)
		.addField("Old hoisted: " + oldRole.hoist, "New hoisted: " + newRole.hoist,true)
		.addField("Old mentionable: " + oldRole.mentionable, "New mentionable: " + newRole.hoist, true)
		.addField("Old position: " + oldRole.position, "New position: " + newRole.position)
		.addField("Old permission bitwise: " + oldRole.permissions, "New permission bitwise: " + newRole.permissions);
	logchannel.send({embed: embed})
});

// role delete
client.on("roleDelete", role => {
	if (role.guild.id != '316545691545501706') return;
	let guild = client.guilds.cache.get('528941000555757598');
	let logchannel = guild.channels.cache.get('655829748957577266');
	if (!logchannel) return;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setTitle("Role deleted")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.setColor(role.hexColor)
		.addField("Name: " + role.name, "Hoisted: " + role.hoist, true)
		.addField("Mentionable: " + role.mentionable, "Position: " + role.position, true)
		.addField("=================", "Permission bitwise: " + role.permissions);
	logchannel.send({embed: embed})
});

client.login(process.env.BOT_TOKEN).catch(console.error);
