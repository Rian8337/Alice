import { GuildMember, MessageOptions } from "discord.js";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { PerformanceCalculationResult } from "@alice-interfaces/utils/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { calculateStrings } from "./calculateStrings";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { MapStats, ModUtil, Accuracy } from "osu-droid";

export const run: Command["run"] = async (_, interaction) => {
    const beatmapID: number = BeatmapManager.getBeatmapID(interaction.options.getString("beatmap") ?? "")[0];

    const hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id);

    if (!beatmapID && !hash) {
        return interaction.editReply({
            content: MessageCreator.createReject(calculateStrings.noBeatmapProvided)
        });
    }

    if (beatmapID && (isNaN(beatmapID) || !NumberHelper.isPositive(beatmapID))) {
        return interaction.editReply({
            content: MessageCreator.createReject(calculateStrings.beatmapProvidedIsInvalid)
        });
    }

    // Get calculation parameters
    const forceAR: number | undefined =
        interaction.options.getNumber("approachrate") ?
        NumberHelper.clamp(interaction.options.getNumber("approachrate", true), 0, 12.5) :
        undefined;

    const stats: MapStats = new MapStats({
        ar: forceAR,
        speedMultiplier: NumberHelper.clamp(interaction.options.getNumber("speedmultiplier") ?? 1, 0.5, 2),
        isForceAR: !isNaN(<number> forceAR)
    });

    const calcParams: PerformanceCalculationParameters = new PerformanceCalculationParameters(
        ModUtil.pcStringToMods(interaction.options.getString("mods") ?? ""),
        new Accuracy({
            n100: Math.max(0, interaction.options.getInteger("x100") ?? 0),
            n50: Math.max(0, interaction.options.getInteger("x50") ?? 0),
            nmiss: Math.max(0, interaction.options.getInteger("misses") ?? 0)
        }),
        NumberHelper.clamp(interaction.options.getNumber("accuracy") ?? 0, 0, 100),
        interaction.options.getInteger("combo") ? Math.max(0, interaction.options.getInteger("combo", true)) : undefined,
        1,
        stats
    );

    const calcResult: PerformanceCalculationResult | null = await BeatmapDifficultyHelper.calculateBeatmapPerformance(beatmapID ?? hash, calcParams);

    if (!calcResult) {
        return interaction.editReply({
            content: MessageCreator.createReject(calculateStrings.beatmapNotFound)
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

    BeatmapManager.setChannelLatestBeatmap(interaction.channel!.id, calcResult.map.hash);

    interaction.editReply(calcEmbedOptions);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "calculate",
    description: "Calculates the difficulty and performance value of an osu!standard beatmap.",
    options: [
        {
            name: "beatmap",
            type: CommandArgumentType.STRING,
            description: "The beatmap ID or link to calculate. Defaults to the latest cached beatmap in the channel, if any."
        },
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
            command: "calculate",
            description: "will calculate the latest cached beatmap in the channel."
        },
        {
            command: "calculate 1884658",
            description: "will calculate the beatmap with ID 1884658."
        },
        {
            command: "calculate https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
            description: "will calculate the linked beatmap."
        },
        {
            command: "calculate 1884658 99.89%",
            description: "will calculate the beatmap with ID 1884658 with 99.89% as accuracy gained."
        },
        {
            command: "calculate https://osu.ppy.sh/beatmapsets/902745#osu/1884658 1x100 1x50 +HDHR -d -p",
            description: "will calculate the linked beatmap with 1x 100 and 1x 50 gained, HDHR mod, and show detailed response for both droid and standard difficulty and performance value."
        },
        {
            command: "calculate https://osu.ppy.sh/beatmapsets/902745#osu/1884658 10x100 5x50 +HDDT 2.0x 150x",
            description: "will calculate the linked beatmap with 10x 100 and 5x 50 gained, HDDT mod, 2x speed multiplier, and a maximum combo of 150."
        }
    ],
    permissions: [],
    scope: "ALL"
};