import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { UserContextMenuCommand } from "structures/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DPPHelper } from "@utils/helpers/DPPHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.targetUser,
            {
                projection: {
                    _id: 0,
                    dppRecalcComplete: 1,
                    uid: 1,
                    username: 1,
                    playc: 1,
                    pp: 1,
                    pptotal: 1,
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

    DPPHelper.displayDPPList(interaction, bindInfo, 1);
};

export const config: UserContextMenuCommand["config"] = {
    name: "View Droid PP Profile",
    replyEphemeral: true,
};
