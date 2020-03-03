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
let current_map = [];

// Command loading
client.commands = new Discord.Collection();
fs.readdir("./cmd/" , (err, files) => {
	if (err) throw err;
	let cmdfile = files.filter (f => f.split(".").pop() === "js");
	if (cmdfile.length <= 0) {
		console.log("No command found uwu");
		return
	}

	console.log(`Loading ${cmdfile.length} command(s), please wait...`);
	cmdfile.forEach((f, i) => {
		let props = require(`./cmd/${f}`);
		console.log(`${i+1} : ${f} loaded`);
		client.commands.set(props.config.name, props)
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
    client.user.setActivity("a!help | a!modhelp", {type: "PLAYING"}).catch(console.error);
	
    // API check and unverified prune
	setInterval(() => {
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
		if (!apidown) client.commands.get("trackfunc").run(client, message = "", args = {}, maindb);
		client.commands.get("dailytrack").run(client, message = "", args = {}, maindb, alicedb);
		client.commands.get("weeklytrack").run(client, message = "", args = {}, maindb, alicedb);
		// client.commands.get("clantrack").run(client, message = "", args = {}, maindb, alicedb)
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
	
	// 8ball
	if ((message.content.startsWith("Alice, ") && message.content.endsWith("?")) || (message.author.id == '386742340968120321' && message.content.startsWith("Dear, ") && message.content.endsWith("?"))) {
		if (message.channel instanceof Discord.DMChannel) return message.channel.send("I do not want to respond in DMs!");
		let args = msgArray.slice(0);
		let cmd = client.commands.get("response");
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
			if (msgArray[i].indexOf("#osu/") !== -1 || msgArray[i].indexOf("/b/") !== -1 || msgArray[i].indexOf("/beatmaps/") !== -1) client.commands.get("autocalc").run(client, message, msgArray.slice(i), current_map);
			else if (msgArray[i].indexOf("/beatmapsets/") !== -1 || msgArray[i].indexOf("/s/") !== -1) client.commands.get("autocalc").run(client, message, msgArray.slice(i), current_map, true)
		}
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
	
	// commands
	if (message.author.id == '386742340968120321' && message.content == "a!apidown") {
		apidown = !apidown;
		return message.channel.send(`✅ **| API down mode has been set to \`${apidown}\`.**`)
	}
	
	if (message.content.includes("m.mugzone.net/chart/")) {
		let cmd = client.commands.get("malodychart");
		cmd.run(client, message, args)
	}
	
	if (message.content.startsWith("&")) {
		let mainbot = message.guild.members.cache.get("391268244796997643");
		if (!mainbot) return;
		let cmd = client.commands.get(command.slice(1));
		if (cmd && mainbot.user.presence.status == 'offline') {
			if (apidown && require_api.includes(cmd.config.name)) return message.channel.send("❎ **| I'm sorry, API is currently unstable or down, therefore you cannot use droid-related commands!**");
			cmd.run(client, message, args, maindb, alicedb, current_map)
		}
	}
	
	if (message.content.startsWith(config.prefix)) {
		let cmd = client.commands.get(command.slice(config.prefix.length));
		if (cmd) {
			if (apidown && require_api.includes(cmd.help.name)) return message.channel.send("❎ **| I'm sorry, API is currently unstable or down, therefore you cannot use droid-related commands!**");
			if (message.content.startsWith("$")) return message.channel.send("I'm not Mudae!");
			cmd.run(client, message, args, maindb, alicedb, current_map)
		}
	}
});

// welcome message for international server
client.on("guildMemberAdd", member => {
	let channel = member.guild.channels.cache.get("360716684174032896");
	if (!channel) return;
	console.log("Member joined");
	let joinMessage = `Welcome to ${member.guild.name}'s ${channel}, <@${member.id}>. To verify yourself as someone who plays osu!droid or interested in the game and open the rest of the server, you can follow *any* of the following methods:\n\n- post your osu!droid screenshot (main menu if you are an online player or recent result (score) if you are an offline player)\n\n- post your osu! profile (screenshot or link) and reason why you join this server (don't worry, we don't judge you)\n\nafter that, you can ping Moderator or Helper role and wait for one to come to verify you (you can also ping both roles if you need help), waiting can last from 5 seconds to 1 hour (I know, sorry xd)`;
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

// member ban detection
client.on("guildBanAdd", async (guild, user) => {
	let banInfo = (await guild.fetchAuditLogs({type: "MEMBER_BAN_ADD", user: user.id, limit: 1})).entries.first();
	let executor = banInfo.executor;
	let target = banInfo.target;
	let reason = banInfo.reason ? banInfo.reason : "Unknown";

	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * footer.length);
	let embed = new Discord.MessageEmbed()
		.setAuthor(executor.tag, executor.avatarURL({dynamic: true}))
		.setTitle("Ban executed")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.addField(`Banned user: ${target.username}`, `User ID: ${target.id}`)
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
			attachments.push(attachment.proxyURL)
		});
		logchannel.send("Image attached", {files: attachments})
	}
	else {
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
				attachments.push(attachment.proxyURL)
			});
			logchannel.send({files: attachments})
		}
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
