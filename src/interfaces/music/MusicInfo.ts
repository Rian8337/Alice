import { Readable } from "stream";
import { AudioPlayer } from "@discordjs/voice";
import { MusicQueue } from "./MusicQueue";

/**
 * Object used when playing music in a voice channel (contains things such as queue, idle timeout, etc).
 */
export interface MusicInfo {
    /**
     * The timeout for the bot to leave the voice channel after channel inactivity.
     */
    idleTimeout: NodeJS.Timeout | null;

    /**
     * The music queue of the voice channel.
     * 
     * The first item is the music that is being played.
     */
    readonly queue: MusicQueue[];

    /**
     * The audio player that is currently playing in the voice channel.
     */
    player: AudioPlayer | null;

    /**
     * The music queue that is currently playing.
     */
    currentlyPlaying: MusicQueue | null;

    /**
     * The stream that is being played.
     * 
     * This is stored in case it wants to be destroyed midway.
     */
    stream: Readable | null;

    /**
     * Whether the current music in this voice channel is repeated.
     */
    repeat: boolean;

    /**
     * Whether the music queue in this voice channel will be shuffled.
     */
    shuffle: boolean;
};