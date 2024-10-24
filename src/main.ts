/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as THREE from "three";
import { resizeRendererToDisplaySize, Simulator } from "./Simulator";
import { Ball } from "./Ball";
import { Juggler } from "./Juggler";
import * as TWEAKPANE from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import * as Tone from "tone";
import { lance } from "./Interactive_siteswap_player";
import { MediaPlayer } from "./AudioPlayer";

//TODO : With react, handle volume button being pressed as interaction ?
//TODO : Test on phone if touch correctly starts audio
//TODO : Add the option for no audio/normal audio/spatialized audio
//TODO : Add option to mute a juggler/some balls ?
//TODO : Camlecase or underscores ?
//TODO Bugged buffer load if not await in main code.
//TODO : Put code in simulator
//TODO : Remove the fact that hand get closer depending on unit time (simplifies code)
//TODO : Cap Hand movement
//TODO : Implement juggler model
//TODO : Merge juggler geometries
//TODO : Fixer le décalage musique / image quand on utilise le slider temporel (demanderait de passer par web audio api avec controle manuel du temps ?) ou alors juste en étandant Player de Tonejs ?
//TODO : Dans petite fleur, tester le u plus petit dans les fonctions.
//TODO : Remake system to sync with tonejs transport ? (to allow for smooth bpm transitions for instance)
//TODO : Change sfx playbackrate based on music playbackrate.

//TODO : Controles fonctionnent bien sur firefox, à voire sur chrome et tel.

/// URL Parameters (temp) ///
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mute_simulator = urlParams.get("mute-simulator") === "1";
const mute_video = urlParams.get("mute-video") === "1";


const video_html_elem = document.getElementById("video_player");
const play_pause_button = document.getElementById("play_button");
const seek_bar = document.getElementById("time_slider");
const play_icon = document.getElementById("play_icon");

if (
    !(
        video_html_elem instanceof HTMLVideoElement &&
        play_pause_button instanceof HTMLButtonElement &&
        seek_bar instanceof HTMLInputElement &&
        play_icon instanceof HTMLImageElement
    )
) {
    throw Error("Couldn't grab all references from js.");
}

seek_bar.value = "0";

const video = new MediaPlayer(video_html_elem);

let had_ended = false;

play_pause_button.addEventListener("click", async () => {
    if (had_ended) {
        video.currentTime = 0;
    }
    if (video.playing) {
        video.pause();
    } else {
        if (Tone.getContext().state === "suspended") {
            await Tone.start();
        }
        await video.play();
    }
});

video_html_elem.addEventListener("play", () => {
    had_ended = false;
    play_icon.src = "icons/pause.svg";
});

video_html_elem.addEventListener("pause", () => {
    had_ended = false;
    play_icon.src = "icons/play.svg";
});

video_html_elem.addEventListener("ended", () => {
    had_ended = true;
    play_icon.src = "icons/loop.svg";
});

video_html_elem.addEventListener("timeupdate", () => {
    seek_bar.value = video.currentTime.toString();
});

let resume_on_click: boolean | undefined = undefined;

seek_bar.addEventListener("click", async () => {
    if (resume_on_click) {
        await video.play();
    }
    resume_on_click = undefined;
});

seek_bar.addEventListener("input", () => {
    if (resume_on_click === undefined) {
        resume_on_click = video.playing || play_icon.src === "icons/loop.svg";
        if (video.playing) {
            video.pause();
        }
    }
});

seek_bar.addEventListener("change", async () => {
    video.currentTime = parseFloat(seek_bar.value);
    if (had_ended) {
        await video.play();
    }
});

if (video.readyState >= 1) {
    seek_bar.max = video.duration.toString();
} else {
    video_html_elem.addEventListener("loadedmetadata", () => {
        seek_bar.max = video.duration.toString();
    });
}

const transport = Tone.getTransport();
// const transport = new TransportPlayback();
const context = Tone.getContext();

const handle_load_end = (() => {
    let load_ready = 0;
    return () => {
        load_ready++;
        if (load_ready === 2) {
            const wait_screen = document.querySelector("#wait_screen");
            if (!(wait_screen instanceof Element)) {
                throw new Error();
            }
            wait_screen.classList.add("fade_out");
            wait_screen.addEventListener("animationend", async () => {
                wait_screen.remove();
                await video.play();
            });
        }
    };
})();

