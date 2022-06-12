import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
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
        return InteractionHelper.reply(interaction, {
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

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const clanNameLengths: number[] = [];

        for (
            let i = 20 * (page - 1);
            i < Math.min(clans.size, 20 + 20 * (page - 1));
            ++i
        ) {
            clanNameLengths.push(
                StringHelper.getUnicodeStringLength(clans.at(i)!.name.trim())
            );
        }

        const longestNameLength: number = Math.max(...clanNameLengths, 16);

        let output: string = `${"#".padEnd(4)} | ${localization
            .getTranslation("clanName")
            .padEnd(longestNameLength)} | ${localization
            .getTranslation("clanMemberCount")
            .padEnd(7)} | ${localization.getTranslation("clanPower")}\n`;

        for (
            let i = 20 * (page - 1);
            i < Math.min(clans.size, 20 + 20 * (page - 1));
            ++i
        ) {
            const clan: Clan = clans.at(i)!;

            if (clan) {
                output += `${(i + 1).toString().padEnd(4)} | ${clan.name
                    .trim()
                    .padEnd(longestNameLength)} | ${clan.member_list.size
                    .toString()
                    .padEnd(6)} | ${clan.power
                    .toLocaleString(
                        LocaleHelper.convertToBCP47(localization.language)
                    )
                    .padEnd(4)}`;
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
        page,
        Math.ceil(clans.size / 20),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
