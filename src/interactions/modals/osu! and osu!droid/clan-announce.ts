import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { ModalCommand } from "structures/core/ModalCommand";
import { ClanAnnounceLocalization } from "@alice-localization/interactions/modals/osu! and osu!droid/clan-announce/ClanAnnounceLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Role } from "discord.js";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization: ClanAnnounceLocalization = new ClanAnnounceLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const announcementMessage: string =
        interaction.fields.getTextInputValue("message");

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
            ),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return InteractionHelper.reply(interaction, {
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
