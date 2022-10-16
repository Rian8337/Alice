import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    if (
        !(<GuildMember>interaction.member).roles.cache.find(
            (r) => r.name === "Referee"
        ) ||
        !staffMembers.get(interaction.user.id)
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.noPermissionReject
                )
            ),
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntExist")
            ),
        });
    }

    clan.setMatchMode(isMatch);

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setClanMatchModeFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setClanMatchModeSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
