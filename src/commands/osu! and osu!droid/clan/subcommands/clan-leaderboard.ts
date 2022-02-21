import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const clans: Collection<string, Clan> =
        await DatabaseManager.elainaDb.collections.clan.get(
            "name",
            {},
            { projection: { _id: 0, name: 1, member_list: 1, power: 1 } }
        );

    if (clans.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noAvailableClans")
            ),
        });
    }

    clans.sort((a, b) => {
        return b.power - a.power;
    });

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(clans.size / 20)
    );

    const onPageChange: OnButtonPageChange = async (
        options,
        page,
        entries: Clan[]
    ) => {
        const longestNameLength: number = Math.max(
            ...entries
                .slice(20 * (page - 1), 20 + 20 * (page - 1))
                .map((v) => StringHelper.getUnicodeStringLength(v.name.trim())),
            16
        );

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("clanName")
            .padEnd(longestNameLength)} | ${localization
            .getTranslation("clanMemberCount")
            .padEnd(7)} | ${localization.getTranslation("clanPower")}\n`;

        for (let i = 20 * (page - 1); i < 20 + 20 * (page - 1); ++i) {
            const clan: Clan = entries[i];

            if (clan) {
                output += `${(i + 1).toString().padEnd(4)} | ${clan.name
                    .trim()
                    .padEnd(longestNameLength)} | ${clan.member_list.size
                    .toString()
                    .padEnd(6)} | ${clan.power.toLocaleString().padEnd(4)}`;
            } else {
                output += `${"-".padEnd(4)} | ${"-".padEnd(
                    longestNameLength
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
        [...clans.values()],
        20,
        page,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
