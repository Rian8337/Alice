import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { SimulateLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/simulate/SimulateLocalization";
import { SlashCommand } from "@alice-structures/core/SlashCommand";
import { ScoreRank } from "@alice-structures/utils/ScoreRank";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PerformanceCalculationParameters } from "@alice-utils/dpp/PerformanceCalculationParameters";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import {
    Accuracy,
    calculateDroidDifficultyStatistics,
    Circle,
    DroidHitWindow,
    IModApplicableToDroid,
    MapInfo,
    Mod,
    Modes,
    ModFlashlight,
    ModHidden,
    ModPrecise,
    ModUtil,
    Slider,
    SliderNestedHitObject,
    SliderTick,
} from "@rian8337/osu-base";
import { HitResult } from "@rian8337/osu-droid-replay-analyzer";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization = new SimulateLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const beatmapID = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap") ?? "",
    )[0];

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

    const modInput = interaction.options.getString("mods");
    const speedMultiplierInput =
        interaction.options.getNumber("speedmultiplier");

    if (!modInput && !speedMultiplierInput) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSimulateOptions"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const discordid = interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username = interaction.options.getString("username");

    const dbManager = DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | null = null;

    switch (true) {
        case !!uid:
            player = await Player.getInformation(uid!);

            uid ??= player?.uid;

            break;
        case !!username:
            if (!StringHelper.isUsernameValid(username)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("playerNotFound"),
                    ),
                });
            }

            player = await Player.getInformation(username);

            uid ??= player?.uid;

            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                    },
                },
            );

            if (!bindInfo) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language,
                        ).getTranslation(
                            discordid
                                ? Constants.userNotBindedReject
                                : Constants.selfNotBindedReject,
                        ),
                    ),
                });
            }

            player = await Player.getInformation(bindInfo.uid);
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound"),
            ),
        });
    }

    if (player.recentPlays.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerHasNoRecentPlays"),
            ),
        });
    }

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
        beatmapID ?? hash,
        {
            checkFile: false,
        },
    );

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const score = await Score.getFromHash(player.uid, beatmap.hash);

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || discordid || username
                        ? "userScoreNotFound"
                        : "selfScoreNotFound",
                ),
            ),
        });
    }

    const mods = ModUtil.pcStringToMods(modInput ?? "");

    if (
        StringHelper.sortAlphabet(
            score.mods.reduce((a, v) => a + v.acronym, ""),
        ) ===
            StringHelper.sortAlphabet(
                mods.reduce((a, v) => a + v.acronym, ""),
            ) &&
        (speedMultiplierInput ?? 1) === score.speedMultiplier
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noSimulateOptions"),
            ),
        });
    }

    const replay = await ReplayHelper.analyzeReplay(score);

    if (!replay.data) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || discordid || username
                        ? "userScoreNotFound"
                        : "selfScoreNotFound",
                ),
            ),
        });
    }

    await beatmap.retrieveBeatmapFile();
    if (!beatmap.hasDownloadedBeatmap()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    replay.beatmap ??= beatmap.beatmap!;

    // Simulate replay given the mods input.
    // For the moment, we're not gonna check for cursor position in sliders as the operation will be too expensive.
    let scoreMultiplier = 1;
    for (const mod of mods) {
        if (mod.isApplicableToDroid()) {
            scoreMultiplier *= mod.droidScoreMultiplier;
        }
    }

    const speedMultiplier = speedMultiplierInput ?? 1;
    if (speedMultiplier >= 1) {
        scoreMultiplier *= 1 + (speedMultiplier - 1) * 0.24;
    } else {
        scoreMultiplier *= Math.pow(0.3, (1 - speedMultiplier) * 4);
    }

    const difficultyMultiplier =
        1 + beatmap.od / 10 + beatmap.hp / 10 + (beatmap.cs - 3) / 4;

    let totalScore = 0;
    let currentCombo = 0;
    let maxCombo = 0;
    const accuracy = new Accuracy({
        n300: 0,
        n100: 0,
        n50: 0,
        nmiss: 0,
    });

    // We need to calculate the real hit window of the score.
    // This will be used when comparing accuracy against hit result, as the result was rounded down
    // to the nearest integer, making some hits look like they should receive a 300 but instead they
    // receive a 100. The same can be applied for 100 and 50.
    const realOD = calculateDroidDifficultyStatistics({
        overallDifficulty: beatmap.od,
        mods: score.mods.filter(
            (v) =>
                !ModUtil.speedChangingMods.some((m) => m.acronym === v.acronym),
        ),
        convertOverallDifficulty: false,
    }).overallDifficulty;

    const realHitWindow = new DroidHitWindow(realOD);
    const realIsPrecise = score.mods.some((m) => m instanceof ModPrecise);
    const realSpeedMultiplier = calculateDroidDifficultyStatistics({
        customSpeedMultiplier: score.speedMultiplier,
        mods: score.mods,
    }).overallSpeedMultiplier;

    // In simulation, it is fine to apply speed-changing mods if they are present.
    const simulatedOD = calculateDroidDifficultyStatistics({
        overallDifficulty: beatmap.od,
        mods: mods.filter(
            (v) =>
                !ModUtil.speedChangingMods.some((m) => m.acronym === v.acronym),
        ),
        convertOverallDifficulty: false,
    }).overallDifficulty;

    const simulatedHitWindow = new DroidHitWindow(simulatedOD);
    const simulatedIsPrecise = mods.some((m) => m instanceof ModPrecise);
    const simulatedSpeedMultiplier = calculateDroidDifficultyStatistics({
        customSpeedMultiplier: speedMultiplier,
        mods: mods,
    }).overallSpeedMultiplier;

    const simulatedHitWindow300 =
        simulatedHitWindow.hitWindowFor300(simulatedIsPrecise) /
        simulatedSpeedMultiplier;
    const simulatedHitWindow100 =
        simulatedHitWindow.hitWindowFor100(simulatedIsPrecise) /
        simulatedSpeedMultiplier;
    const simulatedHitWindow50 =
        simulatedHitWindow.hitWindowFor50(simulatedIsPrecise) /
        simulatedSpeedMultiplier;

    const spinnerRotationsNeeded = 2 + (2 * simulatedOD) / 10;

    const addSliderNestedResult = (
        object: SliderNestedHitObject,
        wasHit = true,
    ) => {
        if (wasHit) {
            ++currentCombo;

            if (object instanceof SliderTick) {
                totalScore += 10;
            } else {
                totalScore += 30;
            }
        } else {
            currentCombo = 0;
        }

        maxCombo = Math.max(maxCombo, currentCombo);
    };

    const addHitResult = (result: HitResult) => {
        let hitWeight = 0;

        switch (result) {
            case HitResult.great:
                ++accuracy.n300;
                hitWeight = 300;
                break;
            case HitResult.good:
                ++accuracy.n100;
                hitWeight = 100;
                break;
            case HitResult.meh:
                ++accuracy.n50;
                hitWeight = 50;
                break;
            default:
                ++accuracy.nmiss;
                break;
        }

        totalScore +=
            hitWeight +
            Math.floor((hitWeight * currentCombo * difficultyMultiplier) / 25);

        if (hitWeight > 0) {
            ++currentCombo;
        } else {
            currentCombo = 0;
        }

        maxCombo = Math.max(maxCombo, currentCombo);
    };

    for (let i = 0; i < beatmap.beatmap!.hitObjects.objects.length; ++i) {
        const object = beatmap.beatmap!.hitObjects.objects[i];
        const objectData = replay.data.hitObjectData[i];
        const hitAccuracy = Math.abs(objectData.accuracy);

        if (object instanceof Circle) {
            let wasRounded = false;

            switch (objectData.result) {
                case HitResult.good:
                    wasRounded =
                        hitAccuracy ===
                        realHitWindow.hitWindowFor300(realIsPrecise);
                    break;
                case HitResult.meh:
                    wasRounded =
                        hitAccuracy ===
                        realHitWindow.hitWindowFor100(realIsPrecise);
                    break;
            }

            const realHitAccuracy = hitAccuracy / realSpeedMultiplier;

            switch (true) {
                case wasRounded
                    ? realHitAccuracy < simulatedHitWindow300
                    : realHitAccuracy <= simulatedHitWindow300:
                    addHitResult(HitResult.great);
                    objectData.result = HitResult.great;
                    break;
                case wasRounded
                    ? realHitAccuracy < simulatedHitWindow100
                    : realHitAccuracy <= simulatedHitWindow100:
                    addHitResult(HitResult.good);
                    objectData.result = HitResult.good;
                    break;
                case wasRounded
                    ? realHitAccuracy < simulatedHitWindow50
                    : realHitAccuracy <= simulatedHitWindow50:
                    addHitResult(HitResult.meh);
                    objectData.result = HitResult.meh;
                    break;
                default:
                    addHitResult(HitResult.miss);
                    objectData.result = HitResult.miss;
            }
        } else if (object instanceof Slider) {
            if (objectData.result === HitResult.miss) {
                // Missing a slider means missing everything, so we can ignore nested objects.
                addHitResult(objectData.result);
                break;
            }

            if (objectData.result === HitResult.great) {
                // All nested objects were hit.
                for (const nestedObject of object.nestedHitObjects.slice(
                    0,
                    -1,
                )) {
                    addSliderNestedResult(nestedObject);
                }

                addHitResult(HitResult.great);

                continue;
            }

            // Misses and 300s have been handled. Now 50s and 100s.
            // Start with slider head first.
            addSliderNestedResult(
                object.nestedHitObjects[0],
                Math.abs(hitAccuracy) !==
                    Math.floor(
                        simulatedHitWindow.hitWindowFor50(simulatedIsPrecise),
                    ) +
                        13,
            );
            for (let i = 1; i < object.nestedHitObjects.length - 1; ++i) {
                addSliderNestedResult(
                    object.nestedHitObjects[i],
                    objectData.tickset[i - 1],
                );
            }

            addHitResult(objectData.result);
        } else {
            // Spinners require a bit of special case.
            const rotations = Math.floor(hitAccuracy / 4);

            // Add 100 for every slider rotation.
            // Source: https://github.com/osudroid/osu-droid/blob/cd4a1e543616cc205841681bcf15302269377cb7/src/ru/nsu/ccfit/zuev/osu/game/Spinner.java#L318-L324
            totalScore +=
                100 * Math.min(rotations, Math.floor(spinnerRotationsNeeded));

            // Then, for every bonus rotation, add 1000 as spinner bonus.
            for (let i = 0; i < rotations; ++i) {
                if (i < spinnerRotationsNeeded) {
                    continue;
                }

                totalScore += 1000;
            }

            // After adding bonuses, register hit.
            const percentFill = rotations / spinnerRotationsNeeded;
            switch (true) {
                case percentFill >= 1:
                    addHitResult(HitResult.great);
                    objectData.result = HitResult.great;
                    break;
                case percentFill > 0.95:
                    addHitResult(HitResult.good);
                    objectData.result = HitResult.good;
                    break;
                case percentFill > 0.9:
                    addHitResult(HitResult.meh);
                    objectData.result = HitResult.meh;
                    break;
                default:
                    addHitResult(HitResult.miss);
                    objectData.result = HitResult.miss;
            }
        }
    }

    totalScore = Math.floor(totalScore * scoreMultiplier);

    // Reprocess rank.
    let rank: ScoreRank;
    const isHidden = mods.some(
        (m) => m instanceof ModHidden || m instanceof ModFlashlight,
    );
    const hit300Ratio = accuracy.n300 / beatmap.objects;

    switch (true) {
        case accuracy.value() === 1:
            rank = isHidden ? "XH" : "X";
            break;
        case hit300Ratio > 0.9 &&
            accuracy.n50 / beatmap.objects < 0.01 &&
            accuracy.nmiss === 0:
            rank = isHidden ? "SH" : "S";
            break;
        case (hit300Ratio > 0.8 && accuracy.nmiss === 0) || hit300Ratio > 0.9:
            rank = "A";
            break;
        case (hit300Ratio > 0.7 && accuracy.nmiss === 0) || hit300Ratio > 0.8:
            rank = "B";
            break;
        case hit300Ratio > 0.6:
            rank = "C";
            break;
        default:
            rank = "D";
    }

    // Assign calculated properties to the score object.
    score.accuracy = accuracy;
    score.combo = maxCombo;
    score.score = totalScore;
    score.speedMultiplier = speedMultiplier;
    score.mods = <(Mod & IModApplicableToDroid)[]>(
        mods.filter((m) => m.isApplicableToDroid())
    );
    score.rank = rank;

    // Construct calculation
    const calcParams = new PerformanceCalculationParameters({
        accuracy: accuracy,
        combo: maxCombo,
        forceCS: score.forceCS,
        forceAR: score.forceAR,
        forceOD: score.forceOD,
        forceHP: score.forceHP,
        mods: score.mods,
        oldStatistics: score.oldStatistics,
        customSpeedMultiplier:
            interaction.options.getNumber("speedmultiplier") ?? 1,
    });

    const droidAttribs = await DPPProcessorRESTManager.getPerformanceAttributes(
        beatmap.beatmapId,
        Modes.droid,
        PPCalculationMethod.live,
        calcParams,
    );

    const osuAttribs = await DPPProcessorRESTManager.getPerformanceAttributes(
        beatmap.beatmapId,
        Modes.osu,
        PPCalculationMethod.live,
        calcParams,
    );

    BeatmapManager.setChannelLatestBeatmap(interaction.channelId, score.hash);

    const embed = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember | null>interaction.member)?.displayColor,
        droidAttribs,
        osuAttribs,
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("simulatedPlayDisplay"),
            player.username,
        ),
        embeds: [embed],
    });
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "simulate",
    description:
        "Simulates a score of yours or a player if specific mods and/or speed multiplier were used.",
    options: [
        {
            name: "beatmap",
            description:
                "The beatmap ID or link to simulate the score from. Defaults to the latest cached beatmap, if any.",
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "uid",
            description: "The uid of the player to obtain the score from.",
            type: ApplicationCommandOptionType.Integer,
            minValue: Constants.uidMinLimit,
        },
        {
            name: "user",
            description: "The Discord user to obtain the score from.",
            type: ApplicationCommandOptionType.User,
        },
        {
            name: "username",
            description: "The username of the player to obtain the score from.",
            type: ApplicationCommandOptionType.String,
            minLength: 2,
            maxLength: 20,
            autocomplete: true,
        },
        {
            name: "mods",
            description: "The mods that should be used. Defaults to No Mod.",
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "speedmultiplier",
            type: ApplicationCommandOptionType.Number,
            description:
                "The speed multiplier to calculate for, from 0.5 to 2. Stackable with modifications. Defaults to 1.",
            minValue: 0.5,
            maxValue: 2,
        },
    ],
    example: [],
    permissions: [],
    scope: "ALL",
    cooldown: 4,
};
