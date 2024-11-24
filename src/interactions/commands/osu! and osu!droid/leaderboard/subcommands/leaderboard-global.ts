import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { Collection } from "discord.js";
import { LeaderboardLocalization } from "@localization/interactions/commands/osu! and osu!droid/leaderboard/LeaderboardLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { OnlinePlayerRank } from "@structures/utils/OnlinePlayerRank";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new LeaderboardLocalization(
        CommandHelper.getLocale(interaction),
    );
    const BCP47 = LocaleHelper.convertToBCP47(localization.language);

    const page = interaction.options.getInteger("page") ?? 1;

    if (!NumberHelper.isPositive(page)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidPage"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const leaderboardCache = new Collection<number, OnlinePlayerRank[]>();

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const actualPage = Math.floor((page - 1) / 5);
        const pageRemainder = (page - 1) % 5;

        const ranks =
            leaderboardCache.get(actualPage) ??
            (await DroidHelper.getGlobalLeaderboard(actualPage + 1));

        if (!leaderboardCache.has(actualPage)) {
            leaderboardCache.set(actualPage, ranks);
        }

        const longestUsernameLength = Math.max(
            ...ranks
                .slice(20 * pageRemainder, 20 + 20 * pageRemainder)
                .map((v) =>
                    StringHelper.getUnicodeStringLength(v.username.trim()),
                ),
            16,
        );

        let output = `${"#".padEnd(4)} | ${localization
            .getTranslation("username")
            .padEnd(longestUsernameLength)} | ${localization
            .getTranslation("uid")
            .padEnd(6)} | ${localization
            .getTranslation("playCount")
            .padEnd(5)} | ${localization.getTranslation(
            "accuracy",
        )} | ${localization.getTranslation("pp")}\n`;

        for (
            let i = 20 * pageRemainder;
            i < Math.min(ranks.length, 20 + 20 * pageRemainder);
            ++i
        ) {
            const c = ranks[i];

            output += `${(actualPage * 100 + i + 1)
                .toString()
                .padEnd(4)} | ${c.username.padEnd(
                longestUsernameLength,
            )} | ${c.id.toString().padEnd(6)} | ${c.playcount.toString().padEnd(5)} | ${(c.accuracy * 100).toLocaleString(BCP47).padEnd(8)} | ${c.pp.toLocaleString(
                BCP47,
            )}\n`;
        }

        options.content = "```c\n" + output + "```";
    };

    MessageButtonCreator.createLimitlessButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        page,
        120,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
