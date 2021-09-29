import { readFile } from "fs/promises";
import { TriviaQuestionCategory } from "@alice-enums/trivia/TriviaQuestionCategory";
import { TriviaQuestionType } from "@alice-enums/trivia/TriviaQuestionType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { Collection, CommandInteraction, GuildMember, InteractionCollector, Message, MessageActionRow, MessageButton, MessageCollector, MessageComponentInteraction, MessageEmbed, MessageOptions, MessageSelectOptionData, Snowflake } from "discord.js";
import { ArrayHelper } from "./ArrayHelper";
import { Symbols } from "@alice-enums/utils/Symbols";
import { TriviaQuestionResult } from "@alice-interfaces/trivia/TriviaQuestionResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

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
    static askQuestion(interaction: CommandInteraction, category?: TriviaQuestionCategory, type?: TriviaQuestionType): Promise<TriviaQuestionResult> {
        return new Promise(async resolve => {
            category ??= ArrayHelper.getRandomArrayElement(<TriviaQuestionCategory[]> Object.values(TriviaQuestionCategory).filter(v => typeof v === "number"));

            const file: string = await readFile(`${process.cwd()}/files/trivia/${this.getCategoryFileName(category)}`, { encoding: "utf-8" });

            const questionData: string[][] = file.split("\n").map(v => v.split(" | "));

            let components: string[];

            if (type) {
                const availableQuestions: string[][] = questionData.filter(v => {
                    const questionType: number = parseInt(v[1]);

                    if (type === TriviaQuestionType.MULTIPLE_CHOICE_FIRST_TYPE) {
                        return questionType === TriviaQuestionType.MULTIPLE_CHOICE_FIRST_TYPE || questionType === TriviaQuestionType.MULTIPLE_CHOICE_SECOND_TYPE;
                    } else {
                        return questionType === type;
                    }
                });

                if (availableQuestions.length === 0) {
                    return resolve({
                        category: category,
                        type: type,
                        correctAnswers: [],
                        results: []
                    });
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
                components[components.length - 1] = components.at(-1)!.replace("\r", "");
            }

            // The rest is a combination of correct answers and all answers.
            const correctAnswers: string[] = [];

            const isMultipleChoice: boolean = type === TriviaQuestionType.MULTIPLE_CHOICE_FIRST_TYPE || type === TriviaQuestionType.MULTIPLE_CHOICE_SECOND_TYPE;

            if (isMultipleChoice) {
                correctAnswers.push(components[0]);

                if (type === TriviaQuestionType.MULTIPLE_CHOICE_SECOND_TYPE) {
                    components.shift();
                }
            } else {
                correctAnswers.push(...components);
            }

            let allAnswers: string[] = components;

            ArrayHelper.shuffle(allAnswers);

            const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
                { author: interaction.user, color: (<GuildMember | null> interaction.member)?.displayColor }
            );

            embed.setTitle("Trivia Question")
                .setDescription(`${difficulty} ${Symbols.star} - ${this.getCategoryName(category)} Question\n\n${question}`)

            if (isMultipleChoice) {
                // Convert to letter choices (A, B, etc.) first.
                // There can only be one correct answer in a multiple choice question, so this
                // assumption is safe.
                correctAnswers[0] = String.fromCharCode(65 + allAnswers.indexOf(correctAnswers[0]));

                allAnswers = allAnswers.map((v, i) => v = `${String.fromCharCode(65 + i)}. ${v}`);

                embed.addField(
                    "Answers",
                    allAnswers.join("\n")
                );
            }

            if (imageLink !== "-") {
                embed.setImage(imageLink);
            }

            const options: MessageOptions = {
                components: [],
                embeds: [ embed ]
            };

            if (isMultipleChoice) {
                const component: MessageActionRow = new MessageActionRow();

                for (let i = 0; i < allAnswers.length; ++i) {
                    const button: MessageButton = new MessageButton()
                        .setCustomId(String.fromCharCode(65 + i))
                        .setStyle("PRIMARY")
                        .setLabel(String.fromCharCode(65 + i));

                    component.addComponents(button);
                }

                options.components!.push(component);
            }

            const questionMessage: Message = <Message> await interaction.editReply(options);

            const time: number = (isMultipleChoice ? 5 + (difficulty * 2) : 7 + (difficulty * 3)) * 1000;

            if (isMultipleChoice) {
                const collector: InteractionCollector<MessageComponentInteraction> = questionMessage.createMessageComponentCollector({
                    filter: i => i.isButton(),
                    componentType: "BUTTON",
                    dispose: true,
                    time: time
                });

                // Use a separate collection to prevent multiple answers from users
                const answers: Collection<Snowflake, MessageComponentInteraction> = new Collection();

                collector.on("collect", i => {
                    answers.set(i.user.id, i);

                    i.reply({
                        content: MessageCreator.createAccept(`Your latest choice (${i.customId}) has been recorded!`),
                        ephemeral: true
                    });
                });

                collector.on("end", async () => {
                    options.components = [];

                    try {
                        await interaction.editReply(options);
                    } catch { }

                    resolve({
                        category: category!,
                        type: type!,
                        correctAnswers: [ allAnswers.find(v => v.startsWith(correctAnswers[0]))! ],
                        results: answers.filter(v => v.customId === correctAnswers[0]).map(v => {
                            return {
                                user: v.user,
                                timeTaken: v.createdTimestamp - questionMessage.createdTimestamp
                            };
                        })
                    });
                });
            } else {
                const lowercasedCorrectAnswers: string[] = correctAnswers.map(v => v.toLowerCase());

                const collector: MessageCollector = interaction.channel!.createMessageCollector({
                    filter: message => lowercasedCorrectAnswers.includes(message.content.toLowerCase()),
                    time: time
                });

                collector.on("end", collected => {
                    resolve({
                        category: category!,
                        type: type!,
                        correctAnswers: correctAnswers,
                        results: collected.map(v => {
                            return {
                                user: v.author,
                                timeTaken: v.createdTimestamp - questionMessage.createdTimestamp
                            };
                        })
                    });
                });
            }
        });
    }

    /**
     * Maps all possible categories into choices for select menus.
     */
    static getCategoryChoices(): MessageSelectOptionData[] {
        return Object.values(TriviaQuestionCategory).filter(v => typeof v === "number").map(v => {
            return {
                label: this.getCategoryName(<TriviaQuestionCategory> v),
                value: v.toString()
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

    private static getCategoryFileName(category: TriviaQuestionCategory): string {
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
}