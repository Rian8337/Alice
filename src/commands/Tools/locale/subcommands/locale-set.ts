import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { LocaleLocalization } from "@alice-localization/commands/Tools/locale/LocaleLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: LocaleLocalization = new LocaleLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const constantsLocalization: ConstantsLocalization =
        new ConstantsLocalization(localization.language);

    const scope: string = interaction.options.getString("scope", true);

    const pickedLanguage: Language = <Language>(
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
        )
    )[0];

    if (!pickedLanguage) {
        return;
    }

    let result: OperationResult;

    switch (scope) {
        case "server":
            if (
                !interaction.inCachedGuild() ||
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
                return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setLocaleFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setLocaleSuccess")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
