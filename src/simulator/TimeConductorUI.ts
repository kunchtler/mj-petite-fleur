//TODO : Change classNames to be more specific to this function.
//Or even give them as parameters ?

import { TimeConductor } from "./AudioPlayer";

export function createControls(htmlElem: HTMLElement, timeConductor: TimeConductor): void {
    const controlElem = document.createElement("div");
    controlElem.className = "controls";
    const playPauseButton = document.createElement("button");
    playPauseButton.className = "play-button";
    const playIcon = document.createElement("img");
    playIcon.className = "icon";
    const seekBar = document.createElement("input");
    seekBar.className = "time_slider";
    seekBar.type = "range";
    seekBar.min = "0";
    seekBar.max = "20";
    seekBar.value = "0";
    seekBar.step = "any";
    htmlElem.appendChild(controlElem);
    controlElem.appendChild(playPauseButton);
    playPauseButton.appendChild(playIcon);
    controlElem.appendChild(seekBar);

    let hadEnded = false;

    playPauseButton.addEventListener("click", async () => {
        if (hadEnded) {
            timeConductor.currentTime = 0;
        }
        if (timeConductor.playing) {
            timeConductor.pause();
        } else {
            await timeConductor.play();
        }
    });

    timeConductor._eventTarget.addEventListener("play", () => {
        hadEnded = false;
        playIcon.src = "icons/pause.svg";
    });

    timeConductor._eventTarget.addEventListener("pause", () => {
        hadEnded = false;
        playIcon.src = "icons/play.svg";
    });

    // video_html_elem.addEventListener("ended", () => {
    //     had_ended = true;
    //     play_icon.src = "icons/loop.svg";
    // });

    timeConductor._eventTarget.addEventListener("timeupdate", () => {
        const duration = parseInt(seekBar.max);
        const current_time = timeConductor.currentTime;
        seekBar.value = (current_time < duration ? current_time : duration).toString();
    });

    let resume_on_click: boolean | undefined = undefined;

    seekBar.addEventListener("click", async () => {
        if (resume_on_click) {
            await timeConductor.play();
        }
        resume_on_click = undefined;
    });

    seekBar.addEventListener("input", () => {
        if (resume_on_click === undefined) {
            resume_on_click = timeConductor.playing || playIcon.src === "icons/loop.svg";
            if (timeConductor.playing) {
                timeConductor.pause();
            }
        }
    });

    seekBar.addEventListener("change", async () => {
        timeConductor.currentTime = parseFloat(seekBar.value);
        if (hadEnded) {
            await timeConductor.play();
        }
    });
}
