import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";

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
            upkeep.toLocaleString(),
            DateTimeFormatHelper.dateToLocaleString(
                new Date(clan.weeklyfee * 1000),
                localization.language
            ),
            totalUpkeep.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
