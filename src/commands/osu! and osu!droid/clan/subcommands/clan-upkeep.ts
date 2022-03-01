import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntExist")
            ),
        });
    }

    const upkeep: number =
        clan.individualUpkeepBaseValue + clan.calculateUpkeep(interaction.user);
    const totalUpkeep: number = clan.calculateOverallUpkeep();

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("clanUpkeepInformation"),
            upkeep.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            ),
            DateTimeFormatHelper.dateToLocaleString(
                new Date(clan.weeklyfee * 1000),
                localization.language
            ),
            totalUpkeep.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
