import { Snowflake } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | null = null;

    switch (true) {
        case !!uid:
            player = await Player.getInformation(uid!);

            uid ??= player?.uid;

            if (!uid) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userProfileNotFound")
                    ),
                });
            }

            break;
        case !!username:
            player = await Player.getInformation(username!);

            uid ??= player?.uid;

            if (!uid) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userProfileNotFound")
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
                }
            );

            uid = bindInfo?.uid;

            if (!uid) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        new ConstantsLocalization(
                            localization.language
                        ).getTranslation(
                            discordid
                                ? Constants.userNotBindedReject
                                : Constants.selfNotBindedReject
                        )
                    ),
                });
            }
    }

    player ??= await Player.getInformation(uid);

    if (!player) {
        return InteractionHelper.reply(interaction, {
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
        (interaction.options.getString("type") ?? "simplified") === "detailed",
        localization.language
    ))!;

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("viewingProfile"),
            player.username,
            ProfileManager.getProfileLink(player.uid).toString()
        ),
        files: [profileImage],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
