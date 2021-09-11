import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { leaderboardStrings } from "../leaderboardStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Collection, Snowflake } from "discord.js";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";

export const run: Subcommand["run"] = async (_, interaction) => {
    const res: Collection<Snowflake, PrototypePP> =
        await DatabaseManager.aliceDb.collections.prototypePP.getLeaderboard();

    if (res.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(leaderboardStrings.noPrototypeEntriesFound)
        });
    }

    const page: number = NumberHelper.clamp(interaction.options.getInteger("page") ?? 1, 1, Math.ceil(res.size / 20));

    const onPageChange: OnButtonPageChange = async (options, page, entries: PrototypePP[]) => {
        const longestUsernameLength: number = Math.max(
            ...entries.slice(20 * (page - 1), 20 + 20 * (page - 1))
                .map(v => StringHelper.getUnicodeStringLength(v.username.trim())),
            16
        );

        let output: string = `${"#".padEnd(4)} | ${"Username".padEnd(longestUsernameLength)} | ${"UID".padEnd(6)} | PP\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: PrototypePP = entries[i];

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username.trim().padEnd(longestUsernameLength)} | ${player.uid.toString().padEnd(6)} | ${player.pptotal.toFixed(2)}`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(longestUsernameLength)} | ${"-".padEnd(6)} | -`;
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
    permissions: []
};