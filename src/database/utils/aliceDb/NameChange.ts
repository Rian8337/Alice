import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseNameChange } from "structures/database/aliceDb/DatabaseNameChange";
import { OperationResult } from "structures/core/OperationResult";
import { Manager } from "@utils/base/Manager";
import { ObjectId } from "bson";
import { bold, Snowflake } from "discord.js";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { Player } from "@rian8337/osu-droid-utilities";
import { Language } from "@localization/base/Language";
import { NameChangeLocalization } from "@localization/database/utils/aliceDb/NameChange/NameChangeLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { OfficialDatabaseUser } from "@database/official/schema/OfficialDatabaseUser";
import { DroidHelper } from "@utils/helpers/DroidHelper";

/**
 * Represents an osu!droid name change request.
 */
export class NameChange extends Manager implements DatabaseNameChange {
    discordid: Snowflake;
    new_username: string | null;
    uid: number;
    cooldown: number;
    isProcessed: boolean;
    previous_usernames: string[];
    readonly _id?: ObjectId;
    private player: Pick<OfficialDatabaseUser, "username"> | Player | null =
        null;

    constructor(
        data: DatabaseNameChange = DatabaseManager.aliceDb?.collections
            .nameChange.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.new_username = data.new_username;
        this.uid = data.uid;
        this.cooldown = data.cooldown;
        this.isProcessed = data.isProcessed;
        this.previous_usernames = data.previous_usernames ?? [];
    }

    /**
     * Accepts this name change request if this account requests a name change.
     *
     * @param language The locale of the user who attempted to accept this name change request. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async accept(language: Language = "en"): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (this.isProcessed) {
            return this.createOperationResult(
                false,
                localization.getTranslation("requestNotActive"),
            );
        }

        this.player ??= await DroidHelper.getPlayer(this.uid, ["username"]);

        if (!this.player) {
            return this.deny("Cannot find player profile");
        }

        // Still use API for name change to allow logging.
        const apiRequestBuilder = new DroidAPIRequestBuilder()
            .setEndpoint("user_rename.php")
            .addParameter("username", this.player.username)
            .addParameter("newname", this.new_username!);

        const apiResult = await apiRequestBuilder.sendRequest();

        if (apiResult.statusCode !== 200) {
            return this.createOperationResult(
                false,
                localization.getTranslation("droidServerRequestFailed"),
            );
        }

        const content = apiResult.data.toString("utf-8");
        const requestResult = content.split(" ").shift()!;

        if (requestResult === "FAILED") {
            return this.deny(
                localization.getTranslation("newUsernameTaken"),
                language,
            );
        }

        await DatabaseManager.elainaDb.collections.userBind.updateOne(
            { uid: this.uid },
            { $set: { username: this.new_username! } },
        );

        await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
            { uid: this.uid },
            { $set: { username: this.new_username! } },
        );

        this.isProcessed = true;

        const result =
            await DatabaseManager.aliceDb.collections.nameChange.updateOne(
                { uid: this.uid },
                {
                    $set: {
                        new_username: null,
                        isProcessed: true,
                    },
                    $push: {
                        previous_usernames: this.player.username,
                    },
                },
            );

        await this.notifyAccept();

        this.previous_usernames.push(this.player.username);
        this.new_username = null;

        return result;
    }

    /**
     * Cancels this name change request if this account requests a name change.
     *
     * @returns An object containing information about the operation.
     */
    cancel(): Promise<OperationResult> {
        return this.deny();
    }

    /**
     * Denies this name change request if this account requests a name change.
     *
     * @param reason The reason for denying the name change request.
     * @param language The locale of the user who attempted to deny the name change request.
     * @returns An object containing information about the operation.
     */
    async deny(
        reason?: string,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (this.isProcessed) {
            return this.createOperationResult(
                false,
                localization.getTranslation("requestNotActive"),
            );
        }

        this.isProcessed = true;

        const result =
            await DatabaseManager.aliceDb.collections.nameChange.updateOne(
                { uid: this.uid },
                {
                    $inc: {
                        cooldown: -86400 * 30,
                    },
                    $set: {
                        new_username: null,
                        isProcessed: true,
                    },
                },
            );

        if (result.success && reason) {
            await this.notifyDeny(reason);
        }

        return result;
    }

    /**
     * Notifies a user for name change request accept.
     */
    private async notifyAccept(): Promise<void> {
        try {
            const user = await this.client.users.fetch(this.discordid);

            if (!user) {
                return;
            }

            const localization = this.getLocalization(
                CommandHelper.getUserPreferredLocale(user),
            );

            this.player ??= (await DroidHelper.getPlayer(this.uid, [
                "username",
            ]))!;

            const embed = EmbedCreator.createNormalEmbed({
                color: 2483712,
                timestamp: true,
            });

            embed
                .setTitle(localization.getTranslation("requestDetails"))
                .setDescription(
                    `${bold(localization.getTranslation("currentUsername"))}: ${
                        this.player.username
                    }\n` +
                        `${bold(
                            localization.getTranslation("requestedUsername"),
                        )}: ${this.new_username}\n` +
                        `${bold(
                            localization.getTranslation("creationDate"),
                        )}: ${DateTimeFormatHelper.dateToLocaleString(
                            new Date((this.cooldown - 86400 * 30) * 1000),
                            localization.language,
                        )}\n\n` +
                        `${bold(
                            localization.getTranslation("status"),
                        )}: ${localization.getTranslation("accepted")}`,
                );

            user.send({
                content: MessageCreator.createAccept(
                    localization.getTranslation("acceptedNotification"),
                    DateTimeFormatHelper.dateToLocaleString(
                        new Date(this.cooldown * 1000),
                        localization.language,
                    ),
                ),
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    }

    /**
     * Notifies the user for name change request denial.
     *
     * @param reason The reason for denying the name change request.
     */
    private async notifyDeny(reason: string): Promise<void> {
        try {
            const user = await this.client.users.fetch(this.discordid);

            if (!user) {
                return;
            }

            const localization = this.getLocalization(
                CommandHelper.getUserPreferredLocale(user),
            );

            this.player ??= (await DroidHelper.getPlayer(this.uid, [
                "username",
            ]))!;

            const embed = EmbedCreator.createNormalEmbed({
                color: 16711711,
                timestamp: true,
            });

            embed
                .setTitle(localization.getTranslation("requestDetails"))
                .setDescription(
                    `${bold(localization.getTranslation("currentUsername"))}: ${
                        this.player.username
                    }\n` +
                        `${bold(
                            localization.getTranslation("requestedUsername"),
                        )}: ${this.new_username}\n` +
                        `${bold(
                            localization.getTranslation("creationDate"),
                        )}: ${DateTimeFormatHelper.dateToLocaleString(
                            new Date((this.cooldown - 86400 * 30) * 1000),
                            localization.language,
                        )}\n\n` +
                        `${bold(
                            localization.getTranslation("status"),
                        )}: ${localization.getTranslation("denied")}\n` +
                        `${bold(
                            localization.getTranslation("reason"),
                        )}: ${reason}`,
                );

            user.send({
                content: MessageCreator.createReject(
                    localization.getTranslation("deniedNotification"),
                    reason,
                ),
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): NameChangeLocalization {
        return new NameChangeLocalization(language);
    }
}
