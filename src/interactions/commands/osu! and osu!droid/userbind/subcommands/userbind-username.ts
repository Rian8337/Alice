import { Player } from "@rian8337/osu-droid-utilities";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { DatabaseManager } from "@database/DatabaseManager";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { UserbindLocalization } from "@localization/interactions/commands/osu! and osu!droid/userbind/UserbindLocalization";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { DroidHelper } from "@utils/helpers/DroidHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new UserbindLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const username = interaction.options.getString("username", true);
    const email = interaction.options.getString("email", true);
    const dbManager = DatabaseManager.elainaDb.collections.userBind;

    if (!StringHelper.isUsernameValid(username)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(username, [
        "id",
        "username",
        "email",
    ]);

    if (!player || player instanceof Player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    if (email !== player.email) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("incorrectEmail"),
            ),
        });
    }

    const uidBindInfo = await dbManager.getFromUid(player.id, {
        projection: { _id: 0, discordid: 1 },
    });

    if (uidBindInfo && uidBindInfo.discordid !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("accountHasBeenBoundError"),
            ),
        });
    }

    const userBindInfo = await dbManager.getFromUser(interaction.user, {
        projection: {
            _id: 0,
            uid: 1,
        },
    });

    if (userBindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("discordAccountAlreadyBoundError"),
            ),
        });
    }

    if (email !== player.email) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("incorrectEmail"),
            ),
        });
    }

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("bindConfirmation"),
                username,
            ),
        },
        [interaction.user.id],
        10,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    const result = await dbManager.insert({
        discordid: interaction.user.id,
        uid: player.id,
        username: player.username,
    });

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("bindError"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("bindSuccessful"),
            username,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
