import AdmZip from "adm-zip";
import {
    EmbedBuilder,
    BaseMessageOptions,
    AttachmentBuilder,
} from "discord.js";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { MapInfo, Modes } from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import {
    ExportedReplayJSON,
    HitErrorInformation,
} from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import { FetchreplayLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/fetchreplay/FetchreplayLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: FetchreplayLocalization = new FetchreplayLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const beatmapLink: string = interaction.options.getString("beatmap", true);

    const beatmapID: number = BeatmapManager.getBeatmapID(beatmapLink)[0];

    let uid: number | null = interaction.options.getInteger("uid");

    let hash: string = beatmapLink?.startsWith("h:")
        ? beatmapLink.slice(2)
        : "";

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotProvided"),
            ),
        });
    }

    if (!uid) {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user,
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
                    Constants.selfNotBindedReject,
                ),
            });
        }

        uid = bindInfo.uid;
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        hash ? hash : beatmapID,
        { checkFile: false },
    );

    if (beatmapInfo) {
        hash = beatmapInfo.hash;
    }

    const score: Score | null = await Score.getFromHash(uid, hash);

    if (!score) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    interaction.options.getInteger("uid")
                        ? "userScoreNotFound"
                        : "selfScoreNotFound",
                ),
            ),
        });
    }

    const replay = await ReplayHelper.analyzeReplay(score);

    if (!replay.data) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noReplayFound"),
            ),
        });
    }

    const { data } = replay;

    const zip: AdmZip = new AdmZip();

    zip.addFile(`${score.scoreID}.odr`, replay.originalODR!);

    let modstring = score.mods.map((v) => v.droidString).join("");
    if (score.forceCS !== undefined) {
        modstring += `|CS${score.forceCS}`;
    }
    if (score.forceAR !== undefined) {
        modstring += `|AR${score.forceAR}`;
    }
    if (score.forceOD !== undefined) {
        modstring += `|OD${score.forceOD}`;
    }
    if (score.forceHP !== undefined) {
        modstring += `|HP${score.forceHP}`;
    }

    const json: ExportedReplayJSON = {
        version: 1,
        replaydata: {
            filename: `${data.folderName}\\/${data.fileName}`,
            playername:
                data.replayVersion < 3 ? score.username : data.playerName,
            replayfile: `${score.scoreID}.odr`,
            mod: modstring,
            score: score.score,
            combo: score.combo,
            mark: score.rank,
            h300k: data.hit300k,
            h300: score.accuracy.n300,
            h100k: data.hit100k,
            h100: score.accuracy.n100,
            h50: score.accuracy.n50,
            misses: score.accuracy.nmiss,
            accuracy: score.accuracy.value(),
            time: score.date.getTime(),
            perfect:
                data.replayVersion < 3
                    ? score.accuracy.nmiss === 0
                        ? 1
                        : 0
                    : data.isFullCombo
                      ? 1
                      : 0,
        },
    };

    zip.addFile("entry.json", Buffer.from(JSON.stringify(json, null, 2)));

    const replayAttachment: AttachmentBuilder = new AttachmentBuilder(
        zip.toBuffer(),
        {
            name: `${data.fileName.substring(0, data.fileName.length - 4)} [${
                data.playerName
            }]-${json.replaydata.time}.edr`,
        },
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                score.rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language),
                ),
                score.combo.toString(),
                (score.accuracy.value() * 100).toFixed(2),
                score.accuracy.n300.toString(),
                score.accuracy.n100.toString(),
                score.accuracy.n50.toString(),
                score.accuracy.nmiss.toString(),
            ),
            files: [replayAttachment],
        });
    }

    const droidAttribs: CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    > | null = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score.scoreID,
        Modes.droid,
        PPCalculationMethod.live,
    );

    if (!droidAttribs) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                score.rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language),
                ),
                score.combo.toString(),
                (score.accuracy.value() * 100).toFixed(2),
                score.accuracy.n300.toString(),
                score.accuracy.n100.toString(),
                score.accuracy.n50.toString(),
                score.accuracy.nmiss.toString(),
            ),
            files: [replayAttachment],
        });
    }

    const osuAttribs: CompleteCalculationAttributes<
        OsuDifficultyAttributes,
        OsuPerformanceAttributes
    > | null = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        score.scoreID,
        Modes.osu,
        PPCalculationMethod.live,
    );

    if (!osuAttribs) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                score.rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language),
                ),
                score.combo.toString(),
                (score.accuracy.value() * 100).toFixed(2),
                score.accuracy.n300.toString(),
                score.accuracy.n100.toString(),
                score.accuracy.n50.toString(),
                score.accuracy.nmiss.toString(),
            ),
            files: [replayAttachment],
        });
    }

    const calcEmbedOptions: BaseMessageOptions =
        EmbedCreator.createCalculationEmbed(
            beatmapInfo,
            BeatmapDifficultyHelper.getCalculationParamsFromScore(score),
            droidAttribs.difficulty,
            osuAttribs.difficulty,
            droidAttribs.performance,
            osuAttribs.performance,
            localization.language,
        );

    replay.beatmap ??= beatmapInfo.beatmap ?? undefined;

    const hitErrorInformation: HitErrorInformation | null =
        replay.calculateHitError();

    const embed: EmbedBuilder = EmbedBuilder.from(calcEmbedOptions.embeds![0]);

    embed.setAuthor({
        name: StringHelper.formatString(
            localization.getTranslation("playInfo"),
            score.username,
        ),
        iconURL: embed.data.author?.icon_url,
    });

    if (hitErrorInformation) {
        embed.addFields({
            name: localization.getTranslation("hitErrorInfo"),
            value: `${hitErrorInformation.negativeAvg.toFixed(
                2,
            )}ms - ${hitErrorInformation.positiveAvg.toFixed(
                2,
            )}ms ${localization.getTranslation(
                "hitErrorAvg",
            )} | ${hitErrorInformation.unstableRate.toFixed(2)} UR`,
        });
    }

    calcEmbedOptions.files ??= [];
    calcEmbedOptions.files.push(replayAttachment);

    InteractionHelper.reply(interaction, calcEmbedOptions);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "fetchreplay",
    description: "Fetches replay from a player in a beatmap.",
    options: [
        {
            name: "beatmap",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The beatmap ID or link.",
        },
        {
            name: "uid",
            type: ApplicationCommandOptionType.Integer,
            description:
                "The uid of the player. Defaults to your current bound uid.",
            minValue: Constants.uidMinLimit,
        },
    ],
    example: [
        {
            command: "fetchreplay",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
            ],
            description:
                "will fetch the replay from the uid you're currently bound on in the beatmap with ID 1884658.",
        },
        {
            command: "fetchreplay",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description:
                "will fetch the replay from the uid you're currently bound on in the linked beatmap.",
        },
        {
            command: "fetchreplay",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
                {
                    name: "uid",
                    value: 51076,
                },
            ],
            description:
                "will fetch the replay from the player with uid 51076 in the beatmap with ID 1884658.",
        },
        {
            command: "fetchreplay 5455",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/b/1884658",
                },
                {
                    name: "uid",
                    value: 5455,
                },
            ],
            description:
                "will fetch the replay from the player with uid 5455 in the linked beatmap.",
        },
    ],
    cooldown: 30,
    permissions: [],
    scope: "ALL",
};
