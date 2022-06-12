import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePPCollectionManager } from "@alice-database/managers/aliceDb/PrototypePPCollectionManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageAttachment, Snowflake } from "discord.js";
import { PrototypecheckLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project and Ranked Score Project/prototypecheck/PrototypecheckLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: PrototypecheckLocalization =
        new PrototypecheckLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

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
        case !!discordid:
            ppInfo = await dbManager.getFromUser(discordid!);
            break;
        default:
            // If no arguments are specified, default to self
            ppInfo = await dbManager.getFromUser(interaction.user);
    }

    if (!ppInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    !!uid || !!username || !!discordid
                        ? "userInfoNotAvailable"
                        : "selfInfoNotAvailable"
                )
            ),
        });
    }

    let csvString: string =
        'UID,Username,"Total PP","Previous Total PP",Diff,"Last Update"\n';

    csvString += `${ppInfo.uid},${ppInfo.username},${ppInfo.pptotal.toFixed(
        2
    )},${ppInfo.prevpptotal.toFixed(2)},${(
        ppInfo.pptotal - ppInfo.prevpptotal
    ).toFixed(2)},"${new Date(ppInfo.lastUpdate).toUTCString()}"\n\n`;

    csvString +=
        '"Map Name",Mods,Combo,Accuracy,Misses,"Live PP","Local PP",Diff\n';

    for (const pp of ppInfo.pp.values()) {
        let modstring = pp.mods ? `${pp.mods}` : "NM";
        if (pp.forcedAR || (pp.speedMultiplier && pp.speedMultiplier !== 1)) {
            if (pp.mods) {
                modstring += " ";
            }

            modstring += "(";

            if (pp.forcedAR) {
                modstring += `AR${pp.forcedAR}`;
            }

            if (pp.speedMultiplier && pp.speedMultiplier !== 1) {
                if (pp.forcedAR) {
                    modstring += ", ";
                }

                modstring += `${pp.speedMultiplier}x`;
            }

            modstring += ")";
        }

        csvString += `"${pp.title}","${modstring}",${pp.combo},${pp.accuracy},${
            pp.miss
        },${pp.prevPP},${pp.pp},${(pp.pp - pp.prevPP).toFixed(2)}\n`;
    }

    const attachment: MessageAttachment = new MessageAttachment(
        Buffer.from(csvString),
        `prototype_${ppInfo.uid}_${new Date().toUTCString()}.csv`
    );

    InteractionHelper.reply(interaction, {
        files: [attachment],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
