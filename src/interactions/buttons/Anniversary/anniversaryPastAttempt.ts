import { AnniversaryPastAttemptsLocalization } from "@alice-localization/interactions/buttons/Anniversary/anniversaryPastAttempts/AnniversaryPastAttemptsLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryPastAttemptsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const attemptIndex = parseInt(interaction.customId.split("#")[1]);

    await InteractionHelper.deferReply(interaction);

    const player = CacheManager.anniversaryTriviaPlayers.get(
        interaction.user.id,
    );

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noPastAttempts"),
            ),
        });
    }

    if (attemptIndex === 1 && !player.pastAttempts[0]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noFirstAttempt"),
            ),
        });
    } else if (attemptIndex === 2 && !player.pastAttempts[1]) {
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
        ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
