import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { Command } from "@alice-interfaces/core/Command";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { CooldownKey } from "@alice-types/core/CooldownKey";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { DMChannel, GuildMember, Interaction, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export const run: EventUtil["run"] = async (client, interaction: Interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const botOwnerExecution: boolean = CommandHelper.isExecutedByBotOwner(interaction);

    if (Config.isDebug && !botOwnerExecution) {
        return interaction.reply({
            content: MessageCreator.createReject(
                "I'm sorry, I'm in debug mode now. I cannot accept commands from anyone beside bot owners!"
            ),
            ephemeral: true
        });
    }

    const command: Command | undefined = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: MessageCreator.createReject(
                "I'm sorry, I cannot find the command with that name."
            )
        });
    }

    // Check for maintenance
    if (Config.maintenance && !botOwnerExecution) {
        return interaction.reply({
            content: MessageCreator.createReject(
                `I'm sorry, I'm currently under maintenance due to \`${Config.maintenanceReason}\`. Please try again later!`
            ),
            ephemeral: true
        });
    }

    // Check if command is executable in channel
    if (!CommandHelper.isCommandExecutableInScope(interaction, command.config.scope)) {
        return interaction.reply({
            content: MessageCreator.createReject(
                "I'm sorry, this command is not executable in this channel."
            ),
            ephemeral: true
        });
    }

    // Permissions
    if (!CommandHelper.userFulfillsCommandPermission(interaction, command.config.permissions)) {
        return interaction.reply({
            content: MessageCreator.createReject(
                `${Constants.noPermissionReject} You need these permissions: \`${PermissionHelper.getPermissionString(command.config.permissions)}\`.`
            )
        });
    }

    const subcommand: Subcommand | undefined = CommandHelper.getSubcommand(interaction);
    const subcommandGroup: Subcommand | undefined = CommandHelper.getSubcommandGroup(interaction);

    // Command cooldown
    if (!botOwnerExecution) {
        const cooldownKey: CooldownKey = <CooldownKey> `${interaction.user.id}:${interaction.commandName}`;

        if (CommandHelper.isCooldownActive(cooldownKey)) {
            return interaction.reply({
                content: MessageCreator.createReject(
                    "Hey, calm down with the command! I need to rest too, you know."
                ),
                ephemeral: true
            });
        }

        const finalCooldown: number = Math.max(
            // Local command cooldown
            command.config.cooldown ?? 0,
            // Local subcommand cooldown
            subcommand?.config.cooldown ?? 0,
            // Local subcommand group cooldown
            subcommandGroup?.config.cooldown ?? 0,
            // Global command cooldown
            CommandUtilManager.globallyDisabledCommands.get(interaction.commandName) ?? 0,
            // Guild command cooldown
            CommandUtilManager.guildDisabledCommands.get(interaction.guildId!)?.get(interaction.commandName)?.cooldown ?? 0,
            // Channel command cooldown
            CommandUtilManager.channelDisabledCommands.get(interaction.channelId)?.get(interaction.commandName)?.cooldown ?? 0
        );

        CommandHelper.setCooldown(cooldownKey, finalCooldown);
    }

    client.logger.info(`${interaction.user.tag} (${interaction.channel instanceof DMChannel ? "DM" : `#${(<TextChannel | NewsChannel | ThreadChannel> interaction.channel!).name}`}): ${interaction.commandName}`);

    // Ephemeral handling
    try {
        await interaction.deferReply({
            ephemeral:
                command?.config.replyEphemeral ||
                Config.maintenance ||
                !CommandHelper.isCommandEnabled(interaction) ||
                subcommand?.config.replyEphemeral ||
                subcommandGroup?.config.replyEphemeral
        });
    } catch (ignored) {
        return;
    }

    // Partial data handling
    await client.channels.fetch(interaction.channelId);
    await interaction.channel?.fetch();

    if (interaction.inGuild()) {
        await client.guilds.fetch(interaction.guildId);
        await interaction.guild?.fetch();
        await (<GuildMember> interaction.member).fetch();
    }

    // Finally, run the command
    command.run(client, interaction)
        .catch((e: Error) => {
            interaction.editReply(MessageCreator.createReject(
                `Unable to execute command: ${e.message}`
            ));

            client.emit("error", e);
        });
};

export const config: EventUtil["config"] = {
    description: "Responsible for handling commands received from interactions. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true
};