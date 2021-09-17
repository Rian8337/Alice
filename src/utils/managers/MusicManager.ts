import { Manager } from "@alice-utils/base/Manager";
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Collection, Snowflake, StageChannel, TextBasedChannels, VoiceChannel } from "discord.js";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import * as ytdl from "ytdl-core-discord";
import { MusicInfo } from "@alice-interfaces/music/MusicInfo";
import { MusicQueue } from "@alice-interfaces/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { VideoSearchResult } from "yt-search";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for playing music in voice channels.
 */
export abstract class MusicManager extends Manager {
    /**
     * Information about every voice channel the bot is connected to, mapped by channel ID.
     */
    static readonly musicInformations: Collection<Snowflake, MusicInfo> = new Collection();

    /**
     * Plays a YouTube video as audio into a channel.
     * 
     * @param channel The channel to play the video on.
     * @param executionChannel The channel at which the user plays an video.
     * @param queue The music queue to play.
     * @param forceSkip Whether to forcefully skip the current playback, if any.
     */
    static async play(channel: VoiceChannel | StageChannel, executionChannel: TextBasedChannels, queue: MusicQueue, forceSkip?: boolean): Promise<OperationResult> {
        if (channel.guild.me && channel.guild.me.voice.channelId !== channel.id) {
            // If the bot is connected to other voice channel, (either
            // due to disconnect or crash) disconnect first
            await channel.guild.me.voice.disconnect();
        }

        let musicInformation: MusicInfo | undefined = this.musicInformations.get(channel.id);

        if (musicInformation && musicInformation.player && !forceSkip) {
            return this.createOperationResult(false, "a music is still playing");
        }

        musicInformation ??= {
            idleTimeout: null,
            player: null,
            queue: [],
            currentlyPlaying: null,
            stream: null,
            repeat: false,
            shuffle: false
        };

        if (musicInformation.idleTimeout) {
            clearTimeout(musicInformation.idleTimeout);
        }

        this.musicInformations.set(
            channel.id,
            musicInformation
        );

        const player: AudioPlayer = createAudioPlayer();

        player.once("error", async error => {
            await executionChannel.send({
                content: MessageCreator.createReject(
                    `The audio playback emitted an error: \`%s\`.`, error.message
                )
            });

            this.onPlayFinish(channel, executionChannel, queue, error);
        });

        player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Playing || newState.status !== AudioPlayerStatus.Idle) {
                return;
            }

