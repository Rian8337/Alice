import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { RecalcLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { consola } from "consola";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization = new RecalcLocalization(
        CommandHelper.getLocale(interaction),
    );

    const prototypeDbManager = DatabaseManager.aliceDb.collections.prototypePP;
    const prototypeTypeDbManager =
        DatabaseManager.aliceDb.collections.prototypePPType;

    let calculatedCount = 0;

    let player: PrototypePP | undefined;
    const reworkType = interaction.options.getString("reworktype", true);

    // If rework doesn't exist in the database, a name must be supplied.
    if (!(await prototypeTypeDbManager.reworkTypeExists(reworkType))) {
        const reworkName = interaction.options.getString("reworkname");

        if (!reworkName) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("reworkNameMissing"),
                ),
            });
        }

        await prototypeTypeDbManager.insert({
            name: reworkName,
            type: reworkType,
        });

        // New rework - clone overall reworks to this rework for now. Recalculation will be done later down the line.
        await prototypeDbManager.cloneOverallToRework(reworkType);
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcInProgress"),
        ),
    });

    if (interaction.options.getBoolean("resetprogress")) {
        await prototypeDbManager.updateMany({}, { $set: { scanDone: false } });
    }

    while (
        (player = (
            await prototypeDbManager.getUnscannedPlayers(1, reworkType)
        ).first())
    ) {
        consola.info(
            `Now calculating ID ${player.discordid} for rework ${reworkType}`,
        );

        const bindInfo =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                player.discordid,
                {
                    projection: {
                        _id: 0,
                        discordid: 1,
                        pp: 1,
                        playc: 1,
                        pptotal: 1,
                        previous_bind: 1,
                        uid: 1,
                        username: 1,
                    },
                },
            );

        if (!bindInfo) {
            await prototypeDbManager.deleteOne({ discordid: player.discordid });
            continue;
        }

        await bindInfo.calculatePrototypeDPP(reworkType);

        consola.info(
            `${++calculatedCount} players recalculated for rework ${reworkType}`,
        );
    }

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcSuccess"),
            interaction.user.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
