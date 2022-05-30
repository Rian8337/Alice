import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const amount: number = interaction.options.getInteger("amount", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(name);

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntExist")
            ),
        });
    }

    const incrementResult: OperationResult = clan.incrementPower(
        amount,
        localization.language
    );

    if (!incrementResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("modifyClanPowerFailed"),
                incrementResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("modifyClanPowerFailed"),
                finalResult.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("modifyClanPowerSuccessful")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
