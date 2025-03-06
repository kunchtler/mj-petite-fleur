// Si on fait des play/pause constamment, this.media.currentTime n'aura pas forcément le temps de bien s'update.
//TODO : At some point, rather than CustomEvents, use Signals/Observer library ?

interface TimeConductorParam {
    minTime?: number;
    maxTime?: number;
    startTime?: number;
    playbackRate?: number;
    autoplay?: boolean;
}

class TimeConductor {
    private _lastUpdateTime: number;
    private _lastKnownTime: number;
    private _playbackRate: number;
    private _paused: boolean;
    _eventTarget: EventTarget;
    private _timeupdateInterval?: number;

    constructor({ startTime = 0, playbackRate = 1, autoplay = false }: TimeConductorParam) {
        this._lastUpdateTime = performance.now() / 1000;
        this._lastKnownTime = startTime;
        this._playbackRate = playbackRate;
        this._eventTarget = new EventTarget();
        this._paused = true;

        if (autoplay) {
            this.play().catch(() => {
                throw new Error();
            });
        }
    }

    play(): Promise<void> {
        this._lastUpdateTime = performance.now() / 1000;
        this._paused = false;
        this._eventTarget.dispatchEvent(new CustomEvent("play"));
        this._timeupdateInterval = window.setInterval(() => {
            this._eventTarget.dispatchEvent(new CustomEvent("timeupdate"));
        }, 100);
        return Promise.resolve();
    }

    pause(): void {
        this._lastKnownTime = this.currentTime;
        this._paused = true;
        this._eventTarget.dispatchEvent(new CustomEvent("pause"));
        clearInterval(this._timeupdateInterval);
    }

    set currentTime(time: number) {
        this._lastUpdateTime = performance.now() / 1000;
        this._lastKnownTime = time;
    }

    get currentTime(): number {
        if (this.paused) {
            return this._lastKnownTime;
        } else {
            return (
                this._lastKnownTime +
                (performance.now() / 1000 - this._lastUpdateTime) * this._playbackRate
            );
        }
    }

    set playbackRate(value: number) {
        //Compute last known time *before* setting playbackrate
        //as playbackrate is used in currentTime calculation.
        this._lastKnownTime = this.currentTime;
        this._lastUpdateTime = performance.now() / 1000;
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
    _lastUpdateTime: number;
    _lastKnownTime: number;

    constructor(media: HTMLMediaElement) {
        this.media = media;
        this._lastUpdateTime = performance.now() / 1000;
        this._lastKnownTime = this.media.currentTime;
    }

    play(): Promise<void> {
        this._lastUpdateTime = performance.now() / 1000;
        this._lastKnownTime = this.media.currentTime;
        return this.media.play();
    }

    pause(): void {
        this.media.pause();
    }

    set currentTime(time: number) {
        this.media.currentTime = time;
        this._lastUpdateTime = performance.now() / 1000;
        this._lastKnownTime = time;
    }

    get currentTime(): number {
        if (this.paused) {
            return this.media.currentTime;
        } else {
            return (
                this._lastKnownTime +
                (performance.now() / 1000 - this._lastUpdateTime) * this.media.playbackRate
            );
        }
    }

    set playbackRate(value: number) {
        //Compute last known time *before* setting playbackrate
        //as playbackrate is used in currentTime calculation.
        this._lastKnownTime = this.currentTime;
        this._lastUpdateTime = performance.now() / 1000;
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
