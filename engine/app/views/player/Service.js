import TrackPlayer from 'react-native-track-player';

const onPlaybackState = (args: any) => {
    let message;

    switch (args.state) {
        case TrackPlayer.STATE_BUFFERING: message = 'STATE_BUFFERING'; break;
        case TrackPlayer.STATE_NONE: message = 'STATE_NONE'; break;
        case TrackPlayer.STATE_PAUSED: message = 'STATE_PAUSED'; break;
        case TrackPlayer.STATE_PLAYING: message = 'STATE_PLAYING'; break;
        case TrackPlayer.STATE_READY: message = 'STATE_READY'; TrackPlayer.play(); break;
        case TrackPlayer.STATE_STOPPED: message = 'STATE_STOPPED'; break;
        default: message = `unknow state const ${args.state}`; break;
    }

    console.warn('playback-state', message);
}


module.exports = async function() {
    TrackPlayer.addEventListener('remote-play', () => {
        TrackPlayer.play()
    });

    TrackPlayer.addEventListener('remote-pause', () => {
        TrackPlayer.pause()
    });

    TrackPlayer.addEventListener('remote-next', () => {
        TrackPlayer.skipToNext()
    });

    TrackPlayer.addEventListener('remote-previous', () => {
        TrackPlayer.skipToPrevious()
    });

    TrackPlayer.addEventListener('remote-seek', async (event) => {
        TrackPlayer.seekTo(event.position);
    });

    TrackPlayer.addEventListener("remote-jump-forward",  async (event) => {
        let position = await TrackPlayer.getPosition();
        let newPosition = position + event.interval;
        await TrackPlayer.seekTo(newPosition);
    });

    TrackPlayer.addEventListener("remote-jump-backward",  async (event) => {
        let position = await TrackPlayer.getPosition();
        let newPosition = position > 9 ? position - event.interval : 0;
        await TrackPlayer.seekTo(newPosition);
    });

    TrackPlayer.addEventListener('remote-stop', () => {
        TrackPlayer.destroy()
    });

    TrackPlayer.addEventListener('playback-state', onPlaybackState);

    /*
        TrackPlayer.addEventListener('playback-error', onPlaybackError);

     */
};
