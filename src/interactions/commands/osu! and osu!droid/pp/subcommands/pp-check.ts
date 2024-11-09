import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { PPLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { PPHelper } from "@utils/helpers/PPHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { OfficialDatabaseUser } from "@database/official/schema/OfficialDatabaseUser";
import { Player } from "@rian8337/osu-droid-utilities";
import { DroidHelper } from "@utils/helpers/DroidHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new PPLocalization(
        CommandHelper.getLocale(interaction),
    );

    const discordid = interaction.options.getUser("user")?.id;
    const uid = interaction.options.getInteger("uid");
    const username = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    let player:
        | Pick<OfficialDatabaseUser, "id" | "username" | "pp">
        | Player
        | null = null;

    switch (true) {
        case !!uid:
        case !!username:
            player = await DroidHelper.getPlayer(uid ?? username!);
            break;

        default: {
            const bindInfo =
                await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                    discordid ?? interaction.user.id,
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
                            localization.language,
                        ).getTranslation(
                            discordid
                                ? Constants.userNotBindedReject
                                : Constants.selfNotBindedReject,
                        ),
                    ),
                });
            }

            player = await DroidHelper.getPlayer(bindInfo.uid);
        }
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    PPHelper.displayPPList(
        interaction,
        player,
        interaction.options.getInteger("page") ?? 1,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 10,
};
