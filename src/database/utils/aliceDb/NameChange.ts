import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseNameChange } from "@alice-interfaces/database/aliceDb/DatabaseNameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { MessageEmbed, Snowflake, User } from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DroidAPIRequestBuilder, RequestResponse } from "@rian8337/osu-base";
import { Player } from "@rian8337/osu-droid-utilities";
import { Language } from "@alice-localization/base/Language";
import { NameChangeLocalization } from "@alice-localization/database/utils/aliceDb/NameChangeLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

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
    private player?: Player;

    constructor(
        data: DatabaseNameChange = DatabaseManager.aliceDb?.collections
            .nameChange.defaultDocument ?? {}
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
        const localization: NameChangeLocalization = this.getLocalization(language);

        if (this.isProcessed) {
            return this.createOperationResult(
                false,
                localization.getTranslation("requestNotActive")
            );
        }

        this.player ??= await Player.getInformation({ uid: this.uid });

        if (!this.player.username) {
            return this.deny("Cannot find player profile");
        }

        const apiRequestBuilder: DroidAPIRequestBuilder =
            new DroidAPIRequestBuilder()
                .setEndpoint("rename.php")
                .addParameter("username", this.player.username)
                .addParameter("newname", this.new_username!);

        const apiResult: RequestResponse =
            await apiRequestBuilder.sendRequest();

        if (apiResult.statusCode !== 200) {
            return this.createOperationResult(
                false,
                localization.getTranslation("droidServerRequestFailed")
            );
        }

        const content: string = apiResult.data.toString("utf-8");
        const requestResult: string = content.split(" ").shift()!;

        if (requestResult === "FAILED") {
            return this.deny("New username taken");
        }

        await DatabaseManager.elainaDb.collections.userBind.update(
            { uid: this.uid },
            { $set: { username: this.new_username! } }
        );

        await DatabaseManager.aliceDb.collections.playerInfo.update(
            { uid: this.uid },
            { $set: { username: this.new_username! } }
        );

        await DatabaseManager.aliceDb.collections.rankedScore.update(
            { uid: this.uid },
            { $set: { username: this.new_username! } }
        );

        this.isProcessed = true;

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.nameChange.update(
                { uid: this.uid },
                {
                    $set: {
                        current_username: this.new_username!,
                        new_username: null,
                        isProcessed: true,
                    },
                    $push: {
                        previous_usernames: this.player.username,
                    },
                }
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
    async deny(reason?: string, language: Language = "en"): Promise<OperationResult> {
        const localization: NameChangeLocalization = this.getLocalization(language);

        if (this.isProcessed) {
            return this.createOperationResult(
                false,
                localization.getTranslation("requestNotActive")
            );
        }

        this.isProcessed = true;

        const result: OperationResult =
            await DatabaseManager.aliceDb.collections.nameChange.update(
                { uid: this.uid },
                {
                    $inc: {
                        cooldown: -86400 * 30,
                    },
                    $set: {
                        new_username: null,
                        isProcessed: true,
                    },
                }
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
            const user: User = await this.client.users.fetch(this.discordid);

            if (!user) {
                return;
            }

            const localization: NameChangeLocalization = this.getLocalization(await CommandHelper.getUserPreferredLocale(user));

            this.player ??= await Player.getInformation({ uid: this.uid });

            const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
                color: 2483712,
                timestamp: true,
            });

            embed
                .setTitle(localization.getTranslation("requestDetails"))
                .setDescription(
                    `**${localization.getTranslation("currentUsername")}**: ${this.player.username}\n` +
                    `**${localization.getTranslation("requestedUsername")}**: ${this.new_username}\n` +
                    `**${localization.getTranslation("creationDate")}**: ${new Date(
                        (this.cooldown - 86400 * 30) * 1000
                    ).toUTCString()}\n\n` +
                    `**${localization.getTranslation("accepted")}**: ${localization.getTranslation("accepted")}`
                );

            user.send({
                content: MessageCreator.createAccept(
                    localization.getTranslation("acceptedNotification"),
                    new Date(this.cooldown * 1000).toUTCString()
                ),
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch { }
    }

    /**
     * Notifies the user for name change request denial.
     *
     * @param reason The reason for denying the name change request.
     */
    private async notifyDeny(reason: string): Promise<void> {
        try {
            const user: User = await this.client.users.fetch(this.discordid);

            if (!user) {
                return;
            }

            const localization: NameChangeLocalization = this.getLocalization(await CommandHelper.getUserPreferredLocale(user));

            this.player ??= await Player.getInformation({ uid: this.uid });

            const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
                color: 16711711,
                timestamp: true,
            });

            embed
                .setTitle(localization.getTranslation("requestDetails"))
                .setDescription(
                    `**${localization.getTranslation("currentUsername")}**: ${this.player.username}\n` +
                    `**${localization.getTranslation("requestedUsername")}**: ${this.new_username}\n` +
                    `**${localization.getTranslation("creationDate")}**: ${new Date(
                        (this.cooldown - 86400 * 30) * 1000
                    ).toUTCString()}\n\n` +
                    `**${localization.getTranslation("status")}**: ${localization.getTranslation("denied")}\n` +
                    `**${localization.getTranslation("reason")}**: ${reason}`
                );

            user.send({
                content: MessageCreator.createReject(
                    localization.getTranslation("deniedNotification"),
                    reason
                ),
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch { }
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
