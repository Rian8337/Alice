import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    if (
        !(<GuildMember>interaction.member).roles.cache.find(
            (r) => r.name === "Referee"
        ) ||
        !staffMembers.get(interaction.user.id)
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(new ConstantsLocalization(language).getTranslation(Constants.noPermissionReject)),
        });
    }

    const name: string = interaction.options.getString("name", true);

    const isMatch: boolean = interaction.options.getBoolean(
        "ismatchmode",
        true
    );

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(name);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("clanDoesntExist")),
        });
    }

    clan.setMatchMode(isMatch);

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("setClanMatchModeFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("setClanMatchModeSuccess")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
