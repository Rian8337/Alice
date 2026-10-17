import { CommandCategory } from "@enums/core/CommandCategory";
import { CalculateLocalization } from "@localization/interactions/commands/osu! and osu!droid/calculate/CalculateLocalization";
import {
    Accuracy,
    MapInfo,
    MathUtils,
    ModCustomSpeed,
    ModDifficultyAdjust,
    Modes,
    ModUtil,
} from "@rian8337/osu-base";
import {
    CacheableDifficultyAttributes,
    IDroidDifficultyAttributes,
    IOsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    IDroidDifficultyAttributes as IRebalanceDroidDifficultyAttributes,
    IOsuDifficultyAttributes as IRebalanceOsuDifficultyAttributes,
} from "@rian8337/osu-rebalance-difficulty-calculator";
import { DroidPerformanceAttributes } from "@structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@structures/difficultyattributes/OsuPerformanceAttributes";
import { RebalanceDroidPerformanceAttributes } from "@structures/difficultyattributes/RebalanceDroidPerformanceAttributes";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { PPHelper } from "@utils/helpers/PPHelper";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { PPProcessorRESTManager } from "@utils/managers/PPProcessorRESTManager";
import { PPVariantManager } from "@utils/managers/PPVariantManager";
import { DefaultPPVariants } from "@utils/pp/DefaultPPVariants";
import { PerformanceCalculationParameters } from "@utils/pp/PerformanceCalculationParameters";
import { checkVariant } from "@utils/pp/variantChoice";
import { ApplicationCommandOptionType, TextDisplayBuilder } from "discord.js";
import { SlashCommand } from "structures/core/SlashCommand";

