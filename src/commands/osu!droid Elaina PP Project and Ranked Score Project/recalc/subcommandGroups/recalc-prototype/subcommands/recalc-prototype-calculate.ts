import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Snowflake } from "discord.js";
import { recalcStrings } from "../../../recalcStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(recalcStrings.tooManyOptions),
        });
    }

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null;

    switch (true) {
        case !!uid:
            bindInfo = await dbManager.getFromUid(uid!);
            break;
        case !!username:
            bindInfo = await dbManager.getFromUsername(username!);
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);
    }

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                !!uid || !!username || !!discordid
                    ? Constants.userNotBindedReject
                    : Constants.selfNotBindedReject
            ),
        });
    }

    await interaction.editReply({
        content: MessageCreator.createAccept(recalcStrings.recalcInProgress),
    });

    await bindInfo.calculatePrototypeDPP();

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            recalcStrings.fullRecalcSuccess,
            interaction.user.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
