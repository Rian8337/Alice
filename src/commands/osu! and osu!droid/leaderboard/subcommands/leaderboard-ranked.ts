import { DatabaseManager } from "@alice-database/DatabaseManager";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { LeaderboardLocalization } from "@alice-localization/commands/osu! and osu!droid/LeaderboardLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(await CommandHelper.getLocale(interaction));

    const res: Collection<number, RankedScore> =
        await DatabaseManager.aliceDb.collections.rankedScore.getLeaderboard();

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20)
    );

    const onPageChange: OnButtonPageChange = async (
        options,
        page,
        entries: RankedScore[]
    ) => {
        const longestUsernameLength: number = Math.max(
            ...entries
                .slice(20 * (page - 1), 20 + 20 * (page - 1))
                .map((v) =>
                    StringHelper.getUnicodeStringLength(v.username.trim())
                ),
            16
        );

        let output: string = `${"#".padEnd(4)} | ${localization.getTranslation("username").padEnd(
            longestUsernameLength
        )} | ${localization.getTranslation("uid").padEnd(6)} | ${localization.getTranslation("playCount").padEnd(5)} | ${localization.getTranslation("score")} (Lv)\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: RankedScore = entries[i];

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                        .toString()
                        .padEnd(6)} | ${player.playc
                            .toString()
                            .padEnd(
                                5
                            )} | ${player.score.toLocaleString()} (${Math.floor(
                                player.level
                            )})`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(
                    longestUsernameLength
                )} | ${"-".padEnd(6)} | ${"-".padEnd(5)} | -`;
            }

            output += "\n";
        }

        options.content = "```c\n" + output + "```";
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        [...res.values()],
        20,
        page,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