// Handling of the first user input before playing audio.
const first_interaction_event_types = ["mousedown", "keydown", "touchstart"];

async function handle_first_interaction(event: Event) {
    for (const event_type of first_interaction_event_types) {
        event.currentTarget?.removeEventListener(event_type, handle_first_interaction, true);
    }
    const text_element = document.querySelector("#wait_user");
    if (!(text_element instanceof HTMLParagraphElement)) {
        throw new Error();
    }
    text_element.textContent = "User interaction detected ✔️";
    await Tone.start();
    handle_load_end();
    //We block the promise until resolved
    // await Tone.start()
    //     .then(() => {
    //         console.log("User interaction detected. Ready to play audio");
    //         return Tone.loaded();
    //     })
    //     .then(() => {
    //         console.log("Audio buffers all loaded !");
    //         //transport.start();
    //     })
    //     .catch((reason: unknown) => {
    //         throw new Error(`Unable to setup the audio to play. Reason : ${reason}`);
    //         //console.log(reason);
    //     });
}

for (const event_type of first_interaction_event_types) {
    document.body.addEventListener(event_type, handle_first_interaction, true);
}

async function handle_sounds_loaded() {
    await Tone.loaded();
    const text_element = document.querySelector("#wait_load");
    if (!(text_element instanceof HTMLParagraphElement)) {
        throw new Error();
    }
    text_element.textContent = "Sound loaded ✔️";
    handle_load_end();
}

const sfx_buffers = {
    heavy_hit1: new Tone.ToneAudioBuffer("grelot_balls_sfx/heavy_hit1.mp3"),
    heavy_hit2: new Tone.ToneAudioBuffer("grelot_balls_sfx/heavy_hit2.mp3"),
    heavy_hit3: new Tone.ToneAudioBuffer("grelot_balls_sfx/heavy_hit3.mp3"),
    normal_hit1: new Tone.ToneAudioBuffer("grelot_balls_sfx/normal_hit1.mp3"),
    normal_hit2: new Tone.ToneAudioBuffer("grelot_balls_sfx/normal_hit2.mp3"),
    weak_hit1: new Tone.ToneAudioBuffer("grelot_balls_sfx/weak_hit1.mp3"),
    weak_hit2: new Tone.ToneAudioBuffer("grelot_balls_sfx/weak_hit2.mp3"),
    shaker: new Tone.ToneAudioBuffer("grelot_balls_sfx/shaker.mp3"),
    weak_hit_shaker: new Tone.ToneAudioBuffer("grelot_balls_sfx/weak_hit_shaker.mp3")
};

//TODO : CHange music_raw name
// const music_raw = new Audio("petite_fleur_vincent.mp3");
// const music_raw = new Audio("petite_fleur_mid.mp4");
// const music = new MediaPlayer(video_html_elem);
const music_tone = context.createMediaElementSource(video_html_elem);
const music_gain = new Tone.Gain(mute_video ? 0 : 3).toDestination();
Tone.connect(music_tone, music_gain);
const sfx_gain = new Tone.Gain(mute_simulator ? 0 : 2).toDestination();
// sfx_gain.gain.value = 0;
// music_gain.gain.value = 0;

if (video.readyState >= 3) {
    await handle_sounds_loaded();
} else {
    video_html_elem.addEventListener("loadeddata", handle_sounds_loaded, { once: true });
}

const simulator = new Simulator("#simulator_canvas");
const scene = simulator.scene;
const renderer = simulator.renderer;
const camera = simulator.camera;

//create_juggler_mesh(scene, 2.0, 0.5, 0.3);

simulator.jugglers = [new Juggler(2.0)];
const vincent = simulator.jugglers[0];
// vincent.mesh.position.set(-1, 0, 1);
// vincent.mesh.rotateY(Math.PI / 2);

