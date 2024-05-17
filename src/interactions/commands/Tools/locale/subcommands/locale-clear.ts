import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { LocaleLocalization } from "@alice-localization/interactions/commands/Tools/locale/LocaleLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LocaleLocalization = new LocaleLocalization(
        CommandHelper.getLocale(interaction),
    );

    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(localization.language);

    const scope: string = interaction.options.getString("scope", true);

    let result: OperationResult;

    switch (scope) {
        case "server":
            if (
                !interaction.inCachedGuild() ||
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "ManageGuild",
                ])
            ) {
                interaction.ephemeral = true;

                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject,
                        ),
                    ),
                });
            }

            result =
                await DatabaseManager.aliceDb.collections.guildSettings.setServerLocale(
                    interaction.guildId,
                    "en",
                );

            break;
        case "channel":
            if (
                !interaction.inCachedGuild() ||
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "ManageChannels",
                ])
            ) {
                interaction.ephemeral = true;

                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject,
                        ),
                    ),
                });
            }

            result =
                await DatabaseManager.aliceDb.collections.guildSettings.setChannelLocale(
                    interaction.guildId,
                    interaction.channelId,
                    "en",
                );

            break;
        default:
            result =
                await DatabaseManager.aliceDb.collections.userLocale.setUserLocale(
                    interaction.user.id,
                    "en",
                );
    }

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clearLocaleFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("clearLocaleSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
