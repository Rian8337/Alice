import { readFile } from "fs/promises";
import { TriviaQuestionCategory } from "@alice-enums/trivia/TriviaQuestionCategory";
import { TriviaQuestionType } from "@alice-enums/trivia/TriviaQuestionType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import {
    ButtonInteraction,
    Collection,
    GuildMember,
    Message,
    EmbedBuilder,
    BaseMessageOptions,
    Snowflake,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    APIButtonComponentWithCustomId,
    TextInputBuilder,
    TextInputStyle,
    RepliableInteraction,
    SelectMenuComponentOptionData,
} from "discord.js";
import { ArrayHelper } from "./ArrayHelper";
import { Symbols } from "@alice-enums/utils/Symbols";
import { TriviaQuestionResult } from "@alice-structures/trivia/TriviaQuestionResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Language } from "@alice-localization/base/Language";
import { TriviaHelperLocalization } from "@alice-localization/utils/helpers/TriviaHelper/TriviaHelperLocalization";
import { InteractionHelper } from "./InteractionHelper";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { TriviaQuestionCachedAnswer } from "@alice-structures/trivia/TriviaQuestionCachedAnswer";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";

/**
 * Helper methods for trivia-related features.
 */
export abstract class TriviaHelper {
    /**
     * Asks a trivia question to the given interaction.
     *
     * @param interaction The interaction.
     * @param category The question category to force.
     * @param type The question type to force.
     * @returns The result of the trivia question.
     */
    static async askQuestion(
        interaction: RepliableInteraction,
        category?: TriviaQuestionCategory,
        type?: TriviaQuestionType,
        language: Language = "en"
    ): Promise<TriviaQuestionResult> {
        const localization: TriviaHelperLocalization =
            this.getLocalization(language);

        category ??= ArrayHelper.getRandomArrayElement(
            <TriviaQuestionCategory[]>(
                Object.values(TriviaQuestionCategory).filter(
                    (v) => typeof v === "number"
                )
            )
        );

        const file: string = await readFile(
            `${process.cwd()}/files/trivia/${this.getCategoryFileName(
                category
            )}`,
            { encoding: "utf-8" }
        );

        const questionData: string[][] = file
            .split("\n")
            .map((v) => v.split(" | "));

        let components: string[];

        if (type) {
            const availableQuestions: string[][] = questionData.filter((v) => {
                const questionType: number = parseInt(v[1]);

                if (type === TriviaQuestionType.multipleChoiceFirstType) {
                    return (
                        questionType ===
                            TriviaQuestionType.multipleChoiceFirstType ||
                        questionType ===
                            TriviaQuestionType.multipleChoiceSecondType
                    );
                } else {
                    return questionType === type;
                }
            });

            if (availableQuestions.length === 0) {
                return {
                    category: category,
                    type: type,
                    correctAnswers: [],
                    results: [],
                };
            }

            components = ArrayHelper.getRandomArrayElement(availableQuestions);
        } else {
            components = ArrayHelper.getRandomArrayElement(questionData);
        }

        // First entry is the difficulty of the question.
        const difficulty: number = parseInt(components.shift()!);

        // Second entry is the type of the question.
        type = parseInt(components.shift()!);

        // Third entry is the link of the image related to the question.
        const imageLink: string = components.shift()!;

        // Fourth entry is the question itself.
        const question: string = components.shift()!;

        // TODO: this is a bit trippy considering it should never be undefined, but apparently
        // an error was thrown for that reason.
        if (components.length > 0) {
            components[components.length - 1] = components
                .at(-1)!
                .replace("\r", "");
        }

        // The rest is a combination of correct answers and all answers.
        const correctAnswers: string[] = [];

        const isMultipleChoice: boolean =
            type === TriviaQuestionType.multipleChoiceFirstType ||
            type === TriviaQuestionType.multipleChoiceSecondType;

        if (isMultipleChoice) {
            correctAnswers.push(components[0]);

            if (type === TriviaQuestionType.multipleChoiceSecondType) {
                components.shift();
            }
        } else {
            correctAnswers.push(...components);
        }

        let allAnswers: string[] = components;

        ArrayHelper.shuffle(allAnswers);

        const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        embed
            .setTitle(
                `${difficulty} ${Symbols.star} | ${this.getCategoryName(
                    category
                )} Question`
            )
            .setDescription(question);

        if (isMultipleChoice) {
            // Convert to letter choices (A, B, etc.) first.
            // There can only be one correct answer in a multiple choice question, so this
            // assumption is safe.
            correctAnswers[0] = String.fromCharCode(
                65 + allAnswers.indexOf(correctAnswers[0])
            );

            allAnswers = allAnswers.map(
                (v, i) => (v = `${String.fromCharCode(65 + i)}. ${v}`)
            );

            embed.addFields({ name: "Answers", value: allAnswers.join("\n") });
        }

        if (imageLink !== "-") {
            embed.setImage(imageLink);
        }

        const component: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder();

        const options: BaseMessageOptions = {
            content: MessageCreator.createWarn(
                localization.getTranslation("triviaQuestion")
            ),
            components: [component],
            embeds: [embed],
        };

        if (isMultipleChoice) {
            for (let i = 0; i < allAnswers.length; ++i) {
                const button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId(String.fromCharCode(65 + i))
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(String.fromCharCode(65 + i));

                CacheManager.exemptedButtonCustomIds.add(
                    String.fromCharCode(65 + i)
                );
                component.addComponents(button);
            }
        } else {
            component.addComponents(
                new ButtonBuilder()
                    .setCustomId("answerQuestionTrivia")
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(
                        localization.getTranslation(
                            "fillInTheBlankAnswerPrompt"
                        )
                    )
                    .setEmoji(Symbols.memo)
            );

            CacheManager.exemptedButtonCustomIds.add("answerQuestionTrivia");
        }

        const questionMessage: Message = await InteractionHelper.reply(
            interaction,
            options
        );

        const time: number = isMultipleChoice
            ? 5 + difficulty * 2
            : 7 + difficulty * 3;

        return new Promise((resolve) => {
            if (isMultipleChoice) {
                const { collector } =
                    InteractionCollectorCreator.createButtonCollector(
                        questionMessage,
                        time,
                        (i) =>
                            component.components.some(
                                (c) =>
                                    (<APIButtonComponentWithCustomId>c.data)
                                        .custom_id === i.customId
                            )
                    );

                // Use a separate collection to prevent multiple answers from users
                const answers: Collection<Snowflake, ButtonInteraction> =
                    new Collection();

                collector.on("collect", (i) => {
                    answers.set(i.user.id, i);

                    i.reply({
                        content: MessageCreator.createAccept(
                            localization.getTranslation("latestChoiceRecorded"),
                            i.customId
                        ),
                        ephemeral: true,
                    });
                });

                collector.once("end", async () => {
                    options.components = [];

                    try {
                        await InteractionHelper.reply(interaction, options);
                        // eslint-disable-next-line no-empty
                    } catch {}

                    resolve({
                        category: category!,
                        type: type!,
                        correctAnswers: [
                            allAnswers.find((v) =>
                                v.startsWith(correctAnswers[0])
                            )!,
                        ],
                        results: answers
                            .filter((v) => v.customId === correctAnswers[0])
                            .map((v) => {
                                return {
                                    user: v.user,
                                    timeTaken:
                                        v.createdTimestamp -
                                        questionMessage.createdTimestamp,
                                };
                            }),
                    });
                });
            } else {
                CacheManager.questionTriviaFillInTheBlankAnswers.set(
                    interaction.channelId!,
                    new Collection()
                );

                const { collector } =
                    InteractionCollectorCreator.createButtonCollector(
                        questionMessage,
                        time,
                        (i) =>
                            (<APIButtonComponentWithCustomId>(
                                component.components[0].data
                            )).custom_id === i.customId
                    );

                collector.on("collect", (i) => {
                    ModalCreator.createModal(
                        i,
                        "trivia-questions-fillintheblank",
                        localization.getTranslation("fillInTheBlankModalTitle"),
                        new TextInputBuilder()
                            .setCustomId("answer")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setLabel(
                                localization.getTranslation(
                                    "fillInTheBlankModalLabel"
                                )
                            )
                            .setPlaceholder(
                                localization.getTranslation(
                                    "fillInTheBlankModalPlaceholder"
                                )
                            )
                    );
                });

                collector.once("end", async () => {
                    options.components = [];

                    try {
                        await InteractionHelper.reply(interaction, options);
                        // eslint-disable-next-line no-empty
                    } catch {}

                    const lowercasedCorrectAnswers: string[] =
                        correctAnswers.map((v) => v.toLowerCase());

                    const collected: Collection<
                        Snowflake,
                        TriviaQuestionCachedAnswer
                    > = CacheManager.questionTriviaFillInTheBlankAnswers
                        .get(interaction.channelId!)!
                        .filter((v) =>
                            lowercasedCorrectAnswers.includes(
                                v.answer.toLowerCase()
                            )
                        );

                    resolve({
                        category: category!,
                        type: type!,
                        correctAnswers: correctAnswers,
                        results: collected.map((v) => {
                            return {
                                user: v.user,
                                timeTaken:
                                    v.submissionTime -
                                    questionMessage.createdTimestamp,
                            };
                        }),
                    });

                    CacheManager.questionTriviaFillInTheBlankAnswers.delete(
                        interaction.channelId!
                    );
                });
            }
        });
    }