//TODO : Handle properly this await (by loading the sounds for the balls only when Tone has loaded the buffer.)
await Tone.loaded();
for (const color of ["red", "green", "blue"]) {
    const player = new Tone.Players(sfx_buffers);
    const panner = new Tone.Panner3D({ panningModel: "HRTF", rolloffFactor: 1 });
    player.connect(panner);
    panner.connect(sfx_gain);
    simulator.balls.push(new Ball(color, 0.08, undefined, player, panner, undefined));
}

const tweakpane_container = document.querySelector(".tp-dfwv");
if (!(tweakpane_container instanceof HTMLElement)) {
    throw new Error();
}
const pane = new TWEAKPANE.Pane({ container: tweakpane_container });

//////////////// Petite Fleur ////////////////

const weak_hit = ["weak_hit1", "weak_hit2"];
const normal_hit = ["normal_hit1", "normal_hit2"];
const heavy_hit = ["heavy_hit1", "heavy_hit2", "heavy_hit3"];

// Petite Fleur
const left = vincent.left_hand;
const right = vincent.right_hand;
const ball0 = simulator.balls[0];
const ball1 = simulator.balls[1];
const ball2 = simulator.balls[2];
let balls = [ball0, ball1, ball2];
let hands = [right, left];
let u = 60 / 264;
let d = (u * 9) / 10;
let d1 = u / 3;
let u2 = 60 / 277;
let d2 = (u2 * 9) / 10;
let d21 = u2 / 3;
// const t = 56.153;

// let t = 5.729 - 5 * u;
let t = 5.2 - 5 * u;

function swap<T>(list: T[], order?: number[]): void {
    if (list.length === 0) {
        return;
    }
    if (order === undefined) {
        order = [];
        for (let i = 0; i < list.length; i++) {
            order.push((i + 1) % list.length);
        }
    }
    const list2: T[] = [];
    for (let i = 0; i < list.length; i++) {
        list2.push(list[order[i]]);
    }
    for (let i = 0; i < list.length; i++) {
        list[i] = list2[i];
    }
}

//TODO : Inverser fonction lance pour dire plutto le temps d'attrapage de la balle, et son temps de vol ?
//1st section (video: 5:16)
lance(balls[0], t + 0 * u + d, 5 * u - d, left, right, u, heavy_hit);
lance(balls[1], t + 3 * u + d, 3 * u - d, right, left, u, weak_hit);
lance(balls[2], t + 4 * u + d, 3 * u - d, left, right, u, weak_hit);
lance(balls[0], t + 5 * u + d, 3 * u - d, right, left, u, weak_hit);
lance(balls[1], t + 6 * u + d, 3 * u - d, left, right, u, weak_hit);
t = t + 7 * u;
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        lance(balls[2], t + 0 * u + d, 4 * u - d, hands[0], hands[0], u, normal_hit);
        lance(balls[0], t + 1 * u + d, 4 * u - d, hands[1], hands[1], u, normal_hit);
        lance(balls[1], t + 2 * u + d1, 1 * u - d1, hands[0], hands[1], u, heavy_hit);
        swap(balls, [2, 0, 1]);
        swap(hands);
        t = t + 3 * u;
    }
    lance(balls[2], t + 0 * u + d, 3 * u - d, left, right, u, weak_hit);
    lance(balls[0], t + 1 * u + d, 3 * u - d, right, left, u, weak_hit);
    lance(balls[1], t + 2 * u + d, 3 * u - d, left, right, u, weak_hit);
    lance(balls[2], t + 3 * u + d, 3 * u - d, right, left, u, weak_hit);
    lance(balls[0], t + 4 * u + d, 3 * u - d, left, right, u, weak_hit);
    lance(balls[1], t + 5 * u + d, 3 * u - d, right, left, u, weak_hit);
    lance(balls[2], t + 6 * u + d, 3 * u - d, left, right, u, weak_hit);
    swap(balls, [1, 2, 0]);
    hands = [right, left];
    t = t + 7 * u;
}
for (let j = 0; j < 2; j++) {
    lance(balls[2], t + 0 * u + d, 4 * u - d, hands[0], hands[0], u, normal_hit);
    lance(balls[0], t + 1 * u + d, 4 * u - d, hands[1], hands[1], u, normal_hit);
    lance(balls[1], t + 2 * u + d1, 1 * u - d1, hands[0], hands[1], u, heavy_hit);
    swap(balls, [2, 0, 1]);
    swap(hands);
    t = t + 3 * u;
}
lance(balls[2], t + 0 * u + d, 4 * u - d, right, right, u, heavy_hit);
lance(balls[1], t + 2 * u + d1, 1 * u - d1, right, left, u, heavy_hit);
t = t + 5 * u;

