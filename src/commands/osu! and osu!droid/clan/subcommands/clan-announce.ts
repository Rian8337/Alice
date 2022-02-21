import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Role } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(await CommandHelper.getLocale(interaction));

    const announcementMessage: string = interaction.options.getString(
        "message",
        true
    );

    if (announcementMessage.length > 1750) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("announcementMessageTooLong")
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

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("announcementMessageConfirmation")
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    let finalMessage: string = "";

    const clanRole: Role | undefined = interaction.guild!.roles.cache.find(
        (r) => r.name === clan.name
    );

    if (clanRole) {
        finalMessage += clanRole.toString();
    } else {
        finalMessage += clan.member_list.map((v) => `<@${v.id}>`).join("");
    }

    finalMessage += `\n\n${announcementMessage}\n\n- ${interaction.user}`;

    interaction.followUp({
        content: finalMessage,
        allowedMentions: {
            parse: ["everyone"],
        },
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