    /**
     * Maps all possible categories into choices for select menus.
     */
    static getCategoryChoices(): SelectMenuComponentOptionData[] {
        return Object.values(TriviaQuestionCategory)
            .filter((v) => typeof v === "number")
            .map((v) => {
                return {
                    label: this.getCategoryName(<TriviaQuestionCategory>v),
                    value: v.toString(),
                };
            });
    }

    /**
     * Gets the name of the category.
     *
     * @param category The category.
     */
    static getCategoryName(category: TriviaQuestionCategory): string {
        switch (category) {
            case TriviaQuestionCategory.ANIMAL:
                return "Animals";
            case TriviaQuestionCategory.ANIME_AND_MANGA:
                return "Entertainment: Japanese Anime and Manga";
            case TriviaQuestionCategory.ART_AND_LITERATURE:
                return "Art and Literature";
            case TriviaQuestionCategory.ENTERTAINMENT_BOARD_GAMES:
                return "Entertainment: Board Games";
            case TriviaQuestionCategory.ENTERTAINMENT_CARTOONS_AND_ANIMATIONS:
                return "Entertainment: Cartoons and Animations";
            case TriviaQuestionCategory.CELEBRITIES:
                return "Celebrities";
            case TriviaQuestionCategory.ENTERTAINMENT_COMICS:
                return "Entertainment: Comics";
            case TriviaQuestionCategory.VIDEO_GAME_DOTA_2:
                return "Video Game: DotA 2";
            case TriviaQuestionCategory.VIDEO_GAME_FINAL_FANTASY:
                return "Video Game: Final Fantasy";
            case TriviaQuestionCategory.SCIENCE_COMPUTERS:
                return "Science: Computers";
            case TriviaQuestionCategory.ENTERTAINMENT_FILM:
                return "Entertainment: Film";
            case TriviaQuestionCategory.SCIENCE_GADGETS:
                return "Science: Gadgets";
            case TriviaQuestionCategory.GENERAL_KNOWLEDGE:
                return "General Knowledge";
            case TriviaQuestionCategory.GEOGRAPHY:
                return "Geography";
            case TriviaQuestionCategory.HISTORY:
                return "History";
            case TriviaQuestionCategory.VIDEO_GAME_LEAGUE_OF_LEGENDS:
                return "Video Game: League of Legends";
            case TriviaQuestionCategory.SCIENCE_MATHEMATICS:
                return "Science: Mathematics";
            case TriviaQuestionCategory.ENTERTAINMENT_MUSIC:
                return "Entertainment: Music";
            case TriviaQuestionCategory.MYTHOLOGY:
                return "Mythology";
            case TriviaQuestionCategory.VIDEO_GAME_POKEMON:
                return "Video Game: Pokemon";
            case TriviaQuestionCategory.SCIENCE_AND_NATURE:
                return "Science and Nature";
            case TriviaQuestionCategory.COMPANY_SLOGANS:
                return "Company Slogans";
            case TriviaQuestionCategory.SPORTS:
                return "Sports";
            case TriviaQuestionCategory.FILM_STAR_WARS:
                return "Film: Star Wars";
            case TriviaQuestionCategory.ENTERTAINMENT_TELEVISION:
                return "Entertainment: Television";
            case TriviaQuestionCategory.NONCATEGORIZED:
                return "Noncategorized";
            case TriviaQuestionCategory.ENTERTAINMENT_MUSICALS_AND_THEATRES:
                return "Entertainment: Musicals and Theatres";
            case TriviaQuestionCategory.VEHICLES:
                return "Vehicles";
            case TriviaQuestionCategory.ENTERTAINMENT_VIDEO_GAMES:
                return "Entertainment: Video Games";
            case TriviaQuestionCategory.ENGLISH_LANGUAGE:
                return "The English Language";
            case TriviaQuestionCategory.LOGICAL_REASONING:
                return "Logical Reasoning";
        }
    }

