import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { Command } from "@alice-interfaces/core/Command";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { RunCommandLocalization } from "@alice-localization/events/interactionCreate/runCommand/RunCommandLocalization";
import {
    ChannelCooldownKey,
    GlobalCooldownKey,
} from "@alice-types/core/CooldownKey";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import {
    CacheType,
    CommandInteractionOption,
    DMChannel,
    Interaction,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";

export const run: EventUtil["run"] = async (
    client,
    interaction: Interaction
) => {
    if (!interaction.isCommand()) {
        return;
    }

    // 3 seconds should be enough to get the user's locale
    const localization: RunCommandLocalization = new RunCommandLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const botOwnerExecution: boolean =
        CommandHelper.isExecutedByBotOwner(interaction);

    if (Config.isDebug && !botOwnerExecution) {
        return interaction.reply({
            content: MessageCreator.createReject(
                localization.getTranslation("debugModeActive")
            ),
            ephemeral: true,
        });
    }

    const command: Command | undefined = client.commands.get(
        interaction.commandName
    );

    if (!command) {
        return interaction.reply({
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound")
            ),
        });
    }

    // Check for maintenance
    if (Config.maintenance && !botOwnerExecution) {
        return interaction.reply({
            content: MessageCreator.createReject(
                StringHelper.formatString(
                    localization.getTranslation("maintenanceMode"),
                    Config.maintenanceReason
                )
            ),
            ephemeral: true,
        });
    }

    // Check if command is executable in channel
    if (
        !CommandHelper.isCommandExecutableInScope(
            interaction,
            command.config.scope
        )
    ) {
        return interaction.reply({
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotExecutableInChannel")
            ),
            ephemeral: true,
        });
    }

    // Permissions
    if (
        !CommandHelper.userFulfillsCommandPermission(
            interaction,
            command.config.permissions
        )
    ) {
        return interaction.reply({
            content: MessageCreator.createReject(
                `${new ConstantsLocalization(
                    localization.language
                ).getTranslation(
                    Constants.noPermissionReject
                )} ${localization.getTranslation("requiredPermissions")}`,
                PermissionHelper.getPermissionString(command.config.permissions)
            ),
        });
    }

    const subcommand: Subcommand | undefined =
        CommandHelper.getSubcommand(interaction);
    const subcommandGroup: Subcommand | undefined =
        CommandHelper.getSubcommandGroup(interaction);

    // Command cooldown
    if (!botOwnerExecution) {
        const channelCooldownKey: ChannelCooldownKey = <ChannelCooldownKey>(
            `${interaction.user.id}:${interaction.channelId}:${interaction.commandName}`
        );

        const globalCooldownKey: GlobalCooldownKey = <GlobalCooldownKey>(
            `${interaction.user.id}:${interaction.commandName}`
        );

        if (
            CommandHelper.isCooldownActive(channelCooldownKey) ||
            CommandHelper.isCooldownActive(globalCooldownKey)
        ) {
            return interaction.reply({
                content: MessageCreator.createReject(
                    localization.getTranslation("commandInCooldown")
                ),
                ephemeral: true,
            });
        }

        const channelCooldown: number = Math.max(
            // Local command cooldown
            command.config.cooldown ?? 0,
            // Local subcommand cooldown
            subcommand?.config.cooldown ?? 0,
            // Local subcommand group cooldown
            subcommandGroup?.config.cooldown ?? 0,
            // Guild command cooldown
            CommandUtilManager.guildDisabledCommands
                .get(interaction.guildId!)
                ?.get(interaction.commandName)?.cooldown ?? 0,
            // Channel command cooldown
            CommandUtilManager.channelDisabledCommands
                .get(interaction.channelId)
                ?.get(interaction.commandName)?.cooldown ?? 0
        );

        const globalCooldown: number = Math.max(
            // Global command cooldown
            CommandUtilManager.globallyDisabledCommands.get(
                interaction.commandName
            ) ?? 0,
            // Global cooldown
            CommandUtilManager.globalCommandCooldown
        );

        CommandHelper.setCooldown(
            globalCooldown > channelCooldown ||
                (globalCooldown === channelCooldown &&
                    (CommandUtilManager.globallyDisabledCommands.get(
                        interaction.commandName
                    ) ||
                        CommandUtilManager.globalCommandCooldown))
                ? globalCooldownKey
                : channelCooldownKey,
            Math.max(channelCooldown, globalCooldown)
        );
    }

    // Log used command along with its subcommand group, subcommand, and options
    let logMessage: string = `${interaction.user.tag} (${
        interaction.channel instanceof DMChannel
            ? "DM"
            : `#${
                  (<TextChannel | NewsChannel | ThreadChannel>(
                      interaction.channel!
                  )).name
              }`
    }): ${interaction.commandName}`;

    if (interaction.options.getSubcommandGroup(false)) {
        logMessage += ` ${interaction.options.getSubcommandGroup()}`;
    }

    if (interaction.options.getSubcommand(false)) {
        logMessage += ` ${interaction.options.getSubcommand()}`;
    }

    let usedOptions: readonly CommandInteractionOption<CacheType>[];

    if (interaction.options.getSubcommandGroup(false)) {
        usedOptions = interaction.options.data[0].options![0].options ?? [];
    } else if (interaction.options.getSubcommand(false)) {
        usedOptions = interaction.options.data[0].options ?? [];
    } else {
        usedOptions = interaction.options.data;
    }

    const optionsStr: string = usedOptions
        .map((v) => {
            let str: string = `${v.name}:`;

            switch (true) {
                case !!v.channel:
                    str += `#${v.channel?.name}`;
                    break;
                case !!v.user:
                    str += `@${v.user?.tag}`;
                    break;
                case !!v.role:
                    str += `@${v.role?.name}`;
                    break;
                case !!v.value:
                    str += v.value;
                    break;
            }

            return str;
        })
        .join(" ");

    client.logger.info(`${logMessage} ${optionsStr}`);

    interaction.ephemeral =
        (command.config.replyEphemeral ||
            Config.maintenance ||
            !CommandHelper.isCommandEnabled(interaction) ||
            subcommand?.config.replyEphemeral ||
            subcommandGroup?.config.replyEphemeral) ??
        false;

    if (Config.isDebug) {
        // Attempt to instantly defer in debug mode (slower internet).
        const instantDefer: boolean =
            command.config.instantDeferInDebug !== false &&
            subcommandGroup?.config.instantDeferInDebug !== false &&
            subcommand?.config.instantDeferInDebug !== false;

        if (instantDefer) {
            await InteractionHelper.defer(interaction);
        }
    }

    // Finally, run the command
    command.run(client, interaction).catch((e: Error) => {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("commandExecutionFailed"),
                e.message
            ),
        });

        client.emit("error", e);
    });
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for handling commands received from interactions. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
