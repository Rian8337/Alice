import {
    Collection,
    CommandInteraction,
    GuildMember,
    MessageCollector,
    EmbedBuilder,
    Snowflake,
    bold,
    userMention,
} from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MathEquation } from "@alice-structures/utils/MathEquation";
import { MathGameType } from "structures/commands/Fun/MathGameType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MathEquationCreator } from "@alice-utils/creators/MathEquationCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { ApplicationCommandOptionType } from "discord.js";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { MathgameLocalization } from "@alice-localization/interactions/commands/Fun/mathgame/MathgameLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

/**
 * Generates an equation and loops the game.
 *
 * @param level The level to generate equation for.
 * @param operatorAmount The amount of operators in the equation.
 * @param callback Callback function.
 */
function generateEquation(
    level: number,
    operatorAmount: number,
    callback: (mathEquation: MathEquation, ...args: unknown[]) => unknown,
) {
    callback(MathEquationCreator.createEquation(level, operatorAmount));
}

/**
 * Ends an ongoing game.
 *
 * @param interaction The interaction that started the game.
 * @param mode The mode of the game.
 * @param gameStats The statistics of the game.
 * @param level The level at the moment the game was ended.
 * @param operatorCount The operator count at the moment the game was ended.
 * @param endMessage The message to be sent along with game statistics.
 * @param localization The localization of the interaction.
 * @param language The locale of the localization.
 */
