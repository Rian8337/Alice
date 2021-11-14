import { TriviaQuestionCategory } from "@alice-enums/trivia/TriviaQuestionCategory";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { TriviaQuestionResult } from "@alice-interfaces/trivia/TriviaQuestionResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { TriviaHelper } from "@alice-utils/helpers/TriviaHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { triviaStrings } from "../triviaStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (CacheManager.stillHasQuestionTriviaActive.has(interaction.channelId)) {
        return interaction.editReply({
            content: MessageCreator.createReject(triviaStrings.channelHasTriviaQuestionActive)
        });
    }

    let category: TriviaQuestionCategory | undefined;

    if (interaction.options.getBoolean("forcecategory")) {
        const pickedChoice: string = (await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn("Choose the category that you want to enforce.")
            },
            TriviaHelper.getCategoryChoices(),
            [interaction.user.id],
            30
        ))[0];

        if (!pickedChoice) {
            return;
        }

        category = parseInt(pickedChoice);
    }

    CacheManager.stillHasQuestionTriviaActive.add(interaction.channelId);

    const result: TriviaQuestionResult = await TriviaHelper.askQuestion(
        interaction,
        category,
        interaction.options.getInteger("type") ?? undefined
    );

    CacheManager.stillHasQuestionTriviaActive.delete(interaction.channelId);

    if (result.correctAnswers.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                triviaStrings.categoryHasNoQuestionType, TriviaHelper.getCategoryName(result.category)
            )
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: (<GuildMember | null> interaction.member)?.displayColor }
    );

    if (result.results.length > 0) {
        embed.setDescription(
            `Hey, someone got that correctly.\n\n` +
            result.results.sort((a, b) => { return a.timeTaken - b.timeTaken; }).map(v => `${v.user.username} - ${v.timeTaken / 1000} s`).join("\n") + "\n\n" +
            `${result.correctAnswers.length === 1 ? "The correct answer is" : "Correct answers are"} **${result.correctAnswers.join(", ")}**.`
        );
    } else {
        embed.setDescription(
            "Looks like no one got that right.\n\n" +
            `${result.correctAnswers.length === 1 ? "The correct answer is" : "Correct answers are"} **${result.correctAnswers.join(", ")}**.`
        );
    }

    interaction.followUp({
        embeds: [ embed ]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};