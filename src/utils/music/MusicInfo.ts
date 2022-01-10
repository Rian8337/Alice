import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    entersState,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import {
    DMChannel,
    PartialDMChannel,
    Snowflake,
    TextBasedChannel,
} from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

/**
 * Represents a music information for an active voice connection.
 */
export class MusicInfo {
    /**
     * The ID of the voice channel at which this connection is playing in.
     */
    readonly voiceChannelId: Snowflake;

    /**
     * The active connection.
     */
    readonly connection: VoiceConnection;

    /**
     * The time at which this connection was made.
     */
    readonly createdAt: Date;

    /**
     * The audio player for the voice channel.
     */
    readonly player: AudioPlayer = createAudioPlayer();

    /**
     * The channel this music information is binded to.
     */
    readonly executionChannel: Exclude<
        TextBasedChannel,
        DMChannel | PartialDMChannel
    >;

    /**
     * The timeout for the bot to leave the voice channel after channel inactivity.
     */
    idleTimeout: NodeJS.Timeout | null = null;

    /**
     * The music queue of the voice channel.
     *
     * The first item is the music that is being played.
     */
    readonly queue: MusicQueue[] = [];

    /**
     * Whether the queue is locked (guarantees safe access).
     */
    queueLock: boolean = false;

    /**
     * Whether this music information's voice connection is locked (ensures connection is proper).
     */
    readyLock: boolean = false;

    /**
     * Whether the current music in this voice channel is repeated.
     */
    repeat: boolean = false;

    /**
     * Whether the current queue is being skipped.
     */
    skip: boolean = false;

    /**
     * The music queue that is currently playing.
     */
    get currentlyPlaying(): MusicQueue | null {
        return this.player.state.status !== AudioPlayerStatus.Idle
            ? (<AudioResource<MusicQueue>>this.player.state.resource).metadata
            : null;
    }

    constructor(
        connection: VoiceConnection,
        voiceChannelId: Snowflake,
        executionChannel: Exclude<
            TextBasedChannel,
            DMChannel | PartialDMChannel
        >
    ) {
        this.connection = connection;
        this.voiceChannelId = voiceChannelId;
        this.executionChannel = executionChannel;
        this.createdAt = new Date();

        this.connection.on("stateChange", async (_, newState) => {
            switch (newState.status) {
                case VoiceConnectionStatus.Disconnected:
                    if (
                        newState.reason ===
                            VoiceConnectionDisconnectReason.WebSocketClose &&
                        newState.closeCode === 4014
                    ) {
                        try {
                            // Probably moved voice channel.
                            await entersState(
                                this.connection,
                                VoiceConnectionStatus.Connecting,
                                5e3
                            );
                        } catch {
                            // Probably removed from voice channel.
                            this.connection.destroy();
                        }
                    } else if (this.connection.rejoinAttempts < 5) {
                        await HelperFunctions.sleep(
                            (this.connection.rejoinAttempts + 1) * 5e3
                        );
                        this.connection.rejoin();
                    } else {
                        this.connection.destroy();
                    }
                    break;
                case VoiceConnectionStatus.Destroyed:
                    this.stop();
                    break;
                case VoiceConnectionStatus.Connecting:
                case VoiceConnectionStatus.Signalling:
                    if (!this.readyLock) {
                        // Set a 20 second time limit for the connection to become ready before
                        // destroying the voice connection. This stops the voice connection from permanently
                        // existing in one of these states.
                        this.readyLock = true;

                        try {
                            await entersState(
                                this.connection,
                                VoiceConnectionStatus.Ready,
                                2e4
                            );
                        } catch {
                            if (
                                this.connection.state.status !==
                                VoiceConnectionStatus.Destroyed
                            ) {
                                this.connection.destroy();
                            }
                        }

                        this.readyLock = false;
                    }
                    break;
            }
        });

        this.player.on("stateChange", (oldState, newState) => {
            if (
                newState.status === AudioPlayerStatus.Idle &&
                oldState.status !== AudioPlayerStatus.Idle
            ) {
                // Idle state is entered from a nonidle state. This means that an audio resource has finished playing.
                // Process the queue to start playing the next queue, if one is available.
                this.processQueue(
                    (<AudioResource<MusicQueue>>oldState.resource).metadata
                );
            } else if (
                oldState.status !== AudioPlayerStatus.Paused &&
                newState.status === AudioPlayerStatus.Playing
            ) {
                // New music is playing.
                this.executionChannel.send({
                    embeds: [
                        EmbedCreator.createMusicQueueEmbed(
                            (<AudioResource<MusicQueue>>newState.resource)
                                .metadata
                        ),
                    ],
                });
            }
        });

        this.player.on("error", (err) => {
            this.executionChannel.send({
                content: MessageCreator.createReject(
                    `The audio player emitted an error: \`%s\`.`,
                    err.message
                ),
            });
        });

        this.connection.subscribe(this.player);
    }

    /**
     * Enqueues a music queue.
     *
     * @param queue The music queue to enqueue.
     * @param index The index to enqueue this music queue on. Defaults to latest.
     */
    enqueue(queue: MusicQueue, index: number = this.queue.length): void {
        this.queue.splice(index, 0, queue);

        this.processQueue(this.queue[0]);
    }

    /**
     * Dequeues a music queue.
     *
     * @param index The index of the queue to dequeue.
     */
    dequeue(index: number): void {
        this.queue.splice(Math.max(1, index - 1), 1);
    }

    /**
     * Stops audio playback and empties the queue.
     */
    stop(): void {
        this.queueLock = true;

        this.queue.length = 0;

        this.player.stop();
    }

    /**
     * Shuffles the queue of this music information.
     */
    shuffleQueue(): void {
        ArrayHelper.shuffle(this.queue);
    }

    /**
     * Attempts to play a queue.
     *
     * @param queueToRepeat The music queue that will be repeated if repeat mode is enabled.
     * @param forceSkip Whether to skip the previously played queue if repeat mode is enabled.
     */
    private async processQueue(queueToRepeat: MusicQueue): Promise<void> {
        const repeatAndNotSkip: boolean = this.repeat && !this.skip;

        // Don't do anything if the queue is locked (already being processed),
        // is empty, or the audio player is already playing something.
        if (this.queue.length === 0 && !repeatAndNotSkip) {
            this.idleTimeout ??= setTimeout(
                () => this.connection.destroy(),
                60 * 10 * 1000
            );
            return;
        }

        if (
            this.queueLock ||
            this.player.state.status !== AudioPlayerStatus.Idle
        ) {
            return;
        }

        // Lock the queue to guarantee safe access.
        this.queueLock = true;

        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);

            this.idleTimeout = null;
        }

        const nextQueue: MusicQueue = repeatAndNotSkip
            ? queueToRepeat
            : this.queue.shift()!;

        try {
            // Attempt to convert the queue into an `AudioResource` (i.e. start streaming the video).
            const resource: AudioResource<MusicQueue> =
                await nextQueue.createAudioResource();

            this.player.play(resource);

            this.skip = false;

            this.queueLock = false;
        } catch (err) {
            await this.executionChannel.send({
                content: MessageCreator.createReject(
                    `An error occurred while trying to play %s: \`%s\`.`,
                    nextQueue.information.title,
                    (<Error>err).message
                ),
            });

            this.queueLock = false;

            this.repeat = false;

            this.processQueue(queueToRepeat);
        }
    }
}
