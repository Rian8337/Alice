import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { User } from "discord.js";

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

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    if (challenge.featured !== user.id) {
        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.challenge.updateOne(
                { challengeid: challenge.challengeid },
                {
                    $set: {
                        featured: user.id,
                    },
                },
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setFeaturedFailed"),
                    result.reason!,
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setFeaturedSuccess"),
            challenge.challengeid,
            user.tag,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