//2nd section (video: 5:31)
//TODO : Besoin de resynchroniser t avec le temps de l'audio ?
// t = 21.426 - 8 * u;
t = 20.897 - 8 * u;

hands = [left, right];
balls = [balls[0], balls[2], balls[1]];
for (let i = 0; i < 5; i++) {
    lance(balls[0], t + 0 * u + d, 3 * u - d, hands[0], hands[1], u, weak_hit);
    swap(balls);
    swap(hands);
    t = t + 1 * u;
}
balls = [balls[1], balls[2], balls[0]];
for (let j = 0; j < 3; j++) {
    lance(balls[2], t + 0 * u + d, 4 * u - d, hands[0], hands[0], u, normal_hit);
    lance(balls[0], t + 1 * u + d, 4 * u - d, hands[1], hands[1], u, normal_hit);
    lance(balls[1], t + 2 * u + d1, 1 * u - d1, hands[0], hands[1], u, heavy_hit);
    swap(balls, [2, 0, 1]);
    swap(hands);
    t = t + 3 * u;
}
for (let i = 0; i < 7; i++) {
    lance(balls[2], t + 0 * u + d, 3 * u - d, hands[0], hands[1], u, weak_hit);
    swap(balls);
    swap(hands);
    t = t + 1 * u;
}
for (let j = 0; j < 3; j++) {
    lance(balls[2], t + 0 * u + d, 4 * u - d, hands[0], hands[0], u, normal_hit);
    lance(balls[0], t + 1 * u + d, 4 * u - d, hands[1], hands[1], u, normal_hit);
    lance(balls[1], t + 2 * u + d1, 1 * u - d1, hands[0], hands[1], u, heavy_hit);
    swap(balls, [2, 0, 1]);
    swap(hands);
    t = t + 3 * u;
}
lance(balls[2], t + 0 * u + d, 4 * u - d, hands[0], hands[0], u, normal_hit);
t = t + 1 * u;
//TODO : The transition between u and u2 is a mess but since both values
//are close, it is not noticable).
lance(balls[0], t + 0 * u + d2, 5 * u2 - d2, hands[1], hands[0], u, heavy_hit);
lance(balls[1], t + 1 * u + d1, 1 * u - d1, hands[0], hands[1], u, heavy_hit);
lance(balls[1], t + 2 * u + d2, 5 * u2 - d2, hands[1], hands[0], u, heavy_hit);
lance(balls[2], t + 3 * u + d21, 1 * u2 - d21, hands[0], hands[1], u, heavy_hit);
swap(balls, [2, 0, 1]);
t = t + 3 * u + u2;
for (let i = 0; i < 16; i++) {
    lance(balls[0], t + 0 * u2 + d2, 5 * u2 - d2, hands[1], hands[0], u2, heavy_hit);
    lance(balls[1], t + 1 * u2 + d21, 1 * u2 - d21, hands[0], hands[1], u2, heavy_hit);
    swap(balls, [1, 2, 0]);
    t = t + 2 * u2;
}
lance(balls[0], t + 0 * u2 + d2, 5 * u2 - d2, right, left, u2, normal_hit);
lance(balls[1], t + 1 * u2 + d21, 1 * u2 - d21, left, right, u2, heavy_hit);
lance(balls[1], t + 2 * u2 + d2, 4.5 * u2 - d2, right, left, u2, heavy_hit);
lance(balls[2], t + 3 * u2 + d21, 1 * u2 - d21, left, right, u2, normal_hit);
lance(balls[2], t + 4 * u2 + d2, 4 * u2 - d2, right, left, u2, normal_hit);
lance(balls[0], t + 5 * u2 + d21, 1 * u2 - d21, left, right, u2, heavy_hit);
lance(balls[0], t + 6 * u2 + d2, 3 * u2 - d2, right, left, u2, normal_hit);
lance(balls[1], t + 6.5 * u2 + d21, 0.5 * u2 - 0.5 * d21, left, right, u2, heavy_hit);
// lance(balls[1], t + 3.5 * u, 2.5 * u - d, left, right, u);
lance(balls[2], t + 8 * u2 + d2, 2 * u2 - d2, left, right, u2, normal_hit);
lance(balls[1], t + 8.5 * u2 + d2, 3.5 * u2 - d2, right, right, u2, "shaker");
// lance(balls[1], t + 1 * u, 1 * u - d, right, left, u);
lance(balls[2], t + 10 * u2 + d21, 1 * u2 - d21, right, left, u2, heavy_hit);
// lance(balls[1], t + 1 * u, 1 * u - d, right, left, u);

