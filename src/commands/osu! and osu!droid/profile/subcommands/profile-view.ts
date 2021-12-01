import { Snowflake } from "discord.js";
import { Player } from "osu-droid";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { profileStrings } from "../profileStrings";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";

export const run: Subcommand["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.tooManyOptions),
        });
    }

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | undefined;

    switch (true) {
        case !!uid:
            player = await Player.getInformation({ uid: uid! });
            uid = player.uid;
            if (!uid) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        profileStrings.profileNotFound,
                        "the player's"
                    ),
                });
            }
            break;
        case !!username:
            player = await Player.getInformation({ username: username! });
            uid = player.uid;
            if (!uid) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        profileStrings.profileNotFound,
                        "the player's"
                    ),
                });
            }
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);
            uid = bindInfo?.uid;
            if (!uid) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.userNotBindedReject
                    ),
                });
            }
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);
            uid = bindInfo?.uid;
            if (!uid) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        Constants.selfNotBindedReject
                    ),
                });
            }
    }

    player ??= await Player.getInformation({ uid: uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                profileStrings.profileNotFound,
                uid || username || discordid ? "that account's" : "your"
            ),
        });
    }

    const profileImage: Buffer = (await ProfileManager.getProfileStatistics(
        uid,
        player,
        bindInfo,
        undefined,
        undefined,
        (interaction.options.getString("type") ?? "simplified") === "detailed"
    ))!;

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.viewingProfile,
            player.username,
            ProfileManager.getProfileLink(player.uid).toString()
        ),
        files: [profileImage],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
