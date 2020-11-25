const Discord = require('discord.js');
const { Db } = require('mongodb');

/**
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {Db} maindb 
 * @param {Db} alicedb 
 */
module.exports.run = (client, message, args, maindb, alicedb) => {
    if (!(message.channel instanceof Discord.TextChannel)) {
        return message.channel.send("❎ **| I'm sorry, this command is not available in DM.**");
    }

    // find eligible permission for user
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
        let hasPermission = false;
        for (const [, permissionOverwrite] of message.channel.permissionOverwrites.entries()) {
            if ((message.author.id === permissionOverwrite.id || message.member.roles.cache.has(permissionOverwrite.id)) && permissionOverwrite.allow.has("MANAGE_CHANNELS")) {
                hasPermission = true;
                break;
            }
        }
        if (!hasPermission) {
            return message.channel.send("❎ **| I'm sorry, you don't have permission to use this.**");
        }
    }

    const channelSettingsDb = alicedb.collection("channelsettings");
    
    switch (args[0]?.toLowerCase()) {
        case "disable": {
            const command = args[1]?.toLowerCase();
            if (!command) {
                return message.channel.send("❎ **| Hey, please enter a command to disable!**");
            }

            const cmd = client.commands.get(command) || client.aliases.get(command);
            if (!cmd) {
                return message.channel.send("❎ **| I'm sorry, I cannot find the command that you want to disable!**");
            }
            if (cmd.config.name === this.config.name) {
                return message.channel.send("❎ **| Hey, you cannot disable this command!**");
            }

            channelSettingsDb.findOne({channelID: message.channel.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }

                const disabledCommands = res?.disabledCommands || [];
                const disabledCommand = disabledCommands.find(v => v === cmd.config.name);
                if (disabledCommand) {
                    return message.channel.send("❎ **| I'm sorry, that command has been disabled already!**");
                }
                disabledCommands.push(cmd.config.name);

                channelSettingsDb.updateOne({channelID: message.channel.id}, {$set: {channelID: message.channel.id, disabledCommands: disabledCommands}}, {upsert: true}, err => {
                    if (err) {
                        console.log(err);
                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                    }
                    client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands: disabledCommands});
                    message.channel.send(`✅ **| Successfully disabled \`${cmd.config.name}\`.**`);
                });
            });
            break;
        }
        case "enable": {
            const command = args[1]?.toLowerCase();
            if (!command) {
                return message.channel.send("❎ **| Hey, please enter a command to enable!**");
            }

            const cmd = client.commands.get(command) || client.aliases.get(command);
            if (!cmd) {
                return message.channel.send("❎ **| I'm sorry, I cannot find the command that you want to enable!**");
            }

            channelSettingsDb.findOne({channelID: message.channel.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }

                const disabledCommands = res?.disabledCommands || [];
                const disabledCommand = disabledCommands.findIndex(v => v === cmd.config.name);
                if (disabledCommand === -1) {
                    return message.channel.send("❎ **| I'm sorry, that command has been enabled already!**");
                }
                disabledCommands.splice(disabledCommand, 1);

                if (disabledCommands.length > 0) {
                    channelSettingsDb.updateOne({channelID: message.channel.id}, {$set: {channelID: message.channel.id, disabledCommands: disabledCommands}}, {upsert: true}, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands: disabledCommands});
                        message.channel.send(`✅ **| Successfully enabled \`${cmd.config.name}\`.**`);
                    });
                } else {
                    channelSettingsDb.deleteOne({channelID: message.channel.id}, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands: disabledCommands});
                        message.channel.send(`✅ **| Successfully enabled \`${cmd.config.name}\`.**`);
                    });
                }
            });
            break;
        }
        default: message.channel.send(`❎ **| I'm sorry, your first argument (${args[0]?.toLowerCase()}) is invalid! Accepted arguments are \`disable\` and \`enable\`.**`);
    }
};

module.exports.config = {
    name: "command",
    aliases: "cmd",
    description: "Enables or disables a command in a channel.",
    usage: "command <disable/enable> <command>",
    detail: "`command`: The command to disable or enable [String]\n`disable/enable`: Whether to disable or enable a command [String]",
    permission: "Manage Channels"
};