import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDoesntExist),
        });
    }

    const upkeep: number =
        clan.individualUpkeepBaseValue + clan.calculateUpkeep(interaction.user);
    const totalUpkeep: number = clan.calculateOverallUpkeep();

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.clanUpkeepInformation,
            clan.upkeepBaseValue % clan.member_list.size
                ? `somewhere between ${upkeep.toLocaleString()}-${(
                      upkeep + 1
                  ).toLocaleString()}`
                : upkeep.toLocaleString(),
            new Date(clan.weeklyfee * 1000).toUTCString(),
            totalUpkeep.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
