import { Snowflake } from "discord.js";
import { Player } from "osu-droid";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { profileStrings } from "../../profileStrings";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";

export const run: Subcommand["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined = interaction.options.getUser("user")?.id;
    let uid: number | null = interaction.options.getInteger("uid");
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

    if (!uid) {
        if (!bindInfo) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    uid || username || discordid ? Constants.userNotBindedReject : Constants.selfNotBindedReject
                )
            });
        }

        uid = bindInfo.uid;
    }

    const pickedChoice: string | undefined = await SelectMenuCreator.createSelectMenu(
        interaction,
        "Choose the type of profile to view.",
        [
            {
                label: "Simplified Profile",
                value: "simplified",
                description: "View the simplified version."
            },
            {
                label: "Detailed Profile",
                value: "detailed",
                description: "View the detailed version."
            }
        ],
        [interaction.user.id],
        20
    );

    const player: Player = await Player.getInformation({ uid: uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                profileStrings.profileNotFound, uid || username || discordid ? "that account's" : "your"
            )
        });
    }

    const profileImage: Buffer = (await ProfileManager.getProfileStatistics(uid, player, bindInfo, undefined, undefined, pickedChoice === "detailed"))!;

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.viewingProfile, player.username, ProfileManager.getProfileLink(player.uid).toString()
        ),
        files: [profileImage]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};