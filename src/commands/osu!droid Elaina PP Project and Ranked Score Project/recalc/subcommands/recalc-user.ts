import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember, User } from "discord.js";
import { recalcStrings } from "../recalcStrings";
import { RecalculationManager } from "@alice-utils/managers/RecalculationManager";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.hasAny(
            ...Config.verifyPerm
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.userNotBindedReject),
        });
    }

    if (bindInfo.hasAskedForRecalc) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                recalcStrings.userHasRequestedRecalc
            ),
        });
    }

    if (await bindInfo.isDPPBanned()) {
        return interaction.editReply({
            content: MessageCreator.createReject(recalcStrings.userIsDPPBanned),
        });
    }

    RecalculationManager.queue(interaction, bindInfo.discordid);

    interaction.editReply({
        content: MessageCreator.createAccept(
            recalcStrings.userQueued,
            user.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
