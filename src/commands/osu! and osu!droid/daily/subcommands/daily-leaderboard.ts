import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const allPlayers: Collection<number, PlayerInfo> =
        await DatabaseManager.aliceDb.collections.playerInfo.get(
            "uid",
            {},
            { projection: { _id: 0, uid: 1, points: 1, username: 1 } }
        );

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(allPlayers.size / 20)
    );

    allPlayers.sort((a, b) => {
        return b.points - a.points;
    });

    const onPageChange: OnButtonPageChange = async (
        options,
        page,
        entries: PlayerInfo[]
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
        )} | ${"UID".padEnd(6)} | Points\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: PlayerInfo = entries[i];

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                    .toString()
                    .padEnd(6)} | ${player.points.toLocaleString()}`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(
                    longestUsernameLength
                )} | ${"-".padEnd(6)} | ${"-".padEnd(4)}`;
            }

            output += "\n";
        }

        options.content = "```c\n" + output + "```";
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        [...allPlayers.values()],
        20,
        page,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
