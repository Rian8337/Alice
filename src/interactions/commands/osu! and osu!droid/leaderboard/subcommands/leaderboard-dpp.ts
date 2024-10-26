import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { StringHelper } from "@utils/helpers/StringHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { Collection } from "discord.js";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { LeaderboardLocalization } from "@localization/interactions/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        CommandHelper.getLocale(interaction),
    );

    const clan: string | null = interaction.options.getString("clan");

    await InteractionHelper.deferReply(interaction);

    const res: Collection<number, UserBind> =
        await DatabaseManager.elainaDb.collections.userBind.getDPPLeaderboard(
            clan ?? undefined,
        );

    if (res.size === 0 && clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("dppLeaderboardClanNotFound"),
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(res.size / 20),
    );

    const entries: UserBind[] = [...res.values()];

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const startIndex: number = 20 * (page - 1);
        const usersToDisplay: UserBind[] = entries.slice(
            startIndex,
            20 + startIndex,
        );
        const usernameLengths: number[] = usersToDisplay.map((v) =>
            StringHelper.getUnicodeStringLength(v.username.trim()),
        );

        const longestUsernameLength: number = Math.max(...usernameLengths, 16);

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("username")
            .padEnd(longestUsernameLength)} | ${localization
            .getTranslation("uid")
            .padEnd(6)} | ${localization
            .getTranslation("playCount")
            .padEnd(4)} | ${localization.getTranslation("pp")}\n`;

        for (let i = 0; i < 20; ++i) {
            const player: UserBind | undefined = usersToDisplay[i];

            if (player) {
                output += `${(startIndex + i + 1)
                    .toString()
                    .padEnd(4)} | ${player.username
                    .trim()
                    .padEnd(longestUsernameLength)} | ${player.uid
                    .toString()
                    .padEnd(6)} | ${(player.playc ?? 0)
                    .toString()
                    .padEnd(4)} | ${(player.pptotal ?? 0).toFixed(2)}`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(
                    longestUsernameLength,
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
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
