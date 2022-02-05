import { Manager } from "@alice-utils/base/Manager";
import {
    AudioPlayerStatus,
    DiscordGatewayAdapterCreator,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import {
    Collection,
    Snowflake,
    StageChannel,
    TextChannel,
    ThreadChannel,
    VoiceChannel,
} from "discord.js";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { MusicQueue } from "@alice-utils/music/MusicQueue";

/**
 * A manager for playing music in voice channels.
 */
export abstract class MusicManager extends Manager {
    /**
     * Information about every voice channel the bot is connected to, mapped by guild ID.
     */
    static readonly musicInformations: Collection<Snowflake, MusicInfo> =
        new Collection();

    /**
     * Enqueues a YouTube video to a channel.
     *
     * @param channel The channel.
     * @param executionChannel The channel at which the user plays the video.
     * @param queue The queue to enqueue.
     * @param index The index at which to enter the queue in. Defaults to latest.
     */
    static async enqueue(
        channel: VoiceChannel | StageChannel,
        executionChannel: TextChannel | ThreadChannel,
        queue: MusicQueue,
        index?: number
    ): Promise<OperationResult> {
        let musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            musicInformation = new MusicInfo(
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: <DiscordGatewayAdapterCreator>(
                        channel.guild.voiceAdapterCreator
                    ),
                }),
                channel.id,
                executionChannel
            );

            this.musicInformations.set(channel.guildId, musicInformation);
        }

        try {
            await entersState(
                musicInformation.connection,
                VoiceConnectionStatus.Ready,
                2e4
            );
        } catch (error) {
            this.client.emit("error", <Error>error);

            return this.createOperationResult(
                false,
                "failed to join voice channel within 20 seconds"
            );
        }

        if (
            musicInformation.queue.find(
                (q) => q.information.videoId === queue.information.videoId
            )
        ) {
            return this.createOperationResult(false, "video is already queued");
        }

        // Limit queue to 10 items
        if (musicInformation.queue.length >= 10) {
            return this.createOperationResult(
                false,
                "queue limit reached, only up to 10 items allowed"
            );
        }

        musicInformation.enqueue(queue, index);

        return this.createOperationResult(true);
    }

    /**
     * Dequeues an audio from a channel.
     *
     * @param channel The channel.
     * @param index The index of the audio in the queue to dequeue.
     */
    static dequeue(
        channel: VoiceChannel | StageChannel,
        index: number
    ): OperationResult {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        musicInformation.dequeue(index);

        return this.createOperationResult(true);
    }

    /**
     * Leaves a voice or stage channel.
     *
     * @param channel The channel.
     * @returns An object containing information about the operation.
     */
    static leave(channel: VoiceChannel | StageChannel): OperationResult {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        if (
            musicInformation.connection.state.status !==
            VoiceConnectionStatus.Destroyed
        ) {
            musicInformation.connection.destroy();
        }

        this.musicInformations.delete(channel.guildId);

        return this.createOperationResult(true);
    }

    /**
     * Pauses the currently playing music in a channel.
     *
     * @param channel The channel.
     * @returns An object containing information about the operation.
     */
    static pause(channel: VoiceChannel | StageChannel): OperationResult {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (
            musicInformation.player.state.status !== AudioPlayerStatus.Playing
        ) {
            return this.createOperationResult(false, "no music is playing");
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        musicInformation.player.pause();

        return this.createOperationResult(true);
    }

    /**
     * Resumes a paused audio playback in a channel.
     *
     * @param channel The channel.
     * @returns An object containing information about the operation.
     */
    static resume(channel: VoiceChannel | StageChannel): OperationResult {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        if (musicInformation.player.state.status !== AudioPlayerStatus.Paused) {
            return this.createOperationResult(false, "playback is not paused");
        }

        musicInformation.player.unpause();

        return this.createOperationResult(true);
    }

    /**
     * Skips an audio in the channel's audio queue.
     *
     * @param channel The channel.
     * @param executionChannel The channel at which the user plays an audio.
     * @returns An object containing information about the operation.
     */
    static async skip(
        channel: VoiceChannel | StageChannel
    ): Promise<OperationResult> {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        if (
            musicInformation.player.state.status !== AudioPlayerStatus.Playing
        ) {
            return this.createOperationResult(false, "no audio is playing");
        }

        musicInformation.skip = true;

        // State transition listener is already defined in `MusicInfo` construction.
        // Transitions into the idle state mean the next track from the queue will be loaded and played.
        musicInformation.player.stop();

        return this.createOperationResult(true);
    }

    /**
     * Sets the repeat mode of a music in a channel.
     *
     * @param channel The channel.
     * @param repeat Whether to enable repeat mode.
     */
    static setRepeat(
        channel: VoiceChannel | StageChannel,
        repeat: boolean
    ): OperationResult {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        musicInformation.repeat = repeat;

        return this.createOperationResult(true);
    }

    /**
     * Shuffles a music queue in a voice channel.
     *
     * @param channel The channel.
     */
    static shuffle(channel: VoiceChannel | StageChannel): OperationResult {
        const musicInformation: MusicInfo | undefined =
            this.musicInformations.get(channel.guildId);

        if (!musicInformation) {
            return this.createOperationResult(
                false,
                "I'm not in a voice channel"
            );
        }

        if (musicInformation.voiceChannelId !== channel.id) {
            return this.createOperationResult(
                false,
                "I'm not in your voice channel"
            );
        }

        musicInformation.shuffleQueue();

        return this.createOperationResult(true);
    }
}
