import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { LeaderboardLocalization } from "@alice-localization/commands/osu! and osu!droid/LeaderboardLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

/**
 * Retrieves the global leaderboard.
 *
 * @param page The page to retrieve.
 * @returns The scores at that page.
 */
async function retrieveLeaderboard(page: number): Promise<string[]> {
    const apiRequestBuilder = new DroidAPIRequestBuilder()
        .setEndpoint("top.php")
        .addParameter("page", page);

    const result = await apiRequestBuilder.sendRequest();

    if (result.statusCode !== 200) {
        return [];
    }

    const data: string = result.data.toString("utf-8");
    const content: string[] = data.split("<br>");
    content.shift();

    return content;
}

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: LeaderboardLocalization = new LeaderboardLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const page: number = interaction.options.getInteger("page") ?? 1;

    if (!NumberHelper.isPositive(page)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("invalidPage")
            ),
        });
    }

    const leaderboardCache: Collection<number, string[]> = new Collection();

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const actualPage: number = Math.floor((page - 1) / 5);

        const pageRemainder: number = (page - 1) % 5;

        const scores: string[] =
            leaderboardCache.get(actualPage) ??
            (await retrieveLeaderboard(actualPage));

        if (!leaderboardCache.has(actualPage)) {
            leaderboardCache.set(actualPage, scores);
        }

        const longestUsernameLength: number = Math.max(
            ...scores
                .slice(20 * pageRemainder, 20 + 20 * pageRemainder)
                .map((v) => StringHelper.getUnicodeStringLength(v[1].trim())),
            16
        );

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("username")
            .padEnd(longestUsernameLength)} | ${localization
            .getTranslation("uid")
            .padEnd(6)} | ${localization
            .getTranslation("playCount")
            .padEnd(5)} | ${localization.getTranslation(
            "accuracy"
        )} | ${localization.getTranslation("score")}\n`;

        for (
            let i = 20 * pageRemainder;
            i < Math.min(scores.length, 20 + 20 * pageRemainder);
            ++i
        ) {
            const c: string[] = scores[i].split(" ");

            c.splice(1, 1);

            output += `${(actualPage * 100 + i + 1)
                .toString()
                .padEnd(4)} | ${c[1].padEnd(
                longestUsernameLength
            )} | ${c[0].padEnd(6)} | ${c[4].padEnd(5)} | ${(
                (parseInt(c[5]) / parseInt(c[4]) / 1000).toFixed(2) + "%"
            ).padEnd(8)} | ${parseInt(c[3]).toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )}\n`;
        }

        options.content = "```c\n" + output + "```";
    };

    MessageButtonCreator.createLimitlessButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        [],
        page,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
