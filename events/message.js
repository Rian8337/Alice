const Discord = require('discord.js');
const config = require('../config.json');

let maintenance = false;
let maintenance_reason = '';
const current_map = [];
let command_cooldown = 0;

module.exports.run = (client, message, maindb, alicedb) => {
    message.isOwner = message.author.id === '132783516176875520' || message.author.id === '386742340968120321';
	
	// mute detection for lounge ban
	if (message.author.id === '391268244796997643' && message.channel.id === '440166346592878592' && message.embeds.length > 0) {
		client.subevents.get("loungeBanMuteDetection").run(message, alicedb)
	}

	if (message.author.bot) return;
	client.utils.get("chatcoins").run(message, maindb, alicedb);
	const msgArray = message.content.split(/\s+/g);
	const command = msgArray[0];
	const args = msgArray.slice(1);
	
	if ((message.author.id == '111499800683216896' || message.author.id == '386742340968120321') && message.content.toLowerCase() == 'brb shower') {
		client.subevents.get("brbShower").run(message)
	}
	
	// picture detector in #cute-no-lewd
	if (message.channel.id === '686948895212961807') {
		client.subevents.get("cuteNoLewd").run(client, message)
	}
	
	// 8ball
	if ((message.content.startsWith("Alice, ") || (message.author.id == '386742340968120321' && message.content.startsWith("Dear, "))) && message.content.endsWith("?")) {
		client.subevents.get("8ball").run(client, message, msgArray, alicedb)
	}
	
	// osu! automatic recognition
	if (!message.content.startsWith("&") && !message.content.startsWith(config.prefix) && !message.content.startsWith("a%")) {
		client.subevents.get("osuRecognition").run(client, message, current_map)
	}
	
	// YouTube link detection
	if (!(message.channel instanceof Discord.DMChannel) && !message.content.startsWith("&") && !message.content.startsWith(config.prefix)) {
		client.subevents.get("youtubeRecognition").run(client, message, current_map)
	}
	
	// picture log
	if (message.attachments.size > 0 && message.channel.id !== '686948895212961807' && !(message.channel instanceof Discord.DMChannel) && message.guild.id === '316545691545501706') {
		client.subevents.get("pictureLog").run(client, message)
	}
	
	// mention log
	if (message.mentions.users.size > 0 && message.guild.id == '316545691545501706') {
		client.subevents.get("mentionLog").run(client, message)
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
		else client.user.setActivity("a!help").catch(console.error);
		module.exports.maintenance = maintenance
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
		client.subevents.get("commandHandler").run(obj)
	}
	
	if (message.content.startsWith(config.prefix)) {
		client.subevents.get("commandHandler").run(obj)
	}
};

module.exports.config = {
    name: "message"
};

module.exports.maintenance = maintenance;
