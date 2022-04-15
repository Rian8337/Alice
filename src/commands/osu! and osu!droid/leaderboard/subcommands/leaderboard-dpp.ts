import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Collection } from "discord.js";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { LeaderboardLocalization } from "@alice-localization/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const clan: string = interaction.options.getString("clan")!;

    const res: Collection<string, UserBind> =
        await DatabaseManager.elainaDb.collections.userBind.getDPPLeaderboard(
            clan
        );

    if (res.size === 0 && clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("dppLeaderboardClanNotFound")
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20)
    );

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const usernameLengths: number[] = [];

        for (
            let i = 20 * (page - 1);
            i < Math.min(res.size, 20 + 20 * (page - 1));
            ++i
        ) {
            usernameLengths.push(
                StringHelper.getUnicodeStringLength(res.at(i)!.username.trim())
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
            const player: UserBind | undefined = res.at(i);

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

export const config: Subcommand["config"] = {
    permissions: [],
};
