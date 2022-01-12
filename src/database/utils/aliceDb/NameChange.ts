import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseNameChange } from "@alice-interfaces/database/aliceDb/DatabaseNameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { MessageEmbed, Snowflake, User } from "discord.js";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DroidAPIRequestBuilder, RequestResponse } from "osu-droid";

/**
 * Represents an osu!droid name change request.
 */
export class NameChange extends Manager implements DatabaseNameChange {
    discordid: Snowflake;
    current_username: string;
    new_username: string | null;
    uid: number;
    cooldown: number;
    isProcessed: boolean;
    previous_usernames: string[];
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseNameChange = DatabaseManager.aliceDb?.collections
            .nameChange.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.current_username = data.current_username;
        this.new_username = data.new_username;
        this.uid = data.uid;
        this.cooldown = data.cooldown;
        this.isProcessed = data.isProcessed;
        this.previous_usernames = data.previous_usernames ?? [];
    }

    /**
     * Accepts this name change request if this account requests a name change.
     *
     * @returns An object containing information about the operation.
     */
    async accept(): Promise<OperationResult> {
        if (this.isProcessed) {
            return this.createOperationResult(
                false,
                "name change request is not active"
            );
        }

        const apiRequestBuilder: DroidAPIRequestBuilder =
            new DroidAPIRequestBuilder()
                .setEndpoint("rename.php")
                .addParameter("username", this.current_username)
                .addParameter("newname", this.new_username!);

        const apiResult: RequestResponse =
            await apiRequestBuilder.sendRequest();

        if (apiResult.statusCode !== 200) {
            return this.createOperationResult(
                false,
                "cannot create request to osu!droid server"
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
                        previous_usernames: this.current_username,
                    },
                }
            );

        await this.notifyAccept();

        this.previous_usernames.push(this.current_username);
        this.current_username = this.new_username!;

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
     *
     * @returns An object containing information about the operation.
     */
    async deny(reason?: string): Promise<OperationResult> {
        if (this.isProcessed) {
            return this.createOperationResult(
                false,
                "name change request is not active"
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
        const user: User = await this.client.users.fetch(this.discordid);

        if (!user) {
            return;
        }

        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            color: 2483712,
            timestamp: true,
        });

        embed
            .setTitle("Request Details")
            .setDescription(
                `**Old Username**: ${this.current_username}\n` +
                    `**New Username**: ${this.new_username}\n` +
                    `**Creation Date**: ${new Date(
                        (this.cooldown - 86400 * 30) * 1000
                    ).toUTCString()}\n\n` +
                    "**Status**: Accepted"
            );

        try {
            user.send({
                content: MessageCreator.createReject(
                    "Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in %s.",
                    new Date(this.cooldown * 1000).toUTCString()
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
        const user: User = await this.client.users.fetch(this.discordid);

        if (!user) {
            return;
        }

        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            color: 16711711,
            timestamp: true,
        });

        embed
            .setTitle("Request Details")
            .setDescription(
                `**Old Username**: ${this.current_username}\n` +
                    `**New Username**: ${this.new_username}\n` +
                    `**Creation Date**: ${new Date(
                        (this.cooldown - 86400 * 30) * 1000
                    ).toUTCString()}\n\n` +
                    "**Status**: Denied\n" +
                    `**Reason**: ${reason}`
            );

        try {
            user.send({
                content: MessageCreator.createReject(
                    "Hey, I would like to inform you that your name change request was denied due to `%s`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!",
                    reason
                ),
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    }
}
