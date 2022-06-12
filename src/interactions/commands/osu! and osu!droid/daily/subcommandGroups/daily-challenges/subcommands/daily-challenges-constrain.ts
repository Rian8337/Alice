import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
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

    if (!challenge.isScheduled) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeIsOngoing")
            ),
        });
    }

    const constrain: string | null = interaction.options.getString("constrain");

    if (challenge.constrain !== constrain) {
        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.challenge.update(
                { challengeid: challenge.challengeid },
                {
                    $set: {
                        constrain: constrain ?? "",
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setConstrainFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setConstrainSuccess"),
            challenge.challengeid,
            constrain ?? localization.getTranslation("none")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