function createVariantRejection(
    localization: CalculateLocalization,
    check: Exclude<ReturnType<typeof checkVariant>, "ok">,
    variantName: string,
    modeName: "droid" | "PC",
): string {
    switch (check) {
        case "notFound":
            return MessageCreator.createReject(
                localization.getTranslation("variantNotFound"),
                variantName,
            );
        case "unavailable":
            return MessageCreator.createReject(
                localization.getTranslation("variantUnavailable"),
                variantName,
            );
        case "wrongMode":
            return MessageCreator.createReject(
                localization.getTranslation("variantWrongMode"),
                variantName,
                modeName,
            );
    }
}

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization = new CalculateLocalization(
        CommandHelper.getLocale(interaction),
    );

    const beatmapID = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? "",
    ).at(0);

    const hash = BeatmapManager.getChannelLatestBeatmap(interaction.channelId);

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

    const actingUid = await PPVariantManager.getActingUid(interaction.user);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID ?? hash!,
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
    const mods = ModUtil.pcStringToMods(
        interaction.options.getString("mods") ?? "",
    );

    const speedMultiplier = interaction.options.getNumber("speedmultiplier");
    const forceCS = interaction.options.getNumber("circlesize");
    const forceAR = interaction.options.getNumber("approachrate");
    const forceOD = interaction.options.getNumber("overalldifficulty");
    const sliderTicksMissed =
        interaction.options.getInteger("sliderticksmissed");
    const sliderEndsDropped =
        interaction.options.getInteger("sliderendsdropped");
    const totalScore = interaction.options.getInteger("totalscore");

    if (forceCS !== null || forceAR !== null || forceOD !== null) {
        mods.set(
            new ModDifficultyAdjust({
                cs: forceCS ?? undefined,
                ar: forceAR ?? undefined,
                od: forceOD ?? undefined,
            }),
        );
    }

    if (speedMultiplier !== null && speedMultiplier !== 1) {
        mods.set(new ModCustomSpeed(speedMultiplier));
    }

    const calcParams = new PerformanceCalculationParameters({
        mods: mods,
        accuracy: Accuracy.fromHitCounts({
            n100: Math.max(0, interaction.options.getInteger("x100") ?? 0),
            n50: Math.max(0, interaction.options.getInteger("x50") ?? 0),
            nmiss: Math.max(0, interaction.options.getInteger("misses") ?? 0),
        }, beatmap.objects),
        inputAccuracy: interaction.options.getNumber("accuracy") ?? 100,
        combo:
            interaction.options.getInteger("combo") && beatmap.maxCombo !== null
                ? MathUtils.clamp(
                    0,
                    interaction.options.getInteger("combo", true),
                    beatmap.maxCombo,
                )
                : (beatmap.maxCombo ?? undefined),
        sliderTicksMissed:
            sliderTicksMissed !== null
                ? Math.max(0, sliderTicksMissed)
                : undefined,
        sliderEndsDropped:
            sliderEndsDropped !== null
                ? Math.max(0, sliderEndsDropped)
                : undefined,
        totalScore: totalScore !== null ? Math.max(0, totalScore) : undefined,
    });

    calcParams.recalculateAccuracy(beatmap.objects);

    const droidVariantName =
        interaction.options.getString("variant") ?? DefaultPPVariants.droidLive;
    const osuVariantName =
        interaction.options.getString("pcvariant") ?? DefaultPPVariants.osuLive;

    const droidVariant = await PPVariantManager.resolve(
        droidVariantName,
        actingUid,
    );

    const droidVariantCheck = checkVariant(droidVariant, Modes.Droid);

    if (droidVariantCheck !== "ok") {
        return InteractionHelper.reply(interaction, {
            content: createVariantRejection(
                localization,
                droidVariantCheck,
                droidVariantName,
                "droid",
            ),
        });
    }

    const osuVariant = await PPVariantManager.resolve(
        osuVariantName,
        actingUid,
    );

    const osuVariantCheck = checkVariant(osuVariant, Modes.Osu);

    if (osuVariantCheck !== "ok") {
        return InteractionHelper.reply(interaction, {
            content: createVariantRejection(
                localization,
                osuVariantCheck,
                osuVariantName,
                "PC",
            ),
        });
    }

    const isDroidRebalance = droidVariant?.algorithm === "rebalance";
    const isOsuRebalance = osuVariant?.algorithm === "rebalance";

    const droidCalcResult =
        await PPProcessorRESTManager.getPerformanceAttributesForVariant(
            beatmap.beatmapId,
            droidVariant!.name,
            calcParams,
            true,
            actingUid,
        );

    const osuCalcResult = droidCalcResult
        ? await PPProcessorRESTManager.getPerformanceAttributesForVariant(
            beatmap.beatmapId,
            osuVariant!.name,
            calcParams,
            false,
            actingUid,
        )
        : null;

    if (!droidCalcResult || !osuCalcResult) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const droidDifficulty = droidCalcResult.attributes.difficulty;
    const droidPerformance = droidCalcResult.attributes.performance;
    const osuDifficulty = osuCalcResult.attributes.difficulty;
    const osuPerformance = osuCalcResult.attributes
        .performance as OsuPerformanceAttributes;

    const options = EmbedCreator.createCalculationEmbed(
        beatmap,
        calcParams,
        droidDifficulty as CacheableDifficultyAttributes<
            IDroidDifficultyAttributes | IRebalanceDroidDifficultyAttributes
        >,
        osuDifficulty as CacheableDifficultyAttributes<
            IOsuDifficultyAttributes | IRebalanceOsuDifficultyAttributes
        >,
        droidPerformance as
        | DroidPerformanceAttributes
        | RebalanceDroidPerformanceAttributes,
        osuPerformance,
        localization.language,
        Buffer.from(droidCalcResult.strainChart),
    );

    let string = "";

    if (interaction.options.getBoolean("showdroiddetail")) {
        string += `${localization.getTranslation("rawDroidSr")}: ${isDroidRebalance
                ? PPHelper.getRebalanceDroidDifficultyAttributesInfo(
                    droidDifficulty as CacheableDifficultyAttributes<IRebalanceDroidDifficultyAttributes>,
                )
                : PPHelper.getDroidDifficultyAttributesInfo(
                    droidDifficulty as CacheableDifficultyAttributes<IDroidDifficultyAttributes>,
                )
            }`;
        string += `\n${localization.getTranslation("rawDroidPp")}: ${isDroidRebalance
                ? PPHelper.getRebalanceDroidPerformanceAttributesInfo(
                    droidPerformance as RebalanceDroidPerformanceAttributes,
                )
                : PPHelper.getDroidPerformanceAttributesInfo(
                    droidPerformance as DroidPerformanceAttributes,
                )
            }\n`;
    }

    if (interaction.options.getBoolean("showosudetail")) {
        string += `${localization.getTranslation("rawPcSr")}: ${isOsuRebalance
                ? PPHelper.getRebalanceOsuDifficultyAttributesInfo(
                    osuDifficulty as CacheableDifficultyAttributes<IRebalanceOsuDifficultyAttributes>,
                )
                : PPHelper.getOsuDifficultyAttributesInfo(
                    osuDifficulty as CacheableDifficultyAttributes<IOsuDifficultyAttributes>,
                )
            }\n${localization.getTranslation(
                "rawPcPp",
            )}: ${PPHelper.getOsuPerformanceAttributesInfo(osuPerformance)}`;
    }

    if (string) {
        options.components = [
            new TextDisplayBuilder().setContent(string),
            ...options.components!,
        ];
    }

    BeatmapManager.setChannelLatestBeatmap(interaction.channelId, beatmap.hash);

    void InteractionHelper.reply(interaction, options, true);
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
            name: "sliderticksmissed",
            type: ApplicationCommandOptionType.Integer,
            description: "The amount of slider ticks that were missed.",
            minValue: 0,
        },
        {
            name: "sliderendsdropped",
            type: ApplicationCommandOptionType.Integer,
            description: "The amount of slider ends that were dropped.",
            minValue: 0,
        },
        {
            name: "totalscore",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The total score achieved. Only relevant if slider tick or end misses are not given.",
            minValue: 0,
        },
        {
            name: "circlesize",
            type: ApplicationCommandOptionType.Number,
            description:
                "The Circle Size (CS) to be forced in calculation, from 0 to 11. Defaults to the beatmap's CS.",
            minValue: 0,
            maxValue: 15,
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
            name: "variant",
            type: ApplicationCommandOptionType.String,
            description:
                "The droid variant to calculate with. Defaults to droid-live.",
            autocomplete: true,
        },
        {
            name: "pcvariant",
            type: ApplicationCommandOptionType.String,
            description:
                "The PC variant to calculate with. Defaults to osu-live.",
            autocomplete: true,
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
        {
            command: "calculate",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
                {
                    name: "variant",
                    value: "droid-rebalance",
                },
                {
                    name: "pcvariant",
                    value: "osu-rebalance",
                },
            ],
            description:
                "will calculate the beatmap with ID 1884658 using the droid-rebalance droid variant and the osu-rebalance PC variant.",
        },
    ],
};
