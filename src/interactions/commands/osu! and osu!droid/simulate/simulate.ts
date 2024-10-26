import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OfficialDatabaseUser } from "@alice-database/official/schema/OfficialDatabaseUser";
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
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import {
    Accuracy,
    BeatmapDifficulty,
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
        CommandHelper.getLocale(interaction),
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
    let uid = interaction.options.getInteger("uid");
    const username = interaction.options.getString("username");

    const dbManager = DatabaseManager.elainaDb.collections.userBind;
    let bindInfo: UserBind | null = null;
    let player:
        | Pick<OfficialDatabaseUser, "id" | "username" | "playcount">
        | Player
        | null = null;

    switch (true) {
        case !!uid:
            player = await DroidHelper.getPlayer(uid!, [
                "id",
                "username",
                "playcount",
            ]);

            uid ??=
                (player instanceof Player ? player.uid : player?.id) ?? null;

            break;
        case !!username:
            if (!StringHelper.isUsernameValid(username)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("playerNotFound"),
                    ),
                });
            }

            player = await DroidHelper.getPlayer(username, [
                "id",
                "username",
                "playcount",
            ]);

            uid ??=
                (player instanceof Player ? player.uid : player?.id) ?? null;

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

            player = await DroidHelper.getPlayer(bindInfo.uid, [
                "id",
                "username",
                "playcount",
            ]);
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound"),
            ),
        });
    }

    if (
        (player instanceof Player ? player.playCount : player.playcount) === 0
    ) {
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

    const score = await DroidHelper.getScore(
        player instanceof Player ? player.uid : player.id,
        beatmap.hash,
        [
            "id",
            "uid",
            "hash",
            "combo",
            "mark",
            "mode",
            "perfect",
            "good",
            "bad",
            "miss",
            "filename",
            "hash",
            "score",
            "date",
        ],
    );

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

    let realMods: (Mod & IModApplicableToDroid)[];
    let realForceCS: number | undefined;
    let realForceAR: number | undefined;
    let realForceOD: number | undefined;
    let realForceHP: number | undefined;
    let realSpeedMultiplier: number;
    let realOldStatistics: boolean;

    if (score instanceof Score) {
        realMods = score.mods;
        realForceCS = score.forceCS;
        realForceAR = score.forceAR;
        realForceOD = score.forceOD;
        realForceHP = score.forceHP;
        realSpeedMultiplier = score.speedMultiplier;
        realOldStatistics = score.oldStatistics;
    } else {
        const parsedMods = DroidHelper.parseMods(score.mode);

        realMods = parsedMods.mods;
        realForceCS = parsedMods.forceCS;
        realForceAR = parsedMods.forceAR;
        realForceOD = parsedMods.forceOD;
        realForceHP = parsedMods.forceHP;
        realSpeedMultiplier = parsedMods.speedMultiplier;
        realOldStatistics = parsedMods.oldStatistics;
    }

    const simulatedMods = ModUtil.pcStringToMods(modInput ?? "");

    if (
        StringHelper.sortAlphabet(
            realMods.reduce((a, v) => a + v.acronym, ""),
        ) ===
            StringHelper.sortAlphabet(
                simulatedMods.reduce((a, v) => a + v.acronym, ""),
            ) &&
        (speedMultiplierInput ?? 1) === realSpeedMultiplier
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

    await BeatmapManager.downloadBeatmap(beatmap);

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
    let simulatedScoreMultiplier = 1;
    for (const mod of simulatedMods) {
        if (mod.isApplicableToDroid()) {
            simulatedScoreMultiplier *= mod.droidScoreMultiplier;
        }
    }

    const simulatedSpeedMultiplier = speedMultiplierInput ?? 1;
    if (simulatedSpeedMultiplier >= 1) {
        simulatedScoreMultiplier *= 1 + (simulatedSpeedMultiplier - 1) * 0.24;
    } else {
        simulatedScoreMultiplier *= Math.pow(
            0.3,
            (1 - simulatedSpeedMultiplier) * 4,
        );
    }

    const difficultyMultiplier =
        1 + beatmap.od / 10 + beatmap.hp / 10 + (beatmap.cs - 3) / 4;

    let simulatedTotalScore = 0;
    let simulatedCurrentCombo = 0;
    let simulatedMaxCombo = 0;
    const simulatedAccuracy = new Accuracy({
        n300: 0,
        n100: 0,
        n50: 0,
        nmiss: 0,
    });

    // We need to calculate the real hit window of the score.
    // This will be used when comparing accuracy against hit result, as the result was rounded down
    // to the nearest integer, making some hits look like they should receive a 300 but instead they
    // receive a 100. The same can be applied for 100 and 50.
    const realDifficulty = new BeatmapDifficulty();
    realDifficulty.od = beatmap.od;

    ModUtil.applyModsToBeatmapDifficulty(
        realDifficulty,
        Modes.droid,
        realMods,
        realSpeedMultiplier,
        false,
        realOldStatistics,
    );

    const realHitWindow = new DroidHitWindow(realDifficulty.od);
    const realIsPrecise = realMods.some((m) => m instanceof ModPrecise);

    const realHitWindow300 = realHitWindow.hitWindowFor300(realIsPrecise);
    const realHitWindow100 = realHitWindow.hitWindowFor100(realIsPrecise);

    const simulatedDifficulty = new BeatmapDifficulty();
    simulatedDifficulty.od = beatmap.od;

    ModUtil.applyModsToBeatmapDifficulty(
        simulatedDifficulty,
        Modes.droid,
        simulatedMods,
        simulatedSpeedMultiplier,
        false,
        realOldStatistics,
    );

    const simulatedHitWindow = new DroidHitWindow(simulatedDifficulty.od);
    const simulatedIsPrecise = simulatedMods.some(
        (m) => m instanceof ModPrecise,
    );

    const simulatedHitWindow300 =
        simulatedHitWindow.hitWindowFor300(simulatedIsPrecise);
    const simulatedHitWindow100 =
        simulatedHitWindow.hitWindowFor100(simulatedIsPrecise);
    const simulatedHitWindow50 =
        simulatedHitWindow.hitWindowFor50(simulatedIsPrecise);

    const spinnerRotationsNeeded = 2 + (2 * simulatedDifficulty.od) / 10;

    const addSliderNestedResult = (
        object: SliderNestedHitObject,
        wasHit = true,
    ) => {
        if (wasHit) {
            ++simulatedCurrentCombo;

            if (object instanceof SliderTick) {
                simulatedTotalScore += 10;
            } else {
                simulatedTotalScore += 30;
            }
        } else {
            simulatedCurrentCombo = 0;
        }

        simulatedMaxCombo = Math.max(simulatedMaxCombo, simulatedCurrentCombo);
    };

    const addHitResult = (result: HitResult) => {
        let hitWeight = 0;

        switch (result) {
            case HitResult.great:
                ++simulatedAccuracy.n300;
                hitWeight = 300;
                break;
            case HitResult.good:
                ++simulatedAccuracy.n100;
                hitWeight = 100;
                break;
            case HitResult.meh:
                ++simulatedAccuracy.n50;
                hitWeight = 50;
                break;
            default:
                ++simulatedAccuracy.nmiss;
                break;
        }

        simulatedTotalScore +=
            hitWeight +
            Math.floor(
                (hitWeight * simulatedCurrentCombo * difficultyMultiplier) / 25,
            );

        if (hitWeight > 0) {
            ++simulatedCurrentCombo;
        } else {
            simulatedCurrentCombo = 0;
        }

        simulatedMaxCombo = Math.max(simulatedMaxCombo, simulatedCurrentCombo);
    };

    for (let i = 0; i < beatmap.beatmap!.hitObjects.objects.length; ++i) {
        const object = beatmap.beatmap!.hitObjects.objects[i];
        const objectData = replay.data.hitObjectData[i];
        const hitAccuracy = Math.abs(objectData.accuracy);

        if (object instanceof Circle) {
            let wasRounded = false;

            switch (objectData.result) {
                case HitResult.good:
                    wasRounded = hitAccuracy === realHitWindow300;
                    break;
                case HitResult.meh:
                    wasRounded = hitAccuracy === realHitWindow100;
                    break;
            }

            let hitResult: HitResult;

            switch (true) {
                case wasRounded
                    ? hitAccuracy < simulatedHitWindow300
                    : hitAccuracy <= simulatedHitWindow300:
                    hitResult = HitResult.great;
                    break;
                case wasRounded
                    ? hitAccuracy < simulatedHitWindow100
                    : hitAccuracy <= simulatedHitWindow100:
                    hitResult = HitResult.good;
                    break;
                case wasRounded
                    ? hitAccuracy < simulatedHitWindow50
                    : hitAccuracy <= simulatedHitWindow50:
                    hitResult = HitResult.meh;
                    break;
                default:
                    hitResult = HitResult.miss;
                    break;
            }

            addHitResult(hitResult);
            objectData.result = hitResult;
        } else if (object instanceof Slider) {
            if (objectData.result === HitResult.miss) {
                // Missing a slider means missing everything, so we can ignore nested objects.
                addHitResult(objectData.result);
                continue;
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
                Math.abs(hitAccuracy) !== Math.floor(simulatedHitWindow50) + 13,
            );

            // Then, handle the slider ticks and repeats.
            for (let j = 1; j < object.nestedHitObjects.length - 1; ++j) {
                addSliderNestedResult(
                    object.nestedHitObjects[j],
                    objectData.tickset[j - 1],
                );
            }

            // Finally, the slider end.
            addHitResult(objectData.result);
        } else {
            // Spinners require a bit of special case.
            const rotations = Math.floor(hitAccuracy / 4);

            // Add 100 for every slider rotation.
            // Source: https://github.com/osudroid/osu-droid/blob/cd4a1e543616cc205841681bcf15302269377cb7/src/ru/nsu/ccfit/zuev/osu/game/Spinner.java#L318-L324
            simulatedTotalScore +=
                100 * Math.min(rotations, Math.floor(spinnerRotationsNeeded));

            // Then, for every bonus rotation, add 1000 as spinner bonus.
            for (let j = 0; j < rotations; ++j) {
                if (j < spinnerRotationsNeeded) {
                    continue;
                }

                simulatedTotalScore += 1000;
            }

            // After adding bonuses, register hit.
            let hitResult: HitResult;
            const percentFill = rotations / spinnerRotationsNeeded;

            switch (true) {
                case percentFill >= 1:
                    hitResult = HitResult.great;
                    break;
                case percentFill > 0.95:
                    hitResult = HitResult.good;
                    break;
                case percentFill > 0.9:
                    hitResult = HitResult.meh;
                    break;
                default:
                    hitResult = HitResult.miss;
                    break;
            }

            addHitResult(hitResult);
            objectData.result = hitResult;
        }
    }

    simulatedTotalScore = Math.floor(
        simulatedTotalScore * simulatedScoreMultiplier,
    );

    // Reprocess rank.
    let newRank: ScoreRank;
    const isHidden = simulatedMods.some(
        (m) => m instanceof ModHidden || m instanceof ModFlashlight,
    );
    const hit300Ratio = simulatedAccuracy.n300 / beatmap.objects;

    switch (true) {
        case simulatedAccuracy.value() === 1:
            newRank = isHidden ? "XH" : "X";
            break;
        case hit300Ratio > 0.9 &&
            simulatedAccuracy.n50 / beatmap.objects < 0.01 &&
            simulatedAccuracy.nmiss === 0:
            newRank = isHidden ? "SH" : "S";
            break;
        case (hit300Ratio > 0.8 && simulatedAccuracy.nmiss === 0) ||
            hit300Ratio > 0.9:
            newRank = "A";
            break;
        case (hit300Ratio > 0.7 && simulatedAccuracy.nmiss === 0) ||
            hit300Ratio > 0.8:
            newRank = "B";
            break;
        case hit300Ratio > 0.6:
            newRank = "C";
            break;
        default:
            newRank = "D";
    }

    // Assign calculated properties to the score object and construct calculation.
    let calcParams: PerformanceCalculationParameters;

    if (score instanceof Score) {
        score.accuracy = simulatedAccuracy;
        score.combo = simulatedMaxCombo;
        score.score = simulatedTotalScore;
        score.speedMultiplier = simulatedSpeedMultiplier;
        score.mods = <(Mod & IModApplicableToDroid)[]>(
            simulatedMods.filter((m) => m.isApplicableToDroid())
        );
        score.rank = newRank;

        calcParams = new PerformanceCalculationParameters({
            accuracy: simulatedAccuracy,
            combo: simulatedMaxCombo,
            forceCS: realForceCS,
            forceAR: realForceAR,
            forceOD: realForceOD,
            forceHP: realForceHP,
            mods: score.mods,
            oldStatistics: score.oldStatistics,
            customSpeedMultiplier: simulatedSpeedMultiplier,
        });
    } else {
        const mods = <(Mod & IModApplicableToDroid)[]>(
            simulatedMods.filter((m) => m.isApplicableToDroid())
        );

        score.score = simulatedTotalScore;
        score.combo = simulatedMaxCombo;
        score.perfect = simulatedAccuracy.n300;
        score.good = simulatedAccuracy.n100;
        score.bad = simulatedAccuracy.n50;
        score.mark = newRank;
        score.mode = DroidHelper.modsToDatabaseString({
            mods: mods,
            forceCS: realForceCS,
            forceAR: realForceAR,
            forceOD: realForceOD,
            forceHP: realForceHP,
            speedMultiplier: simulatedSpeedMultiplier,
            oldStatistics: realOldStatistics,
        });
        score.miss = simulatedAccuracy.nmiss;

        calcParams = new PerformanceCalculationParameters({
            accuracy: simulatedAccuracy,
            combo: simulatedMaxCombo,
            forceCS: realForceCS,
            forceAR: realForceAR,
            forceOD: realForceOD,
            forceHP: realForceHP,
            mods: mods,
            oldStatistics: realOldStatistics,
            customSpeedMultiplier: simulatedSpeedMultiplier,
        });
    }

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
        player instanceof Player
            ? player.avatarURL
            : DroidHelper.getAvatarURL(player.id),
        (<GuildMember | null>interaction.member)?.displayColor,
        droidAttribs?.attributes,
        osuAttribs?.attributes,
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
