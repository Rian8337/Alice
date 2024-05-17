import AdmZip from "adm-zip";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { Accuracy, MapInfo, Modes } from "@rian8337/osu-base";
import { ExportedReplayJSON } from "@rian8337/osu-droid-replay-analyzer";
import { Score } from "@rian8337/osu-droid-utilities";
import { FetchreplayLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/fetchreplay/FetchreplayLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ReplayHelper } from "@alice-utils/helpers/ReplayHelper";
import { DPPProcessorRESTManager } from "@alice-utils/managers/DPPProcessorRESTManager";
import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { BeatmapDifficultyHelper } from "@alice-utils/helpers/BeatmapDifficultyHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization = new FetchreplayLocalization(
        CommandHelper.getLocale(interaction),
    );

    const beatmapLink = interaction.options.getString("beatmap", true);
    const beatmapID = BeatmapManager.getBeatmapID(beatmapLink)[0];
    let uid = interaction.options.getInteger("uid");
    let hash = beatmapLink?.startsWith("h:") ? beatmapLink.slice(2) : "";

    if (!beatmapID && !hash) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotProvided"),
            ),
        });
    }

    if (!uid) {
        const bindInfo =
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

    const score = await DroidHelper.getScore(uid, hash, [
        "id",
        "score",
        "combo",
        "mark",
        "mode",
        "perfect",
        "good",
        "bad",
        "miss",
        "date",
    ]);

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

    const username =
        score instanceof Score
            ? score.username
            : (await DroidHelper.getPlayer(uid, ["username"]))?.username;

    if (!username) {
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

    const zip = new AdmZip();

    zip.addFile(
        `${score instanceof Score ? score.scoreID : score.id}.odr`,
        replay.originalODR!,
    );

    let modstring: string;

    if (score instanceof Score) {
        modstring = score.mods.map((v) => v.droidString).join("");

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
    } else {
        const parsedMods = DroidHelper.parseMods(score.mode);

        modstring = parsedMods.mods.map((v) => v.droidString).join("");

        if (parsedMods.forceCS !== undefined) {
            modstring += `|CS${parsedMods.forceCS}`;
        }
        if (parsedMods.forceAR !== undefined) {
            modstring += `|AR${parsedMods.forceAR}`;
        }
        if (parsedMods.forceOD !== undefined) {
            modstring += `|OD${parsedMods.forceOD}`;
        }
        if (parsedMods.forceHP !== undefined) {
            modstring += `|HP${parsedMods.forceHP}`;
        }
    }

    const scoreId = score instanceof Score ? score.scoreID : score.id;
    const rank = score instanceof Score ? score.rank : score.mark;
    const accuracy =
        score instanceof Score
            ? score.accuracy
            : new Accuracy({
                  n300: score.perfect,
                  n100: score.good,
                  n50: score.bad,
                  nmiss: score.miss,
              });

    const json: ExportedReplayJSON = {
        version: 1,
        replaydata: {
            filename: `${data.folderName}\\/${data.fileName}`,
            playername: data.replayVersion < 3 ? username : data.playerName,
            replayfile: `${scoreId}.odr`,
            mod: modstring,
            score: score.score,
            combo: score.combo,
            mark: rank,
            h300k: data.hit300k,
            h300: accuracy.n300,
            h100k: data.hit100k,
            h100: accuracy.n100,
            h50: accuracy.n50,
            misses: accuracy.nmiss,
            accuracy: accuracy.value(),
            time: score.date.getTime(),
            perfect:
                data.replayVersion < 3
                    ? accuracy.nmiss === 0
                        ? 1
                        : 0
                    : data.isFullCombo
                      ? 1
                      : 0,
        },
    };

    zip.addFile("entry.json", Buffer.from(JSON.stringify(json, null, 2)));

    const replayAttachment = new AttachmentBuilder(zip.toBuffer(), {
        name: `${data.fileName.substring(0, data.fileName.length - 4)} [${
            data.playerName
        }]-${json.replaydata.time}.edr`,
    });

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language),
                ),
                score.combo.toString(),
                (accuracy.value() * 100).toFixed(2),
                accuracy.n300.toString(),
                accuracy.n100.toString(),
                accuracy.n50.toString(),
                accuracy.nmiss.toString(),
            ),
            files: [replayAttachment],
        });
    }

    const droidAttribs = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        scoreId,
        Modes.droid,
        PPCalculationMethod.live,
    );

    if (!droidAttribs) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language),
                ),
                score.combo.toString(),
                (accuracy.value() * 100).toFixed(2),
                accuracy.n300.toString(),
                accuracy.n100.toString(),
                accuracy.n50.toString(),
                accuracy.nmiss.toString(),
            ),
            files: [replayAttachment],
        });
    }

    const osuAttribs = await DPPProcessorRESTManager.getOnlineScoreAttributes(
        scoreId,
        Modes.osu,
        PPCalculationMethod.live,
    );

    if (!osuAttribs) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("fetchReplayNoBeatmapSuccessful"),
                rank,
                score.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language),
                ),
                score.combo.toString(),
                (accuracy.value() * 100).toFixed(2),
                accuracy.n300.toString(),
                accuracy.n100.toString(),
                accuracy.n50.toString(),
                accuracy.nmiss.toString(),
            ),
            files: [replayAttachment],
        });
    }

    const calcEmbedOptions = EmbedCreator.createCalculationEmbed(
        beatmapInfo,
        BeatmapDifficultyHelper.getCalculationParamsFromScore(score),
        droidAttribs.difficulty,
        osuAttribs.difficulty,
        droidAttribs.performance,
        osuAttribs.performance,
        localization.language,
    );

    replay.beatmap ??= beatmapInfo.beatmap ?? undefined;

    const hitErrorInformation = replay.calculateHitError();
    const embed = EmbedBuilder.from(calcEmbedOptions.embeds![0]);

    embed.setAuthor({
        name: StringHelper.formatString(
            localization.getTranslation("playInfo"),
            username,
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
    calcEmbedOptions.files = calcEmbedOptions.files.concat(replayAttachment);

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
