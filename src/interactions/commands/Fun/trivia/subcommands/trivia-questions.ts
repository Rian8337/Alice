import { TriviaQuestionCategory } from "@alice-enums/trivia/TriviaQuestionCategory";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TriviaQuestionResult } from "@alice-structures/trivia/TriviaQuestionResult";
import { TriviaLocalization } from "@alice-localization/interactions/commands/Fun/trivia/TriviaLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TriviaHelper } from "@alice-utils/helpers/TriviaHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { GuildMember, EmbedBuilder, SelectMenuInteraction } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: TriviaLocalization = new TriviaLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (CacheManager.stillHasQuestionTriviaActive.has(interaction.channelId)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("channelHasTriviaQuestionActive")
            ),
        });
    }

    CacheManager.stillHasQuestionTriviaActive.add(interaction.channelId);

    let category: TriviaQuestionCategory | undefined;

    if (interaction.options.getBoolean("forcecategory")) {
        const selectMenuInteraction: SelectMenuInteraction | null =
            await SelectMenuCreator.createSelectMenu(
                interaction,
                {
                    content: MessageCreator.createWarn(
                        localization.getTranslation("chooseCategory")
                    ),
                },
                TriviaHelper.getCategoryChoices(),
                [interaction.user.id],
                30
            );

        if (!selectMenuInteraction) {
            CacheManager.stillHasQuestionTriviaActive.delete(
                interaction.channelId
            );

            return;
        }

        await selectMenuInteraction.deferUpdate();

        category = parseInt(selectMenuInteraction.values[0]);
    }

    const result: TriviaQuestionResult = await TriviaHelper.askQuestion(
        interaction,
        category,
        interaction.options.getInteger("type") ?? undefined,
        localization.language
    );

    CacheManager.stillHasQuestionTriviaActive.delete(interaction.channelId);

    if (result.correctAnswers.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("categoryHasNoQuestionType"),
                TriviaHelper.getCategoryName(result.category)
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    if (result.results.length > 0) {
        embed.setDescription(
            `${localization.getTranslation("correctAnswerGotten")}\n\n` +
                result.results
                    .sort((a, b) => {
                        return a.timeTaken - b.timeTaken;
                    })
                    .map((v) => `${v.user.username} - ${v.timeTaken / 1000} s`)
                    .join("\n") +
                "\n\n" +
                `${localization.getTranslation(
                    result.correctAnswers.length === 1
                        ? "oneCorrectAnswer"
                        : "multipleCorrectAnswers"
                )} **${result.correctAnswers.join(", ")}**.`
        );
    } else {
        embed.setDescription(
            `${localization.getTranslation("correctAnswerNotGotten")}\n\n` +
                `${localization.getTranslation(
                    result.correctAnswers.length === 1
                        ? "oneCorrectAnswer"
                        : "multipleCorrectAnswers"
                )} **${result.correctAnswers.join(", ")}**.`
        );
    }

    interaction.followUp({
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
