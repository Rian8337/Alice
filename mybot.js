const Discord = require("discord.js");
const fs = require("fs");
const mongodb = require('mongodb');
require("dotenv").config();
const elainadbkey = process.env.ELAINA_DB_KEY;
const alicedbkey = process.env.ALICE_DB_KEY;

const client = new Discord.Client({
	ws: {
		intents: new Discord.Intents().add(
			Discord.Intents.NON_PRIVILEGED,
			Discord.Intents.FLAGS.GUILD_MEMBERS
		)
	}
});
const messageLog = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);

client.commands = new Discord.Collection();
client.utils = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();
client.subevents = new Discord.Collection();
client.help = [];
let maintenance = false;

// Events loading
fs.readdir('./events', (err, files) => {
	console.log("Loading events");
	if (err) throw err;
	files.forEach((file, i) => {
		fs.lstat(`./events/${file}`, (err, stats) => {
			if (err) throw err;
			if (stats.isDirectory()) {
				return;
			}
			const props = require(`./events/${file}`);
			console.log(`${i+1}. ${file} loaded`);
			client.events.set(props.config.name, props);
		});
	});
});

// Subevents loading
fs.readdir('./events/subevents', (err, files) => {
	console.log("Loading subevents");
	if (err) throw err;
	files.forEach((file, i) => {
		const props = require(`./events/subevents/${file}`);
		console.log(`${i+1}. ${file} loaded`);
		client.subevents.set(props.config.name, props);
	});
});

// Utility loading
fs.readdir("./util", (err, files) => {
	console.log("Loading utilities");
	if (err) throw err;
	files.forEach((file, i) => {
		let props = require(`./util/${file}`);
		console.log(`${i+1}. ${file} loaded`);
		client.utils.set(props.config.name, props);
	});
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
				if (props.config.aliases) client.aliases.set(props.config.aliases, props);
			});
		});
	});
});

// Elaina DB
let elainauri = 'mongodb://' + elainadbkey + '@elainadb-shard-00-00-r6qx3.mongodb.net:27017,elainadb-shard-00-01-r6qx3.mongodb.net:27017,elainadb-shard-00-02-r6qx3.mongodb.net:27017/test?ssl=true&replicaSet=ElainaDB-shard-0&authSource=admin&retryWrites=true';
let maindb = '';
let elainadb = new mongodb.MongoClient(elainauri, {useNewUrlParser: true, useUnifiedTopology: true});

// Alice DB
let aliceuri = 'mongodb+srv://' + alicedbkey + '@alicedb-hoexz.gcp.mongodb.net/test?retryWrites=true&w=majority';
let alicedb = '';
let alcdb = new mongodb.MongoClient(aliceuri, {useNewUrlParser: true, useUnifiedTopology: true});

elainadb.connect((err, db) => {
	if (err) throw err;
	maindb = db.db('ElainaDB');
	console.log("Elaina DB connection established");
	if (maindb && alicedb) {
		console.log("Connecting to Discord API");
		client.login(process.env.BOT_TOKEN).catch(console.error);
	}
});

alcdb.connect((err, db) => {
	if (err) throw err;
	alicedb = db.db("AliceDB");
	console.log("Alice DB connection established");
	if (maindb && alicedb) {
		console.log("Connecting to Discord API");
		client.login(process.env.BOT_TOKEN).catch(console.error);
	}
});

// Client events
client.on("ready", () => {
	client.events.get("ready").run(client, maindb, alicedb, maintenance);
});

client.on("message", message => {
	client.events.get("message").run(client, message, maindb, alicedb, maintenance);
});

client.on("guildMemberAdd", member => {
	client.events.get("guildMemberAdd").run(client, member, alicedb);
});

client.on("guildMemberRemove", member => {
	client.events.get("guildMemberRemove").run(client, member, maindb, alicedb);
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
	client.events.get("guildMemberUpdate").run(client, oldMember, newMember, alicedb);
});

client.on("typingStart", (channel, user) => {
	client.events.get("typingStart").run(client, channel, user);
});

client.on("guildBanAdd", (guild, user) => {
	client.events.get("guildBanAdd").run(client, guild, user, maindb, alicedb);
});

client.on("guildBanRemove", (guild, user) => {
	client.events.get("guildBanRemove").run(client, guild, user);
});

client.on("messageUpdate", (oldMessage, newMessage) => {
	client.events.get("messageUpdate").run(client, oldMessage, newMessage);
});

client.on("messageDelete", message => {
	client.events.get("messageDelete").run(client, message, messageLog);
});

client.on("messageDeleteBulk", messages => {
	client.events.get("messageDeleteBulk").run(client, messages);
});
