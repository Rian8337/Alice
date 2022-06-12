import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserContextMenuCommand } from "@alice-interfaces/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { ViewDroidProfileLocalization } from "@alice-localization/interactions/contextmenus/user/viewDroidProfile/ViewDroidProfileLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const localization: ViewDroidProfileLocalization =
        new ViewDroidProfileLocalization(
            await CommandHelper.getLocale(interaction)
        );

    if (interaction.targetUser.bot) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.userNotBindedReject
                )
            ),
        });
    }

    const isSelfExecution: boolean =
        interaction.user.id === interaction.targetUser.id;

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.targetUser
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    isSelfExecution
                        ? Constants.selfNotBindedReject
                        : Constants.userNotBindedReject
                )
            ),
        });
    }

    await InteractionHelper.defer(interaction);

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    isSelfExecution
                        ? "selfProfileNotFound"
                        : "userProfileNotFound"
                )
            ),
        });
    }

    const profileImage: Buffer = (await ProfileManager.getProfileStatistics(
        player.uid,
        player,
        bindInfo,
        undefined,
        undefined,
        false,
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

export const config: UserContextMenuCommand["config"] = {
    name: "View osu!droid Profile",
};
