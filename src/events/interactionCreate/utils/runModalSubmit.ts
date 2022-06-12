import { Config } from "@alice-core/Config";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { ModalCommand } from "@alice-interfaces/core/ModalCommand";
import { RunModalSubmitLocalization } from "@alice-localization/events/interactionCreate/runModalSubmit/RunModalSubmitLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import {
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
    if (!interaction.isModalSubmit()) {
        return;
    }

    // 3 seconds should be enough to get the user's locale
    const localization: RunModalSubmitLocalization =
        new RunModalSubmitLocalization(
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

    const command: ModalCommand | undefined =
        client.interactions.modalSubmit.get(interaction.customId);

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

    // Log used command
    client.logger.info(
        `Modal: ${interaction.user.tag} (${
            interaction.channel instanceof DMChannel
                ? "DM"
                : `#${
                      (<TextChannel | NewsChannel | ThreadChannel>(
                          interaction.channel!
                      )).name
                  }`
        }): ${interaction.customId}`
    );

    interaction.ephemeral =
        (command.config?.replyEphemeral || Config.maintenance) ?? false;

    if (Config.isDebug && command.config?.instantDeferInDebug !== false) {
        // Attempt to instantly defer in debug mode (slower internet).
        await InteractionHelper.defer(interaction);
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
        "Responsible for handling modal submissions from interactions. This event utility cannot be disabled.",
    togglePermissions: [],
    toggleScope: [],
    debugEnabled: true,
};
