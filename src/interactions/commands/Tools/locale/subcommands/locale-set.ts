import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Language } from "@alice-localization/base/Language";
import { LocaleLocalization } from "@alice-localization/interactions/commands/Tools/locale/LocaleLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { SelectMenuInteraction } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LocaleLocalization = new LocaleLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(localization.language);

    const scope: string = interaction.options.getString("scope", true);

    const selectMenuInteraction: SelectMenuInteraction | null =
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("selectLanguage")
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
            20
        );

    if (!selectMenuInteraction) {
        return;
    }

    const pickedLanguage: Language = <Language>selectMenuInteraction.values[0];

    let result: OperationResult;

    switch (scope) {
        case "server":
            if (
                !interaction.inCachedGuild() ||
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "MANAGE_GUILD",
                ])
            ) {
                return InteractionHelper.update(selectMenuInteraction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result =
                await DatabaseManager.aliceDb.collections.guildSettings.setServerLocale(
                    interaction.guildId,
                    pickedLanguage
                );

            break;
        case "channel":
            if (
                !interaction.inCachedGuild() ||
                !CommandHelper.userFulfillsCommandPermission(interaction, [
                    "MANAGE_CHANNELS",
                ])
            ) {
                return InteractionHelper.update(selectMenuInteraction, {
                    content: MessageCreator.createReject(
                        constantsLocalization.getTranslation(
                            Constants.noPermissionReject
                        )
                    ),
                });
            }

            result =
                await DatabaseManager.aliceDb.collections.guildSettings.setChannelLocale(
                    interaction.guildId,
                    interaction.channelId,
                    pickedLanguage
                );

            break;
        default:
            result =
                await DatabaseManager.aliceDb.collections.userLocale.setUserLocale(
                    interaction.user.id,
                    pickedLanguage
                );
    }

    if (!result.success) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setLocaleFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setLocaleSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
