import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserContextMenuCommand } from "structures/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { ViewDroidProfileLocalization } from "@alice-localization/interactions/contextmenus/user/viewDroidProfile/ViewDroidProfileLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const localization = new ViewDroidProfileLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const isSelfExecution = interaction.user.id === interaction.targetUser.id;

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.targetUser,
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

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    isSelfExecution
                        ? Constants.selfNotBindedReject
                        : Constants.userNotBindedReject,
                ),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player = await DroidHelper.getPlayer(bindInfo.uid, [
        "id",
        "username",
        "score",
        "playcount",
        "accuracy",
        "region",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    isSelfExecution
                        ? "selfProfileNotFound"
                        : "userProfileNotFound",
                ),
            ),
        });
    }

    const profileImage = (await ProfileManager.getProfileStatistics(
        bindInfo.uid,
        player,
        bindInfo,
        undefined,
        false,
        localization.language,
    ))!;

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("viewingProfile"),
            `${player.username} (${bindInfo.uid})`,
            ProfileManager.getProfileLink(bindInfo.uid).toString(),
        ),
        files: [profileImage],
    });
};

export const config: UserContextMenuCommand["config"] = {
    name: "View osu!droid Profile",
    replyEphemeral: true,
};
