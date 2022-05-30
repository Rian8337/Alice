import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/commands/osu! and osu!droid/daily/DailyLocalization";
import { PassRequirementType } from "@alice-types/challenge/PassRequirementType";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { MapInfo, MapStats, ModUtil } from "@rian8337/osu-base";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getById(
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

    await InteractionHelper.defer(interaction);

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

    const passRequirement: PassRequirementType = <PassRequirementType>(
        interaction.options.getString("type", true)
    );

    let passValue: string | number = interaction.options.getString(
        "value",
        true
    );

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (
        challenge.pass.id !== passRequirement ||
        challenge.pass.value !== passValue
    ) {
        switch (passRequirement) {
            case "score": {
                passValue = parseInt(passValue);

                await beatmap.retrieveBeatmapFile();

                const maxScore: number = beatmap.map!.maxDroidScore(
                    new MapStats({
                        mods: ModUtil.pcStringToMods(challenge.constrain),
                    })
                );

                if (
                    !NumberHelper.isNumberInRange(passValue, 0, maxScore, true)
                ) {
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
                            (1e6).toLocaleString(BCP47)
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

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.challenge.update(
                { challengeid: challenge.challengeid },
                {
                    $set: {
                        pass: {
                            id: passRequirement,
                            value: passValue,
                        },
                    },
                }
            );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("setPassReqFailed"),
                    result.reason!
                ),
            });
        }
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setPassReqSuccess"),
            challenge.challengeid,
            passRequirement,
            passValue.toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
