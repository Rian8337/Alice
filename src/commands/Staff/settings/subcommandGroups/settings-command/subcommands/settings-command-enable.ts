import { Constants } from "@alice-core/Constants";
import { Command } from "@alice-interfaces/core/Command";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CommandUtilScope } from "@alice-types/utils/CommandUtilScope";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { SettingsLocalization } from "@alice-localization/commands/Staff/settings/SettingsLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(localization.language);

    const commandName: string = interaction.options.getString("command", true);

    const scope: CommandUtilScope =
        <CommandUtilScope>interaction.options.getString("scope") ?? "channel";

    const command: Command | undefined = client.commands.get(commandName);

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
                    "MANAGE_CHANNELS",
                ])
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result = await CommandUtilManager.setCommandCooldownInChannel(
                interaction.channel instanceof ThreadChannel
                    ? interaction.channel.parent!
                    : <TextChannel | NewsChannel>interaction.channel,
                commandName,
                0
            );
            break;
        case "guild":
            if (
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "MANAGE_GUILD",
                ])
            ) {
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

export const config: Subcommand["config"] = {
    permissions: [],
};
