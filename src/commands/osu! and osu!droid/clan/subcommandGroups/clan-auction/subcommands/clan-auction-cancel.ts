import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const auction: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (!auction) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("auctionDoesntExist")
            ),
        });
    }

    if (auction.bids.size > 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanAuctionHasBeenBid")
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(
            auction.auctioneer
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
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

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("clanAuctionCancelConfirmation")
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    const powerup: PowerupType = auction.powerup;

    ++clan.powerups.get(powerup)!.amount;

    const cancelResult: OperationResult =
        await DatabaseManager.aliceDb.collections.clanAuction.delete({
            name: name,
        });

    if (!cancelResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("acceptClanInvitationFailed"),
                cancelResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanAuctionCancelFailed"),
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("clanAuctionCancelSuccessful")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
