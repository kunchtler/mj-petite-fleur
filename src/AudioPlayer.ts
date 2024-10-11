// Si on fait des play/pause constamment, this.media.currentTime n'aura pas forcément le temps de bien s'update.
class AudioPlayer {
    media: HTMLMediaElement;
    _last_update_time: number;
    _last_known_time: number;

    constructor(media: HTMLMediaElement) {
        this.media = media;
        this._last_update_time = performance.now() / 1000;
        this._last_known_time = this.media.currentTime;
    }

    play(): Promise<void> {
        this._last_update_time = performance.now() / 1000;
        this._last_known_time = this.media.currentTime;
        return this.media.play();
    }

    pause(): void {
        this.media.pause();
    }

    set currentTime(time: number) {
        this.media.currentTime = time;
        this._last_update_time = performance.now() / 1000;
        this._last_known_time = time;
    }

    get currentTime(): number {
        if (this.paused) {
            return this.media.currentTime;
        } else {
            return (
                this._last_known_time +
                (performance.now() / 1000 - this._last_update_time) * this.media.playbackRate
            );
        }
    }

    set playbackRate(value: number) {
        //Compute last known time *before* setting playbackrate
        //as playbackrate is used in currentTime calculation.
        this._last_known_time = this.currentTime;
        this._last_update_time = performance.now() / 1000;
        this.media.playbackRate = value;
    }

    get playbackRate(): number {
        return this.media.playbackRate;
    }

    get paused(): boolean {
        return this.media.paused;
    }

    get playing(): boolean {
        return !this.media.paused;
    }
}

export { AudioPlayer };
