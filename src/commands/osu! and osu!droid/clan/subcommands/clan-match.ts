import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    if (
        !(<GuildMember>interaction.member).roles.cache.find(
            (r) => r.name === "Referee"
        ) ||
        !staffMembers.get(interaction.user.id)
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
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
            content: MessageCreator.createReject(clanStrings.clanDoesntExist),
        });
    }

    clan.setMatchMode(isMatch);

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.setClanMatchModeFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.setClanMatchModeSuccess
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
