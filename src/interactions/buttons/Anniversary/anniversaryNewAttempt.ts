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

    await InteractionHelper.deferReply(interaction);

    const player =
        (await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.getFromId(
            interaction.user.id,
            {
                projection: {
                    _id: 0,
                    currentAttempt: 1,
                },
            },
        )) ??
        new AnniversaryTriviaPlayer({
            discordId: interaction.user.id,
            pastEventAttempts: [],
            pastAttempts: [],
        });

    if (player.currentAttempt !== undefined) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("existingAttemptExists"),
            ),
        });
    }

    player.currentAttempt = [];

    await DatabaseManager.aliceDb.collections.anniversaryTriviaPlayer.updateOne(
        {
            discordId: interaction.user.id,
        },
        {
            $set: {
                currentAttempt: [],
            },
            $setOnInsert: {
                pastAttempts: [],
                pastEventAttempts: [],
            },
        },
        { upsert: true },
    );

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
