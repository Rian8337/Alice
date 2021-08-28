import { Message, MessageCollector, Snowflake } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MathEquation } from "@alice-interfaces/utils/MathEquation";
import { MathEquationCreator } from "@alice-utils/creators/MathEquationCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { mathquizStrings } from "./mathquizStrings";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

const stillHasEquationActive: Set<Snowflake> = new Set();

export const run: Command["run"] = async (_, interaction) => {
    if (stillHasEquationActive.has(interaction.user.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(mathquizStrings.userStillHasActiveGame)
        });
    }

    const level: number = interaction.options.getInteger("difflevel") ?? 1;

    const minLevel: number = 1;
    const maxLevel: number = 20;

    if (!NumberHelper.isNumberInRange(level, minLevel, maxLevel, true)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mathquizStrings.difficultyLevelOutOfRange, minLevel.toString(), maxLevel.toString()
            )
        });
    }

    const operatorAmount: number = interaction.options.getInteger("operatoramount") ?? 4;

    const minOperatorAmount: number = 1;
    const maxOperatorAmount: number = 10;

    if (!NumberHelper.isNumberInRange(operatorAmount, minOperatorAmount, maxOperatorAmount, true)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mathquizStrings.operatorAmountOutOfRange,
                minOperatorAmount.toString(),
                maxOperatorAmount.toString()
            )
        });
    }

    const mathEquation: MathEquation = MathEquationCreator.createEquation(level, operatorAmount);
    const realEquation: string = mathEquation.realEquation;
    const answer: number = mathEquation.answer;

    if (isNaN(answer)) {
        return interaction.editReply({
            content: MessageCreator.createReject(mathquizStrings.equationGeneratorError)
        });
    }

    const msg: Message = <Message> await interaction.editReply({
        content: MessageCreator.createWarn(
            mathquizStrings.equationQuestion,
            interaction.user.toString(),
            operatorAmount.toString(),
            level.toString(),
            realEquation
        )
    });

    stillHasEquationActive.add(interaction.user.id);

    const collector: MessageCollector = msg.channel.createMessageCollector({
        filter: (m: Message) => parseInt(m.content) === answer && m.author.id === interaction.user.id,
        time: 30 * 1000
    });

    let correct: boolean = false;

    collector.on("collect", () => {
        msg.delete();

        correct = true;

        interaction.editReply({
            content: MessageCreator.createAccept(
                mathquizStrings.correctAnswer,
                interaction.user.toString(),
                ((Date.now() - msg.createdTimestamp) / 1000).toString(),
                realEquation,
                answer.toString()
            )
        });

        stillHasEquationActive.delete(interaction.user.id);

        collector.stop();
    });

    collector.on("end", () => {
        if (!correct) {
            interaction.editReply(MessageCreator.createReject(
                mathquizStrings.wrongAnswer,
                interaction.user.toString(),
                realEquation,
                answer.toString()
            ));

            stillHasEquationActive.delete(interaction.user.id);
        }
    });
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
    name: "mathquiz",
    description: "Creates a simple math equation that you have to solve within 30 seconds.",
    options: [
        {
            name: "difflevel",
            type: CommandArgumentType.INTEGER,
            description: "The difficulty level of the equation, ranging from 1 to 20. Defaults to 1."
        },
        {
            name: "operatoramount",
            type: CommandArgumentType.INTEGER,
            description: "The amount of operators to be used in the equation, ranging from 1 to 10. Defaults to 4."
        }
    ],
    example: [
        {
            command: "mathquiz",
            description: "will generate a math equation with difficulty level 1 and 4 operator amount."
        },
        {
            command: "mathquiz 20",
            description: "will generate a math equation with difficulty level 20 and 4 operator amount."
        },
        {
            command: "mathquiz 5 5",
            description: "will generate a math equation with difficulty level 5 and 5 operator amount."
        }
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL"
};