import { DatabaseManager } from "@database/DatabaseManager";
import { AnniversaryReviewType } from "@enums/utils/AnniversaryReviewType";
import { AnniversaryPastEventAttemptLocalization } from "@localization/interactions/buttons/Anniversary/anniversaryPastEventAttempt/AnniversaryPastEventAttemptLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { CacheManager } from "@utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryPastEventAttemptLocalization(
        CommandHelper.getLocale(interaction),
    );

    const attemptIndex = parseInt(interaction.customId.split("#")[1]);

    await InteractionHelper.deferReply(interaction);

    const player =
        await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.getFromId(
            interaction.user.id,
            { projection: { _id: 0, pastEventAttempts: 1 } },
        );

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noPastAttempts"),
            ),
        });
    }

    if (attemptIndex === 1 && !player.pastEventAttempts[0]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noFirstAttempt"),
            ),
        });
    } else if (attemptIndex === 2 && !player.pastEventAttempts[1]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSecondAttempt"),
            ),
        });
    }

    const firstQuestion = CacheManager.anniversaryTriviaQuestions.first()!;

    InteractionHelper.reply(
        interaction,
        player.toReviewMessage(
            interaction.member,
            firstQuestion,
            attemptIndex,
            localization.language,
            AnniversaryReviewType.event,
        ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
