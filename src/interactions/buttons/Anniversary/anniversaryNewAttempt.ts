import { DatabaseManager } from "@alice-database/DatabaseManager";
import { AnniversaryTriviaPlayer } from "@alice-database/utils/aliceDb/AnniversaryTriviaPlayer";
import { AnniversaryNewAttemptLocalization } from "@alice-localization/interactions/buttons/Anniversary/anniversaryNewAttempt/AnniversaryNewAttemptLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new AnniversaryNewAttemptLocalization(
        CommandHelper.getLocale(interaction),
    );

    const player =
        CacheManager.anniversaryTriviaPlayers.get(interaction.user.id) ??
        new AnniversaryTriviaPlayer({
            discordId: interaction.user.id,
            pastAttempts: [],
        });

    if (player?.currentAttempt !== undefined) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("existingAttemptExists"),
            ),
        });
    }

    if (player.pastAttempts.length === 2) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noMoreAttempts"),
            ),
        });
    }

    player.currentAttempt = [];

    await InteractionHelper.deferReply(interaction);

    await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
        {
            discordId: interaction.user.id,
        },
        {
            $set: {
                currentAttempt: [],
            },
        },
    );

    CacheManager.anniversaryTriviaPlayers.set(interaction.user.id, player);

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
