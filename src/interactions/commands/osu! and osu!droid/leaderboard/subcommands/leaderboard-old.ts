import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Collection } from "discord.js";
import { LeaderboardLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { OldPPProfile } from "@alice-database/utils/aliceDb/OldPPProfile";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const res: Collection<string, OldPPProfile> =
        await DatabaseManager.aliceDb.collections.playerOldPPProfile.getLeaderboard();

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20)
    );

    const entries: OldPPProfile[] = [...res.values()];

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const usernameLengths: number[] = [];

        for (
            let i = 20 * (page - 1);
            i < Math.min(res.size, 20 + 20 * (page - 1));
            ++i
        ) {
            usernameLengths.push(
                StringHelper.getUnicodeStringLength(entries[i].username.trim())
            );
        }

        const longestUsernameLength: number = Math.max(...usernameLengths, 16);

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("username")
            .padEnd(longestUsernameLength)} | ${localization
            .getTranslation("uid")
            .padEnd(6)} | ${localization
            .getTranslation("playCount")
            .padEnd(4)} | ${localization.getTranslation("pp")}\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: OldPPProfile | undefined = entries[i];

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                    .toString()
                    .padEnd(6)} | ${(player.playc ?? 0)
                    .toString()
                    .padEnd(4)} | ${(player.pptotal ?? 0).toFixed(2)}`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(
                    longestUsernameLength
                )} | ${"-".padEnd(6)} | ${"-".padEnd(4)} | -`;
            }

            output += "\n";
        }

        options.content = "```c\n" + output + "```";
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        page,
        Math.ceil(res.size / 20),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
