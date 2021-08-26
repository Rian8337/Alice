import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ppcheckStrings } from "../ppcheckStrings";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const username: string = interaction.options.getString("username", true);

    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUsername(username);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.userNotBindedReject)
        });
    }

    DPPHelper.viewDPPList(interaction, bindInfo, NumberHelper.clamp(interaction.options.getInteger("page") ?? 1, 1, Math.ceil(bindInfo.pp.size / 5)));
};

export const config: Subcommand["config"] = {
    permissions: []
};