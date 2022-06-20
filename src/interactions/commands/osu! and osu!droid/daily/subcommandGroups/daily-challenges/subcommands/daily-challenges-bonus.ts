import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ChallengeCollectionManager } from "@alice-database/managers/aliceDb/ChallengeCollectionManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { Bonus } from "@alice-interfaces/challenge/Bonus";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { BonusID } from "@alice-types/challenge/BonusID";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, MapStats, Mod, ModUtil } from "@rian8337/osu-base";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const dbManager: ChallengeCollectionManager =
        DatabaseManager.aliceDb.collections.challenge;

    const challenge: Challenge | null = await dbManager.getById(
        interaction.options.getString("id", true)
    );

    if (!challenge) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeNotFound")
            ),
        });
    }

    if (!challenge.isScheduled) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("challengeIsOngoing")
            ),
        });
    }

    const type: BonusID = <BonusID>interaction.options.getString("type", true);

    const level: number = interaction.options.getInteger("level", true);

    let value: string | number | null = interaction.options.getString("value");

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (!value) {
        // Value omitted, means the user wants to delete.
        const bonus: Bonus | undefined = challenge.bonus.get(type);

        if (bonus) {
            const index: number = bonus.list.findIndex(
                (v) => v.level === level
            );

            if (index !== -1) {
                bonus.list.splice(index, 1);

                if (bonus.list.length === 0) {
                    challenge.bonus.delete(type);
                }

                const result: OperationResult = await dbManager.updateOne(
                    { challengeid: challenge.challengeid },
                    {
                        $set: {
                            bonus: [...challenge.bonus.values()],
                        },
                    }
                );

                if (!result.success) {
                    return InteractionHelper.reply(interaction, {
                        content: MessageCreator.createReject(
                            localization.getTranslation("modifyBonusFailed"),
                            result.reason!
                        ),
                    });
                }
            }
        }

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("modifyBonusSuccess"),
                challenge.challengeid,
                type,
                level.toLocaleString(BCP47),
                localization.getTranslation("none")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const beatmap: MapInfo | null = await BeatmapManager.getBeatmap(
        challenge.beatmapid,
        false
    );

    if (!beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    switch (type) {
        case "score": {
            value = parseInt(value);

            await beatmap.retrieveBeatmapFile();

            const maxScore: number = beatmap.map!.maxDroidScore(
                new MapStats({
                    mods: ModUtil.pcStringToMods(challenge.constrain),
                })
            );

            if (!NumberHelper.isNumberInRange(value, 0, maxScore, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
                        "0",
                        maxScore.toLocaleString(BCP47)
                    ),
                });
            }

            break;
        }
        case "acc":
            value = parseFloat(value);

            if (!NumberHelper.isNumberInRange(value, 0, 100, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
                        "0",
                        "100"
                    ),
                });
            }

            break;
        case "scorev2":
            value = parseInt(value);

            if (!NumberHelper.isNumberInRange(value, 0, 1e6, true)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
                        "0",
                        (1e6).toLocaleString(BCP47)
                    ),
                });
            }

            break;
        case "combo":
            value = parseInt(value);

            if (
                !NumberHelper.isNumberInRange(value, 0, beatmap.maxCombo, true)
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
                        "0",
                        beatmap.maxCombo.toLocaleString(BCP47)
                    ),
                });
            }

            break;
        case "mod": {
            const mods: Mod[] = ModUtil.pcStringToMods(value);

            if (mods.some((m) => !m.droidRanked)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("unrankedModsIncluded")
                    ),
                });
            }

            value = mods.reduce((a, v) => a + v.acronym, "");

            break;
        }
        case "rank":
            value = value.toUpperCase();

            if (!["SSH", "SS", "SH", "S", "A", "B", "C", "D"].includes(value)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
                        "SSH",
                        "D"
                    ),
                });
            }

            break;
        case "dpp":
        case "pp":
        case "ur":
            value = parseFloat(value);

            if (
                !NumberHelper.isNumberInRange(
                    value,
                    0,
                    Number.POSITIVE_INFINITY,
                    true
                )
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
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
            value = parseInt(value);

            if (
                !NumberHelper.isNumberInRange(value, 0, beatmap.objects, true)
            ) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("bonusValueOutOfRange"),
                        "0",
                        beatmap.objects.toLocaleString(BCP47)
                    ),
                });
            }

            break;
    }

    const bonus: Bonus = challenge.bonus.get(type) ?? { id: type, list: [] };

    const index: number = bonus.list.findIndex((v) => v.level === level);

    if (index !== -1) {
        bonus.list[index].value = value;
    } else {
        bonus.list.push({
            level: level,
            value: value,
        });

        bonus.list.sort((a, b) => a.level - b.level);
    }

    challenge.bonus.set(type, bonus);

    const result: OperationResult = await dbManager.updateOne(
        { challengeid: challenge.challengeid },
        {
            $set: {
                bonus: [...challenge.bonus.values()],
            },
        }
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("modifyBonusFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("modifyBonusSuccess"),
            challenge.challengeid,
            type,
            level.toLocaleString(BCP47),
            value.toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
