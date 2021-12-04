import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { leaderboardStrings } from "../leaderboardStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Collection } from "discord.js";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";

export const run: Subcommand["run"] = async (_, interaction) => {
    const clan: string = interaction.options.getString("clan")!;

    const res: Collection<string, UserBind> =
        await DatabaseManager.elainaDb.collections.userBind.getDPPLeaderboard(
            clan
        );

    if (res.size === 0 && clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                leaderboardStrings.dppLeaderboardClanNotFound
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20)
    );

    const onPageChange: OnButtonPageChange = async (
        options,
        page,
        entries: UserBind[]
    ) => {
        const longestUsernameLength: number = Math.max(
            ...entries
                .slice(20 * (page - 1), 20 + 20 * (page - 1))
                .map((v) =>
                    StringHelper.getUnicodeStringLength(v.username.trim())
                ),
            16
        );

        let output: string = `${"#".padEnd(4)} | ${"Username".padEnd(
            longestUsernameLength
        )} | ${"UID".padEnd(6)} | ${"Play".padEnd(4)} | PP\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: UserBind = entries[i];

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
