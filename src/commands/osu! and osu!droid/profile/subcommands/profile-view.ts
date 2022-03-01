import { Snowflake } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ProfileLocalization = new ProfileLocalization(language);

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
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
                        localization.getTranslation("userProfileNotFound")
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
                        localization.getTranslation("userProfileNotFound")
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
                        new ConstantsLocalization(language).getTranslation(
                            Constants.userNotBindedReject
                        )
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
                localization.getTranslation(
                    uid || username || discordid
                        ? "userProfileNotFound"
                        : "selfProfileNotFound"
                )
            ),
        });
    }

    const profileImage: Buffer = (await ProfileManager.getProfileStatistics(
        uid,
        player,
        bindInfo,
        undefined,
        undefined,
        (interaction.options.getString("type") ?? "simplified") === "detailed",
        language
    ))!;

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("viewingProfile"),
            player.username,
            ProfileManager.getProfileLink(player.uid).toString()
        ),
        files: [profileImage],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
