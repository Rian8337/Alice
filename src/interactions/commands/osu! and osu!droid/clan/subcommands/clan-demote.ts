import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const toDemote: User = interaction.options.getUser("member", true);

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

    if (!clan.isLeader(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    if (!clan.member_list.has(toDemote.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotInExecutorClan")
            ),
        });
    }

    if (!clan.hasAdministrativePower(toDemote)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotCoLeader")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("demoteMemberConfirmation")
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    clan.member_list.get(toDemote.id)!.hasPermission = false;

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("demoteMemberFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("demoteMemberSuccessful")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
