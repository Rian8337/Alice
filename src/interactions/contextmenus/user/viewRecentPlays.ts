import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserContextMenuCommand } from "@alice-interfaces/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { ViewRecentPlaysLocalization } from "@alice-localization/interactions/contextmenus/user/viewRecentPlays/ViewRecentPlaysLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const localization: ViewRecentPlaysLocalization =
        new ViewRecentPlaysLocalization(
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

    await InteractionHelper.deferReply(interaction);

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    if (!player) {
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

    ScoreDisplayHelper.showRecentPlays(interaction, player);
};

export const config: UserContextMenuCommand["config"] = {
    name: "View Recent Plays",
    replyEphemeral: true,
};
