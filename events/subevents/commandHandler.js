const Discord = require('discord.js');
const config = require('../../config.json');
const { Db } = require('mongodb');
const cd = [];

/**
 * @param {Object} obj
 * @param {Discord.Client} obj.client
 * @param {Discord.Message} obj.message
 * @param {string[]} obj.args
 * @param {Db} obj.maindb
 * @param {Db} obj.alicedb
 * @param {string} obj.command
 * @param {[string, string][]} obj.current_map
 * @param {string[]} obj.disabled_commands
 * @param {number} obj.command_cooldown
 * @param {boolean} obj.maintenance
 * @param {string} obj.maintenance_reason
 * @param {boolean} obj.main_bot
 */
module.exports.run = obj => {
    const client = obj.client;
    const message = obj.message;
    const args = obj.args;
    const maindb = obj.maindb;
    const alicedb = obj.alicedb;
    const command = obj.command;
    const current_map = obj.current_map;
    const disabled_commands = obj.disabled_commands;
    const command_cooldown = obj.command_cooldown;
    const maintenance = obj.maintenance;
    const maintenance_reason = obj.maintenance_reason;
    const main_bot = obj.main_bot;

    const cmd = client.commands.get(command.slice(main_bot ? config.prefix.length : 1)) || client.aliases.get(command.slice(main_bot ? config.prefix.length : 1));
    if (cmd) {
        if (!message.isOwner) {
            if (maintenance) {
                return message.channel.send(`❎ **| I'm sorry, I'm currently under maintenance due to \`${maintenance_reason}\`. Please try again later!**`);
            }
            if (disabled_commands.find(c => c === cmd.config.name)) {
                return message.channel.send("❎ **| I'm sorry, this command is disabled temporarily!**");
            }
        }
        message.channel.startTyping().catch(console.error);
        setTimeout(() => {
            message.channel.stopTyping(true);
        }, 5000);
        const cd_index = cd.findIndex(c => c.id === message.author.id);
        if (cd_index !== -1) {
            return message.channel.send(`❎ **| Hey, calm down with the command (${(cd[cd_index].time).toFixed(1)} ${cd[cd_index].time === 1 ? "second" : "seconds"})! I need to rest too, you know.**`);
        }
        if (message.channel.type === "text") {
            console.log(`${message.author.tag} (#${message.channel.name}): ${message.content}`);
        }
        else {
            console.log(`${message.author.tag} (DM): ${message.content}`);
        }
        cmd.run(client, message, args, maindb, alicedb, current_map);
        if (command_cooldown && !message.isOwner) {
            const index = cd.push({
                id: message.author.id,
                time: command_cooldown
            }) - 1;
            const interval = setInterval(() => {
                cd[index].time -= 0.1;
                if (cd[index].time <= 0) {
                    clearInterval(interval);
                    cd.splice(index, 1);
                }
            }, 100);
        }
    }
};

module.exports.config = {
    name: "commandHandler"
};