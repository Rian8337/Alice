import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserContextMenuCommand } from "@alice-interfaces/core/UserContextMenuCommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: UserContextMenuCommand["run"] = async (_, interaction) => {
    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.targetUser,
            { retrieveAllPlays: true }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(
                    await CommandHelper.getLocale(interaction)
                ).getTranslation(
                    interaction.user.id === interaction.targetUser.id
                        ? Constants.selfNotBindedReject
                        : Constants.userNotBindedReject
                )
            ),
        });
    }

    DPPHelper.displayDPPList(interaction, bindInfo, 1);
};

export const config: UserContextMenuCommand["config"] = {
    name: "View Droid PP Profile",
    replyEphemeral: true,
};
