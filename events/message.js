const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../config.json');

let maintenance = false;
let maintenance_reason = '';
const current_map = [];
const disabled_commands = [];
let command_cooldown = 0;

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = async (client, message, maindb, alicedb) => {
    message.isOwner = message.author.id === '132783516176875520' || message.author.id === '386742340968120321';
	
	if (message.embeds.length > 0) {
		// owo bot support
		if (message.author.id === "289066747443675143") {
			client.subevents.get("updateMap").run(message, current_map);
		}
	}

	if (message.author.bot) return;
	client.utils.get("chatcoins").run(message, maindb, alicedb);
	const msgArray = message.content.split(/\s+/g);
	const command = msgArray[0];
	const args = msgArray.slice(1);
	
	// picture detector in #cute-no-lewd
	if (message.channel.id === '686948895212961807') {
		client.subevents.get("cuteNoLewd").run(client, message);
	}
	
	// 8ball
	if ((message.content.startsWith("Alice, ") || (message.author.id == '386742340968120321' && message.content.startsWith("Dear, "))) && message.content.endsWith("?")) {
		client.subevents.get("8ball").run(client, message, msgArray, alicedb);
	}
	
	// osu! beatmap link and osu!droid profile recognition
	if (!message.content.startsWith("&") && !message.content.startsWith(config.prefix) && !message.content.startsWith("a%")) {
		client.subevents.get("osuRecognition").run(client, message, current_map);
		client.subevents.get("profileFetch").run(client, message, maindb, alicedb);
	}
	
	// YouTube link detection
	if (!(message.channel instanceof Discord.DMChannel) && !message.content.startsWith("&") && !message.content.startsWith(config.prefix)) {
		client.subevents.get("youtubeRecognition").run(client, message, current_map);
	}
	
	// picture log
	if (message.attachments.size > 0 && message.channel.id !== '686948895212961807' && !(message.channel instanceof Discord.DMChannel) && message.guild.id === '316545691545501706') {
		client.subevents.get("pictureLog").run(client, message);
	}
	
	// mention log
	if (message.mentions.users.size > 0 && message.guild.id == '316545691545501706') {
		client.subevents.get("mentionLog").run(client, message);
	}
	
	// self-talking (for fun lol)
	if (message.author.id == '386742340968120321' && message.channel.id == '683633835753472032') {
		client.channels.cache.get("316545691545501706").send(message.content);
	}
	
	// commands
	if (message.author.id === '386742340968120321' && command === config.prefix + 'maintenance') {
		maintenance_reason = args.join(" ");
		if (!maintenance_reason) {
			maintenance_reason = 'Unknown';
		}
		maintenance = !maintenance;
		if (maintenance) {
			client.user.setActivity("Maintenance mode").catch(console.error);
		}
		else {
			client.user.setActivity(config.prefix + "help", {type: "LISTENING"}).catch(console.error);
		}
		this.maintenance = maintenance;
		message.channel.send(`✅ **| Maintenance mode has been set to \`${maintenance}\` for \`${maintenance_reason}\`.**`).catch(console.error);
	}

	if (message.author.id === '386742340968120321' && command === config.prefix + 'cooldown') {
		const seconds = parseFloat(args[0]);
		if (isNaN(seconds) || seconds < 0) {
			return message.channel.send("❎ **| Hey, please enter a valid cooldown period!**");
		}
		command_cooldown = parseFloat(seconds.toFixed(1));
		message.channel.send(`✅ **| Successfully set command cooldown to ${seconds} ${seconds === 1 ? "second" : "seconds"}.**`);
	}

	if (message.author.id === "386742340968120321" && (command === config.prefix + 'cmd' || command === config.prefix + 'command')) {
		if (args[0] === "list") {
			if (disabled_commands.length === 0) {
				return message.channel.send("❎ **| I'm sorry, there are no disabled commands now!**");
			}
			let string = `✅ **| The current disabled ${disabled_commands.length === 1 ? "command is" : "commands are"} `;
			for (const disabled of disabled_commands) {
				string += `\`${disabled}\`, `;
			}
			string = string.substring(0, string.length - 2) + ".**";
			return message.channel.send(string);
		}
		const cmd = client.commands.get(args[0]) || client.aliases.get(args[0]);
		if (!cmd) {
			return message.channel.send("❎ **| Hey, please enter a command to enable or disable!**");
		}
		const cmd_index = disabled_commands.findIndex(c => c === cmd.config.name);
		if (cmd_index === -1) {
			disabled_commands.push(cmd.config.name);
		} else {
			disabled_commands.splice(cmd_index, 1);
		}
		message.channel.send(`✅ **| Successfully ${cmd_index === -1 ? "disabled" : "enabled"} \`${cmd.config.name}\` command.**`);
	}
	
	if (message.content.includes("m.mugzone.net/chart/")) {
		let cmd = client.commands.get("malodychart");
		cmd.run(client, message, args);
	}
	
	const obj = {
		client: client,
		message: message,
		args: args,
		maindb: maindb,
		alicedb: alicedb,
		command: command,
		current_map: current_map,
		disabled_commands: disabled_commands,
		command_cooldown: command_cooldown,
		maintenance: maintenance,
		maintenance_reason: maintenance_reason,
		main_bot: true
	};

	if (message.content.startsWith("&")) {
		let mainbot = await message.guild?.members.fetch('391268244796997643');
		if (!mainbot || mainbot.user.presence.status !== 'offline') return;
		obj.main_bot = false;
		client.subevents.get("commandHandler").run(obj);
	}
	
	if (message.content.startsWith(config.prefix)) {
		client.subevents.get("commandHandler").run(obj);
	}
};

module.exports.config = {
    name: "message"
};

module.exports.maintenance = maintenance;
