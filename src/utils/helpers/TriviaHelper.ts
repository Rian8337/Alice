import { readFile } from "fs/promises";
import { TriviaQuestionCategory } from "@enums/trivia/TriviaQuestionCategory";
import { TriviaQuestionType } from "@enums/trivia/TriviaQuestionType";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
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
import { Symbols } from "@enums/utils/Symbols";
import { TriviaQuestionResult } from "@structures/trivia/TriviaQuestionResult";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { Language } from "@localization/base/Language";
import { TriviaHelperLocalization } from "@localization/utils/helpers/TriviaHelper/TriviaHelperLocalization";
import { InteractionHelper } from "./InteractionHelper";
import { ModalCreator } from "@utils/creators/ModalCreator";
import { CacheManager } from "@utils/managers/CacheManager";
import { TriviaQuestionCachedAnswer } from "@structures/trivia/TriviaQuestionCachedAnswer";
import { InteractionCollectorCreator } from "@utils/base/InteractionCollectorCreator";

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
        language: Language = "en",
    ): Promise<TriviaQuestionResult> {
        const localization: TriviaHelperLocalization =
            this.getLocalization(language);

        category ??= ArrayHelper.getRandomArrayElement(
            <TriviaQuestionCategory[]>(
                Object.values(TriviaQuestionCategory).filter(
                    (v) => typeof v === "number",
                )
            ),
        );

        const file: string = await readFile(
            `${process.cwd()}/files/trivia/${this.getCategoryFileName(
                category,
            )}`,
            { encoding: "utf-8" },
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
                    category,
                )} Question`,
            )
            .setDescription(question);

        if (isMultipleChoice) {
            // Convert to letter choices (A, B, etc.) first.
            // There can only be one correct answer in a multiple choice question, so this
            // assumption is safe.
            correctAnswers[0] = String.fromCharCode(
                65 + allAnswers.indexOf(correctAnswers[0]),
            );

            allAnswers = allAnswers.map(
                (v, i) => (v = `${String.fromCharCode(65 + i)}. ${v}`),
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
                localization.getTranslation("triviaQuestion"),
            ),
            components: [component],
            embeds: [embed],
        };

        const triviaMultipleChoicePrefix: string = "triviaMultipleChoiceOption";

        if (isMultipleChoice) {
            for (let i = 0; i < allAnswers.length; ++i) {
                const button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId(String.fromCharCode(65 + i))
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(String.fromCharCode(65 + i));

                CacheManager.exemptedButtonCustomIds.add(
                    triviaMultipleChoicePrefix + String.fromCharCode(65 + i),
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
                            "fillInTheBlankAnswerPrompt",
                        ),
                    )
                    .setEmoji(Symbols.memo),
            );

            CacheManager.exemptedButtonCustomIds.add("answerQuestionTrivia");
        }

        const questionMessage: Message = await InteractionHelper.reply(
            interaction,
            options,
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
                                        .custom_id === i.customId,
                            ),
                    );

                // Use a separate collection to prevent multiple answers from users
                const answers: Collection<Snowflake, ButtonInteraction> =
                    new Collection();

                collector.on("collect", (i) => {
                    answers.set(i.user.id, i);

                    i.reply({
                        content: MessageCreator.createAccept(
                            localization.getTranslation("latestChoiceRecorded"),
                            i.customId.replace(triviaMultipleChoicePrefix, ""),
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
                                v.startsWith(correctAnswers[0]),
                            )!,
                        ],
                        results: answers
                            .filter(
                                (v) =>
                                    v.customId.replace(
                                        triviaMultipleChoicePrefix,
                                        "",
                                    ) === correctAnswers[0],
                            )
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
                    new Collection(),
                );

                const { collector } =
                    InteractionCollectorCreator.createButtonCollector(
                        questionMessage,
                        time,
                        (i) =>
                            (<APIButtonComponentWithCustomId>(
                                component.components[0].data
                            )).custom_id === i.customId,
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
                                    "fillInTheBlankModalLabel",
                                ),
                            )
                            .setPlaceholder(
                                localization.getTranslation(
                                    "fillInTheBlankModalPlaceholder",
                                ),
                            ),
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
                                v.answer.toLowerCase(),
                            ),
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
                        interaction.channelId!,
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
            case TriviaQuestionCategory.animal:
                return "Animals";
            case TriviaQuestionCategory.animeAndManga:
                return "Entertainment: Japanese Anime and Manga";
            case TriviaQuestionCategory.artAndLiterature:
                return "Art and Literature";
            case TriviaQuestionCategory.entertainmentBoardGames:
                return "Entertainment: Board Games";
            case TriviaQuestionCategory.entertainmentCartoonsAndAnimations:
                return "Entertainment: Cartoons and Animations";
            case TriviaQuestionCategory.celebrities:
                return "Celebrities";
            case TriviaQuestionCategory.entertainmentComics:
                return "Entertainment: Comics";
            case TriviaQuestionCategory.videoGameDOTA2:
                return "Video Game: DotA 2";
            case TriviaQuestionCategory.videoGameFinalFantasy:
                return "Video Game: Final Fantasy";
            case TriviaQuestionCategory.scienceComputers:
                return "Science: Computers";
            case TriviaQuestionCategory.entertainmentFilm:
                return "Entertainment: Film";
            case TriviaQuestionCategory.scienceGadgets:
                return "Science: Gadgets";
            case TriviaQuestionCategory.generalKnowledge:
                return "General Knowledge";
            case TriviaQuestionCategory.geography:
                return "Geography";
            case TriviaQuestionCategory.history:
                return "History";
            case TriviaQuestionCategory.videoGameLeagueOfLegends:
                return "Video Game: League of Legends";
            case TriviaQuestionCategory.scienceMathematics:
                return "Science: Mathematics";
            case TriviaQuestionCategory.entertainmentMusic:
                return "Entertainment: Music";
            case TriviaQuestionCategory.mythology:
                return "Mythology";
            case TriviaQuestionCategory.videoGamePokemon:
                return "Video Game: Pokemon";
            case TriviaQuestionCategory.scienceAndNature:
                return "Science and Nature";
            case TriviaQuestionCategory.companySlogans:
                return "Company Slogans";
            case TriviaQuestionCategory.sports:
                return "Sports";
            case TriviaQuestionCategory.filmStarWars:
                return "Film: Star Wars";
            case TriviaQuestionCategory.entertainmentTelevision:
                return "Entertainment: Television";
            case TriviaQuestionCategory.noncategorized:
                return "Noncategorized";
            case TriviaQuestionCategory.entertainmentMusicalsANdTheatres:
                return "Entertainment: Musicals and Theatres";
            case TriviaQuestionCategory.vehicles:
                return "Vehicles";
            case TriviaQuestionCategory.entertainmentVideoGames:
                return "Entertainment: Video Games";
            case TriviaQuestionCategory.englishLanguage:
                return "The English Language";
            case TriviaQuestionCategory.logicalReasoning:
                return "Logical Reasoning";
        }
    }

    private static getCategoryFileName(
        category: TriviaQuestionCategory,
    ): string {
        switch (category) {
            case TriviaQuestionCategory.animal:
                return "animal.txt";
            case TriviaQuestionCategory.animeAndManga:
                return "animemanga.txt";
            case TriviaQuestionCategory.artAndLiterature:
                return "artnliterature.txt";
            case TriviaQuestionCategory.entertainmentBoardGames:
                return "boardgame.txt";
            case TriviaQuestionCategory.entertainmentCartoonsAndAnimations:
                return "cartoon.txt";
            case TriviaQuestionCategory.celebrities:
                return "celeb.txt";
            case TriviaQuestionCategory.entertainmentComics:
                return "comic.txt";
            case TriviaQuestionCategory.videoGameDOTA2:
                return "dota2.txt";
            case TriviaQuestionCategory.videoGameFinalFantasy:
                return "ff.txt";
            case TriviaQuestionCategory.scienceComputers:
                return "computer.txt";
            case TriviaQuestionCategory.entertainmentFilm:
                return "film.txt";
            case TriviaQuestionCategory.scienceGadgets:
                return "gadget.txt";
            case TriviaQuestionCategory.generalKnowledge:
                return "general.txt";
            case TriviaQuestionCategory.geography:
                return "geography.txt";
            case TriviaQuestionCategory.history:
                return "history.txt";
            case TriviaQuestionCategory.videoGameLeagueOfLegends:
                return "leagueoflegends.txt";
            case TriviaQuestionCategory.scienceMathematics:
                return "math.txt";
            case TriviaQuestionCategory.entertainmentMusic:
                return "music.txt";
            case TriviaQuestionCategory.mythology:
                return "myth.txt";
            case TriviaQuestionCategory.videoGamePokemon:
                return "pokemon.txt";
            case TriviaQuestionCategory.scienceAndNature:
                return "science.txt";
            case TriviaQuestionCategory.companySlogans:
                return "slogan.txt";
            case TriviaQuestionCategory.sports:
                return "sport.txt";
            case TriviaQuestionCategory.filmStarWars:
                return "starwars.txt";
            case TriviaQuestionCategory.entertainmentTelevision:
                return "television.txt";
            case TriviaQuestionCategory.noncategorized:
                return "test.txt";
            case TriviaQuestionCategory.entertainmentMusicalsANdTheatres:
                return "theater.txt";
            case TriviaQuestionCategory.vehicles:
                return "vehicle.txt";
            case TriviaQuestionCategory.entertainmentVideoGames:
                return "videogame.txt";
            case TriviaQuestionCategory.englishLanguage:
                return "english.txt";
            case TriviaQuestionCategory.logicalReasoning:
                return "logic.txt";
        }
    }

    /**
     * Gets the localization of this helper utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language,
    ): TriviaHelperLocalization {
        return new TriviaHelperLocalization(language);
    }
}
