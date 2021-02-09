const Discord = require('discord.js');
const { Db } = require('mongodb');
const config = require('../../config.json');

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

    // Find eligible permission for user
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
        let hasPermission = false;
        for (const [, permissionOverwrite] of message.channel.permissionOverwrites.entries()) {
            if ((message.author.id === permissionOverwrite.id || message.member.roles.cache.has(permissionOverwrite.id)) && permissionOverwrite.allow.has("MANAGE_CHANNELS")) {
                hasPermission = true;
                break;
            }
        }
        if (!hasPermission) {
            return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
        }
    }

    const footer = config.avatar_list;
    const index = Math.floor(Math.random() * footer.length);
    const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({dynamic: true}))
        .setColor(message.member.roles.color?.hexColor || "#000000")
        .setFooter("Alice Synthesis Thirty", footer[index]);

    const channelSettingsDb = alicedb.collection("channelsettings");
    const punishmentDb = alicedb.collection("punishmentconfig");

    switch (args[0]?.toLowerCase()) {
        case "command": {
            switch (args[1]?.toLowerCase()) {
                case "disable": {
                    const command = args[2]?.toLowerCase();
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
        
                        if (res) {
                            channelSettingsDb.updateOne({channelID: message.channel.id}, {$set: {disabledCommands}}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands});
                                message.channel.send(`✅ **| Successfully disabled \`${cmd.config.name}\`.**`);
                            });
                        } else {
                            channelSettingsDb.insertOne({channelID: message.channel.id, disabledCommands, disabledUtils: []}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands});
                                message.channel.send(`✅ **| Successfully disabled \`${cmd.config.name}\`.**`);
                            });
                        }
                    });
                    break;
                }
                case "enable": {
                    const command = args[2]?.toLowerCase();
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
                        if (res) {
                            channelSettingsDb.updateOne({channelID: message.channel.id}, {$set: {disabledCommands}}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands});
                                message.channel.send(`✅ **| Successfully enabled \`${cmd.config.name}\`.**`);
                            });
                        } else {
                            channelSettingsDb.insertOne({channelID: message.channel.id, disabledCommands, disabledUtils: []}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledCommands({channelID: message.channel.id, disabledCommands});
                                message.channel.send(`✅ **| Successfully enabled \`${cmd.config.name}\`.**`);
                            });
                        }
                    });
                    break;
                }
                default: {
                    embed.setTitle("Command Settings")
                        .setDescription(`Enable or disable commands in the channel. Use \`${config.prefix}settings command disable/enable <command>\` to access this command.\n\nKeep in mind that Administrator permission will override this setting.`);

                    message.channel.send(embed);
                }
            }
            break;
        }

        case "util": {
            const availableUtils = ["osuRecognition", "youtubeRecognition", "8ball", "profileFetch"];

            switch (args[1]?.toLowerCase()) {
                case "enable": {
                    const util = args[2]?.toLowerCase();

                    if (!util) {
                        return message.channel.send("❎ **| Hey, please enter a utility to enable!**");
                    }

                    const utilName = availableUtils.find(v => v.toLowerCase() === util);
                    if (!utilName) {
                        return message.channel.send("❎ **| Hey, that utility isn't available!**");
                    }

                    const actualUtil = client.subevents.get(utilName);
                    if (!actualUtil) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the utility that you want to enable!**");
                    }

                    channelSettingsDb.findOne({channelID: message.channel.id}, (err, res) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }

                        const disabledUtils = res?.disabledUtils || [];
                        const disabledUtil = disabledUtils.findIndex(v => v === actualUtil.config.name);
                        if (disabledUtil === -1) {
                            return message.channel.send("❎ **| I'm sorry, that utility has been enabled already!**");
                        }
                        disabledUtils.splice(disabledUtil, 1);

                        if (res) {
                            channelSettingsDb.updateOne({channelID: message.channel.id}, {$set: {disabledUtils}}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledUtils({channelID: message.channel.id, disabledUtils});
                                message.channel.send(`✅ **| Successfully enabled \`${actualUtil.config.name}\`.**`);
                            });
                        } else {
                            channelSettingsDb.insertOne({channelID: message.channel.id, disabledCommands: [], disabledUtils}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledUtils({channelID: message.channel.id, disabledUtils});
                                message.channel.send(`✅ **| Successfully enabled \`${actualUtil.config.name}\`.**`);
                            });
                        }
                    });
                    break;
                }
                case "disable": {
                    const util = args[2]?.toLowerCase();

                    if (!util) {
                        return message.channel.send("❎ **| Hey, please enter a utility to disable!**");
                    }

                    const utilName = availableUtils.find(v => v.toLowerCase() === util);
                    if (!utilName) {
                        return message.channel.send("❎ **| Hey, that utility isn't available!**");
                    }

                    const actualUtil = client.subevents.get(utilName);
                    if (!actualUtil) {
                        return message.channel.send("❎ **| I'm sorry, I cannot find the utility that you want to disable!**");
                    }

                    channelSettingsDb.findOne({channelID: message.channel.id}, (err, res) => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }

                        const disabledUtils = res?.disabledUtils || [];
                        const disabledUtil = disabledUtils.find(v => v === actualUtil.config.name);
                        if (disabledUtil) {
                            return message.channel.send("❎ **| I'm sorry, that utility has been disabled already!**");
                        }
                        disabledUtils.push(actualUtil.config.name);

                        if (res) {
                            channelSettingsDb.updateOne({channelID: message.channel.id}, {$set: {disabledUtils}}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledUtils({channelID: message.channel.id, disabledUtils});
                                message.channel.send(`✅ **| Successfully disabled \`${actualUtil.config.name}\`.**`);
                            });
                        } else {
                            channelSettingsDb.insertOne({channelID: message.channel.id, disabledCommands: [], disabledUtils}, err => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                client.events.get("message").setChannelDisabledUtils({channelID: message.channel.id, disabledUtils});
                                message.channel.send(`✅ **| Successfully disabled \`${actualUtil.config.name}\`.**`);
                            });
                        }
                    });
                    break;
                }
                default: {
                    embed.setTitle("Utilities Settings")
                        .setDescription(`Enable or disable utilities such as automatic beatmap detection, YouTube link beatmap detection, and 8ball in the channel. Use \`${config.prefix}settings util disable/enable <util>\` to access this command.\nAvailable toggleable utilities are:\n- Beatmap detection (\`osuRecognition\`)\n- YouTube link beatmap detection (\`youtubeRecognition\`)\n- 8ball (\`8ball\`)\n- osu!droid profile detection (\`profileFetch\`)\n\nUsers with Administrator permission will override this setting.`);

                    message.channel.send(embed);
                }
            }
            break;
        }

        case "mute": {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
            }

            switch (args[1]?.toLowerCase()) {
                case "permission": {
                    switch (args[2]?.toLowerCase()) {
                        case "grant": {
                            const roleName = args[3]?.toLowerCase();
                            if (!roleName) {
                                return message.channel.send("❎ **| Hey, please enter a role to allow access to!**");
                            }

                            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
                            if (!role) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the role that you have specified!**");
                            }

                            if (role.permissions.has("ADMINISTRATOR")) {
                                return message.channel.send("❎ **| Hey, roles with Administrator permission can already mute up to permanent!**");
                            }

                            const duration = parseInt(args[4]);
                            if (isNaN(duration) || duration < -1 || duration === Number.POSITIVE_INFINITY) {
                                return message.channel.send("❎ **| Hey, please enter a proper maximum mute duration!**");
                            }

                            punishmentDb.findOne({guildID: message.guild.id}, (err, res) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!res) {
                                    return message.channel.send("❎ **| I'm sorry, this server doesn't have a log channel configured! Please set a log channel before managing mute access for roles!**");
                                }

                                const { allowedMuteRoles } = res;

                                const roleIndex = allowedMuteRoles.find(v => v.id === role.id);
                                if (roleIndex !== -1) {
                                    allowedMuteRoles[roleIndex].maxTime = duration;
                                } else {
                                    allowedMuteRoles.push({
                                        id: role.id,
                                        maxTime: duration
                                    });
                                }

                                punishmentDb.updateOne({guildID: message.guild.id}, {$set: {allowedMuteRoles}}, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| Successfully given mute permission for ${role.name} role.**`);
                                });
                            });
                            break;
                        }
                        case "revoke": {
                            const roleName = args[3]?.toLowerCase();
                            if (!roleName) {
                                return message.channel.send("❎ **| Hey, please enter a role to revoke access from!**");
                            }

                            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
                            if (!role) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the role that you have specified!**");
                            }

                            if (role.permissions.has("ADMINISTRATOR")) {
                                return message.channel.send("❎ **| Hey, you cannot revoke access for roles with Administrator permission!**");
                            }

                            punishmentDb.findOne({guildID: message.guild.id}, (err, res) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!res) {
                                    return message.channel.send("❎ **| I'm sorry, this server doesn't have a log channel configured! Please set a log channel before managing mute access for roles!**");
                                }

                                const { allowedMuteRoles } = res;

                                const roleIndex = allowedMuteRoles.findIndex(v => v.id === role.id);
                                if (roleIndex === -1) {
                                    return message.channel.send("❎ **| I'm sorry, this role has not been given mute access!**");
                                }
                                allowedMuteRoles.splice(roleIndex, 1);

                                punishmentDb.updateOne({guildID: message.guild.id}, {$set: {allowedMuteRoles}}, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| Successfully revoked mute permission for ${role.name} role.**`);
                                });
                            });
                            break;
                        }
                        default: {
                            embed.setTitle("Mute Permission Configuration")
                                .setDescription(`Manage access to mute commands for roles.\n\nUsing \`${config.prefix}settings mute permission <allow/revoke> <role name> [duration (in seconds)]\` allows you to manage mute permission for roles.\nRoles with Administrator permission are automatically granted permanent mute permission.`);

                            message.channel.send(embed);
                        }
                    }
                    break;
                }
                case "immunity": {
                    switch (args[2]?.toLowerCase()) {
                        case "grant": {
                            const roleName = args[3]?.toLowerCase();
                            if (!roleName) {
                                return message.channel.send("❎ **| Hey, please enter a role to give mute immunity to!**");
                            }

                            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
                            if (!role) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the role that you have specified!**");
                            }

                            if (role.permissions.has("ADMINISTRATOR")) {
                                return message.channel.send("❎ **| Hey, roles with Administrator permission are already immune to mutes!**");
                            }

                            punishmentDb.findOne({guildID: message.guild.id}, (err, res) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!res) {
                                    return message.channel.send("❎ **| I'm sorry, this server doesn't have a log channel configured! Please set a log channel before managing mute immunity for roles!**");
                                }

                                const { immuneMuteRoles } = res;

                                const roleIndex = immuneMuteRoles.findIndex(v => v.id === role.id);
                                if (roleIndex !== -1) {
                                    return message.channel.send("❎ **| I'm sorry, this role has been given mute immunity!**");
                                }
                                immuneMuteRoles.push(role.id);

                                punishmentDb.updateOne({guildID: message.guild.id}, {$set: {immuneMuteRoles}}, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| Successfully given mute immunity for ${role.name} role.**`);
                                });
                            });
                            break;
                        }
                        case "revoke": {
                            const roleName = args[3]?.toLowerCase();
                            if (!roleName) {
                                return message.channel.send("❎ **| Hey, please enter a role to revoke mute immunity from!**");
                            }

                            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
                            if (!role) {
                                return message.channel.send("❎ **| I'm sorry, I cannot find the role that you have specified!**");
                            }

                            if (role.permissions.has("ADMINISTRATOR")) {
                                return message.channel.send("❎ **| Hey, you cannot remove mute immunity from roles with Administrator permission!**");
                            }

                            punishmentDb.findOne({guildID: message.guild.id}, (err, res) => {
                                if (err) {
                                    console.log(err);
                                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                }
                                if (!res) {
                                    return message.channel.send("❎ **| I'm sorry, this server doesn't have a log channel configured! Please set a log channel before managing mute immunity for roles!**");
                                }

                                const { immuneMuteRoles } = res;

                                const roleIndex = immuneMuteRoles.findIndex(v => v.id === role.id);
                                if (roleIndex === -1) {
                                    return message.channel.send("❎ **| I'm sorry, this role does not have mute immunity!**");
                                }
                                immuneMuteRoles.splice(roleIndex, 1);

                                punishmentDb.updateOne({guildID: message.guild.id}, {$set: {immuneMuteRoles}}, err => {
                                    if (err) {
                                        console.log(err);
                                        return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                                    }
                                    message.channel.send(`✅ **| Successfully revoked mute immunity for ${role.name} role.**`);
                                });
                            });
                            break;
                        }
                        default: {
                            embed.setTitle("Mute Immunity Configuration")
                                .setDescription(`Manage roles that are immune to mutes.\n\nUsing \`${config.prefix}settings mute immunity <add/remove> <role name>\` allows you to manage immune roles.\nRoles with Administrator permission are automatically immune to mutes.`);
                            
                            message.channel.send(embed);
                        }
                    }
                    break;
                }
                default: {
                    embed.setTitle("Mute Configuration")
                        .addField("Mute Permission", `Give or revoke access to mute commands for a certain role.\nUsing \`${config.prefix}settings permission <grant/revoke> <role name> [duration (in seconds)]\` allows you to manage role access to mutes and its maximum mute duration. To allow permanent mutes, enter \`-1\` as maximum mute duration.\n\nRoles with Administrator permission are granted permanent mute permission automatically.`)
                        .addField("Mute Immunity", `Add or remove roles that are considered immune to mutes. Using \`${config.prefix}settings immunity <grant/revoke> <role name>\` allows you to manage roles that are immune to mutes.\n\nRoles with Administrator permission are immune to mutes automatically.`);

                    message.channel.send(embed);
                }
            }
            break;
        }

        case "log": {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("❎ **| I'm sorry, you don't have the permission to use this command.**");
            }

            const channelID = args[1]?.replace(/[<#!>]/g, "");
            if (!channelID) {
                return message.channel.send("❎ **| Hey, please enter a channel!**");
            }

            const channel = message.guild.channels.resolve(channelID);
            if (!(channel instanceof Discord.TextChannel)) {
                return message.channel.send("❎ **| Hey, log channel must be a text channel!**");
            }

            punishmentDb.findOne({guildID: message.guild.id}, (err, res) => {
                if (err) {
                    console.log(err);
                    return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                }
                if (res) {
                    punishmentDb.updateOne({guildID: message.guild.id}, {$set: {logChannel: channel.id}}, err => {
                        if (err) {
                            console.log(err);
                            return message.channel.send("❎ **| I'm sorry, I'm having trouble receiving response from database. Please try again!**");
                        }
                        message.channel.send(`✅ **| Successfully set punishment log to ${channel}.**`);
                    });
                }
            });
            break;
        }

        default: {
            embed.setTitle("Server Settings")
                .addField("Command", `Enable or disable commands in the channel. Use \`${config.prefix}settings command\` to access this menu.\n\nUsers with Administrator permission will override this setting.`)
                .addField("Utilities", `Enable or disable utilities such as automatic beatmap detection, YouTube link beatmap detection, and 8ball in the channel. Use \`${config.prefix}settings util\` to access this menu.\n\nUsers with Administrator permission will override this setting.`)
                .addField("Punishment Log Channel", `Sets a log channel to log punishment history, such as mutes, kicks, and bans. Use \`${config.prefix}settings log <channel>\` to set the server's log channel. Only users with Administrator permission can access this menu.`)
                .addField("Mute Configuration", `Allow certain roles to use mute commands and allow certain roles to be immune to it. Use \`${config.prefix}settings mute\` to access this menu.\n\nOnly users with Administrator permission can access this menu.`);
            
            message.channel.send(embed);
        }
    }
};

module.exports.config = {
    name: "settings",
    description: "Customizes my behavior in the server or channel.",
    usage: "settings",
    detail: "The usage will output an embed that explains the command.",
    permission: "Manage Channels | Administrator"
};