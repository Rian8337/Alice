import { MapInfo } from "@rian8337/osu-base";
import { Config } from "@alice-core/Config";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { BlacklistLocalization } from "@alice-localization/interactions/commands/Bot Creators/blacklist/BlacklistLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    ApplicationCommandOptionType,
    StringSelectMenuInteraction,
} from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization: BlacklistLocalization = new BlacklistLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const beatmapID: number = BeatmapManager.getBeatmapID(
        interaction.options.getString("beatmap")!
    )[0];

    if (!beatmapID) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapProvided")
            ),
        });
    }

    const reason: string = interaction.options.getString("reason", true);

    const selectMenuInteraction: StringSelectMenuInteraction | null =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("detectedBeatmapId"),
                    beatmapID.toString()
                ),
            },
            [
                {
                    label: localization.getTranslation("blacklist"),
                    value: "blacklist",
                    description: localization.getTranslation("blacklistAction"),
                },
                {
                    label: localization.getTranslation("unblacklist"),
                    value: "unblacklist",
                    description:
                        localization.getTranslation("unblacklistAction"),
                },
            ],
            Config.botOwners,
            20
        );

    if (!selectMenuInteraction) {
        return;
    }

    await selectMenuInteraction.deferUpdate();

    const beatmapInfo: MapInfo<false> | null = await BeatmapManager.getBeatmap(
        beatmapID,
        { checkFile: false }
    );

    if (!beatmapInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("beatmapNotFound")
            ),
        });
    }

    switch (selectMenuInteraction.values[0]) {
        case "blacklist": {
            if (!reason) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("noBlacklistReasonProvided")
                    ),
                });
            }

            const blacklistResult: OperationResult =
                await WhitelistManager.blacklist(
                    beatmapInfo,
                    reason,
                    localization.language
                );

            if (!blacklistResult.success) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("blacklistFailed"),
                        blacklistResult.reason!
                    ),
                });
            }

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("blacklistSuccess"),
                    beatmapInfo.fullTitle
                ),
            });

            break;
        }
        case "unblacklist": {
            const unblacklistResult: OperationResult =
                await WhitelistManager.unblacklist(
                    beatmapInfo,
                    localization.language
                );

            if (!unblacklistResult.success) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("unblacklistFailed"),
                        unblacklistResult.reason!
                    ),
                });
            }

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("unblacklistSuccess"),
                    beatmapInfo.fullTitle
                ),
            });

            break;
        }
    }
};

export const category: SlashCommand["category"] = CommandCategory.BOT_CREATORS;

export const config: SlashCommand["config"] = {
    name: "blacklist",
    description:
        "The main command for droid performance points (dpp) blacklisting system.",
    options: [
        {
            name: "beatmap",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The beatmap ID or link to take an action with.",
        },
        {
            name: "reason",
            required: true,
            type: ApplicationCommandOptionType.String,
            description:
                "The reason for taking the action. Required for blacklisting action.",
        },
    ],
    example: [
        {
            command: "blacklist",
            arguments: [
                {
                    name: "beatmap",
                    value: 1764213,
                },
                {
                    name: "reason",
                    value: "Abuse map",
                },
            ],
            description:
                'will blacklist/unblacklist the beatmap with ID 1764213 with reason "Abuse map".',
        },
        {
            command: "blacklist",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/b/1884658",
                },
                {
                    name: "reason",
                    value: "Broken due to diffcalc",
                },
            ],
            description:
                'will blacklist/unblacklist the linked beatmap with reason "Broken due to diffcalc".',
        },
        {
            command: "blacklist",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
                {
                    name: "reason",
                    value: "Abuse map",
                },
            ],
            description:
                'will blacklist/unblacklist the linked beatmap with reason "Broken due to diffcalc".',
        },
    ],
    permissions: ["BotOwner"],
    scope: "ALL",
};
