import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseAnniversaryTriviaPlayer } from "@alice-structures/database/aliceDb/DatabaseAnniversaryTriviaPlayer";
import { Manager } from "@alice-utils/base/Manager";
import { AnniversaryTriviaQuestion } from "./AnniversaryTriviaQuestion";
import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
} from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { Language } from "@alice-localization/base/Language";
import { AnniversaryTriviaPlayerLocalization } from "@alice-localization/database/utils/aliceDb/AnniversaryTriviaPlayer/AnniversaryTriviaPlayerLocalization";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { AnniversaryTriviaAttempt } from "@alice-structures/utils/AnniversaryTriviaAttempt";
import { AnniversaryTriviaManager } from "@alice-utils/managers/AnniversaryTriviaManager";
import { AnniversaryTriviaCurrentAttemptQuestion } from "@alice-structures/utils/AnniversaryTriviaCurrentAttemptQuestion";

/**
 * Represents a player in the anniversary trivia game.
 */
export class AnniversaryTriviaPlayer
    extends Manager
    implements DatabaseAnniversaryTriviaPlayer
{
    readonly discordId: string;
    currentAttempt?: AnniversaryTriviaCurrentAttemptQuestion[];
    readonly pastAttempts: AnniversaryTriviaAttempt[];

    constructor(
        data: DatabaseAnniversaryTriviaPlayer = DatabaseManager.aliceDb
            ?.collections.anniversaryTriviaPlayer.defaultDocument,
    ) {
        super();

        this.discordId = data.discordId;
        this.pastAttempts = data.pastAttempts;
        this.currentAttempt = data.currentAttempt;
    }

    /**
     * Generates a message for the player to attempt a question.
     *
     * @param member The guild member to generate the message for.
     * @param currentQuestion The current question.
     * @param language The language to use for localization.
     * @returns The options for the message.
     */
    toAttemptMessage(
        member: GuildMember,
        currentQuestion: AnniversaryTriviaQuestion,
        language: Language = "en",
    ): BaseMessageOptions {
        const localization = this.getLocalization(language);

        return {
            components: this.createButtons(currentQuestion, language),
            embeds: [
                EmbedCreator.createNormalEmbed({ author: member.user })
                    .setColor(member.displayColor)
                    .setTitle(
                        StringHelper.formatString(
                            localization.getTranslation("embedQuestionTitle"),
                            currentQuestion.id.toString(),
                        ) +
                            ` [${currentQuestion.marks} ${localization.getTranslation(currentQuestion.marks === 1 ? "embedQuestionMarkSingular" : "embedQuestionMarkPlural")}]`,
                    )
                    .setDescription(currentQuestion.question),
            ],
        };
    }

    /**
     * Generates a message for the player to review their answers.
     *
     * @param member The guild member to generate the message for.
     * @param currentQuestion The current question.
     * @param attemptIndex The index of the attempt to review.
     * @param language The language to use for localization.
     */
    toReviewMessage(
        member: GuildMember,
        currentQuestion: AnniversaryTriviaQuestion,
        attemptIndex: number,
        language: Language,
    ): BaseMessageOptions {
        const localization = this.getLocalization(language);
        const attempt = this.pastAttempts[attemptIndex - 1];

        return {
            components: this.createButtons(
                currentQuestion,
                language,
                attemptIndex,
            ),
            embeds: [
                EmbedCreator.createNormalEmbed({
                    author: member.user,
                    color: member.displayColor,
                    footerText: `${attempt.marks}/${AnniversaryTriviaManager.maximumMarks} ${localization.getTranslation("embedQuestionMarkPlural")}`,
                })
                    .setTimestamp(attempt.submissionDate)
                    .setTitle(
                        StringHelper.formatString(
                            localization.getTranslation("embedQuestionTitle"),
                            currentQuestion.id.toString(),
                        ) +
                            ` [${currentQuestion.marks} ${localization.getTranslation(currentQuestion.marks === 1 ? "embedQuestionMarkSingular" : "embedQuestionMarkPlural")}]`,
                    )
                    .setDescription(currentQuestion.question),
            ],
        };
    }

    /**
     * Creates buttons for embed.
     *
     * @param question The current question.
     * @param language The language to use for localization.
     * @param attemptIndex The index of the attempt to review.
     */
    private createButtons(
        question: AnniversaryTriviaQuestion,
        language: Language,
        attemptIndex?: number,
    ): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];

        // Generate buttons for answers
        const answerRow = new ActionRowBuilder<ButtonBuilder>();

        const userAnswer = (
            attemptIndex
                ? this.pastAttempts[attemptIndex - 1].answers
                : this.currentAttempt
        )?.find((m) => m.id === question.id);

        for (const answer of question.answers) {
            if (attemptIndex) {
                answerRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(answer)
                        .setDisabled(true)
                        .setLabel(answer)
                        .setStyle(
                            userAnswer?.answer === answer
                                ? ButtonStyle.Success
                                : ButtonStyle.Primary,
                        ),
                );
            } else {
                answerRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `anniversaryTriviaAnswer#${question.id}#${answer}`,
                        )
                        .setLabel(answer)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(userAnswer?.answer === answer ?? false),
                );
            }
        }

        rows.push(answerRow);

        // Generate buttons for each question
        let questionRow = new ActionRowBuilder<ButtonBuilder>();

        for (let i = 0; i < 15; ++i) {
            const userAnswer = this.currentAttempt?.find((v) => v.id === i + 1);

            questionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `anniversaryTriviaQuestion#${i + 1}${attemptIndex ? `#${attemptIndex}` : ""}`,
                    )
                    .setLabel((i + 1).toString())
                    .setStyle(
                        userAnswer?.flagged
                            ? ButtonStyle.Danger
                            : userAnswer
                              ? ButtonStyle.Success
                              : ButtonStyle.Secondary,
                    )
                    .setDisabled(i === question.id - 1),
            );

            if (questionRow.components.length === 5) {
                rows.push(questionRow);
                questionRow = new ActionRowBuilder<ButtonBuilder>();
            }
        }

        // Generate submission button
        if (!attemptIndex) {
            const localization = this.getLocalization(language);
            const submissionRow = new ActionRowBuilder<ButtonBuilder>();

            if (userAnswer) {
                submissionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `anniversaryTriviaFlagQuestion#${question.id}`,
                        )
                        .setStyle(ButtonStyle.Danger)
                        .setLabel(
                            localization.getTranslation(
                                (
                                    userAnswer as
                                        | AnniversaryTriviaCurrentAttemptQuestion
                                        | undefined
                                )?.flagged
                                    ? "embedQuestionUnflagQuestion"
                                    : "embedQuestionFlagQuestion",
                            ),
                        ),
                );
            }

            submissionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId("anniversaryTriviaSubmit")
                    .setLabel(
                        localization.getTranslation("embedQuestionSubmit"),
                    )
                    .setStyle(ButtonStyle.Danger),
            );

            rows.push(submissionRow);
        }

        return rows;
    }

    private getLocalization(language: Language) {
        return new AnniversaryTriviaPlayerLocalization(language);
    }
}
