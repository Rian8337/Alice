import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { RecalcLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { PrototypeRecalculationManager } from "@utils/managers/PrototypeRecalculationManager";
import { FindOptions } from "mongodb";
import { DatabaseUserBind } from "structures/database/elainaDb/DatabaseUserBind";
import { DroidHelper } from "@utils/helpers/DroidHelper";
import { OfficialDatabaseUser } from "@database/official/schema/OfficialDatabaseUser";
import { inlineCode } from "discord.js";
import { Modes } from "@rian8337/osu-base";
import { PPVariantManager } from "@utils/managers/PPVariantManager";
import { DefaultPPVariants } from "@utils/pp/DefaultPPVariants";
import { checkVariant } from "@utils/pp/variantChoice";

function createVariantRejection(
    localization: RecalcLocalization,
    check: Exclude<ReturnType<typeof checkVariant>, "ok">,
    variantName: string,
): string {
    return MessageCreator.createReject(
        localization.getTranslation(
            check === "unavailable" ? "variantUnavailable" : "variantNotFound",
        ),
        inlineCode(variantName),
    );
}

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new RecalcLocalization(
        CommandHelper.getLocale(interaction),
    );

    const discordid = interaction.options.getUser("user")?.id;
    let uid = interaction.options.getInteger("uid");
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

    const dbManager = DatabaseManager.elainaDb.collections.userBind;
    const actingUid = await PPVariantManager.getActingUid(interaction.user);
    const variantName =
        interaction.options.getString("variant") ??
        DefaultPPVariants.droidRebalance;

    const variant = await PPVariantManager.resolve(variantName, actingUid);
    const variantCheck = checkVariant(variant, Modes.Droid);

    if (variantCheck !== "ok") {
        return InteractionHelper.reply(interaction, {
            content: createVariantRejection(
                localization,
                variantCheck,
                variantName,
            ),
        });
    }

    if (!uid) {
        let bindInfo: UserBind | null;

        const findOptions: FindOptions = {
            projection: {
                _id: 0,
                uid: 1,
            },
        };

        switch (true) {
            case !!username:
                bindInfo = await dbManager.getFromUsername(
                    username,
                    findOptions,
                );
                break;

            default:
                // If no arguments are specified, default to self
                bindInfo = await dbManager.getFromUser(
                    discordid ?? interaction.user.id,
                    findOptions,
                );
        }

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    new ConstantsLocalization(
                        localization.language,
                    ).getTranslation(
                        username || discordid
                            ? Constants.userNotBindedReject
                            : Constants.selfNotBindedReject,
                    ),
                ),
            });
        }

        uid = bindInfo.uid;
    }

    const player = await DroidHelper.getPlayer(uid, ["id", "archived"]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotFound"),
            ),
        });
    }

    if ((player as Pick<OfficialDatabaseUser, "archived"> | null)?.archived) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerIsArchived"),
            ),
        });
    }

    PrototypeRecalculationManager.queue(
        interaction,
        uid,
        variant!.name,
        actingUid,
    );

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("userQueued"),
            `uid ${uid.toString()}`,
            inlineCode(variant!.name),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    cooldown: 3,
};
