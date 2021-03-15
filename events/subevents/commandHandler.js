const Discord = require('discord.js');
const config = require('../config.json');
const { Db } = require('mongodb');

/**
 * @param {number} num 
 */
function timeConvert(num) {
    num = Math.ceil(num);
    return [Math.floor(num / 60), Math.ceil(num - Math.floor(num / 60) * 60).toString().padStart(2, "0")].join(":");
}

/**
 * @type {Map<string, number>}
 */
const cd = new Map();

/**
 * @param {Object} obj
 * @param {Discord.Client} obj.client
 * @param {Discord.Message} obj.message
 * @param {string[]} obj.args
 * @param {Db} obj.maindb
 * @param {Db} obj.alicedb
 * @param {string} obj.command
 * @param {[string, string][]} obj.current_map
 * @param {string[]} obj.globally_disabled_commands
 * @param {{channelID: string, disabledCommands: {name: string, cooldown: number}[]}[]} obj.channel_disabled_commands
 * @param {number} obj.command_cooldown
 * @param {boolean} obj.maintenance
 * @param {string} obj.maintenance_reason
 * @param {boolean} obj.main_bot
 */
module.exports.run = obj => {
    const {
        client,
        message,
        args,
        maindb,
        alicedb,
        command,
        current_map,
        globally_disabled_commands,
        channel_disabled_commands,
        command_cooldown,
        maintenance,
        maintenance_reason,
        main_bot
    } = obj;

    const cmd = client.commands.get(command.slice(main_bot ? config.prefix.length : 1)) || client.aliases.get(command.slice(main_bot ? config.prefix.length : 1));
    if (!cmd) {
        return;
    }
    
    let finalCommandCooldown = command_cooldown;
    if (!message.isOwner && !message.member?.hasPermission("ADMINISTRATOR")) {
        if (maintenance) {
            return message.channel.send(`❎ **| I'm sorry, I'm currently under maintenance due to \`${maintenance_reason}\`. Please try again later!**`);
        }
        if (globally_disabled_commands.find(c => c === cmd.config.name)) {
            return message.channel.send("❎ **| I'm sorry, this command is disabled temporarily!**");
        }

        const channelSetting = channel_disabled_commands.find(v => v.channelID === message.channel.id);
        if (channelSetting) {
            for (const c of channelSetting.disabledCommands) {
                if (c.name === cmd.config.name) {
                    if (c.cooldown === -1) {
                        message.delete();
                        return message.channel.send(`❎ **| I'm sorry, ${message.author}, \`${cmd.config.name}\` is disabled in this channel!**`)
                            .then(m => m.delete({timeout: 5000}));
                    }
                    finalCommandCooldown = Math.max(command_cooldown, c.cooldown);
                }
            }
        }
    }
    message.channel.startTyping().catch(console.error);
    setTimeout(() => {
        message.channel.stopTyping(true);
    }, 5000);
    const cooldownMapKey = `${message.author.id}:${cmd.config.name}`;
    const cooldownLeft = cd.get(cooldownMapKey);
    if (cooldownLeft) {
        return message.channel.send(`❎ **| Hey, calm down with the command (${timeConvert(cooldownLeft)})! I need to rest too, you know.**`);
    }
    if (message.channel.type === "text") {
        console.log(`${message.author.tag} (#${message.channel.name}): ${message.content}`);
    } else {
        console.log(`${message.author.tag} (DM): ${message.content}`);
    }
    cmd.run(client, message, args, maindb, alicedb, current_map);
    if (finalCommandCooldown && !message.isOwner) {
        cd.set(cooldownMapKey, finalCommandCooldown);
        const interval = setInterval(() => {
            const cooldown = cd.get(cooldownMapKey) - 0.1;
            if (cooldown <= 0) {
                cd.delete(cooldownMapKey);
                return clearInterval(interval);
            }
            cd.set(cooldownMapKey, cooldown);
        }, 100);
    }
};

module.exports.config = {
    name: "commandHandler"
};