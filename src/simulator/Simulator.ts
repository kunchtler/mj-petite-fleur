import * as THREE from "three";
import { Ball } from "./Ball";
import { Juggler } from "./Juggler";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { Table } from "./Table";

function resizeRendererToDisplaySize(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera
    // init_tan_fov: number,
    // init_window_height: number
) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        // camera.fov =
        //     (360 / Math.PI) * Math.atan(init_tan_fov * (window.innerHeight / init_window_height));
        camera.updateProjectionMatrix();
    }
}

function resizeRendererComposerToDisplaySize(
    renderer: THREE.WebGLRenderer,
    composer: EffectComposer,
    camera: THREE.PerspectiveCamera
) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        composer.setSize(width, height);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

class Simulator {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    // controls: OrbitControls;
    controls: OrbitControls;
    balls: Map<string, Ball>;
    jugglers: Map<string, Juggler>;
    tables: Map<string, Table>;
    playBackRate: number;
    paused: boolean;
    // paused: boolean;

    constructor(canvas_id: string) {
        // Scene setup
        const canvas = document.querySelector(canvas_id);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("The provided canvas_id is not of type HTMLCanvasElement.");
        }
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        const scene = new THREE.Scene();
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 50);
        const controls = new OrbitControls(camera, renderer.domElement);
        //camera.position.set(0.0796859236518283, 2.466905446060931, -0.003956106766785765);
        camera.position.set(2.0, 1.5, 0);
        controls.target.set(0, 1.4, 0);
        controls.update();

        const background_color = window.getComputedStyle(canvas).backgroundColor;
        scene.background = new THREE.Color(background_color);

        // Helpers
        const axes_helper = new THREE.AxesHelper(1.5);
        axes_helper.position.y = 0.001;
        scene.add(axes_helper);
        const grid_helper = new THREE.GridHelper(30, 30);
        scene.add(grid_helper);

        //Lighting
        const ambient_light = new THREE.AmbientLight(scene.background, 2);
        scene.add(ambient_light);
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(4, 2, -1);
        scene.add(light);

        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        this.controls = controls;
        // controls.addEventListener("change", () => {
        //     renderer.render(this.scene, this.camera);
        // });

        this.balls = new Map();
        this.jugglers = new Map();
        this.tables = new Map();

        this.paused = true;
        this.playBackRate = 1.0;
    }

    //TODO method to facilitate not having to add balls to the scene
    addJuggler(name: string, juggler: Juggler, position: THREE.Vector3): void {
        if (this.jugglers.has(name)) {
            console.log(`Overriding existing juggler ${name}.`);
            this.removeJuggler(name);
        }
        this.jugglers.set(name, juggler);
        juggler.mesh.position.set(position.x, position.y, position.z);
        this.scene.add(juggler.mesh);
    }

    removeJuggler(name: string): void {
        const juggler = this.jugglers.get(name);
        if (juggler !== undefined) {
            this.jugglers.delete(name);
            this.scene.remove(juggler.mesh);
            juggler.dispose();
        }
    }

    addBall(name: string, ball: Ball) {
        if (this.balls.has(name)) {
            console.log(`Overriding existing ball ${name}.`);
            this.removeBall(name);
        }
        this.balls.set(name, ball);
        this.scene.add(ball.mesh);
    }

    removeBall(name: string): void {
        const ball = this.balls.get(name);
        if (ball !== undefined) {
            this.balls.delete(name);
            this.scene.remove(ball.mesh);
            ball.dispose();
        }
    }

    addTable(name: string, table: Table) {
        if (this.tables.has(name)) {
            console.log(`Overriding existing ball ${name}.`);
            this.removeBall(name);
        }
        this.tables.set(name, table);
        this.scene.add(table.mesh);
    }

    removeTable(name: string): void {
        const table = this.tables.get(name);
        if (table !== undefined) {
            this.tables.delete(name);
            this.scene.remove(table.mesh);
            table.dispose();
        }
    }

    render = (time: number): void => {
        //TODO : Who should receive the time in seconds ? ball.render also ?
        time *= 0.001; // convert time to seconds
        resizeRendererToDisplaySize(this.renderer, this.camera);

        this.balls.forEach((ball) => {
            ball.render(time);
        });
        this.jugglers.forEach((juggler) => {
            juggler.render(time);
        });

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.render);
    };

    //TODO : SHouldn't hands / jugglers handle removal from scene ?
    // TODO : Reset position etc
    reset(): void {
        for (const name of this.jugglers.keys()) {
            this.removeJuggler(name);
        }
        for (const name of this.balls.keys()) {
            this.removeJuggler(name);
        }
        for (const name of this.tables.keys()) {
            this.removeJuggler(name);
        }
    }

    // soft_reset(): void {
    //     for (const ball of this.balls) {
    //         ball.timeline.clear();
    //         this.scene.remove(ball.mesh);
    //     }
    //     for (const juggler of this.jugglers) {
    //         juggler.right_hand.timeline.clear();
    //         juggler.left_hand.timeline.clear();
    //     }
    // }

    /*
    TODO : Add methods to easily use simulator class.
    Expose playBackRate, gravity
    Make time system adaptable to audio / no audio.
    Handle adding / removing juggler / patterns + sanitizing
    All aesthetic things (color, ground)
    */
}



export { Simulator, resizeRendererToDisplaySize, resizeRendererComposerToDisplaySize };
