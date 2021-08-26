import { Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { profileStrings } from "../../profileStrings";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";

export const run: Subcommand["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined = interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

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

    if (username) {
        return interaction.editReply({
            content: MessageCreator.createAccept(
                profileStrings.bindInfo, `Username ${username}`, bindInfo ? `binded to user ID ${bindInfo.discordid}` : "not binded"
            )
        });
    }

    if (uid) {
        return interaction.editReply({
            content: MessageCreator.createAccept(
                profileStrings.bindInfo, `Uid ${uid}`, bindInfo ? `binded to user ID ${bindInfo.discordid}` : "not binded"
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.bindInfo, `User ID ${discordid}`, bindInfo ? "binded" : "not binded"
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};