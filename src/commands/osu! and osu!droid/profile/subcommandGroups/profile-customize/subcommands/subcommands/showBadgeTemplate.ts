import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";

export const run: Subcommand["run"] = async (_, interaction) => {
    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    const template: Buffer = await ProfileManager.getProfileTemplate(
        bindInfo.uid,
        bindInfo
    );

    interaction.editReply({ files: [template] });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