//3rd section (video 5:52)
// lance(balls[0], t + 0*u, 5*u - d, left, right, u);
// lance(balls)

//4th section (video 6:07)

//5th section (video 6:21)

//6th section (video 6:38)

//End (video 6:54)

// for (let i = 0; i < 10; i++) {
//     lance(balls[0], t + 0 * u, 3.5 * u - d, left, left, u, heavy_hit);
//     lance(balls[1], t + 1 * u, 4 * u - d, right, left, u, heavy_hit);
//     lance(balls[2], t + 2 * u, 1 * u - d, left, right, u, heavy_hit);
//     lance(balls[2], t + 3 * u, 3 * u - d, right, left, u, normal_hit);
//     lance(balls[0], t + 3.5 * u, 0.5 * u - d, left, right, u, heavy_hit);
//     // lance(balls[0], t + 4 * u, 1.5 * u - d, right, right, u);
//     lance(balls[1], t + 5 * u, 2 * u - d, left, right, u, normal_hit);
//     lance(balls[0], t + 5.5 * u, 3.5 * u - d, right, right, u, normal_hit);
//     lance(balls[2], t + 6 * u, 4 * u - d, left, left, u, normal_hit);
//     lance(balls[1], t + 7 * u, 1 * u - d, right, left, u, heavy_hit);
//     const tmp = balls[0];
//     balls[0] = balls[1];
//     balls[1] = tmp;
//     balls[2] = balls[2];
//     t = t + 8 * u;
// }

//////////////// Editeur de patterns ////////////////

// // Configuration
// const colors = ["red", "green", "blue", "purple", "yellow", "orange", "pink"];
// const u2 = 0.25;
// const d2 = u2 / 2;
// //Default value of siteswap in siteswap_blade
// const PARAMS = {
//     Siteswap: "(66)(20)(40)"
// };
// //TODO: Handle pattern errors
// //Build siteswap_blade and check change
// const siteswap_blade = pane.addBinding(PARAMS, "Siteswap");
// siteswap_blade.on("change", (ev) => {
//     if (ev.value != "") {
//         simulator.reset_pattern();
//         lance_pattern(conv_siteswap_to_pattern(ev.value), colors, u2, d2, vincent, simulator);
//     }
// });

// const visitor = new MyVisitor<pier[]>();
// const result = visitor.visit(tree);
// console.log(result);
// //Pattern
// //Const pattern with default value
// const pattern = conv_siteswap_to_pattern(PARAMS.Siteswap);
// lance_pattern(pattern, colors, u2, d2, vincent, simulator);

//////////////// Editeur de patterns ////////////////

// const u = 0.25;
// const d = u / 2;
// for (let i = 0; i < 100; i++) {
//     lance(
//         simulator.balls[i % 3],
//         1 + i * u,
//         3 * u - d,
//         vincent.hands[i % 2],
//         vincent.hands[(i + 1) % 2],
//         u,
//         ["normal_hit1", "normal_hit2"]
//     );
// }

// lance(ball1, 1 + 1*u, 3 * u - d, left_hand, right_hand, u);
// lance(ball2, 1 + 2*u, 3 * u - d, right_hand, left_hand, u);
// lance(ball0, 1 + 3*u, 3 * u - d, left_hand, right_hand, u);
// lance(ball1, 1 + 4*u, 3 * u - d, right_hand, left_hand, u);
// lance(ball2, 1 + 5*u, 3 * u - d, left_hand, right_hand, u);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);