            this.onPlayFinish(channel, executionChannel, queue);
        });

        musicInformation.stream = await ytdl.default(queue.information.url);

        musicInformation.currentlyPlaying = queue;

        player.play(createAudioResource(musicInformation.stream));

        const connection: VoiceConnection =
            getVoiceConnection(channel.guildId) ??
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

        if (connection.state.status !== VoiceConnectionStatus.Ready) {
            await entersState(connection, VoiceConnectionStatus.Ready, 30000).catch((err: Error) => {
                this.leave(channel);

                return this.createOperationResult(false, err.message);
            });
        }

        connection.subscribe(player);

        musicInformation.player = player;

        // Prevent duplicate queue
        if (!musicInformation.queue.find(q => q.information.videoId === queue.information.videoId)) {
            musicInformation.queue.push(queue);
        }

        await executionChannel.send({
            embeds: [ EmbedCreator.createMusicQueueEmbed(musicInformation.queue[0]) ]
        });

        return this.createOperationResult(true);
    }

    /**
     * Enqueues a YouTube video to a channel.
     * 
     * @param channel The channel.
     * @param queue The queue to enqueue.
     * @param index The index at which to enter the queue in. Defaults to latest.
     */
    static async enqueue(channel: VoiceChannel | StageChannel, queue: MusicQueue, index?: number): Promise<OperationResult> {
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        if (musicInformation.queue.find(q => q.information.videoId === queue.information.videoId)) {
            return this.createOperationResult(false, "video is already queued");
        }

        // Limit queue to 10 items
        if (musicInformation.queue.length >= 10) {
            return this.createOperationResult(false, "queue limit reached, only up to 10 items allowed");
        }

        musicInformation.queue.splice(
            NumberHelper.clamp(index ?? musicInformation.queue.length, 1, musicInformation.queue.length),
            0,
            queue
        );

        return this.createOperationResult(true);
    }

    /**
     * Dequeues an audio from a channel.
     * 
     * @param channel The channel.
     * @param index The index of the audio in the queue to dequeue.
     */
    static dequeue(channel: VoiceChannel | StageChannel, index: number): OperationResult {
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        musicInformation.queue.splice(Math.max(1, index - 1), 1);

        return this.createOperationResult(true);
    }

    /**
     * Leaves a voice or stage channel.
     * 
     * @param channel The channel.
     * @returns An object containing information about the operation.
     */
    static leave(channel: VoiceChannel | StageChannel): OperationResult {
        const connection: VoiceConnection | undefined = getVoiceConnection(channel.guildId);

        if (connection) {
            connection.destroy();

            this.musicInformations.get(channel.id)?.stream?.destroy();

            this.musicInformations.delete(channel.id);
        }

        return this.createOperationResult(true);
    }

    /**
     * Pauses the currently playing audio in a channel.
     * 
     * @param channel The channel.
     * @returns An object containing information about the operation.
     */
    static pause(channel: VoiceChannel | StageChannel): OperationResult {
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        if (!musicInformation.player) {
            return this.createOperationResult(false, "no audio is playing");
        }

        if (musicInformation.player.state.status === AudioPlayerStatus.Paused) {
            return this.createOperationResult(false, "playback is already paused");
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
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        if (!musicInformation.player) {
            return this.createOperationResult(false, "no audio is playing");
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
    static async skip(channel: VoiceChannel | StageChannel, executionChannel: TextBasedChannels): Promise<OperationResult> {
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        if (!musicInformation.player) {
            return this.createOperationResult(false, "no audio is playing");
        }

        this.discardPlayerInfo(musicInformation);

        const nextQueue: MusicQueue | null | undefined = this.getNextMusic(musicInformation);

        if (nextQueue) {
            return this.play(channel, executionChannel, nextQueue, true);
        }

        return this.createOperationResult(true);
    }

    /**
     * Sets the repeat mode of a music in a channel.
     * 
     * @param channel The channel.
     * @param repeat Whether to enable repeat mode.
     */
    static setRepeat(channel: VoiceChannel | StageChannel, repeat: boolean): OperationResult {
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        musicInformation.repeat = repeat;

        return this.createOperationResult(true);
    }

    /**
     * Sets the shuffle mode of a music queue in a channel.
     * 
     * @param channel The channel.
     * @param repeat Whether to enable repeat mode.
     */
    static setShuffle(channel: VoiceChannel | StageChannel, shuffle: boolean): OperationResult {
        if (!getVoiceConnection(channel.guildId)) {
            return this.createOperationResult(false, "I'm not in a voice channel");
        }

        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        musicInformation.shuffle = shuffle;

        return this.createOperationResult(true);
    }

    /**
     * Emitted whenever an audio finishes playing or the current
     * audio resource emits an error.
     * 
     * @param channel The channel the music was played on.
     * @param executionChannel The channel at which the user plays an audio.
     * @param queue The music queue that was being played.
     * @param err Whether this resulted from a player's error.
     */
    private static async onPlayFinish(channel: VoiceChannel | StageChannel, executionChannel: TextBasedChannels, queue: MusicQueue, err?: Error): Promise<void> {
        const musicInformation: MusicInfo = this.musicInformations.get(channel.id)!;

        this.discardPlayerInfo(musicInformation);

        const nextQueue: MusicQueue | null | undefined = this.getNextMusic(musicInformation);

        if (err) {
            this.play(channel, executionChannel, queue);
        } else if (nextQueue) {
            this.play(channel, executionChannel, nextQueue);
        } else {
            musicInformation.currentlyPlaying = null;

            musicInformation.idleTimeout = setTimeout(() => this.leave(channel), 60 * 10 * 1000);
        }
    }

    /**
     * Discards current player information.
     * 
     * @param musicInformation The music information to perform the operation on.
     */
    private static discardPlayerInfo(musicInformation: MusicInfo): void {
        // In case an error is thrown, destroy the stream
        musicInformation.stream?.destroy();

        musicInformation.stream = null;

        musicInformation.player?.removeAllListeners();

        musicInformation.player?.stop();

        musicInformation.player = null;
    }

    /**
     * Gets the next music to be played.
     * 
     * @param musicInformation The music information to perform the operation on.
     * @returns The next music to be played, `null` or `undefined` if there is none.
     */
    private static getNextMusic(musicInformation: MusicInfo): MusicQueue | null | undefined {
        if (musicInformation.repeat) {
            return musicInformation.currentlyPlaying;
        }

        // There is a chance that shuffle mode is switched during music playback.
        // Therefore, we look for the index of the music queue.
        const index: number = musicInformation.queue.findIndex(q => q.information.videoId === musicInformation.currentlyPlaying?.information.videoId);

        if (index !== -1) {
            musicInformation.queue.splice(index, 1);
        }

        return musicInformation.shuffle ?
            ArrayHelper.getRandomArrayElement(musicInformation.queue) :
            musicInformation.queue[0];
    }
}