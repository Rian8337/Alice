import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Language } from "@localization/base/Language";
import { LocaleLocalization } from "@localization/interactions/commands/Tools/locale/LocaleLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { CacheManager } from "@utils/managers/CacheManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new LocaleLocalization(
        CommandHelper.getLocale(interaction),
    );

    const constantsLocalization = new ConstantsLocalization(
        localization.language,
    );

    const scope = interaction.options.getString("scope", true);

    const selectMenuInteraction =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("selectLanguage"),
                ),
            },
            [
                {
                    label: "English",
                    value: "en",
                },
                {
                    label: "Korean",
                    value: "kr",
                },
                {
                    label: "Indonesian",
                    value: "id",
                },
                {
                    label: "Spanish",
                    value: "es",
                },
            ].sort((a, b) => a.label.localeCompare(b.label)),
            [interaction.user.id],
            20,
        );

    if (!selectMenuInteraction) {
        return;
    }

    const pickedLanguage = <Language>selectMenuInteraction.values[0];

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

                return InteractionHelper.update(selectMenuInteraction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject,
                        ),
                    ),
                });
            }

            CacheManager.guildLocale.set(interaction.guildId, pickedLanguage);

            result =
                await DatabaseManager.aliceDb.collections.guildSettings.setServerLocale(
                    interaction.guildId,
                    pickedLanguage,
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

                return InteractionHelper.update(selectMenuInteraction, {
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
                    pickedLanguage,
                );

            break;
        default:
            result =
                await DatabaseManager.aliceDb.collections.userLocale.setUserLocale(
                    interaction.user.id,
                    pickedLanguage,
                );
    }

    if (!result.success) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setLocaleFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setLocaleSuccess"),
        ),
    });
};
