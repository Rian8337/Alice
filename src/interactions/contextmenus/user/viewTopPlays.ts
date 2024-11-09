import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { UserContextMenuCommand } from "structures/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { PPHelper } from "@utils/helpers/PPHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { ViewTopPlaysLocalization } from "@localization/interactions/contextmenus/user/viewTopPlays/ViewTopPlaysLocalization";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const localization = new ViewTopPlaysLocalization(
        CommandHelper.getLocale(interaction),
    );

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.targetUser,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(
                    CommandHelper.getLocale(interaction),
                ).getTranslation(
                    interaction.user.id === interaction.targetUser.id
                        ? Constants.selfNotBindedReject
                        : Constants.userNotBindedReject,
                ),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(bindInfo.uid, [
        "id",
        "username",
        "pp",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    PPHelper.displayPPList(interaction, player, 1);
};

export const config: UserContextMenuCommand["config"] = {
    name: "View Top Plays",
    replyEphemeral: true,
};
