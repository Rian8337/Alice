const Discord = require("discord.js");
const { Db } = require("mongodb");

/**
 * @type {Map<string, number>}
 */
 const cd = new Map();

/**
 * @param {Object} obj
 * @param {Discord.Client} obj.client
 * @param {Discord.CommandInteraction} obj.interaction
 * @param {string[]} obj.subCommands
 * @param {Array<Discord.Channel|Discord.User|Discord.Role|string|number|boolean>} obj.args
 * @param {Db} obj.maindb
 * @param {Db} obj.alicedb
 */
module.exports.run = async obj => {
    const {
		client,
		interaction,
        subCommands,
		args,
		maindb,
		alicedb
	} = obj;
    await interaction.defer();

    const current_map = client.utils.get("constants").currentMap;
    const globally_disabled_commands = client.utils.get("constants").globallyDisabledCommands;
    const channel_disabled_commands = client.utils.get("constants").channelDisabledCommands;
    const command_cooldown = client.utils.get("constants").commandCooldown;
    const maintenance = client.utils.get("constants").maintenance;
    const maintenance_reason = client.utils.get("constants").maintenanceReason;

    let finalCommandCooldown = command_cooldown;
    const cmd = client.commands.get(interaction.commandName);
    if (!interaction.isOwner && !interaction.member?.hasPermission("ADMINISTRATOR")) {
        if (maintenance) {
            return interaction.editReply(`❎ **| I'm sorry, I'm currently under maintenance due to \`${maintenance_reason}\`. Please try again later!**`);
        }
        if (globally_disabled_commands.find(c => c === cmd.config.name)) {
            return interaction.editReply("❎ **| I'm sorry, this command is disabled temporarily!**");
        }

        const channelSetting = channel_disabled_commands.find(v => v.channelID === interaction.channel.id);
        if (channelSetting) {
            for (const c of channelSetting.disabledCommands) {
                if (c.name === cmd.config.name) {
                    if (c.cooldown === -1) {
                        await interaction.editReply(`❎ **| I'm sorry, \`${cmd.config.name}\` is disabled in this channel!**`);
                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5000);
                        return;
                    }
                    finalCommandCooldown = Math.max(command_cooldown, c.cooldown);
                }
            }
        }
    }

    const cooldownMapKey = `${interaction.user.id}:${interaction.channel.id}:${cmd.config.name}`;
    const cooldownLeft = cd.get(cooldownMapKey);
    if (cooldownLeft) {
        return interaction.editReply(`❎ **| Hey, calm down with the command (${timeConvert(cooldownLeft)})! I need to rest too, you know.**`);
    }
    if (interaction.channel instanceof Discord.TextChannel) {
        console.log(`${interaction.user.tag} (#${interaction.channel.name}): ${interaction.commandName} ${subCommands.join(" ")} ${args.join(" ")}`);
    } else {
        console.log(`${interaction.user.tag} (DM): ${interaction.commandName}: ${interaction.commandName} ${subCommands.join(" ")} ${args.join(" ")}`);
    }
    cmd.run(client, interaction, subCommands, args, maindb, alicedb, current_map);
    if (finalCommandCooldown && !interaction.isOwner) {
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
    name: "interactionHandler"
};