import { GuildMember, MessageOptions } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { RebalancePerformanceCalculationResult } from "@alice-utils/dpp/RebalancePerformanceCalculationResult";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";
import { MapStats, ModUtil, Accuracy } from "@rian8337/osu-base";
import {
    DroidPerformanceCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    DroidPerformanceCalculator as RebalanceDroidPerformanceCalculator,
    OsuPerformanceCalculator as RebalanceOsuPerformanceCalculator,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { CalculateLocalization } from "@alice-localization/commands/osu! and osu!droid/calculate/CalculateLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: CalculateLocalization = new CalculateLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? ""
    )[0];

    const hash: string | undefined = BeatmapManager.getChannelLatestBeatmap(
        interaction.channel!.id
    );

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided")
            ),
        });
    }

    if (
        beatmapID &&
        (isNaN(beatmapID) || !NumberHelper.isPositive(beatmapID))
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapProvidedIsInvalid")
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    // Get calculation parameters
    const forceAR: number | undefined = interaction.options.getNumber(
        "approachrate"
    )
        ? NumberHelper.clamp(
              interaction.options.getNumber("approachrate", true),
              0,
              12.5
          )
        : undefined;

    const stats: MapStats = new MapStats({
        mods: ModUtil.pcStringToMods(
            interaction.options.getString("mods") ?? ""
        ),
        ar: forceAR,
        speedMultiplier: NumberHelper.clamp(
            interaction.options.getNumber("speedmultiplier") ?? 1,
            0.5,
            2
        ),
        isForceAR: !isNaN(<number>forceAR),
    });

    const calcParams: PerformanceCalculationParameters =
        new PerformanceCalculationParameters(
            new Accuracy({
                n100: Math.max(0, interaction.options.getInteger("x100") ?? 0),
                n50: Math.max(0, interaction.options.getInteger("x50") ?? 0),
                nmiss: Math.max(
                    0,
                    interaction.options.getInteger("misses") ?? 0
                ),
            }),
            NumberHelper.clamp(
                interaction.options.getNumber("accuracy") ?? 100,
                0,
                100
            ),
            interaction.options.getInteger("combo")
                ? Math.max(0, interaction.options.getInteger("combo", true))
                : undefined,
            1,
            stats
        );

    const droidCalcResult:
        | PerformanceCalculationResult<DroidPerformanceCalculator>
        | RebalancePerformanceCalculationResult<RebalanceDroidPerformanceCalculator>
        | null = await (interaction.options.getBoolean("lazercalculation")
        ? DroidBeatmapDifficultyHelper.calculateBeatmapRebalancePerformance(
              beatmapID ?? hash,
              calcParams
          )
        : DroidBeatmapDifficultyHelper.calculateBeatmapPerformance(
              beatmapID ?? hash,
              calcParams
          ));

    const osuCalcResult:
        | PerformanceCalculationResult<OsuPerformanceCalculator>
        | RebalancePerformanceCalculationResult<RebalanceOsuPerformanceCalculator>
        | null = await (interaction.options.getBoolean("lazercalculation")
        ? OsuBeatmapDifficultyHelper.calculateBeatmapRebalancePerformance(
              beatmapID ?? hash,
              calcParams
          )
        : OsuBeatmapDifficultyHelper.calculateBeatmapPerformance(
              beatmapID ?? hash,
              calcParams
          ));

    if (!droidCalcResult || !osuCalcResult) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const calcEmbedOptions: MessageOptions =
        await EmbedCreator.createCalculationEmbed(
            calcParams,
            droidCalcResult,
            osuCalcResult,
            (<GuildMember | null>interaction.member)?.displayHexColor,
            localization.language
        );

    let string: string = "";

    if (interaction.options.getBoolean("showdroiddetail")) {
        string += `${localization.getTranslation(
            "rawDroidSr"
        )}: ${droidCalcResult.result.stars.toString()}\n${localization.getTranslation(
            "rawDroidPp"
        )}: ${droidCalcResult.result.toString()}\n`;
    }

    if (interaction.options.getBoolean("showosudetail")) {
        string += `${localization.getTranslation(
            "rawPcSr"
        )}: ${osuCalcResult.result.stars.toString()}\n${localization.getTranslation(
            "rawPcPp"
        )}: ${osuCalcResult.result.toString()}`;
    }

    if (string) {
        calcEmbedOptions.content = string;
    }

    BeatmapManager.setChannelLatestBeatmap(
        interaction.channel!.id,
        osuCalcResult.map.hash
    );

    InteractionHelper.reply(interaction, calcEmbedOptions);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "calculate",
    description:
        "Calculates the difficulty and performance value of an osu!standard beatmap.",
    options: [
        {
            name: "beatmap",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The beatmap ID or link to calculate. Defaults to the latest cached beatmap in the channel, if any.",
        },
        {
            name: "mods",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "Applied game modifications (HD, HR, etc). Defaults to No Mod.",
        },
        {
            name: "combo",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "Maximum combo reached, from 0 to the beatmap's maximum combo. Defaults to maximum combo.",
        },
        {
            name: "accuracy",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The accuracy gained, from 0 to 100. Defaults to 100.",
            minValue: 0,
            maxValue: 100,
        },
        {
            name: "x100",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The amount of 100s gained. If specified, overrides the accuracy option. Defaults to 0.",
        },
        {
            name: "x50",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The amount of 50s gained. If specified, overrides the accuracy option. Defaults to 0.",
        },
        {
            name: "misses",
            type: ApplicationCommandOptionTypes.INTEGER,
            description: "The amount of misses gained. Defaults to 0.",
        },
        {
            name: "approachrate",
            type: ApplicationCommandOptionTypes.NUMBER,
            description:
                "The Approach Rate (AR) to be forced in calculation, from 0 to 12.5. Defaults to the beatmap's AR.",
            minValue: 0,
            maxValue: 12.5,
        },
        {
            name: "speedmultiplier",
            type: ApplicationCommandOptionTypes.NUMBER,
            description:
                "The speed multiplier to calculate for, from 0.5 to 2. Stackable with modifications. Defaults to 1.",
            minValue: 0.5,
            maxValue: 2,
        },
        {
            name: "showdroiddetail",
            type: ApplicationCommandOptionTypes.BOOLEAN,
            description: "Whether to show detailed response for droid pp.",
        },
        {
            name: "showosudetail",
            type: ApplicationCommandOptionTypes.BOOLEAN,
            description: "Whether to show detailed response for PC pp.",
        },
        {
            name: "lazercalculation",
            type: ApplicationCommandOptionTypes.BOOLEAN,
            description:
                "Whether to calculate with respect to the latest osu!lazer difficulty and performance algorithm.",
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
