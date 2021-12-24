import { Message, MessageCollector } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MathEquation } from "@alice-interfaces/utils/MathEquation";
import { MathEquationCreator } from "@alice-utils/creators/MathEquationCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { mathquizStrings } from "./mathquizStrings";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: Command["run"] = async (_, interaction) => {
    if (CacheManager.stillHasMathGameActive.has(interaction.user.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mathquizStrings.userStillHasActiveGame
            ),
        });
    }

    const level: number = interaction.options.getInteger("difflevel") ?? 1;

    const operatorAmount: number =
        interaction.options.getInteger("operatoramount") ?? 4;

    const mathEquation: MathEquation = MathEquationCreator.createEquation(
        level,
        operatorAmount
    );
    const realEquation: string = mathEquation.realEquation;
    const answer: number = mathEquation.answer;

    if (isNaN(answer)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mathquizStrings.equationGeneratorError
            ),
        });
    }

    const msg: Message = <Message>await interaction.editReply({
        content: MessageCreator.createWarn(
            mathquizStrings.equationQuestion,
            interaction.user.toString(),
            operatorAmount.toString(),
            level.toString(),
            realEquation
        ),
    });

    CacheManager.stillHasMathGameActive.add(interaction.user.id);

    const collector: MessageCollector = msg.channel.createMessageCollector({
        filter: (m: Message) =>
            parseInt(m.content) === answer &&
            m.author.id === interaction.user.id,
        time: 30 * 1000,
    });

    let correct: boolean = false;

    collector.on("collect", () => {
        msg.delete();

        correct = true;

        interaction.followUp({
            content: MessageCreator.createAccept(
                mathquizStrings.correctAnswer,
                interaction.user.toString(),
                ((Date.now() - msg.createdTimestamp) / 1000).toString(),
                realEquation,
                answer.toString()
            ),
        });

        collector.stop();
    });

    collector.on("end", () => {
        if (!correct) {
            interaction.editReply(
                MessageCreator.createReject(
                    mathquizStrings.wrongAnswer,
                    interaction.user.toString(),
                    realEquation,
                    answer.toString()
                )
            );
        }

        CacheManager.stillHasMathGameActive.delete(interaction.user.id);
    });
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
    name: "mathquiz",
    description:
        "Creates a simple math equation that you have to solve within 30 seconds.",
    options: [
        {
            name: "difflevel",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The difficulty level of the equation, ranging from 1 to 20. Defaults to 1.",
            minValue: 1,
            maxValue: 20,
        },
        {
            name: "operatoramount",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The amount of operators to be used in the equation, ranging from 1 to 10. Defaults to 4.",
            minValue: 1,
            maxValue: 10,
        },
    ],
    example: [
        {
            command: "mathquiz",
            description:
                "will generate a math equation with difficulty level 1 and 4 operator amount.",
        },
        {
            command: "mathquiz difflevel:20",
            arguments: [
                {
                    name: "difflevel",
                    value: 20,
                },
            ],
            description:
                "will generate a math equation with difficulty level 20 and 4 operator amount.",
        },
        {
            command: "mathquiz difflevel:5 operatoramount:5",
            arguments: [
                {
                    name: "difflevel",
                    value: 5,
                },
                {
                    name: "operatoramount",
                    value: 5,
                },
            ],
            description:
                "will generate a math equation with difficulty level 5 and 5 operator amount.",
        },
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL",
};
