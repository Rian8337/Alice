import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Collection, Snowflake } from "discord.js";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { LeaderboardLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const res: Collection<Snowflake, PrototypePP> =
        await DatabaseManager.aliceDb.collections.prototypePP.getLeaderboard();

    if (res.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noPrototypeEntriesFound")
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20)
    );

    const entries: PrototypePP[] = [...res.values()];

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
            .padEnd(6)} | ${localization.getTranslation("pp")}\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const player: PrototypePP | undefined = entries[i];

            if (player) {
                output += `${(i + 1).toString().padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                    .toString()
                    .padEnd(6)} | ${player.pptotal.toFixed(2)}`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(
                    longestUsernameLength
                )} | ${"-".padEnd(6)} | -`;
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
