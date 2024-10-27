import { DatabaseManager } from "@database/DatabaseManager";
import { AnniversaryContinueAttemptLocalization } from "@localization/interactions/buttons/Anniversary/anniversaryContinueAttempt/AnniversaryContinueAttemptLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { CacheManager } from "@utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryContinueAttemptLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const player =
        await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.getFromId(
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
