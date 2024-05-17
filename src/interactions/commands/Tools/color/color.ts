import { Canvas, createCanvas, CanvasRenderingContext2D } from "canvas";
import { ApplicationCommandOptionType, AttachmentBuilder } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ColorLocalization } from "@alice-localization/interactions/commands/Tools/color/ColorLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: ColorLocalization = new ColorLocalization(
        CommandHelper.getLocale(interaction),
    );

    const color: string = interaction.options.getString("hexcode", true);

    if (!StringHelper.isValidHexCode(color)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidHexCode"),
            ),
        });
    }

    const canvas: Canvas = createCanvas(75, 75);
    const c: CanvasRenderingContext2D = canvas.getContext("2d");

    c.fillStyle = color;
    c.fillRect(0, 0, 75, 75);

    const attachment: AttachmentBuilder = new AttachmentBuilder(
        canvas.toBuffer(),
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("showingHexColor"),
            color,
        ),
        files: [attachment],
    });
};

export const category: SlashCommand["category"] = CommandCategory.tools;

export const config: SlashCommand["config"] = {
    name: "color",
    description: "Sends a color based on given hex code.",
    options: [
        {
            name: "hexcode",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The hex code of the color.",
            maxLength: 7,
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
