import * as THREE from "three";
import { Ball } from "./Ball";
import { Juggler } from "./Juggler";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import createRBTree from "functional-red-black-tree";



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
    balls: Ball[];
    jugglers: Juggler[];

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
        camera.position.set(2, 2, 0.75);
        controls.target.set(0, 1, 0);
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

        this.balls = [];
        this.jugglers = [];
    }

    //TODO method to facilitate not having to add balls to the scene

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
    reset(): void {
        for (const juggler of this.jugglers) {
            juggler.dispose();
        }
        for (const ball of this.balls) {
            ball.dispose();
        }
    }

    soft_reset(): void {
        for (const ball of this.balls) {
            ball.timeline = createRBTree();
            this.scene.remove(ball.mesh);
        }
        for (const juggler of this.jugglers) {
            juggler.right_hand.timeline = createRBTree();
            juggler.left_hand.timeline = createRBTree();
        }
    }

    /*
    TODO : Add methods to easily use simulator class.
    Expose playBackRate, gravity
    Make time system adaptable to audio / no audio.
    Handle adding / removing juggler / patterns + sanitizing
    All aesthetic things (color, ground)
    */
}

// function create_juggler_mesh() {
//     const geometry = new THREE.CapsuleGeometry(0.5, 1.8);
//     const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
//     const juggler_mesh = new THREE.Mesh(geometry, material);
//     return juggler_mesh;
// }

export { Simulator, resizeRendererToDisplaySize, resizeRendererComposerToDisplaySize };
