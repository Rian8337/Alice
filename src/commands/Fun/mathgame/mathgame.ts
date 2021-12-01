import {
    Collection,
    CommandInteraction,
    GuildMember,
    MessageCollector,
    MessageEmbed,
    Snowflake,
} from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MathEquation } from "@alice-interfaces/utils/MathEquation";
import { MathGameType } from "@alice-types/commands/Fun/MathGameType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MathEquationCreator } from "@alice-utils/creators/MathEquationCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { mathgameStrings } from "./mathgameStrings";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";

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
    callback: (mathEquation: MathEquation, ...args: unknown[]) => unknown
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
 */
function endGame(
    interaction: CommandInteraction,
    mode: MathGameType,
    gameStats: Collection<Snowflake, number>,
    level: number,
    operatorCount: number,
    endMessage: string
): void {
    gameStats.sort((a, b) => {
        return b - a;
    });

    const answerString: string = ArrayHelper.collectionToArray(gameStats)
        .map(
            (v, i) =>
                `#${i + 1}: <@${v.key}> - ${v.value} ${
                    v.value === 1 ? "answer" : "answers"
                }`
        )
        .join("\n");

    const totalAnswers: number = [...gameStats.values()].reduce(
        (acc, value) => acc + value,
        0
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
        timestamp: true,
    });

    embed
        .setTitle("Math Game Statistics")
        .setDescription(
            `**Game starter**: ${interaction.user}\n` +
                `**Time started**: ${interaction.createdAt.toUTCString()}\n` +
                `**Duration**: ${DateTimeFormatHelper.secondsToDHMS(
                    Math.floor(
                        (Date.now() - interaction.createdTimestamp) / 1000
                    )
                )}\n` +
                `**Level reached**: Operator count ${operatorCount}, level ${level}\n\n` +
                `**Total correct answers**: ${totalAnswers} ${
                    totalAnswers === 1 ? "answer" : "answers"
                }\n` +
                answerString
        );

    CacheManager.stillHasMathGameActive.delete(
        mode === "single" ? interaction.user.id : interaction.channel!.id
    );

    interaction.channel!.send({
        content: MessageCreator.createAccept(endMessage),
        embeds: [embed],
    });
}

export const run: Command["run"] = async (_, interaction) => {
    const mode: MathGameType = <MathGameType>(
        (!interaction.inGuild()
            ? "single"
            : interaction.options.getString("mode") ?? "single")
    );

    switch (mode) {
        case "single":
            if (CacheManager.stillHasMathGameActive.has(interaction.user.id)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        mathgameStrings.userHasOngoingGame
                    ),
                });
            }

            CacheManager.stillHasMathGameActive.add(interaction.user.id);
            break;
        case "multi":
            if (
                CacheManager.stillHasMathGameActive.has(interaction.channel!.id)
            ) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        mathgameStrings.channelHasOngoingGame
                    ),
                });
            }

            CacheManager.stillHasMathGameActive.add(interaction.channel!.id);
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
                        createCollector
                    );
                }

                const endString: string = StringHelper.formatString(
                    mathgameStrings.couldNotFetchEquationGameEnd,
                    (fetchAttempt * 500).toString()
                );

                return endGame(
                    interaction,
                    mode,
                    gameStats,
                    level,
                    operatorAmount,
                    endString
                );
            }

            prevEquations.push(realEquation);

            const questionString: string = MessageCreator.createWarn(
                mode === "single"
                    ? StringHelper.formatString(
                          mathgameStrings.singleGamemodeQuestion,
                          interaction.user.toString(),
                          operatorAmount.toString(),
                          level.toString(),
                          realEquation
                      )
                    : StringHelper.formatString(
                          mathgameStrings.multiGamemodeQuestion,
                          level.toString(),
                          operatorAmount.toString(),
                          realEquation
                      )
            );

            if (!interaction.replied) {
                await interaction.editReply({
                    content: MessageCreator.createAccept(
                        mathgameStrings.gameStartedNotification
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
                          })
                        : msg.channel.createMessageCollector({
                              filter: (m) => parseInt(m.content) === answer,
                              time: 30000,
                          });

                let correct: boolean = false;

                collector.on("collect", (m) => {
                    msg.delete();

                    correct = true;

                    gameStats.set(
                        m.author.id,
                        (gameStats.get(m.author.id) ?? 0) + 1
                    );

                    msg.channel.send(
                        MessageCreator.createAccept(
                            mathgameStrings.correctAnswer,
                            mode === "multi" ? `${m.author}, you` : "You",
                            (
                                (Date.now() - msg.createdTimestamp) /
                                1000
                            ).toString(),
                            realEquation,
                            answer.toString()
                        )
                    );

                    collector.stop();
                });

                collector.on("end", async () => {
                    if (!correct) {
                        msg.delete();

                        const endString: string = StringHelper.formatString(
                            mathgameStrings.noAnswerGameEnd,
                            mode === "multi"
                                ? "Game ended"
                                : `${interaction.user}, game ended`,
                            realEquation,
                            answer.toString()
                        );

                        return endGame(
                            interaction,
                            mode,
                            gameStats,
                            level,
                            operatorAmount,
                            endString
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
        }
    );
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
    name: "mathgame",
    description:
        "A math game! Creates a simple math equation that you have to solve within 30 seconds.",
    options: [
        {
            name: "mode",
            type: ApplicationCommandOptionTypes.STRING,
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
