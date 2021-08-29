import { MapInfo } from "osu-droid";
import { Config } from "@alice-core/Config";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { WhitelistOperationResult } from "@alice-interfaces/dpp/WhitelistOperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { blacklistStrings } from "./blacklistStrings";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";

export const run: Command["run"] = async (_, interaction) => {
    const beatmapID: number = BeatmapManager.getBeatmapID(interaction.options.getString("beatmap")!)[0];

    if (!beatmapID) {
        return interaction.editReply({
            content: MessageCreator.createReject(blacklistStrings.noBeatmapProvided)
        });
    }

    const reason: string = interaction.options.getString("reason", true);

    const pickedChoice: string = (await SelectMenuCreator.createSelectMenu(
        interaction,
        `Detected Beatmap ID: ${beatmapID}\n\nChoose the action that you want to do.`,
        [
            {
                label: "Blacklist",
                value: "blacklist",
                description: `Blacklist the beatmap.`
            },
            {
                label: "Unblacklist",
                value: "unblacklist",
                description: `Unblacklist the beatmap.`
            }
        ],
        Config.botOwners,
        20
    ))[0];

    if (!pickedChoice) {
        return;
    }

    const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(beatmapID, false);

    if (!beatmapInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(blacklistStrings.beatmapNotFound)
        });
    }

    switch (pickedChoice) {
        case "blacklist":
            if (!reason) {
                return interaction.editReply({
                    content: MessageCreator.createReject(blacklistStrings.noBlacklistReasonProvided)
                });
            }

            const blacklistResult: WhitelistOperationResult = await WhitelistManager.blacklist(beatmapInfo, reason);

            if (!blacklistResult.success) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        blacklistStrings.blacklistFailed, blacklistResult.reason!
                    )
                });
            }

            interaction.editReply({
                content: MessageCreator.createAccept(
                    blacklistStrings.blacklistSuccess, beatmapInfo.fullTitle
                )
            });

            break;
        case "unblacklist":
            const unblacklistResult: WhitelistOperationResult = await WhitelistManager.unblacklist(beatmapInfo);

            if (!unblacklistResult.success) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        blacklistStrings.unblacklistFailed, unblacklistResult.reason!
                    )
                });
            }

            interaction.editReply({
                content: MessageCreator.createAccept(
                    blacklistStrings.unblacklistSuccess, beatmapInfo.fullTitle
                )
            });

            break;
    }
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "blacklist",
    description: "The main command for droid performance points (dpp) blacklisting system.",
    options: [
        {
            name: "beatmap",
            required: true,
            type: CommandArgumentType.STRING,
            description: "The beatmap ID or link to take an action with."
        },
        {
            name: "reason",
            required: true,
            type: CommandArgumentType.STRING,
            description: "The reason for taking the action. Required for blacklisting action."
        }
    ],
    example: [
        {
            command: "blacklist 1764213 Abuse map",
            description: "will blacklist/unblacklist the beatmap with ID 1764213 with reason \"Abuse map\"."
        },
        {
            command: "blacklist https://osu.ppy.sh/b/1884658 Broken due to diffcalc",
            description: "will blacklist/unblacklist the linked beatmap with reason \"Broken due to diffcalc\"."
        },
        {
            command: "blacklist https://osu.ppy.sh/beatmapsets/902745#osu/1884658 Broken due to diffcalc",
            description: "will blacklist/unblacklist the linked beatmap with reason \"Broken due to diffcalc\"."
        }
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL"
};