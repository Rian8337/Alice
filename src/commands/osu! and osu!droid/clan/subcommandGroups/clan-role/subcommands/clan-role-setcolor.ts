import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ColorResolvable, Role } from "discord.js";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const color: string = interaction.options.getString("color") ?? "DEFAULT";

    if (
        interaction.options.getString("color") &&
        !StringHelper.isValidHexCode(color)
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("invalidClanRoleHexCode")
            ),
        });
    }

    // Restrict reserved role color for admin/mod/helper/ref
    if (["#3498DB", "#9543BA", "#FFD78C", "#4C6876"].includes(color)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanRoleHexCodeIsRestricted")
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("selfIsNotInClan")),
        });
    }

    if (!clan.roleColorUnlocked) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("roleColorIsNotUnlocked")
            ),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntHaveClanRole")
            ),
        });
    }

    await clanRole.setColor(<ColorResolvable>color);

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("changeRoleColorSuccessful")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
