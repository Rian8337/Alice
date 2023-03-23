import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { PassRequirementType } from "structures/challenge/PassRequirementType";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, MapStats, ModUtil } from "@rian8337/osu-base";
import { User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    if (!id.startsWith("d") && !id.startsWith("w")) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidChallengeId")
            ),
        });
    }

    const matched: RegExpMatchArray | null = id.match(/(\d+)$/);

    if (!matched || matched.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidChallengeId")
            ),
        });
    }

    const existingChallenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(id);

    if (existingChallenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeWithIdExists")
            ),
        });
    }

    const beatmapId: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap", true)
    )[0];

    if (!beatmapId) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided")
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
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    const points: number = interaction.options.getInteger("points", true);

    const passRequirement: PassRequirementType = <PassRequirementType>(
        interaction.options.getString("passrequirement", true)
    );

    let passValue: string | number = interaction.options.getString(
        "passvalue",
        true
    );

    const constrain: string = interaction.options.getString("constrain") ?? "";

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    switch (passRequirement) {
        case "score": {
            passValue = parseInt(passValue);

            await beatmap.retrieveBeatmapFile();

            if (!beatmap.hasDownloadedBeatmap()) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("beatmapNotFound")
                    ),
                });
            }

            const maxScore: number = beatmap.beatmap!.maxDroidScore(
                new MapStats({
                    mods: ModUtil.pcStringToMods(constrain),
                })
            );

            if (!NumberHelper.isNumberInRange(passValue, 0, maxScore, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        maxScore.toLocaleString(BCP47)
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
                        "100"
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
                        (1000000).toLocaleString(BCP47)
                    ),
                });
            }

            break;
        case "combo":
            passValue = parseInt(passValue);

            if (
                !NumberHelper.isNumberInRange(
                    passValue,
                    0,
                    beatmap.maxCombo,
                    true
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        beatmap.maxCombo.toLocaleString(BCP47)
                    ),
                });
            }

            break;
        case "rank":
            passValue = passValue.toUpperCase();

            if (
                !["SSH", "SS", "SH", "S", "A", "B", "C", "D"].includes(
                    passValue
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "SSH",
                        "D"
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
                    true
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        Number.POSITIVE_INFINITY.toLocaleString(BCP47)
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
                    true
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("passValueOutOfRange"),
                        "0",
                        beatmap.objects.toLocaleString(BCP47)
                    ),
                });
            }

            break;
    }

    const featured: User =
        interaction.options.getUser("featured") ?? interaction.user;

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.challenge.insert({
            challengeid: id,
            beatmapid: beatmap.beatmapID,
            featured: featured.id,
            link: ["", ""],
            constrain: constrain,
            pass: {
                id: passRequirement,
                value: passValue,
            },
            points: points,
        });

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addNewChallengeFailed")
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addNewChallengeSuccess"),
            id
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
