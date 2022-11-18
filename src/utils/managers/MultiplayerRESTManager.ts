import { Config } from "@alice-core/Config";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { MultiplayerPlayer } from "@alice-structures/multiplayer/MultiplayerPlayer";
import { PickedBeatmap } from "@alice-structures/multiplayer/PickedBeatmap";
import { RequestResponse } from "@rian8337/osu-base";
import { CoreOptions } from "request";
import { RESTManager } from "./RESTManager";

/**
 * A REST manager for the multiplayer server.
 */
export abstract class MultiplayerRESTManager extends RESTManager {
    private static readonly endpoint = Config.isDebug
        ? "https://droidpp.osudroid.moe/api/droid/"
        : "http://localhost:3001/api/droid/";

    /**
     * Broadcasts a round start state.
     *
     * @param roomId The ID of the room.
     * @param countdownDuration The duration of the initial countdown, in milliseconds.
     */
    static startPlaying(
        roomId: string,
        countdownDuration: number
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.countdownDuration = countdownDuration;

        return this.request(`${this.endpoint}startPlaying`, options);
    }

    /**
     * Broadcasts a round stop playing state.
     *
     * @param roomId The ID of the room.
     */
    static stopPlaying(roomId: string): Promise<RequestResponse> {
        return this.request(
            `${this.endpoint}stopPlaying`,
            this.createRequestOptions(roomId)
        );
    }

    /**
     * Broadcasts a room closed state.
     *
     * @param roomId The ID of the room.
     */
    static broadcastRoomClosed(roomId: string): Promise<RequestResponse> {
        return this.request(
            `${this.endpoint}events/roomClosed`,
            this.createRequestOptions(roomId)
        );
    }

    /**
     * Broadcasts a beatmap changed state.
     *
     * @param roomId The ID of the room.
     * @param beatmap The new beatmap.
     */
    static broadcastBeatmapChanged(
        roomId: string,
        beatmap: PickedBeatmap
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.beatmap = beatmap;

        return this.request(`${this.endpoint}events/beatmapChange`, options);
    }

    /**
     * Broadcasts a required mods changed state.
     *
     * @param roomId The ID of the room.
     * @param mods The new required mods.
     */
    static broadcastRequiredModsChange(
        roomId: string,
        mods: string
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.mods = mods;

        return this.request(
            `${this.endpoint}events/requiredModsChange`,
            options
        );
    }

    /**
     * Broadcasts a speed multiplier changed state.
     *
     * @param roomId The ID of the room.
     * @param value The new speed multiplier value.
     */
    static broadcastSpeedMultiplierChange(
        roomId: string,
        value: number
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.value = value;

        return this.request(
            `${this.endpoint}events/speedMultiplierChange`,
            options
        );
    }

    /**
     * Broadcasts a mod multiplier changed state.
     *
     * @param roomId The ID of the room.
     * @param multipliers The new mod multipliers.
     */
    static broadcastModMultiplierChange(
        roomId: string,
        multipliers: Record<string, number>
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.multipliers = multipliers;

        return this.request(
            `${this.endpoint}events/modMultiplierChange`,
            options
        );
    }

    /**
     * Broadcasts a player joined state.
     *
     * @param roomId The ID of the room.
     * @param player The player who joined.
     */
    static broadcastPlayerJoined(
        roomId: string,
        player: MultiplayerPlayer
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.player = {
            uid: player.uid,
            username: player.username,
            team: player.team,
        };

        return this.request(`${this.endpoint}events/playerJoined`, options);
    }

    /**
     * Broadcasts a player left state.
     *
     * @param roomId The ID of the room.
     * @param uid The uid of the player.
     */
    static broadcastPlayerLeft(
        roomId: string,
        uid: number
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.uid = uid;

        return this.request(`${this.endpoint}events/playerLeft`, options);
    }

    /**
     * Broadcasts a player team changed state.
     *
     * @param roomId The ID of the room.
     * @param uid The uid of the player.
     * @param team The team of the player.
     */
    static broadcastPlayerTeamChange(
        roomId: string,
        uid: number,
        team: MultiplayerTeam
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.uid = uid;
        options.body.team = team;

        return this.request(`${this.endpoint}events/playerTeamChange`, options);
    }

    /**
     * Broadcasts a score portion changed state.
     *
     * @param roomId The ID of the room.
     * @param value The new score portion value.
     */
    static broadcastScorePortionChange(
        roomId: string,
        value: number
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.value = value;

        return this.request(
            `${this.endpoint}events/scorePortionChange`,
            options
        );
    }

    /**
     * Broadcasts a team mode changed state.
     *
     * @param roomId The ID of the room.
     * @param mode The team mode.
     * @param playerTeams The new player teams, if any.
     */
    static broadcastTeamModeChange(
        roomId: string,
        mode: MultiplayerTeamMode
    ): Promise<RequestResponse> {
        const options: CoreOptions = this.createRequestOptions(roomId);

        options.body.mode = mode;

        return this.request(`${this.endpoint}events/teamModeChange`, options);
    }

    /**
     * Creates the default options for a request.
     *
     * @param roomId The ID of the room.
     * @returns The options.
     */
    private static createRequestOptions(roomId: string): CoreOptions {
        return {
            method: "POST",
            body: {
                key: process.env.DROID_SERVER_INTERNAL_KEY,
                roomId: roomId,
            },
            headers: {
                "Content-Type": "application/json",
            },
            json: true,
        };
    }
}
