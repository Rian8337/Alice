import AdmZip from "adm-zip";
import {
    GuildMember,
    MessageAttachment,
    MessageEmbed,
    MessageOptions,
} from "discord.js";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { PerformanceCalculationResult } from "@alice-utils/dpp/PerformanceCalculationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DroidBeatmapDifficultyHelper } from "@alice-utils/helpers/DroidBeatmapDifficultyHelper";
import { OsuBeatmapDifficultyHelper } from "@alice-utils/helpers/OsuBeatmapDifficultyHelper";
import { MapInfo } from "@rian8337/osu-base";
import {
    DroidPerformanceCalculator,
    OsuPerformanceCalculator,
} from "@rian8337/osu-difficulty-calculator";
import {
    ReplayData,
    ExportedReplayJSON,
    HitErrorInformation,
} from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import { FetchreplayLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/fetchreplay/FetchreplayLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: FetchreplayLocalization = new FetchreplayLocalization(
        await CommandHelper.getLocale(interaction)
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
                localization.getTranslation("beatmapNotProvided")
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
                }
            );

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    Constants.selfNotBindedReject
                ),
            });
        }

        uid = bindInfo.uid;
    }

    await InteractionHelper.deferReply(interaction);

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
        hash ? hash : beatmapID
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
                        : "selfScoreNotFound"
                )
            ),
        });
    }

    await score.downloadReplay();

    const data: ReplayData | null | undefined = score.replay?.data;

    if (!data) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noReplayFound")
            ),
        });
    }

    const zip: AdmZip = new AdmZip();

    zip.addFile(`${score.scoreID}.odr`, score.replay!.originalODR!);

    const json: ExportedReplayJSON = {
        version: 1,
        replaydata: {
            filename: `${data.folderName}\\/${data.fileName}`,
            playername:
                data.replayVersion < 3 ? score.username : data.playerName,
            replayfile: `${score.scoreID}.odr`,
            mod: `${score.mods.map((v) => v.droidString).join("")}${
                score.speedMultiplier !== 1 ? `|${score.speedMultiplier}x` : ""
            }${score.forcedAR ? `|AR${score.forcedAR}` : ""}`,
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

    const replayAttachment: MessageAttachment = new MessageAttachment(
        zip.toBuffer(),
        `${data.fileName.substring(0, data.fileName.length - 4)} [${
            data.playerName
        }]-${json.replaydata.time}.edr`
    );

    if (!beatmapInfo?.map) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                score.rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                ),
                score.combo.toString(),
                (score.accuracy.value() * 100).toFixed(2),
                score.accuracy.n300.toString(),
                score.accuracy.n100.toString(),
                score.accuracy.n50.toString(),
                score.accuracy.nmiss.toString()
            ),
            files: [replayAttachment],
        });
    }

    const droidCalcResult: PerformanceCalculationResult<DroidPerformanceCalculator> =
        (await new DroidBeatmapDifficultyHelper().calculateScorePerformance(
            score
        ))!;

    const osuCalcResult: PerformanceCalculationResult<OsuPerformanceCalculator> =
        (await new OsuBeatmapDifficultyHelper().calculateScorePerformance(
            score
        ))!;

    const calcEmbedOptions: MessageOptions =
        await EmbedCreator.createCalculationEmbed(
            await BeatmapDifficultyHelper.getCalculationParamsFromScore(score),
            droidCalcResult,
            osuCalcResult,
            (<GuildMember | null>interaction.member)?.displayHexColor,
            localization.language
        );

    const hitErrorInformation: HitErrorInformation =
        score.replay!.calculateHitError()!;

    (<MessageEmbed>calcEmbedOptions.embeds![0])
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("playInfo"),
                score.username
            ),
            iconURL: (<MessageEmbed>calcEmbedOptions.embeds![0]).author
                ?.iconURL,
        })
        .addField(
            localization.getTranslation("hitErrorInfo"),
            `${hitErrorInformation.negativeAvg.toFixed(
                2
            )}ms - ${hitErrorInformation.positiveAvg.toFixed(
                2
            )}ms ${localization.getTranslation(
                "hitErrorAvg"
            )} | ${hitErrorInformation.unstableRate.toFixed(2)} UR`
        );

    calcEmbedOptions.files?.push(replayAttachment);

    InteractionHelper.reply(interaction, calcEmbedOptions);
};

export const category: SlashCommand["category"] = CommandCategory.OSU;

export const config: SlashCommand["config"] = {
    name: "fetchreplay",
    description: "Fetches replay from a player in a beatmap.",
    options: [
        {
            name: "beatmap",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description: "The beatmap ID or link.",
        },
        {
            name: "uid",
            type: ApplicationCommandOptionTypes.INTEGER,
            description:
                "The uid of the player. Defaults to your current binded uid.",
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
                "will fetch the replay from the uid you're currently binded on in the beatmap with ID 1884658.",
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
                "will fetch the replay from the uid you're currently binded on in the linked beatmap.",
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
