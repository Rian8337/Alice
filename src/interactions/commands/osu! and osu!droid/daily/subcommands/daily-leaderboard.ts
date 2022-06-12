import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const players: Collection<number, PlayerInfo> =
        await DatabaseManager.aliceDb.collections.playerInfo.get(
            "uid",
            {},
            { projection: { _id: 0, uid: 1, points: 1, username: 1 } }
        );

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(players.size / 20)
    );

    players.sort((a, b) => {
        return b.points - a.points;
    });

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const usernameLengths: number[] = [];

        for (
            let i = 20 * (page - 1);
            i < Math.min(players.size, 20 + 20 * (page - 1));
            ++i
        ) {
            usernameLengths.push(
                StringHelper.getUnicodeStringLength(
                    players.at(i)!.username.trim()
                )
            );
        }

        const longestUsernameLength: number = Math.max(...usernameLengths, 16);

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("username")
            .padEnd(longestUsernameLength)} | ${localization
            .getTranslation("uid")
            .padEnd(6)} | ${localization.getTranslation("points")}\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: PlayerInfo | undefined = players.at(i);

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                    .toString()
                    .padEnd(6)} | ${player.points.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}`;
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
        page,
        Math.ceil(players.size / 20),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
