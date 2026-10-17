import { DatabaseManager } from "@database/DatabaseManager";
import { PrototypePP } from "@database/utils/aliceDb/PrototypePP";
import { Modes } from "@rian8337/osu-base";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { RecalcLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { consola } from "consola";
import { PPVariantManager } from "@utils/managers/PPVariantManager";
import { PrototypeRecalculationManager } from "@utils/managers/PrototypeRecalculationManager";
import { DefaultPPVariants } from "@utils/pp/DefaultPPVariants";
import { checkVariant, variantRejectionKey } from "@utils/pp/variantChoice";
import { createVariantRejection } from "@utils/pp/variantRejection";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.channel?.isSendable()) {
        return;
    }

    const localization = new RecalcLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const prototypeDbManager = DatabaseManager.aliceDb.collections.prototypePP;

    let calculatedCount = 0;

    let player: PrototypePP | undefined;

    const actingUid = await PPVariantManager.getActingUid(interaction.user);
    const variantName =
        interaction.options.getString("variant") ??
        DefaultPPVariants.droidRebalance;

    const resolvedVariant = await PPVariantManager.resolve(
        variantName,
        actingUid,
    );
    const variantCheck = checkVariant(resolvedVariant, Modes.Droid);

    const rejection = variantRejectionKey(variantCheck);

    if (rejection) {
        return InteractionHelper.reply(interaction, {
            content: createVariantRejection(
                localization,
                rejection,
                variantName,
                "droid",
            ),
        });
    }

    const variant = resolvedVariant!.name;

    // If the variant has no players yet, clone the players of droid-rebalance to it. Recalculation will be done later
    // down the line.
    if (
        variant !== DefaultPPVariants.droidRebalance &&
        !(await prototypeDbManager.getOne({ reworkType: variant }))
    ) {
        await prototypeDbManager.cloneToVariant(
            DefaultPPVariants.droidRebalance,
            variant,
        );
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcInProgress"),
        ),
    });

    if (interaction.options.getBoolean("resetprogress")) {
        await prototypeDbManager.updateMany(
            { reworkType: variant },
            { $set: { scanDone: false } },
        );
    }

    while (
        (player = (
            await prototypeDbManager.getUnscannedPlayers(1, variant)
        ).first())
    ) {
        consola.info(
            `Now calculating player ${player.uid.toString()} for variant ${variant}`,
        );

        const result = await PrototypeRecalculationManager.calculatePlayer(
            player.uid,
            variant,
            actingUid,
        );

        if (result.failed()) {
            consola.warn(
                `Failed to calculate player ${player.uid.toString()} for variant ${variant}: ${result.reason}`,
            );

            // Mark the player as scanned, otherwise the same player would be picked again forever.
            await prototypeDbManager.updateOne(
                { uid: player.uid, reworkType: variant },
                { $set: { scanDone: true } },
            );
        }

        consola.info(
            `${(++calculatedCount).toString()} players recalculated for variant ${variant}`,
        );
    }

    interaction.channel.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcSuccess"),
            interaction.user.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
