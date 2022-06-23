import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePPCollectionManager } from "@alice-database/managers/aliceDb/PrototypePPCollectionManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { RecalcLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: RecalcLocalization = new RecalcLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const dbManager: PrototypePPCollectionManager =
        DatabaseManager.aliceDb.collections.prototypePP;

    let calculatedCount: number = 0;

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcInProgress")
        ),
    });

    if (interaction.options.getBoolean("resetprogress")) {
        await dbManager.updateMany({}, { $set: { scanDone: false } });
    }

    let player: PrototypePP | undefined;

    while ((player = (await dbManager.getUnscannedPlayers(1)).first())) {
        client.logger.info(`Now calculating ID ${player.discordid}`);

        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                player.discordid,
                {
                    projection: {
                        _id: 0,
                        pp: 1,
                        pptotal: 1,
                        previous_bind: 1,
                        uid: 1,
                        username: 1,
                    },
                }
            );

        if (!bindInfo) {
            await dbManager.deleteOne({ discordid: player.discordid });
            continue;
        }

        await bindInfo.calculatePrototypeDPP();

        client.logger.info(`${++calculatedCount} players recalculated`);
    }

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcSuccess"),
            interaction.user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
