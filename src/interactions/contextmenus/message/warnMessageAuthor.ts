import { MessageContextMenuCommand } from "@alice-interfaces/core/MessageContextMenuCommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { WarnMessageAuthorLocalization } from "@alice-localization/interactions/contextmenus/message/warnMessageAuthor/WarnMessageAuthorLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { WarningManager } from "@alice-utils/managers/WarningManager";
import { Utils } from "@rian8337/osu-base";
import { Message, SelectMenuInteraction } from "discord.js";

export const run: MessageContextMenuCommand["run"] = async (_, interaction) => {
    const localization: WarnMessageAuthorLocalization =
        new WarnMessageAuthorLocalization(
            await CommandHelper.getLocale(interaction)
        );

    if (!(interaction.targetMessage instanceof Message)) {
        return;
    }

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    let selectMenuInteraction: SelectMenuInteraction | null =
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("selectPoints")
                ),
            },
            Utils.initializeArray(10, 0).map((_, i) => {
                const num: number = i + 1;

                return {
                    label: num.toLocaleString(BCP47),
                    value: num.toString(),
                };
            }),
            [interaction.user.id],
            20
        );

    if (!selectMenuInteraction) {
        return;
    }

    await selectMenuInteraction.deferUpdate();

    const points: number = parseInt(selectMenuInteraction.values[0]);

    selectMenuInteraction = await SelectMenuCreator.createSelectMenu(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("selectDuration")
            ),
        },
        [
            // 1 minute
            60,
            // 5 minutes
            60 * 5,
            // 10 minutes
            60 * 10,
            // 1 hour
            3600,
            // 6 hours
            3600 * 6,
            // 12 hours
            3600 * 12,
            // 1 day
            86400,
            // 2 days
            86400 * 2,
            // 4 days
            86400 * 6,
            // 1 week
            86400 * 7,
        ].map((v) => {
            return {
                label: DateTimeFormatHelper.secondsToDHMS(
                    v,
                    localization.language
                ),
                value: v.toString(),
            };
        }),
        [interaction.user.id],
        20
    );

    if (!selectMenuInteraction) {
        return;
    }

    await selectMenuInteraction.deferUpdate();

    const duration: number = parseInt(selectMenuInteraction.values[0]);

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("warningConfirmation"),
                interaction.targetMessage.author.toString(),
                points.toLocaleString(BCP47),
                DateTimeFormatHelper.secondsToDHMS(
                    duration,
                    localization.language
                )
            ),
        },
        [interaction.user.id],
        15
    );

    if (!confirmation) {
        return;
    }

    let loggedContent: string = interaction.targetMessage.content.substring(
        0,
        100
    );

    if (interaction.targetMessage.content.length > 100) {
        loggedContent += "...";
    }

    const result: OperationResult = await WarningManager.issue(
        interaction,
        interaction.targetMessage.member!,
        points,
        duration,
        StringHelper.formatString(
            localization.getTranslation("warningReason"),
            loggedContent,
            interaction.targetMessage.url
        )
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warnIssueFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("warnIssueSuccess")
        ),
    });
};

export const config: MessageContextMenuCommand["config"] = {
    name: "Warn Message Author",
    replyEphemeral: true,
};
