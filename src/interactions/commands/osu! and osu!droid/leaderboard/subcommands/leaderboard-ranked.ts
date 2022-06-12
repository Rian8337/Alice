import { DatabaseManager } from "@alice-database/DatabaseManager";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { LeaderboardLocalization } from "@alice-localization/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const res: Collection<number, RankedScore> =
        await DatabaseManager.aliceDb.collections.rankedScore.getLeaderboard();

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20)
    );

    const resArray: RankedScore[] = [...res.values()];

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const longestUsernameLength: number = Math.max(
            ...resArray
                .slice(20 * (page - 1), 20 + 20 * (page - 1))
                .map((v) =>
                    StringHelper.getUnicodeStringLength(v.username.trim())
                ),
            16
        );

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("username")
            .padEnd(longestUsernameLength)} | ${localization
            .getTranslation("uid")
            .padEnd(6)} | ${localization
            .getTranslation("playCount")
            .padEnd(5)} | ${localization.getTranslation("score")} (Lv)\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: RankedScore = resArray[i];

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                    .toString()
                    .padEnd(6)} | ${player.playc
                    .toString()
                    .padEnd(5)} | ${player.score.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )} (${Math.floor(player.level)})`;
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
        page,
        Math.ceil(res.size / 20),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
