import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Role } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const iconURL: string | null = interaction.options.getString("iconurl");

    const clan: Clan | null = await DatabaseManager.elainaDb.collections.clan.getFromUser(interaction.user);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan)
        });
    }

    if (!clan.roleIconUnlocked) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.roleIconIsNotUnlocked)
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfHasNoAdministrativePermission)
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDoesntHaveClanRole)
        });
    }

    await clanRole.setIcon(iconURL);

    interaction.editReply({
        content: MessageCreator.createAccept(clanStrings.changeRoleIconSuccessful)
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};