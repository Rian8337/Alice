import { MessageAttachment } from "discord.js";
import { Canvas, createCanvas, CanvasRenderingContext2D } from "canvas";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { colorStrings } from "./colorStrings";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: Command["run"] = async (_, interaction) => {
    const color: string = interaction.options.getString("hexcode", true);

    if (!StringHelper.isValidHexCode(color)) {
        return interaction.editReply({
            content: MessageCreator.createReject(colorStrings.invalidHexCode),
        });
    }

    const canvas: Canvas = createCanvas(75, 75);
    const c: CanvasRenderingContext2D = canvas.getContext("2d");

    c.fillStyle = color;
    c.fillRect(0, 0, 75, 75);

    const attachment: MessageAttachment = new MessageAttachment(
        canvas.toBuffer()
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            colorStrings.showingHexColor,
            interaction.user.toString(),
            color
        ),
        files: [attachment],
    });
};

export const category: Command["category"] = CommandCategory.TOOLS;

export const config: Command["config"] = {
    name: "color",
    description: "Sends a color based on given hex code.",
    options: [
        {
            name: "hexcode",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description: "The hex code of the color.",
        },
    ],
    example: [
        {
            command: "color",
            arguments: [
                {
                    name: "hexcode",
                    value: "#ffdd00",
                },
            ],
            description: 'will show the color with hex code "#ffdd00".',
        },
    ],
    permissions: [],
    scope: "ALL",
};
