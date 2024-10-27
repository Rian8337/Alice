import { DatabaseManager } from "@database/DatabaseManager";
import { Challenge } from "@database/utils/aliceDb/Challenge";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("id", true),
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound"),
            ),
        });
    }

    if (!challenge.isScheduled) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeIsOngoing"),
            ),
        });
    }

    const constrain: string | null = interaction.options.getString("constrain");

    if (challenge.constrain !== constrain) {
        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.challenge.updateOne(
                { challengeid: challenge.challengeid },
                {
                    $set: {
                        constrain: constrain ?? "",
                    },
                },
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setConstrainFailed"),
                    result.reason!,
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setConstrainSuccess"),
            challenge.challengeid,
            constrain ?? localization.getTranslation("none"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
