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
import { AnniversaryReviewType } from "@alice-enums/utils/AnniversaryReviewType";
import { CacheManager } from "@alice-utils/managers/CacheManager";

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
    readonly pastEventAttempts: AnniversaryTriviaAttempt[];

    constructor(
        data: DatabaseAnniversaryTriviaPlayer = DatabaseManager.aliceDb
            ?.collections.anniversaryTriviaPlayer.defaultDocument,
    ) {
        super();

        this.discordId = data.discordId;
        this.pastAttempts = data.pastAttempts;
        this.pastEventAttempts = data.pastEventAttempts;
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
     * @param type The type of review.
     */
    toReviewMessage(
        member: GuildMember,
        currentQuestion: AnniversaryTriviaQuestion,
        attemptIndex: number,
        language: Language,
        type: AnniversaryReviewType,
    ): BaseMessageOptions {
        const localization = this.getLocalization(language);
        const attempt = (
            type === AnniversaryReviewType.past
                ? this.pastAttempts
                : this.pastEventAttempts
        )[attemptIndex - 1];

        return {
            components: this.createButtons(
                currentQuestion,
                language,
                attemptIndex,
                type,
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
     * @returns The buttons.
     */
    private createButtons(
        question: AnniversaryTriviaQuestion,
        language: Language,
    ): ActionRowBuilder<ButtonBuilder>[];

    /**
     * Creates buttons for embed.
     *
     * @param question The current question.
     * @param language The language to use for localization.
     * @param attemptIndex The index of the attempt to review.
     * @param type The type of review.
     * @returns The buttons.
     */
    private createButtons(
        question: AnniversaryTriviaQuestion,
        language: Language,
        attemptIndex: number,
        type: AnniversaryReviewType,
    ): ActionRowBuilder<ButtonBuilder>[];

    private createButtons(
        question: AnniversaryTriviaQuestion,
        language: Language,
        attemptIndex?: number,
        type?: AnniversaryReviewType,
    ): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];

        // Generate buttons for answers
        const answerRow = new ActionRowBuilder<ButtonBuilder>();

        const userAnswer = (
            attemptIndex
                ? type === AnniversaryReviewType.event
                    ? this.pastEventAttempts[attemptIndex - 1].answers
                    : this.pastAttempts[attemptIndex - 1].answers
                : this.currentAttempt
        )?.find((m) => m.id === question.id);

        for (const answer of question.answers) {
            if (attemptIndex && type) {
                const button = new ButtonBuilder()
                    .setCustomId(answer)
                    .setDisabled(true)
                    .setLabel(answer);

                if (userAnswer && userAnswer.answer === answer) {
                    if (userAnswer.answer === question.correctAnswer) {
                        button.setStyle(ButtonStyle.Success);
                    } else {
                        button.setStyle(ButtonStyle.Danger);
                    }
                } else if (answer === question.correctAnswer) {
                    button.setStyle(ButtonStyle.Success);
                } else {
                    button.setStyle(ButtonStyle.Primary);
                }

                answerRow.addComponents(button);
            } else {
                answerRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `anniversaryTriviaAnswer#${question.id}#${answer}`,
                        )
                        .setLabel(answer)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(userAnswer?.answer === answer),
                );
            }
        }

        rows.push(answerRow);

        // Generate buttons for each question
        let questionRow = new ActionRowBuilder<ButtonBuilder>();

        for (let i = 0; i < 15; ++i) {
            const button = new ButtonBuilder()
                .setCustomId(
                    `anniversaryTriviaQuestion#${i + 1}${type ? `#${type}` : ""}${attemptIndex ? `#${attemptIndex}` : ""}`,
                )
                .setLabel((i + 1).toString())
                .setDisabled(i === question.id - 1);

            if (attemptIndex && type) {
                const question = CacheManager.anniversaryTriviaQuestions.get(
                    i + 1,
                )!;

                const userAnswer = (
                    type === AnniversaryReviewType.event
                        ? this.pastEventAttempts[attemptIndex - 1].answers
                        : this.pastAttempts[attemptIndex - 1].answers
                ).find((v) => v.id === i + 1);

                // Highlight correctly and wrongly answered questions - as well as those that are not answered.
                button.setStyle(
                    userAnswer
                        ? userAnswer.answer === question.correctAnswer
                            ? ButtonStyle.Success
                            : ButtonStyle.Danger
                        : ButtonStyle.Secondary,
                );
            } else {
                const userAnswer = this.currentAttempt?.find(
                    (v) => v.id === i + 1,
                );

                button.setStyle(
                    userAnswer?.flagged
                        ? ButtonStyle.Danger
                        : userAnswer
                          ? ButtonStyle.Success
                          : ButtonStyle.Secondary,
                );
            }

            questionRow.addComponents(button);

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
                        localization.getTranslation(
                            "embedQuestionSubmitAttempt",
                        ),
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
