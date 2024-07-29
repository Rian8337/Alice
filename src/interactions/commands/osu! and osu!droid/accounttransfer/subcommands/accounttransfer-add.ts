import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { AccountTransferLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/accounttransfer/AccountTransferLocalization";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { DatabaseAccountTransfer } from "@alice-structures/database/aliceDb/DatabaseAccountTransfer";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { FindOptions } from "mongodb";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const dbManager = DatabaseManager.aliceDb.collections.accountTransfer;
    const localization = new AccountTransferLocalization(
        CommandHelper.getLocale(interaction),
    );

    const uid = interaction.options.getInteger("uid", true);
    const email = interaction.options.getString("email", true);

    await InteractionHelper.deferReply(interaction);

    const player = await DroidHelper.getPlayer(uid, ["email"]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound"),
            ),
        });
    }

    if (player.email !== email) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("incorrectEmail"),
            ),
        });
    }

    // Check if the osu!droid account has been added by someone else.
    const options: FindOptions<DatabaseAccountTransfer> = {
        projection: { _id: 0, transferList: 1 },
    };

    const otherAccountTransfer = await dbManager.getFromUid(uid, options);

    if (
        otherAccountTransfer &&
        otherAccountTransfer.discordId !== interaction.user.id
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("accountAlreadyAddedByOther"),
            ),
        });
    }

    const accountTransfer =
        otherAccountTransfer?.discordId === interaction.user.id
            ? otherAccountTransfer
            : await dbManager.getFromDiscordId(interaction.user.id, options);

    let result: OperationResult;

    if (accountTransfer) {
        if (accountTransfer.transferList.includes(uid)) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountAlreadyAddedBySelf"),
                ),
            });
        }

        result = await dbManager.updateOne(
            { discordId: interaction.user.id },
            { $push: { transferList: uid } },
        );
    } else {
        const bindInfo =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user,
                { projection: { _id: 0, uid: 1, previous_bind: 1 } },
            );

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    new ConstantsLocalization(
                        localization.language,
                    ).getTranslation(Constants.userNotBindedReject),
                ),
            });
        }

        if (
            bindInfo.previous_bind.length === 1 &&
            bindInfo.previous_bind[0] === uid
        ) {
            // Theoretically, the account has been added by the user,
            // so we reject with account already added message.
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountAlreadyAddedBySelf"),
                ),
            });
        }

        const transferList = bindInfo.previous_bind.concat(uid);

        result = await dbManager.insert({
            discordId: interaction.user.id,
            // Take the smallest uid for the target transfer.
            transferUid: Math.min(...transferList),
            transferList: transferList,
        });
    }

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setTransferAccountFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addAccountSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
