import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePPCollectionManager } from "@alice-database/managers/aliceDb/PrototypePPCollectionManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { AttachmentBuilder, Snowflake } from "discord.js";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: PPLocalization = new PPLocalization(
        await CommandHelper.getLocale(interaction),
    );

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
            ),
        });
    }

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    const dbManager: PrototypePPCollectionManager =
        DatabaseManager.aliceDb.collections.prototypePP;

    let ppInfo: PrototypePP | null;

    switch (true) {
        case !!uid:
            ppInfo = await dbManager.getFromUid(uid!);
            break;
        case !!username:
            ppInfo = await dbManager.getFromUsername(username!);
            break;
        default:
            // If no arguments are specified, default to self
            ppInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
            );
    }

    if (!ppInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || username || discordid
                        ? "userInfoNotAvailable"
                        : "selfInfoNotAvailable",
                ),
            ),
        });
    }

    let csvString: string =
        'UID,Username,"Total PP","Previous Total PP",Diff,"Last Update"\n';

    csvString += `${ppInfo.uid},${ppInfo.username},${ppInfo.pptotal.toFixed(
        2,
    )},${ppInfo.prevpptotal.toFixed(2)},${(
        ppInfo.pptotal - ppInfo.prevpptotal
    ).toFixed(2)},"${new Date(ppInfo.lastUpdate).toUTCString()}"\n\n`;

    csvString +=
        '"Map Name",Mods,Combo,Accuracy,Misses,"Live PP","Local PP",Diff\n';

    for (const pp of ppInfo.pp.values()) {
        let modstring = pp.mods ? `${pp.mods}` : "NM";
        if (pp.forceAR || (pp.speedMultiplier && pp.speedMultiplier !== 1)) {
            if (pp.mods) {
                modstring += " ";
            }

            modstring += "(";

            if (pp.forceAR) {
                modstring += `AR${pp.forceAR}`;
            }

            if (pp.speedMultiplier && pp.speedMultiplier !== 1) {
                if (pp.forceAR) {
                    modstring += ", ";
                }

                modstring += `${pp.speedMultiplier}x`;
            }

            modstring += ")";
        }

        csvString += `"${pp.title.replace(/"/g, '""')}","${modstring}",${
            pp.combo
        },${pp.accuracy},${pp.miss},${pp.pp},${pp.pp},0\n`;
    }

    const attachment: AttachmentBuilder = new AttachmentBuilder(
        Buffer.from(csvString),
        { name: `prototype_${ppInfo.uid}_${new Date().toUTCString()}.csv` },
    );

    InteractionHelper.reply(interaction, {
        files: [attachment],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
