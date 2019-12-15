const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
require("https");
require("util");
var mongodb = require('mongodb');
require("dotenv").config();
var dbkey = process.env.DB_KEY;

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

let uri = 'mongodb://' + dbkey + '@elainadb-shard-00-00-r6qx3.mongodb.net:27017,elainadb-shard-00-01-r6qx3.mongodb.net:27017,elainadb-shard-00-02-r6qx3.mongodb.net:27017/test?ssl=true&replicaSet=ElainaDB-shard-0&authSource=admin&retryWrites=true';
let maindb = '';
let clientdb = new mongodb.MongoClient(uri, {useNewUrlParser: true});

    clientdb.connect( function(err, db) {
        if (err) throw err;
        //if (db)
        maindb = db.db('ElainaDB');
        console.log("DB connection established");
    });

client.on("ready", () => {
    console.log("Alice Synthesis Thirty is up and running");
    client.user.setActivity("a!help | a!modhelp", {type: "PLAYING"}).catch(e => console.log(e));
});

client.on("message", message => {
	if (message.author.bot) return;
	let msgArray = message.content.split(/\s+/g);
	let command = msgArray[0];
	let args = msgArray.slice(1);

	/*if (message.author.id == '386742340968120321') {
		let cmd = client.commands.get("sayit");
		let args = msgArray.slice(0);
		cmd.run(client, message, args);
		return;
	}

	if (message.isMemberMentioned(client.user) && message.author.id != owner.id) {
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

	if (message.content.startsWith("Alice, ") && message.content.endsWith("?")) {
		if (message.channel instanceof Discord.DMChannel) return message.channel.send("I do not want to respond in DMs!");
		let args = msgArray.slice(0);
		let cmd = client.commands.get("response");
		return cmd.run(client, message, args)
	}
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
			cmd.run(client, message, args, maindb)
		}
	}
	// whitelist logging
	if (message.content.startsWith("&whitelist") || message.content.startsWith("&whitelistset") || message.content.startsWith("a!whitelist") || message.content.startsWith("a!whitelistset")) {
		let cmd = client.commands.get("whitelistlog");
		cmd.run(client, message, args)
	}
});

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
	let logchannel;
	if (message.guild.id == '316545691545501706') {
		if (message.attachments.size == 0) return;
		logchannel = message.guild.channels.find(c => c.name === 'dyno-log');
		if (!logchannel) return;
		let attachments = [];
		message.attachments.forEach((attachment) => {
			attachments.push(attachment.proxyURL)
		});
		logchannel.send("Image attached", {files: attachments})
	}
	else {
		logchannel = message.guild.channels.find(c => c.name === config.log_channel);
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
		.addField("Name: " + role.name, "Hoisted: " + role.hoist, true)
		.addField("Mentionable: " + role.mentionable, "Position: " + role.calculatedPosition, true)
		.addField("=================", "Permission bitwise: " + role.permissions);
	logchannel.send({embed: embed})
});

client.on("roleUpdate", (oldRole, newRole) => {
	if (role.guild.id != '316545691545501706') return;
	let guild = client.guilds.get('528941000555757598');
	let logchannel = guild.channels.get('655829748957577266');
	if (!logchannel) return;
	let footer = config.avatar_list;
	const index = Math.floor(Math.random() * (footer.length - 1) + 1);
	let embed = new Discord.RichEmbed()
		.setTitle("Role updated")
		.setFooter("Alice Synthesis Thirty", footer[index])
		.setTimestamp(new Date())
		.setColor(newRole.hexColor)
		.addField("Old name: " + oldRole.name, "New name: " + newRole.name, true)
		.addField("Old hoisted: " + oldRole.hoist, "New hoisted: " + newRole.hoist,true)
		.addField("Old mentionable: " + oldRole.mentionable, "New mentionable: " + newRole.hoist, true)
		.addField("Old position: " + oldRole.calculatedPosition, "New position: " + newRole.calculatedPosition)
		.addField("Old permission bitwise: " + oldRole.permissions, "New permission bitwise: " + newRole.permissions);
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
		.addField("Name: " + role.name, "Hoisted: " + role.hoist, true)
		.addField("Mentionable: " + role.mentionable, "Position: " + role.calculatedPosition, true)
		.addField("=================", "Permission bitwise: " + role.permissions);
	logchannel.send({embed: embed})
});

// member role applied
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

client.login(process.env.BOT_TOKEN);
