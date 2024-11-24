import { DatabaseManager } from "@database/DatabaseManager";
import { ModalCommand } from "structures/core/ModalCommand";
import { ClanAnnounceLocalization } from "@localization/interactions/modals/osu! and osu!droid/clan-announce/ClanAnnounceLocalization";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { userMention } from "discord.js";

export const run: ModalCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new ClanAnnounceLocalization(
        CommandHelper.getLocale(interaction),
    );

    const announcementMessage = interaction.fields.getTextInputValue("message");

    const clan = await DatabaseManager.elainaDb.collections.clan.getFromUser(
        interaction.user,
    );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan"),
            ),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    "selfHasNoAdministrativePermission",
                ),
            ),
        });
    }

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("announcementMessageConfirmation"),
            ),
        },
        [interaction.user.id],
        20,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    let finalMessage = "";

    const clanRole = interaction.guild.roles.cache.find(
        (r) => r.name === clan.name,
    );

    if (clanRole) {
        finalMessage += clanRole.toString();
    } else {
        finalMessage += clan.member_list.map((v) => userMention(v.id)).join("");
    }

    finalMessage += `\n\n${announcementMessage}\n\n- ${interaction.user}`;

    interaction.followUp({
        content: finalMessage,
        allowedMentions: {
            parse: ["everyone"],
        },
    });
};
