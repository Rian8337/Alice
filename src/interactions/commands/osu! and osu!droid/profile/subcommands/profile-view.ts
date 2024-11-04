import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Constants } from "@core/Constants";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ProfileManager } from "@utils/managers/ProfileManager";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { createHash } from "crypto";
import { StringHelper } from "@utils/helpers/StringHelper";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { OfficialDatabaseUser } from "@database/official/schema/OfficialDatabaseUser";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new ProfileLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
            ),
        });
    }

    await InteractionHelper.deferReply(
        interaction,
        interaction.options.getBoolean("showhashedemail") ?? false,
    );

    const discordid = interaction.options.getUser("user")?.id;
    let uid = interaction.options.getInteger("uid");
    const username = interaction.options.getString("username");

    const dbManager = DatabaseManager.elainaDb.collections.userBind;
    let bindInfo: UserBind | null = null;
    let player:
        | Pick<
              OfficialDatabaseUser,
              | "id"
              | "username"
              | "score"
              | "playcount"
              | "accuracy"
              | "region"
              | "email"
              | "pp"
          >
        | Player
        | null = null;

    switch (true) {
        case !!uid:
            player = await DroidHelper.getPlayer(uid!, [
                "id",
                "username",
                "score",
                "playcount",
                "accuracy",
                "region",
                "email",
                "pp",
            ]);

            uid ??=
                (player instanceof Player ? player.uid : player?.id) ?? null;

            if (!uid) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userProfileNotFound"),
                    ),
                });
            }

            break;
        case !!username:
            if (!StringHelper.isUsernameValid(username)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userProfileNotFound"),
                    ),
                });
            }

            player = await DroidHelper.getPlayer(username, [
                "id",
                "username",
                "score",
                "playcount",
                "accuracy",
                "region",
                "email",
                "pp",
            ]);

            uid ??=
                (player instanceof Player ? player.uid : player?.id) ?? null;

            if (!uid) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userProfileNotFound"),
                    ),
                });
            }
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                        pptotal: 1,
                        clan: 1,
                        weightedAccuracy: 1,
                    },
                },
            );

            uid = bindInfo?.uid ?? null;

            if (!uid) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language,
                        ).getTranslation(
                            discordid
                                ? Constants.userNotBindedReject
                                : Constants.selfNotBindedReject,
                        ),
                    ),
                });
            }
    }

    player ??= await DroidHelper.getPlayer(uid, [
        "id",
        "username",
        "score",
        "playcount",
        "accuracy",
        "region",
        "email",
        "pp",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || username || discordid
                        ? "userProfileNotFound"
                        : "selfProfileNotFound",
                ),
            ),
        });
    }

    const profileImage = (await ProfileManager.getProfileStatistics(
        uid,
        player,
        bindInfo,
        undefined,
        (interaction.options.getString("type") ?? "simplified") === "detailed",
        localization.language,
    ))!;

    if (
        interaction.options.getBoolean("showhashedemail") &&
        (interaction.user.id === bindInfo?.discordid ||
            // Allow global moderators to see hashed email
            (interaction.inCachedGuild() &&
                interaction.member.roles.cache.has("803154670380908575")))
    ) {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("viewingProfileWithEmail"),
                `${player.username} (${uid})`,
                ProfileManager.getProfileLink(uid).toString(),
                createHash("md5").update(player.email).digest("hex"),
            ),
            files: [profileImage],
        });
    } else {
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("viewingProfile"),
                `${player.username} (${uid})`,
                ProfileManager.getProfileLink(uid).toString(),
            ),
            files: [profileImage],
        });
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
