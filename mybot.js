const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const mongodb = require('mongodb');
require("dotenv").config();
const messageLog = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);
const elainadbkey = process.env.ELAINA_DB_KEY;
const alicedbkey = process.env.ALICE_DB_KEY;

let maintenance = false;
let maintenance_reason = '';
const current_map = [];
let command_cooldown = 0;

client.commands = client.utils = client.aliases = client.events = new Discord.Collection();
client.help = [];

//Events loading
fs.readdir('./events', (err, files) => {
	console.log("Loading events");
	if (err) throw err;
	files.forEach((file, i) => {
		const props = require(`./events/${file}`);
		console.log(`${i+1}. ${file} loaded`);
		client.events.set(props.config.name, props)
	})
});

// Utility loading
fs.readdir("./util", (err, files) => {
	console.log("Loading utilities");
	if (err) throw err;
	files.forEach((file, i) => {
		let props = require(`./util/${file}`);
		console.log(`${i+1}. ${file} loaded`);
		client.utils.set(props.config.name, props)
	})
});

// Command loading
fs.readdir('./cmd', (err, folders) => {
	console.log("Loading commands");
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

// Alice DB
let aliceuri = 'mongodb+srv://' + alicedbkey + '@alicedb-hoexz.gcp.mongodb.net/test?retryWrites=true&w=majority';
let alicedb = '';
let alcdb = new mongodb.MongoClient(aliceuri, {useNewUrlParser: true, useUnifiedTopology: true});

elainadb.connect( function(err, db) {
	if (err) throw err;
	maindb = db.db('ElainaDB');
	console.log("Elaina DB connection established");
	if (maindb && alicedb) client.login(process.env.BOT_TOKEN).catch(console.error)
});

alcdb.connect((err, db) => {
	if (err) throw err;
	alicedb = db.db("AliceDB");
	console.log("Alice DB connection established");
	if (maindb && alicedb) client.login(process.env.BOT_TOKEN).catch(console.error)
});

// Main client events
client.on("ready", () => {
    console.log("Alice Synthesis Thirty is up and running");
    client.user.setActivity("a!help");
	
    // Daily reset and unverified prune
	setInterval(() => {
		client.utils.get("unverified").run(client, alicedb);
		client.utils.get("dailyreset").run(alicedb)
	}, 10000);
	
	// Utilities
	setInterval(() => {
		console.log("Utilities running");
		client.utils.get('birthdaytrack').run(client, maindb, alicedb);
		if (!maintenance) {
			client.utils.get("trackfunc").run(client, maindb);
			client.utils.get("clantrack").run(client, maindb, alicedb);
			client.utils.get("dailytrack").run(client, maindb, alicedb);
			client.utils.get("weeklytrack").run(client, maindb, alicedb);
			client.utils.get("auctiontrack").run(client, maindb, alicedb)
		}
	}, 600000);
	
	// Clan rank update
	setInterval(() => {
		if (!maintenance) client.utils.get("clanrankupdate").run(maindb)
	}, 1200000);

	// Mudae role assignment reaction-based on droid cafe
	client.events.get("mudaerolereaction").run(client)

	// Challenge role assignment (reaction-based)
	client.events.get("challengerolereaction").run(client)
});

client.on("message", message => {
	message.isOwner = message.author.id === '132783516176875520' || message.author.id === '386742340968120321';
	
	// mute detection for lounge ban
	if (message.author.id === '391268244796997643' && message.channel.id === '440166346592878592' && message.embeds.length > 0) {
		client.events.get("loungebanmutedetection").run(message, alicedb)
	}

	if (message.author.bot) return;
	client.utils.get("chatcoins").run(message, maindb, alicedb);
	const msgArray = message.content.split(/\s+/g);
	const command = msgArray[0];
	const args = msgArray.slice(1);
	
	if ((message.author.id == '111499800683216896' || message.author.id == '386742340968120321') && message.content.toLowerCase() == 'brb shower') {
		client.events.get("brbshower").run(messsage)
	}
	
	// picture detector in #cute-no-lewd
	if (message.channel.id === '686948895212961807') {
		client.events.get("cutenolewd").run(client, message)
	}
	
	// 8ball
	if ((message.content.startsWith("Alice, ") || (message.author.id == '386742340968120321' && message.content.startsWith("Dear, "))) && message.content.endsWith("?")) {
		client.events.get("8ball").run(client, message, msgArray, alicedb)
	}
	
	// osu! automatic recognition
	if (!message.content.startsWith("&") && !message.content.startsWith(config.prefix) && !message.content.startsWith("a%")) {
		client.events.get("osurecognition").run(client, message, current_map)
	}
	
	// YouTube link detection
	if (!(message.channel instanceof Discord.DMChannel) && !message.content.startsWith("&") && !message.content.startsWith(config.prefix)) {
		client.events.get("youtube").run(client, message, current_map)
	}
	
	// picture log
	if (message.attachments.size > 0 && message.channel.id !== '686948895212961807' && !(message.channel instanceof Discord.DMChannel) && message.guild.id === '316545691545501706') {
		client.events.get("picturelog").run(client, message)
	}
	
	// mention log
	if (message.mentions.users.size > 0 && message.guild.id == '316545691545501706') {
		client.events.get("mentionlog").run(client, message)
	}
	
	// self-talking (for fun lol)
	if (message.author.id == '386742340968120321' && message.channel.id == '683633835753472032') {
		client.channels.cache.get("316545691545501706").send(message.content)
	}
	
	// commands
	if (message.author.id === '386742340968120321' && command === 'a!maintenance') {
		maintenance_reason = args.join(" ");
		if (!maintenance_reason) maintenance_reason = 'Unknown';
		maintenance = !maintenance;
		message.channel.send(`✅ **| Maintenance mode has been set to \`${maintenance}\` for \`${maintenance_reason}\`.**`).catch(console.error);
		if (maintenance) client.user.setActivity("Maintenance mode").catch(console.error);
		else client.user.setActivity("a!help").catch(console.error)
	}

	if (message.author.id === '386742340968120321' && command === 'a!cooldown') {
		const seconds = parseFloat(args[0]);
		if (isNaN(seconds) || seconds < 0) return message.channel.send("❎ **| Hey, please enter a valid cooldown period!**");
		command_cooldown = seconds;
		message.channel.send(`✅ **| Successfully set command cooldown to ${seconds} ${seconds === 1 ? "second" : "seconds"}.**`)
	}
	
	if (message.content.includes("m.mugzone.net/chart/")) {
		let cmd = client.commands.get("malodychart");
		cmd.run(client, message, args)
	}
	
	const obj = {
		client: client,
		message: message,
		args: args,
		maindb: maindb,
		alicedb: alicedb,
		command: command,
		current_map: current_map,
		command_cooldown: command_cooldown,
		maintenance: maintenance,
		maintenance_reason: maintenance_reason,
		main_bot: true
	};

	if (!(message.channel instanceof Discord.DMChannel) && message.content.startsWith("&")) {
		let mainbot = message.guild.members.cache.get("391268244796997643");
		if (!mainbot || mainbot.user.presence.status !== 'offline') return;
		obj.main_bot = false;
		client.events.get("commandhandler").run(obj)
	}
	
	if (message.content.startsWith(config.prefix)) {
		client.events.get("commandhandler").run(obj)
	}
});

client.on("guildMemberAdd", member => {
	// welcome message for international server
	client.events.get("joinmessage").run(member);

	// lounge ban detection
	client.events.get("newmemberloungeban").run(client, member, alicedb)
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
	// introduction message
	client.events.get("introduction").run(oldMember, newMember);

	// lounge ban detection
	client.events.get("roleaddloungebandetection").run(newMember, alicedb);
});

client.on("typingStart", (channel, user) => {
	// typing indicator
	client.events.get("typingindicator").run(channel, user)
});

client.on("guildBanAdd", async (guild, user) => {
	// member ban detection
	client.events.get("banneduserloungeban").run(guild, user, alicedb)
});

client.on("messageUpdate", (oldMessage, newMessage) => {
	// message update logging
	client.events.get("messageupdatelog").run(oldMessage, newMessage)
});

client.on("messageDelete", message => {
	// message delete logging
	client.events.get("messagedeletelog").run(message, messageLog)
});

client.on("messageDeleteBulk", messages => {
	// bulk message delete logging
	client.events.get("bulkdeletelog").run(messages)
});

client.login(process.env.BOT_TOKEN).catch(console.error);