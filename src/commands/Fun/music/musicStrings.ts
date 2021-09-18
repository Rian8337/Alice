/**
 * Strings for the `music` command.
 */
export enum musicStrings {
    userIsNotInVoiceChannel = "I'm sorry, you must be in a voice channel to use this command!",
    botIsNotInVoiceChannel = "I'm sorry, I don't have an active connection to a voice channel!",
    noMusicIsPlaying = "I'm sorry, there is no music playing!",
    noTracksFound = "I'm sorry, I couldn't find any YouTube videos from your search query!",
    playTrackFailed = "I'm sorry, I couldn't play the track: %s.",
    playTrackSuccess = "Successfully played `%s`.",
    skipTrackFailed = "I'm sorry, I couldn't skip the track: %s.",
    skipTrackSuccess = "Successfully skipped the track.",
    pauseTrackFailed = "I'm sorry, I couldn't pause the track: %s.",
    pauseTrackSuccess = "Successfully paused the current track.",
    resumeTrackFailed = "I'm sorry, I couldn't resume the track: %s.",
    resumeTrackSuccess = "Successfully resumed the current track.",
    leaveChannelFailed = "I'm sorry, I couldn't leave the voice channel: %s.",
    leaveChannelSuccess = "Successfully left the voice channel.",
    repeatModeFailed = "I'm sorry, I couldn't modify repeat mode: %s.",
    repeatModeSuccess = "Successfully %s repeat mode.",
    shuffleModeFailed = "I'm sorry, I couldn't modify shuffle mode: %s.",
    shuffleModeSuccess = "Successfully %s shuffle mode.",
    addQueueFailed = "I'm sorry, I couldn't add the video into the music queue: %s.",
    addQueueSuccess = "Successfully added `%s` into the music queue.",
    removeQueueFailed = "I'm sorry, I couldn't remove `%s` from the music queue: %s.",
    removeQueueSuccess = "Successfully removed `%s` from the music queue.",
    queueIsEmpty = "I'm sorry, there is no music queued!"
};