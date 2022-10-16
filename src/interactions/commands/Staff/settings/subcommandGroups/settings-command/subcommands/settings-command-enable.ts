import { Constants } from "@alice-core/Constants";
import { SlashCommand } from "structures/core/SlashCommand";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { CommandUtilScope } from "structures/utils/CommandUtilScope";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(localization.language);

    const commandName: string = interaction.options.getString("command", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const command: SlashCommand | undefined =
        client.interactions.chatInput.get(commandName);

    if (!command) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound")
            ),
        });
    }

    let result: OperationResult | undefined;

    switch (scope) {
        case "channel":
            if (
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "ManageChannels",
                ])
            ) {
                interaction.ephemeral = true;

                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInChannel(
                interaction.channel!.isThread()
                    ? interaction.channel.parent!
                    : interaction.channel!,
                commandName,
                0
            );
            break;
        case "guild":
            if (
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "ManageGuild",
                ])
            ) {
                interaction.ephemeral = true;

                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInGuild(
                interaction.guildId!,
                commandName,
                0
            );
            break;
        case "global":
            // Only allow bot owners to globally enable a command
            if (!CommandHelper.isExecutedByBotOwner(interaction)) {
                interaction.ephemeral = true;

                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            CommandUtilManager.setCommandCooldownGlobally(commandName, 0);
            break;
    }

    if (result && !result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("enableCommandFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("enableCommandSuccess"),
            commandName
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
