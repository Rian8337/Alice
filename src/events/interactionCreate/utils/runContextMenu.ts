import { Config } from "@alice-core/Config";
import { ContextMenuCommand } from "structures/core/ContextMenuCommand";
import { EventUtil } from "structures/core/EventUtil";
import { RunContextMenuLocalization } from "@alice-localization/events/interactionCreate/runContextMenu/RunContextMenuLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BaseInteraction } from "discord.js";
import { consola } from "consola";
import { GlobalCooldownKey } from "@alice-structures/core/CooldownKey";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: EventUtil["run"] = async (
    client,
    interaction: BaseInteraction
) => {
    if (
        !interaction.isUserContextMenuCommand() &&
        !interaction.isMessageContextMenuCommand()
    ) {
        return;
    }

    // 3 seconds should be enough to get the user's locale
    const localization: RunContextMenuLocalization =
        new RunContextMenuLocalization(
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

    const command: ContextMenuCommand | undefined = (
        interaction.isMessageContextMenuCommand()
            ? client.interactions.contextMenu.message
            : client.interactions.contextMenu.user
    ).get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound")
            ),
            ephemeral: true,
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

    // Command cooldown
    if (!botOwnerExecution) {
        const cooldownKey: GlobalCooldownKey = `${interaction.user.id}:${interaction.commandName}`;

        if (CommandHelper.isCooldownActive(cooldownKey)) {
            return interaction.reply({
                content: MessageCreator.createReject(
                    localization.getTranslation("commandInCooldown")
                ),
                ephemeral: true,
            });
        }

        CommandHelper.setCooldown(
            cooldownKey,
            Math.max(
                command.config.cooldown ?? 0,
                CommandUtilManager.globalCommandCooldown
            )
        );
    }

    // Log used command
    consola.info(
        `Context Menu: ${interaction.user.tag} (${
            interaction.channel!.isDMBased()
                ? "DM"
                : `#${interaction.channel!.name}`
        }): ${interaction.commandName}`
    );

    interaction.ephemeral =
        (command.config?.replyEphemeral || Config.maintenance) ?? false;

    if (Config.isDebug && command.config?.instantDeferInDebug !== false) {
        // Attempt to instantly defer in debug mode (slower internet).
        await InteractionHelper.deferReply(interaction);
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
        "Responsible for handling message context menus. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
