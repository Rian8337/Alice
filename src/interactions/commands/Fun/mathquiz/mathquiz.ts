import { Message, MessageCollector } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MathEquation } from "@alice-structures/utils/MathEquation";
import { MathEquationCreator } from "@alice-utils/creators/MathEquationCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ApplicationCommandOptionType } from "discord.js";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { MathquizLocalization } from "@alice-localization/interactions/commands/Fun/mathquiz/MathquizLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: MathquizLocalization = new MathquizLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (CacheManager.stillHasMathGameActive.has(interaction.user.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userStillHasActiveGame"),
            ),
        });
    }

    const level: number = interaction.options.getInteger("difflevel") ?? 1;

    const operatorAmount: number =
        interaction.options.getInteger("operatoramount") ?? 4;

    const mathEquation: MathEquation = MathEquationCreator.createEquation(
        level,
        operatorAmount,
    );
    const realEquation: string = mathEquation.realEquation;
    const answer: number = mathEquation.answer;

    if (isNaN(answer)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("equationGeneratorError"),
            ),
        });
    }

    const msg: Message = await InteractionHelper.reply(interaction, {
        content: MessageCreator.createWarn(
            localization.getTranslation("equationQuestion"),
            interaction.user.toString(),
            operatorAmount.toString(),
            level.toString(),
            realEquation,
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

    collector.once("collect", () => {
        msg.delete();

        correct = true;

        interaction.followUp({
            content: MessageCreator.createAccept(
                localization.getTranslation("correctAnswer"),
                interaction.user.toString(),
                ((Date.now() - msg.createdTimestamp) / 1000).toString(),
                realEquation,
                answer.toString(),
            ),
        });

        collector.stop();
    });

    collector.once("end", () => {
        if (!correct) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("wrongAnswer"),
                    interaction.user.toString(),
                    realEquation,
                    answer.toString(),
                ),
            });
        }

        CacheManager.stillHasMathGameActive.delete(interaction.user.id);
    });
};

export const category: SlashCommand["category"] = CommandCategory.fun;

export const config: SlashCommand["config"] = {
    name: "mathquiz",
    description:
        "Creates a simple math equation that you have to solve within 30 seconds.",
    options: [
        {
            name: "difflevel",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The difficulty level of the equation, ranging from 1 to 20. Defaults to 1.",
            minValue: 1,
            maxValue: 20,
        },
        {
            name: "operatoramount",
            type: ApplicationCommandOptionType.Integer,
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
