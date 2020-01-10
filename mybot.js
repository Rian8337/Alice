const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
require("https");
require("util");
var mongodb = require('mongodb');
require("dotenv").config();
const messageLog = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);
var elainadbkey = process.env.ELAINA_DB_KEY;
var alicedbkey = process.env.ALICE_DB_KEY;

// Command loading
client.commands = new Discord.Collection();
fs.readdir("./cmd/" , (err, files) => {
	if (err) throw err;
	let cmdfile = files.filter (f => f.split(".").pop() === "js");
	if (cmdfile.length <= 0) {
		console.log("No command found uwu");
		return;
	}

	console.log(`Loading ${cmdfile.length} command(s), please wait...`);
	cmdfile.forEach((f, i) => {
		let props = require(`./cmd/${f}`);
		console.log(`${i+1} : ${f} loaded`);
		if(f !== 'ojsamadroid.js') client.commands.set(props.help.name, props);
	});
});

// Elaina DB
let elainauri = 'mongodb://' + elainadbkey + '@elainadb-shard-00-00-r6qx3.mongodb.net:27017,elainadb-shard-00-01-r6qx3.mongodb.net:27017,elainadb-shard-00-02-r6qx3.mongodb.net:27017/test?ssl=true&replicaSet=ElainaDB-shard-0&authSource=admin&retryWrites=true';
let maindb = '';
let elainadb = new mongodb.MongoClient(elainauri, {useNewUrlParser: true});

elainadb.connect( function(err, db) {
	if (err) throw err;
	//if (db)
	maindb = db.db('ElainaDB');
	console.log("Elaina DB connection established");
});

// Alice DB
let aliceuri = 'mongodb+srv://' + alicedbkey + '@alicedb-hoexz.gcp.mongodb.net/test';
let alicedb = '';
let alcdb = new mongodb.MongoClient(aliceuri, {useNewUrlParser: true});

alcdb.connect((err, db) => {
	if (err) throw err;
	alicedb = db.db("AliceDB");
	console.log("Alice DB connection established")
});

// Main client events
client.on("ready", () => {
    console.log("Alice Synthesis Thirty is up and running");
    client.user.setActivity("a!help | a!modhelp", {type: "PLAYING"}).catch(console.error);
    console.log("Webhook initiated");
	
	function trackFunc() {
		console.log("Retrieving plays")
    	let cmd = client.commands.get("trackfunc");
    	cmd.run(client, message = "", args = {}, maindb)
	}

	setInterval(trackFunc, 600000)
});