    private static getCategoryFileName(
        category: TriviaQuestionCategory
    ): string {
        switch (category) {
            case TriviaQuestionCategory.ANIMAL:
                return "animal.txt";
            case TriviaQuestionCategory.ANIME_AND_MANGA:
                return "animemanga.txt";
            case TriviaQuestionCategory.ART_AND_LITERATURE:
                return "artnliterature.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_BOARD_GAMES:
                return "boardgame.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_CARTOONS_AND_ANIMATIONS:
                return "cartoon.txt";
            case TriviaQuestionCategory.CELEBRITIES:
                return "celeb.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_COMICS:
                return "comic.txt";
            case TriviaQuestionCategory.VIDEO_GAME_DOTA_2:
                return "dota2.txt";
            case TriviaQuestionCategory.VIDEO_GAME_FINAL_FANTASY:
                return "ff.txt";
            case TriviaQuestionCategory.SCIENCE_COMPUTERS:
                return "computer.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_FILM:
                return "film.txt";
            case TriviaQuestionCategory.SCIENCE_GADGETS:
                return "gadget.txt";
            case TriviaQuestionCategory.GENERAL_KNOWLEDGE:
                return "general.txt";
            case TriviaQuestionCategory.GEOGRAPHY:
                return "geography.txt";
            case TriviaQuestionCategory.HISTORY:
                return "history.txt";
            case TriviaQuestionCategory.VIDEO_GAME_LEAGUE_OF_LEGENDS:
                return "leagueoflegends.txt";
            case TriviaQuestionCategory.SCIENCE_MATHEMATICS:
                return "math.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_MUSIC:
                return "music.txt";
            case TriviaQuestionCategory.MYTHOLOGY:
                return "myth.txt";
            case TriviaQuestionCategory.VIDEO_GAME_POKEMON:
                return "pokemon.txt";
            case TriviaQuestionCategory.SCIENCE_AND_NATURE:
                return "science.txt";
            case TriviaQuestionCategory.COMPANY_SLOGANS:
                return "slogan.txt";
            case TriviaQuestionCategory.SPORTS:
                return "sport.txt";
            case TriviaQuestionCategory.FILM_STAR_WARS:
                return "starwars.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_TELEVISION:
                return "television.txt";
            case TriviaQuestionCategory.NONCATEGORIZED:
                return "test.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_MUSICALS_AND_THEATRES:
                return "theater.txt";
            case TriviaQuestionCategory.VEHICLES:
                return "vehicle.txt";
            case TriviaQuestionCategory.ENTERTAINMENT_VIDEO_GAMES:
                return "videogame.txt";
            case TriviaQuestionCategory.ENGLISH_LANGUAGE:
                return "english.txt";
            case TriviaQuestionCategory.LOGICAL_REASONING:
                return "logic.txt";
        }
    }

    /**
     * Gets the localization of this helper utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): TriviaHelperLocalization {
        return new TriviaHelperLocalization(language);
    }
}
