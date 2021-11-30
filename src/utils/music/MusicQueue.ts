import { Readable } from "stream";
import { AudioResource, demuxProbe, createAudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { raw as ytdl } from "youtube-dl-exec";
import { VideoSearchResult } from "yt-search";

/**
 * Represents a music queue.
 */
export class MusicQueue {
    /**
     * The information of the video that contains this music.
     */
    readonly information: VideoSearchResult;

    /**
     * The user who queued this music.
     */
    readonly queuer: Snowflake;

    constructor(information: VideoSearchResult, queuer: Snowflake) {
        this.information = information;
        this.queuer = queuer;
    }

    /**
     * Creates an `AudioResource` from this queue.
     */
    createAudioResource(): Promise<AudioResource<MusicQueue>> {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                this.information.url,
                {
                    o: '-',
                    q: '',
                    f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                    r: '500K',
                },
                { stdio: ['ignore', 'pipe', 'ignore'] }
            );

            if (!process.stdout) {
                return reject("No stdout");
            }

            const stream: Readable = process.stdout;

            const onError = (error: Error) => {
                if (!process.killed) process.kill();
                stream.resume();
                reject(error);
            };

            process.once("spawn", () => {
                demuxProbe(stream)
                    .then(probe => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
                    .catch(onError);
            }).catch(onError);
        });
    }
}