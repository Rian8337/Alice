import { AnniversaryContinueAttemptLocalization } from "@alice-localization/interactions/buttons/Anniversary/anniversaryContinueAttempt/AnniversaryContinueAttemptLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryContinueAttemptLocalization(
        CommandHelper.getLocale(interaction),
    );

    const player = CacheManager.anniversaryTriviaPlayers.get(
        interaction.user.id,
    );

    if (!player?.currentAttempt) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noExistingAttempt"),
            ),
        });
    }

    const firstQuestion = CacheManager.anniversaryTriviaQuestions.first()!;

    InteractionHelper.reply(
        interaction,
        player.toAttemptMessage(
            interaction.member,
            firstQuestion,
            localization.language,
        ),
    );
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
