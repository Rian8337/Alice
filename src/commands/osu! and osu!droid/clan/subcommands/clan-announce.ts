import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Role } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const announcementMessage: string = interaction.options.getString(
        "message",
        true
    );

    if (announcementMessage.length > 1750) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.announcementMessageTooLong
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

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.announcementMessageConfirmation
            ),
        },
        [interaction.user.id],
        20
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
