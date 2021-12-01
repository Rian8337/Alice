import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ColorResolvable, Role } from "discord.js";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const color: string = interaction.options.getString("color") ?? "DEFAULT";

    if (
        interaction.options.getString("color") &&
        !StringHelper.isValidHexCode(color)
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.invalidClanRoleHexCode
            ),
        });
    }

    // Restrict reserved role color for admin/mod/helper/ref
    if (["#3498DB", "#9543BA", "#FFD78C", "#4C6876"].includes(color)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanRoleHexCodeIsRestricted
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (!clan.roleColorUnlocked) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.roleColorIsNotUnlocked
            ),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanDoesntHaveClanRole
            ),
        });
    }

    await clanRole.setColor(<ColorResolvable>color);

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.changeRoleColorSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