function endGame(
    interaction: CommandInteraction,
    mode: MathGameType,
    gameStats: Collection<Snowflake, number>,
    level: number,
    operatorCount: number,
    endMessage: string,
    localization: MathgameLocalization,
): void {
    gameStats.sort((a, b) => b - a);

    const answerString: string = ArrayHelper.collectionToArray(gameStats)
        .map(
            (v, i) =>
                `#${i + 1}: ${userMention(v.key)} - ${
                    v.value
                } ${localization.getTranslation("answers")}`,
        )
        .join("\n");

    const totalAnswers: number = [...gameStats.values()].reduce(
        (acc, value) => acc + value,
        0,
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
        timestamp: true,
    });

    embed
        .setTitle(localization.getTranslation("gameStatistics"))
        .setDescription(
            `${bold(localization.getTranslation("gameStarter"))}: ${
                interaction.user
            }\n` +
                `${bold(
                    localization.getTranslation("timeStarted"),
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    interaction.createdAt,
                    localization.language,
                )}\n` +
                `${bold(
                    localization.getTranslation("duration"),
                )}: ${DateTimeFormatHelper.secondsToDHMS(
                    Math.floor(
                        (Date.now() - interaction.createdTimestamp) / 1000,
                    ),
                    localization.language,
                )}\n` +
                `${bold(
                    localization.getTranslation("levelReached"),
                )}: ${localization.getTranslation(
                    "operatorCount",
                )} ${operatorCount}, ${localization.getTranslation(
                    "level",
                )} ${level}\n\n` +
                `${bold(
                    localization.getTranslation("totalCorrectAnswers"),
                )}: ${totalAnswers} ${localization.getTranslation(
                    "answers",
                )}}\n` +
                answerString,
        );

    CacheManager.stillHasMathGameActive.delete(
        mode === "single" ? interaction.user.id : interaction.channelId,
    );

    interaction.channel!.send({
        content: MessageCreator.createAccept(endMessage),
        embeds: [embed],
    });
}

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: MathgameLocalization = new MathgameLocalization(
        CommandHelper.getLocale(interaction),
    );

    const mode: MathGameType = <MathGameType>(
        (!interaction.inGuild()
            ? "single"
            : interaction.options.getString("mode") ?? "single")
    );

    switch (mode) {
        case "single":
            if (CacheManager.stillHasMathGameActive.has(interaction.user.id)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userHasOngoingGame"),
                    ),
                });
            }

            CacheManager.stillHasMathGameActive.add(interaction.user.id);
            break;
        case "multi":
            if (
                CacheManager.stillHasMathGameActive.has(interaction.channelId)
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("channelHasOngoingGame"),
                    ),
                });
            }

            CacheManager.stillHasMathGameActive.add(interaction.channelId);
            break;
    }

    let operatorAmount: number = 1;
    let level: number = 1;
    let fetchAttempt: number = 0;
    const gameStats: Collection<Snowflake, number> = new Collection();
    const prevEquations: string[] = [];

    generateEquation(
        level,
        operatorAmount,
        async function createCollector(mathEquation) {
            const realEquation: string = mathEquation.realEquation;
            const answer: number = mathEquation.answer;

            if (isNaN(answer) || prevEquations.includes(realEquation)) {
                if (fetchAttempt < 5) {
                    ++fetchAttempt;
                    return generateEquation(
                        level,
                        operatorAmount,
                        createCollector,
                    );
                }

                const endString: string = StringHelper.formatString(
                    localization.getTranslation("couldNotFetchEquationGameEnd"),
                    (fetchAttempt * 500).toString(),
                );

                return endGame(
                    interaction,
                    mode,
                    gameStats,
                    level,
                    operatorAmount,
                    endString,
                    localization,
                );
            }

            prevEquations.push(realEquation);

            const questionString: string = MessageCreator.createWarn(
                mode === "single"
                    ? StringHelper.formatString(
                          localization.getTranslation("singleGamemodeQuestion"),
                          interaction.user.toString(),
                          operatorAmount.toString(),
                          level.toString(),
                          realEquation,
                      )
                    : StringHelper.formatString(
                          localization.getTranslation("multiGamemodeQuestion"),
                          level.toString(),
                          operatorAmount.toString(),
                          realEquation,
                      ),
            );

            if (!interaction.replied) {
                await InteractionHelper.reply(interaction, {
                    content: MessageCreator.createAccept(
                        localization.getTranslation("gameStartedNotification"),
                    ),
                });
            }

            interaction.channel!.send(questionString).then((msg) => {
                const collector: MessageCollector =
                    mode === "single"
                        ? msg.channel.createMessageCollector({
                              filter: (m) =>
                                  parseInt(m.content) === answer &&
                                  m.author.id === interaction.user.id,
                              time: 30000,
                              dispose: true,
                          })
                        : msg.channel.createMessageCollector({
                              filter: (m) => parseInt(m.content) === answer,
                              time: 30000,
                              dispose: true,
                          });

                let correct: boolean = false;

                collector.on("collect", (m) => {
                    msg.delete();

                    correct = true;

                    gameStats.set(
                        m.author.id,
                        (gameStats.get(m.author.id) ?? 0) + 1,
                    );

                    msg.channel.send(
                        MessageCreator.createAccept(
                            localization.getTranslation("correctAnswer"),
                            mode === "multi" ? `${m.author}, you` : "You",
                            (
                                (Date.now() - msg.createdTimestamp) /
                                1000
                            ).toString(),
                            realEquation,
                            answer.toString(),
                        ),
                    );

                    collector.stop();
                });

                collector.once("end", async () => {
                    if (!correct) {
                        msg.delete();

                        const endString: string = StringHelper.formatString(
                            localization.getTranslation("noAnswerGameEnd"),
                            mode === "multi"
                                ? "Game ended"
                                : `${interaction.user}, game ended`,
                            realEquation,
                            answer.toString(),
                        );

                        return endGame(
                            interaction,
                            mode,
                            gameStats,
                            level,
                            operatorAmount,
                            endString,
                            localization,
                        );
                    }

                    if (level === 20) {
                        ++operatorAmount;
                        level = 1;
                    } else {
                        ++level;
                    }

                    await HelperFunctions.sleep(0.5);

                    fetchAttempt = 0;

                    generateEquation(level, operatorAmount, createCollector);
                });
            });
        },
    );
};

export const category: SlashCommand["category"] = CommandCategory.fun;

export const config: SlashCommand["config"] = {
    name: "mathgame",
    description:
        "A math game! Creates a simple math equation that you have to solve within 30 seconds.",
    options: [
        {
            name: "mode",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Singleplayer",
                    value: "single",
                },
                {
                    name: "Multiplayer",
                    value: "multi",
                },
            ],
            description:
                "The game mode, whether to play by yourself or with others. Defaults to singleplayer.",
        },
    ],
    example: [
        {
            command: "mathgame",
            description:
                "will start a math game with only you can participate.",
        },
        {
            command: "mathgame",
            arguments: [
                {
                    name: "mode",
                    value: "Multiplayer",
                },
            ],
            description:
                "will start a math game in the channel that others can participate.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
