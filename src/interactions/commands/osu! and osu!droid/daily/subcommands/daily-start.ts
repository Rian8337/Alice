import { DatabaseManager } from "@database/DatabaseManager";
import { Challenge } from "@database/utils/aliceDb/Challenge";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { DailyLocalization } from "@localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { Language } from "@localization/base/Language";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language: Language = CommandHelper.getLocale(interaction);

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !interaction.member.roles.cache.has(Challenge.challengeManagerRole)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    "noPermissionToExecuteCommand",
                ),
            ),
        });
    }

    const localization: DailyLocalization = new DailyLocalization(language);

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
            interaction.options.getString("challengeid", true),
        );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const result: OperationResult = await challenge.start(
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("startChallengeFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("startChallengeSuccess"),
            challenge.challengeid,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
