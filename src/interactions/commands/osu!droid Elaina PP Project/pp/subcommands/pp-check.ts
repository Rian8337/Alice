import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DatabaseUserBind } from "structures/database/elainaDb/DatabaseUserBind";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { FindOptions } from "mongodb";

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

    const dbManager = DatabaseManager.elainaDb.collections.userBind;

    let playerInfo: UserBind | null;

    const findOptions: FindOptions<DatabaseUserBind> = {
        projection: {
            _id: 0,
            dppRecalcComplete: 1,
            uid: 1,
            username: 1,
            playc: 1,
            pp: 1,
            pptotal: 1,
        },
    };

    switch (true) {
        case !!uid:
            playerInfo = await dbManager.getFromUid(uid!, findOptions);
            break;
        case !!username:
            playerInfo = await dbManager.getFromUsername(
                username!,
                findOptions,
            );
            break;
        default:
            // If no arguments are specified, default to self
            playerInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                findOptions,
            );
    }

    if (!playerInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    uid || username || discordid
                        ? Constants.userNotBindedReject
                        : Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    DPPHelper.displayDPPList(
        interaction,
        playerInfo,
        interaction.options.getInteger("page") ?? 1,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 10,
};
