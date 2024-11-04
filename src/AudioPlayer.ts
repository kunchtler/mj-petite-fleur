// Si on fait des play/pause constamment, this.media.currentTime n'aura pas forcément le temps de bien s'update.
//TODO : At some point, rather than CustomEvents, use Signals/Observer library ?

interface TimeConductorParam {
    min_time?: number;
    max_time?: number;
    start_time?: number;
    playback_rate?: number;
    autoplay?: boolean;
}

class TimeConductor {
    _last_update_time: number;
    _last_known_time: number;
    _playbackRate: number;
    _paused: boolean;
    _event_target: EventTarget;
    _timeupdate_interval?: number;

    constructor({
        start_time = 0,
        playback_rate = 1,
        autoplay = false
    }: TimeConductorParam) {
        this._last_update_time = performance.now() / 1000;
        this._last_known_time = start_time;
        this._playbackRate = playback_rate;
        this._event_target = new EventTarget();
        this._paused = true;
        if (autoplay) {
            this.play().catch(() => {
                throw new Error();
            });
        }
    }

    play(): Promise<void> {
        this._last_update_time = performance.now() / 1000;
        this._paused = false;
        this._event_target.dispatchEvent(new CustomEvent("play"));
        this._timeupdate_interval = setInterval(() => {
            this._event_target.dispatchEvent(new CustomEvent("timeupdate"));
        }, 100);
        return Promise.resolve();
    }

    pause(): void {
        this._last_known_time = this.currentTime;
        this._paused = true;
        this._event_target.dispatchEvent(new CustomEvent("pause"));
        clearInterval(this._timeupdate_interval);
    }

    set currentTime(time: number) {
        this._last_update_time = performance.now() / 1000;
        this._last_known_time = time;
    }

    get currentTime(): number {
        if (this.paused) {
            return this._last_known_time;
        } else {
            return (
                this._last_known_time +
                (performance.now() / 1000 - this._last_update_time) * this._playbackRate
            );
        }
    }

    set playbackRate(value: number) {
        //Compute last known time *before* setting playbackrate
        //as playbackrate is used in currentTime calculation.
        this._last_known_time = this.currentTime;
        this._last_update_time = performance.now() / 1000;
        this._playbackRate = value;
    }

    get playbackRate(): number {
        return this._playbackRate;
    }

    get paused(): boolean {
        return this._paused;
    }

    get playing(): boolean {
        return !this._paused;
    }
}

class MediaPlayer {
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

    get duration(): number {
        return this.media.duration;
    }

    get readyState(): number {
        return this.media.readyState;
    }
}

export { TimeConductor, MediaPlayer };
