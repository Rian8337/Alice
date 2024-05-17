import { ModalCommand } from "structures/core/ModalCommand";
import { TriviaMapCachedAnswer } from "@alice-structures/trivia/TriviaMapCachedAnswer";
import { TriviaMapAnswerLocalization } from "@alice-localization/interactions/modals/Fun/trivia-map-answerquestion/TriviaMapAnswerLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { Collection, Snowflake } from "discord.js";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization: TriviaMapAnswerLocalization =
        new TriviaMapAnswerLocalization(CommandHelper.getLocale(interaction));

    const answerCollection:
        | Collection<Snowflake, TriviaMapCachedAnswer>
        | undefined = CacheManager.mapTriviaAnswers.get(interaction.channelId!);

    if (!answerCollection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noOngoingTrivia"),
            ),
        });
    }

    const answer: TriviaMapCachedAnswer = answerCollection.get(
        interaction.user.id,
    ) ?? {
        user: interaction.user,
        answer: {
            artist: "",
            title: "",
        },
        artistAnswerSubmissionTime: 0,
        titleAnswerSubmissionTime: 0,
        artistMatchingCharacterCount: 0,
        titleMatchingCharacterCount: 0,
    };

    try {
        answer.answer.artist = interaction.fields.getTextInputValue("artist");

        answer.artistAnswerSubmissionTime = interaction.createdTimestamp;
        // eslint-disable-next-line no-empty
    } catch {}

    try {
        answer.answer.title = interaction.fields.getTextInputValue("title");

        answer.titleAnswerSubmissionTime = interaction.createdTimestamp;
        // eslint-disable-next-line no-empty
    } catch {}

    answerCollection.set(interaction.user.id, answer);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("answerRecorded"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
