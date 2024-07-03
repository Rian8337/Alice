import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { AttachmentBuilder } from "discord.js";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new PPLocalization(
        CommandHelper.getLocale(interaction),
    );

    const discordid = interaction.options.getUser("user")?.id;
    const uid = interaction.options.getInteger("uid");
    const username = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
            ),
        });
    }

    const dbManager = DatabaseManager.aliceDb.collections.prototypePP;
    const reworkType = interaction.options.getString("rework") ?? "overall";

    let ppInfo: PrototypePP | null;

    switch (true) {
        case !!uid:
            ppInfo = await dbManager.getFromUid(uid!, reworkType);
            break;
        case !!username:
            ppInfo = await dbManager.getFromUsername(username!, reworkType);
            break;
        default:
            // If no arguments are specified, default to self
            ppInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                reworkType,
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
        },${pp.accuracy},${pp.miss},${pp.prevPP},${pp.pp},${(
            pp.pp - pp.prevPP
        ).toFixed(2)}\n`;
    }

    const attachment = new AttachmentBuilder(Buffer.from(csvString), {
        name: `prototype_${ppInfo.uid}_${new Date().toUTCString()}.csv`,
    });

    InteractionHelper.reply(interaction, {
        files: [attachment],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