// pane.registerPlugin(EssentialsPlugin);
// const fpsGraph = pane.addBlade({
//     view: "fpsgraph",
//     label: "FPS",
//     rows: 2
// }) as EssentialsPlugin.FpsGraphBladeApi;
// const monitor = {
//     video_time: 0,
//     audio_time: 0,
//     audio_control: 0,
//     playback_rate: 1,
//     transport_play: transport.state === "started",
//     music: video,
//     mute_music: music_gain.gain.value === 0,
//     mute_sfx: sfx_gain.gain.value === 0
// };
// pane.addBinding(monitor, "video_time", {
//     readonly: true
// });
// pane.addBinding(monitor, "audio_time", {
//     readonly: true
// });
// const blade = pane.addBinding(monitor, "audio_time", {
//     min: 0,
//     max: 100,
//     step: 0.1
// });
// blade.on("change", (ev) => {
//     if (ev.last) {
//         video.currentTime = ev.value;
//         if (monitor.transport_play && video.paused) {
//             video.play().catch(() => {
//                 throw new Error("Problem");
//             });
//         }
//     }
// });

// const blade_playback_rate = pane.addBinding(monitor, "playback_rate", {
//     min: 0.5,
//     max: 2,
//     step: 0.1
// });
// blade_playback_rate.on("change", (ev) => {
//     if (ev.last) {
//         video.playbackRate = ev.value;
//     }
// });
// const play_blade = pane.addBinding(monitor, "transport_play", { label: "Play" });
// play_blade.on("change", async (ev) => {
//     if (!ev.value) {
//         // transport.pause();
//         video.pause();
//     } else {
//         if (Tone.getContext().state === "suspended") {
//             await Tone.start();
//         }
//         await Tone.loaded();
//         await video.play();
//     }
// });
// const mute_music = pane.addBinding(monitor, "mute_music", { label: "Mute Music" });
// mute_music.on("change", (ev) => {
//     music_gain.gain.value = ev.value ? 0 : 3;
// });
// const mute_sfx = pane.addBinding(monitor, "mute_sfx", { label: "Mute Sounds" });
// mute_sfx.on("change", (ev) => {
//     sfx_gain.gain.value = ev.value ? 0 : 2;
// });

// const init_tan_fov = Math.tan(((Math.PI / 180) * camera.fov) / 2);
// const init_window_height = window.innerHeight;

function render(t: number) {
    // fpsGraph.begin();
    // const time = t * 0.001; // convert time to seconds
    const video_time = video.currentTime;
    // monitor.video_time = time;
    // monitor.audio_time = video_time;

    resizeRendererToDisplaySize(renderer, camera /*, init_tan_fov, init_window_height*/);

    simulator.balls.forEach((ball) => {
        ball.render(video_time);
        if (!video.paused) {
            ball.play_on_catch(video_time);
        }
    });
    simulator.jugglers.forEach((juggler) => {
        juggler.render(video_time);
    });

    const listener = Tone.getListener();
    const camera_pos = camera.localToWorld(new THREE.Vector3(0, 0, 0));
    listener.positionX.value = camera_pos.x;
    listener.positionY.value = camera_pos.y;
    listener.positionZ.value = camera_pos.z;
    const camera_dir = camera.localToWorld(new THREE.Vector3(0, 0, -1)).sub(camera_pos);
    listener.forwardX.value = camera_dir.x;
    listener.forwardY.value = camera_dir.y;
    listener.forwardZ.value = camera_dir.z;
    const camera_up = camera.localToWorld(camera.up.clone()).sub(camera_pos);
    listener.upX.value = camera_up.x;
    listener.upY.value = camera_up.y;
    listener.upZ.value = camera_up.z;

    renderer.render(scene, camera);

    // fpsGraph.end();
    requestAnimationFrame(render);
}

simulator.jugglers.forEach((juggler) => {
    scene.add(juggler.mesh);
});
simulator.balls = simulator.balls.filter((ball) => {
    return ball.timeline.length !== 0;
});
simulator.balls.forEach((ball) => {
    scene.add(ball.mesh);
});

requestAnimationFrame(render);