client.on("message", message => {
	if (message.author.bot) return;
	let msgArray = message.content.split(/\s+/g);
	let command = msgArray[0];
	let args = msgArray.slice(1);

	/*if (message.author.id == '386742340968120321') {
		let cmd = client.commands.get("sayd");
		let args = msgArray.slice(0);
		cmd.run(client, message, args);
		return;
	}

	if (message.isMemberMentioned(client.user) && message.author.id != '386742340968120321') {
		let owner = message.guild.members.get("386742340968120321");
		if (!owner) return;
		const embed = new Discord.RichEmbed()
			.setAuthor(message.author.tag, message.author.avatarURL)
			.setTitle("You were mentioned!")
			.setTimestamp(new Date())
			.setColor(message.member.highestRole.hexColor)
			.setFooter("Alice Synthesis Thirty", "https://i.imgur.com/S5yspQs.jpg")
			.addField("Channel", message.channel)
			.addField("Content", message.content.replace(client.user.id, owner.id));

		owner.send(embed).catch(e => console.log(e));
		return
	}*/
	
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
	if (message.content.toLowerCase().includes("woi")) {
		if (message.author.id == '386742340968120321') return message.channel.send("woi");
	}
	
	if (message.content.startsWith("&")) {
		let mainbot = message.guild.members.get("391268244796997643");
		if (!mainbot) return;
		let cmd = client.commands.get(command.slice(1));
		if (cmd && mainbot.user.presence.status == 'offline') return message.channel.send("Hey, unfortunately Elaina is offline now! Please use `a!" + cmd.help.name + "`!")
	
	// commands
	if (message.content.includes("m.mugzone.net/chart/")) {
		let cmd = client.commands.get("malodychart");
		cmd.run(client, message, args)
	}
	
	if (message.content.startsWith(config.prefix) || message.content.startsWith("$")) {
		let cmd = '';
		if (message.content.startsWith(config.prefix)) cmd = client.commands.get(command.slice(config.prefix.length));
		else cmd = client.commands.get(command.slice(1));
		if (cmd) {
			if (message.content.startsWith("$")) return message.channel.send("I'm not Mudae!");
			cmd.run(client, message, args, maindb, alicedb)
		}
	}
	
	// whitelist logging
	if (message.content.startsWith("&whitelist") || message.content.startsWith("&whitelistset") || message.content.startsWith("a!whitelist") || message.content.startsWith("a!whitelistset")) {
		let cmd = client.commands.get("whitelistlog");
		cmd.run(client, message, args)
	}
});
client.on("presenceUpdate", (oldMember, newMember) => {
	if (newMember.id != '386742340968120321' || newMember.user.presence.game == null) return;
	if (newMember.user.presence.game.name == 'WebStorm') client.user.setActivity(config.activity_list[3][0], {type: config.activity_list[3][1]}).catch(console.error)
	else client.user.setActivity(config.activity_list[2][0], {type: config.activity_list[2][1]}).catch(console.error)
});

// welcome message for international server
client.on("guildMemberAdd", member => {
	let channel = member.guild.channels.get("360716684174032896");
	if (!channel) return;
	console.log("Member joined");
	let joinMessage = `Welcome to ${member.guild.name}'s ${channel}, <@${member.id}>. To verify yourself as someone who plays osu!droid or interested in the game and open the rest of the server, you can follow *any* of the following methods:\n\n- post your osu!droid screenshot (main menu if you are an online player or recent result (score) if you are an offline player)\n\n- post your osu! profile (screenshot or link) and reason why you join this server (don't worry, we don't judge you)\n\nafter that, you can ping Moderator or Helper role and wait for one to come to verify you (you can also ping both roles if you need help), waiting can last from 5 seconds to 1 hour (I know, sorry xd)`;
	channel.send(joinMessage)
});

client.on("guildMemberUpdate", oldMember => {
	if (oldMember.user.bot) return;
	let general = oldMember.guild.channels.get("316545691545501706");
	if (!general || oldMember.roles.find(r => r.name === "Member")) return;
	fs.readFile("welcome.txt", 'utf8', (err, data) => {
		if (err) return console.log(err);
		let welcomeMessage = `Welcome to ${oldMember.guild.name}, <@${oldMember.id}>!`;
		setTimeout(() => {
			oldMember.user.send(data).catch(console.error);
			general.send(welcomeMessage)
		}, 100)
	})
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
	if (oldMember.guild.id != '316545691545501706') return;
	if (oldMember.roles.size == newMember.roles.size) return;
	let guild = client.guilds.get('528941000555757598');
	let logchannel = guild.channels.get('655829748957577266');
        let footer = config.avatar_list;
	const index = Math.floor(Math.random() * (footer.length - 1) + 1);
	let embed = new Discord.RichEmbed()
                .setFooter("Alice Synthesis Thirty", footer[index])
                .setTimestamp(new Date());

	if (oldMember.roles.size > newMember.roles.size) {
		oldMember.roles.forEach(role => {
			if (!newMember.roles.get(role.id)) {
                                embed.setDescription("`" + role.name + "` was removed from " + newMember.user.username);
                                embed.setColor(role.hexColor)
			}
		});
		logchannel.send({embed: embed})
	}
	else {
		newMember.roles.forEach(role => {
			if (!oldMember.roles.get(role.id)) {
				embed.setDescription("`" + role.name + "` was added to " + newMember.user.username);
                                embed.setColor(role.hexColor)
			}
		});
		logchannel.send({embed: embed})
	}
});

// message logging
client.on("messageUpdate", (oldMessage, newMessage) => {
	if (oldMessage.author.bot) return;
	if (oldMessage.content == newMessage.content) return;
	let logchannel = oldMessage.guild.channels.find(c => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.RichEmbed()
		.setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL)
		.setFooter(`Author ID: ${oldMessage.author.id} | Message ID: ${oldMessage.id}`)
		.setTimestamp(new Date())
		.setColor("#00cb16")
		.setTitle("Message edited")
		.addField("Channel", `${oldMessage.channel} | [Go to message](${oldMessage.url})`)
		.addField("Old Message", oldMessage.content.substring(0, 1024))
		.addField("New Message", newMessage.content.substring(0, 1024));
	logchannel.send(embed)
});

client.on("messageDelete", message => {
	if (message.author.bot) return;
	if (message.guild.id == '316545691545501706') {
		if (message.attachments.size == 0) return;
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL)
		});
		setTimeout(() => {
                        messageLog.send("Image attached", {files: attachments}).catch(console.error)
                }, 500);
                return
	}
	let logchannel = message.guild.channels.find(c => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.RichEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL)
		.setFooter(`Author ID: ${message.author.id} | Message ID: ${message.id}`)
		.setTimestamp(new Date())
		.setColor("#cb8900")
		.setTitle("Message deleted")
		.addField("Channel", message.channel);

	if (message.content) embed.addField("Content", message.content.substring(0, 1024));
	logchannel.send(embed);

	if (message.attachments.size > 0) {
		let attachments = [];
		message.attachments.forEach(attachment => {
			attachments.push(attachment.proxyURL)
		});
		logchannel.send({files: attachments})
	}
});

client.on("messageDeleteBulk", messages => {
	let message = messages.first();
	let logchannel = message.guild.channels.find(c => c.name === config.log_channel);
	if (!logchannel) return;
	const embed = new Discord.RichEmbed()
		.setTitle("Bulk delete performed")
		.setColor("#4354a3")
		.setTimestamp(new Date())
		.addField("Channel", message.channel)
		.addField("Amount of messages", messages.size);
	logchannel.send(embed)
});

// role logging to keep watch on moderators in the server
// role create
client.on("roleCreate", role => {
	if (role.guild.id != '316545691545501706') return;
	let guild = client.guilds.get('528941000555757598');
	let logchannel = guild.channels.get('655829748957577266');
	if (!logchannel) return;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * (footer.length - 1) + 1);
	let embed = new Discord.RichEmbed()
		.setTitle("Role created")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.setColor(role.hexColor)
		.setDescription("`" + role.name + "` was created");
	logchannel.send({embed: embed})
});

// role delete
client.on("roleDelete", role => {
	if (role.guild.id != '316545691545501706') return;
	let guild = client.guilds.get('528941000555757598');
	let logchannel = guild.channels.get('655829748957577266');
	if (!logchannel) return;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * (footer.length - 1) + 1);
	let embed = new Discord.RichEmbed()
		.setTitle("Role deleted")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.setColor(role.hexColor)
		.setDescription("`" + role.name + "` was deleted");
	logchannel.send({embed: embed})
});

client.login(process.env.BOT_TOKEN).catch(console.error);

// personal stuff
/*const me = new Discord.Client();
me.on("ready", () => {
	console.log("Login initiated");
	me.user.setActivity("Sword Art Online: Alicization Rising Steel", {type: "STREAMING", url: "https://github.com/Rian8337/Alice"}).catch(console.error)
});

me.login(process.env.MY_TOKEN).catch(console.error)*/
