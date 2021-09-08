import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { PerformanceCalculationResult } from "@alice-interfaces/utils/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { GuildMember, MessageOptions } from "discord.js";
import { prevcalcStrings } from "./prevcalcStrings";

export const run: Command["run"] = async (_, interaction) => {
    const beatmapHash: string | undefined = BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id);

    if (!beatmapHash) {
        return interaction.editReply({
            content: MessageCreator.createReject(prevcalcStrings.noCachedBeatmap)
        });
    }

    const calcParams: PerformanceCalculationParameters = BeatmapDifficultyHelper.getCalculationParamsFromInteraction(interaction);

    const calcResult: PerformanceCalculationResult | null = await BeatmapDifficultyHelper.calculateBeatmapPerformance(beatmapHash, calcParams);

    if (!calcResult) {
        return interaction.editReply({
            content: MessageCreator.createReject(prevcalcStrings.beatmapNotFound)
        });
    }

    const calcEmbedOptions: MessageOptions = await EmbedCreator.createCalculationEmbed(
        calcParams,
        calcResult,
        (<GuildMember | null> interaction.member)?.displayHexColor
    );

    let string: string = "";

    if (interaction.options.getBoolean("showdroiddetail")) {
        string += `Raw droid stars: ${calcResult.droid.stars.toString()}\nRaw droid pp: ${calcResult.droid.toString()}\n`;
    }

    if (interaction.options.getBoolean("showosudetail")) {
        string += `Raw PC stars: ${calcResult.osu.toString()}\nRaw PC pp: ${calcResult.osu.stars.toString()}`;
    }

    if (string) {
        calcEmbedOptions.content = string;
    }

    interaction.editReply(calcEmbedOptions);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "prevcalc",
    description: "Calculates the difficulty and performance value latest cached beatmap in the channel, if any.",
    options: [
        {
            name: "mods",
            type: CommandArgumentType.STRING,
            description: "Applied game modifications (HD, HR, etc). Defaults to No Mod."
        },
        {
            name: "combo",
            type: CommandArgumentType.INTEGER,
            description: "Maximum combo reached, from 0 to the beatmap's maximum combo. Defaults to maximum combo."
        },
        {
            name: "accuracy",
            type: CommandArgumentType.NUMBER,
            description: "The accuracy gained, from 0 to 100. Defaults to 100."
        },
        {
            name: "x100",
            type: CommandArgumentType.INTEGER,
            description: "The amount of 100s gained. If specified, overrides the accuracy option. Defaults to 0."
        },
        {
            name: "x50",
            type: CommandArgumentType.INTEGER,
            description: "The amount of 50s gained. If specified, overrides the accuracy option. Defaults to 0."
        },
        {
            name: "misses",
            type: CommandArgumentType.INTEGER,
            description: "The amount of misses gained. Defaults to 0."
        },
        {
            name: "approachrate",
            type: CommandArgumentType.NUMBER,
            description: "The Approach Rate (AR) to be forced in calculation, from 0 to 12.5. Defaults to the beatmap's AR."
        },
        {
            name: "speedmultiplier",
            type: CommandArgumentType.NUMBER,
            description: "The speed multiplier to calculate for (stackable with modifications) from 0.5 to 2. Defaults to 1."
        },
        {
            name: "showdroiddetail",
            type: CommandArgumentType.BOOLEAN,
            description: "Whether to show detailed response for droid pp."
        },
        {
            name: "showosudetail",
            type: CommandArgumentType.BOOLEAN,
            description: "Whether to show detailed response for PC pp."
        }
    ],
    example: [
        {
            command: "manualcalc 1884658",
            description: "will calculate the beatmap with ID 1884658."
        },
        {
            command: "manualcalc https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
            description: "will calculate the linked beatmap."
        },
        {
            command: "manualcalc 1884658 99.89%",
            description: "will calculate the beatmap with ID 1884658 with 99.89% as accuracy gained."
        },
        {
            command: "manualcalc https://osu.ppy.sh/beatmapsets/902745#osu/1884658 1x100 1x50 +HDHR -d -p",
            description: "will calculate the linked beatmap with 1x 100 and 1x 50 gained, HDHR mod, and show detailed response for both droid and standard difficulty and performance value."
        },
        {
            command: "manualcalc https://osu.ppy.sh/beatmapsets/902745#osu/1884658 10x100 5x50 +HDDT 2.0x 150x",
            description: "will calculate the linked beatmap with 10x 100 and 5x 50 gained, HDDT mod, 2x speed multiplier, and a maximum combo of 150."
        }
    ],
    permissions: [],
    scope: "ALL"
};