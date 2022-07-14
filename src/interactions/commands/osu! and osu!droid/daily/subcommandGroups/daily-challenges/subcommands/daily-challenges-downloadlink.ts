import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("id", true)
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound")
            ),
        });
    }

    const downloadLink1: string = interaction.options.getString("link1", true);
    const downloadLink2: string | null = interaction.options.getString("link2");

    if (
        challenge.link[0] !== downloadLink1 ||
        challenge.link[1] !== downloadLink2
    ) {
        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.challenge.updateOne(
                { challengeid: challenge.challengeid },
                {
                    $set: {
                        link: [
                            downloadLink1,
                            downloadLink2 ?? challenge.link[1],
                        ],
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setDownloadLinkFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setDownloadLinkSuccess"),
            challenge.challengeid,
            downloadLink1
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
