import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { PassRequirementType } from "structures/challenge/PassRequirementType";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, ModUtil } from "@rian8337/osu-base";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new DailyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const id = interaction.options.getString("id", true);

    if (!id.startsWith("d") && !id.startsWith("w")) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidChallengeId"),
            ),
        });
    }

    const matched = id.match(/(\d+)$/);

    if (!matched || matched.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidChallengeId"),
            ),
        });
    }

    const existingChallenge =
        await DatabaseManager.aliceDb.collections.challenge.getById(id);

    if (existingChallenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeWithIdExists"),
            ),
        });
    }

    const beatmapId = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true),
    )[0];

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(beatmapId, {
        checkFile: false,
    });

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound"),
            ),
        });
    }

    const points = interaction.options.getInteger("points", true);

    const passRequirement = <PassRequirementType>(
        interaction.options.getString("passrequirement", true)
    );

    let passValue: string | number = interaction.options.getString(
        "passvalue",
        true,
    );

    const constrain = interaction.options.getString("constrain") ?? "";
    const BCP47 = LocaleHelper.convertToBCP47(localization.language);

    switch (passRequirement) {
        case "score": {
            passValue = parseInt(passValue);

            await BeatmapManager.downloadBeatmap(beatmap);

            if (!beatmap.hasDownloadedBeatmap()) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("beatmapNotFound"),
                    ),
                });
            }

            const maxScore = beatmap.beatmap!.maxDroidScore(
                ModUtil.pcStringToMods(constrain),
            );

            if (!NumberHelper.isNumberInRange(passValue, 0, maxScore, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        maxScore.toLocaleString(BCP47),
                    ),
                });
            }

            break;
        }
        case "acc":
            passValue = parseFloat(passValue);

            if (!NumberHelper.isNumberInRange(passValue, 0, 100, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        "100",
                    ),
                });
            }

            break;
        case "scorev2":
            passValue = parseInt(passValue);

            if (!NumberHelper.isNumberInRange(passValue, 0, 1e6, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        (1000000).toLocaleString(BCP47),
                    ),
                });
            }

            break;
        case "combo":
            if (beatmap.maxCombo === null) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("beatmapMaxComboNotFound"),
                    ),
                });
            }

            passValue = parseInt(passValue);

            if (
                !NumberHelper.isNumberInRange(
                    passValue,
                    0,
                    beatmap.maxCombo,
                    true,
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        beatmap.maxCombo.toLocaleString(BCP47),
                    ),
                });
            }

            break;
        case "rank":
            passValue = passValue.toUpperCase();

            if (
                !["SSH", "SS", "SH", "S", "A", "B", "C", "D"].includes(
                    passValue,
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "SSH",
                        "D",
                    ),
                });
            }

            break;
        case "dpp":
        case "pp":
        case "ur":
            passValue = parseFloat(passValue);

            if (
                !NumberHelper.isNumberInRange(
                    passValue,
                    0,
                    Number.POSITIVE_INFINITY,
                    true,
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        Number.POSITIVE_INFINITY.toLocaleString(BCP47),
                    ),
                });
            }

            break;
        case "m300":
        case "m100":
        case "m50":
        case "miss":
            passValue = parseInt(passValue);

            if (
                !NumberHelper.isNumberInRange(
                    passValue,
                    0,
                    beatmap.objects,
                    true,
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        beatmap.objects.toLocaleString(BCP47),
                    ),
                });
            }

            break;
    }

    const featured =
        interaction.options.getUser("featured") ?? interaction.user;

    const result = await DatabaseManager.aliceDb.collections.challenge.insert({
        challengeid: id,
        beatmapid: beatmap.beatmapId,
        featured: featured.id,
        link: ["", ""],
        constrain: constrain,
        pass: {
            id: passRequirement,
            value: passValue,
        },
        points: points,
    });

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addNewChallengeFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addNewChallengeSuccess"),
            id,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
