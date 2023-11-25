import { BaseMessageOptions } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import {
    MapStats,
    ModUtil,
    Accuracy,
    MapInfo,
    Modes,
} from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidDifficultyAttributes as RebalanceDroidDifficultyAttributes,
    OsuDifficultyAttributes as RebalanceOsuDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { CalculateLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/calculate/CalculateLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { RebalanceDroidPerformanceAttributes } from "@alice-structures/difficultyattributes/RebalanceDroidPerformanceAttributes";
import { ResponseDifficultyAttributes } from "@alice-structures/difficultyattributes/ResponseDifficultyAttributes";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: CalculateLocalization = new CalculateLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? "",
    )[0];

    const hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(
        interaction.channelId,
    );

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided"),
            ),
        });
    }

    if (
        beatmapID &&
        (isNaN(beatmapID) || !NumberHelper.isPositive(beatmapID))
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapProvidedIsInvalid"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID ?? hash,
        { checkFile: false },
    );

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    // Get calculation parameters
    const forceCS: number | undefined =
        interaction.options.getNumber("circlesize") ?? undefined;
    const forceAR: number | undefined =
        interaction.options.getNumber("approachrate") ?? undefined;
    const forceOD: number | undefined =
        interaction.options.getNumber("overalldifficulty") ?? undefined;

    const calcParams: PerformanceCalculationParameters =
        new PerformanceCalculationParameters(
            new Accuracy({
                n100: Math.max(0, interaction.options.getInteger("x100") ?? 0),
                n50: Math.max(0, interaction.options.getInteger("x50") ?? 0),
                nmiss: Math.max(
                    0,
                    interaction.options.getInteger("misses") ?? 0,
                ),
                nobjects: beatmap.objects,
            }),
            interaction.options.getNumber("accuracy") ?? 100,
            interaction.options.getInteger("combo")
                ? Math.max(0, interaction.options.getInteger("combo", true))
                : undefined,
            undefined,
            new MapStats({
                mods: ModUtil.pcStringToMods(
                    interaction.options.getString("mods") ?? "",
                ),
                cs: forceCS,
                ar: forceAR,
                od: forceOD,
                speedMultiplier:
                    interaction.options.getNumber("speedmultiplier") ?? 1,
                forceCS: !isNaN(<number>forceCS),
                forceAR: !isNaN(<number>forceAR),
                forceOD: !isNaN(<number>forceOD),
            }),
        );

    calcParams.recalculateAccuracy(beatmap.objects);

    let droidCalcResult: CompleteCalculationAttributes<
        DroidDifficultyAttributes | RebalanceDroidDifficultyAttributes,
        DroidPerformanceAttributes | RebalanceDroidPerformanceAttributes
    > | null;

    let osuCalcResult: CompleteCalculationAttributes<
        OsuDifficultyAttributes | RebalanceOsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null = null;

    switch (interaction.options.getInteger("calculationmethod")) {
        case PPCalculationMethod.rebalance:
            droidCalcResult =
                await DPPProcessorRESTManager.getPerformanceAttributes(
                    beatmap.beatmapId,
                    Modes.droid,
                    PPCalculationMethod.rebalance,
                    calcParams,
                );

            if (droidCalcResult) {
                osuCalcResult =
                    await DPPProcessorRESTManager.getPerformanceAttributes(
                        beatmap.beatmapId,
                        Modes.osu,
                        PPCalculationMethod.rebalance,
                        calcParams,
                    );
            }
            break;
        default:
            droidCalcResult =
                await DPPProcessorRESTManager.getPerformanceAttributes(
                    beatmap.beatmapId,
                    Modes.droid,
                    PPCalculationMethod.live,
                    calcParams,
                );

            if (droidCalcResult) {
                osuCalcResult =
                    await DPPProcessorRESTManager.getPerformanceAttributes(
                        beatmap.beatmapId,
                        Modes.osu,
                        PPCalculationMethod.live,
                        calcParams,
                    );
            }
    }

    if (!droidCalcResult || !osuCalcResult) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const calcEmbedOptions: BaseMessageOptions =
        EmbedCreator.createCalculationEmbed(
            beatmap,
            calcParams,
            droidCalcResult.difficulty,
            osuCalcResult.difficulty,
            droidCalcResult.performance,
            osuCalcResult.performance,
            localization.language,
        );

    let string: string = "";

    if (interaction.options.getBoolean("showdroiddetail")) {
        string += `${localization.getTranslation("rawDroidSr")}: ${
            interaction.options.getInteger("calculationmethod") ===
            PPCalculationMethod.rebalance
                ? DPPHelper.getRebalanceDroidDifficultyAttributesInfo(
                      <
                          ResponseDifficultyAttributes<RebalanceDroidDifficultyAttributes>
                      >droidCalcResult.difficulty,
                  )
                : DPPHelper.getDroidDifficultyAttributesInfo(
                      droidCalcResult.difficulty,
                  )
        }`;
        string += `\n${localization.getTranslation(
            "rawDroidPp",
        )}: ${DPPHelper.getDroidPerformanceAttributesInfo(
            droidCalcResult.performance,
        )}\n`;
    }

    if (interaction.options.getBoolean("showosudetail")) {
        string += `${localization.getTranslation("rawPcSr")}: ${
            interaction.options.getInteger("calculationmethod") ===
            PPCalculationMethod.rebalance
                ? DPPHelper.getRebalanceOsuDifficultyAttributesInfo(
                      <
                          ResponseDifficultyAttributes<RebalanceOsuDifficultyAttributes>
                      >osuCalcResult.difficulty,
                  )
                : DPPHelper.getOsuDifficultyAttributesInfo(
                      osuCalcResult.difficulty,
                  )
        }\n${localization.getTranslation(
            "rawPcPp",
        )}: ${DPPHelper.getOsuPerformanceAttributesInfo(
            osuCalcResult.performance,
        )}`;
    }

    if (string) {
        calcEmbedOptions.content = string;
    }

    BeatmapManager.setChannelLatestBeatmap(interaction.channelId, beatmap.hash);

    InteractionHelper.reply(interaction, calcEmbedOptions);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "calculate",
    description:
        "Calculates the difficulty and performance value of an osu!standard beatmap.",
    options: [
        {
            name: "beatmap",
            type: ApplicationCommandOptionType.String,
            description:
                "The beatmap ID or link to calculate. Defaults to the latest cached beatmap in the channel, if any.",
        },
        {
            name: "mods",
            type: ApplicationCommandOptionType.String,
            description:
                "Applied game modifications (HD, HR, etc). Defaults to No Mod.",
        },
        {
            name: "combo",
            type: ApplicationCommandOptionType.Integer,
            description:
                "Maximum combo reached, from 0 to the beatmap's maximum combo. Defaults to maximum combo.",
            minValue: 0,
        },
        {
            name: "accuracy",
            type: ApplicationCommandOptionType.Number,
            description: "The accuracy gained, from 0 to 100. Defaults to 100.",
            minValue: 0,
            maxValue: 100,
        },
        {
            name: "x100",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The amount of 100s gained. If specified, overrides the accuracy option. Defaults to 0.",
            minValue: 0,
        },
        {
            name: "x50",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The amount of 50s gained. If specified, overrides the accuracy option. Defaults to 0.",
            minValue: 0,
        },
        {
            name: "misses",
            type: ApplicationCommandOptionType.Integer,
            description: "The amount of misses gained. Defaults to 0.",
            minValue: 0,
        },
        {
            name: "circlesize",
            type: ApplicationCommandOptionType.Number,
            description:
                "The Circle Size (CS) to be forced in calculation, from 0 to 11. Defaults to the beatmap's CS.",
            minValue: 0,
            maxValue: 11,
        },
        {
            name: "approachrate",
            type: ApplicationCommandOptionType.Number,
            description:
                "The Approach Rate (AR) to be forced in calculation, from 0 to 12.5. Defaults to the beatmap's AR.",
            minValue: 0,
            maxValue: 12.5,
        },
        {
            name: "overalldifficulty",
            type: ApplicationCommandOptionType.Number,
            description:
                "The Overall Difficulty (OD) to be forced in calculation, from 0 to 11. Defaults to the beatmap's OD.",
            minValue: 0,
            maxValue: 11,
        },
        {
            name: "speedmultiplier",
            type: ApplicationCommandOptionType.Number,
            description:
                "The speed multiplier to calculate for, from 0.5 to 2. Stackable with modifications. Defaults to 1.",
            minValue: 0.5,
            maxValue: 2,
        },
        {
            name: "showdroiddetail",
            type: ApplicationCommandOptionType.Boolean,
            description: "Whether to show detailed response for droid pp.",
        },
        {
            name: "showosudetail",
            type: ApplicationCommandOptionType.Boolean,
            description: "Whether to show detailed response for PC pp.",
        },
        {
            name: "calculationmethod",
            type: ApplicationCommandOptionType.Integer,
            description: "The calculation method to use. Defaults to Live.",
            choices: [
                {
                    name: "Live",
                    value: PPCalculationMethod.live,
                },
                {
                    name: "Rebalance",
                    value: PPCalculationMethod.rebalance,
                },
            ],
        },
    ],
    example: [
        {
            command: "calculate",
            description:
                "will calculate the latest cached beatmap in the channel.",
        },
        {
            command: "calculate",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
            ],
            description: "will calculate the beatmap with ID 1884658.",
        },
        {
            command: "calculate",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description: "will calculate the linked beatmap.",
        },
        {
            command: "calculate",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
                {
                    name: "accuracy",
                    value: 99.89,
                },
            ],
            description:
                "will calculate the beatmap with ID 1884658 with 99.89% as accuracy gained.",
        },
        {
            command: "calculate",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
                {
                    name: "x100",
                    value: 1,
                },
                {
                    name: "x50",
                    value: 1,
                },
                {
                    name: "mods",
                    value: "HDHR",
                },
                {
                    name: "showdroiddetail",
                    value: true,
                },
                {
                    name: "showosudetail",
                    value: true,
                },
            ],
            description:
                "will calculate the linked beatmap with 1x 100 and 1x 50 gained, HDHR mod, and show detailed response for both droid and standard difficulty and performance value.",
        },
        {
            command: "calculate",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
                {
                    name: "x100",
                    value: 1,
                },
                {
                    name: "x50",
                    value: 1,
                },
                {
                    name: "mods",
                    value: "HDDT",
                },
                {
                    name: "speedmultiplier",
                    value: 2,
                },
                {
                    name: "combo",
                    value: 150,
                },
            ],
            description:
                "will calculate the linked beatmap with 10x 100 and 5x 50 gained, HDDT mod, 2x speed multiplier, and a maximum combo of 150.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
