import * as THREE from "three";
import { Hand, HandPhysicsHandling } from "./Hand";
import { Object3DHelper } from "./Object3DHelper";
import { find_elbow } from "./utils";

type JugglerMesh = {
    head: THREE.Mesh;
    chest: THREE.Mesh;
    right_shoulder: THREE.Mesh;
    right_arm: THREE.Mesh;
    right_elbow: THREE.Mesh;
    right_forearm: THREE.Mesh;
    right_hand: THREE.Mesh;
    left_shoulder: THREE.Mesh;
    left_arm: THREE.Mesh;
    left_elbow: THREE.Mesh;
    left_forearm: THREE.Mesh;
    left_hand: THREE.Mesh;
    right_leg: THREE.Mesh;
    left_leg: THREE.Mesh;
};

//TODO : Split in two functions : one to create mesh, one to ass to scene ?
//TODO : Change the way head side scales and arms beahve with different parameters.
//TODO : Arm length as param ?
export function create_juggler_mesh(
    scene: THREE.Scene,
    height: number,
    width: number,
    depth: number
): JugglerMesh {
    const top_chest_length = width;
    const bottom_chest_length = (width * 2) / 3;
    const chest_height = (19 / 50) * height;
    const leg_height = (2 / 5) * height;
    const head_height = (1 / 5) * height;
    const head_chest_offset = (1 / 50) * height;
    const arm_length = (2 / 3) * chest_height;
    const arm_diameter = 0.05;
    const shoulder_radius = 0.08;
    const elbow_radius = 0.05;
    const hand_length = 0.05;
    const hand_width = 0.05 * 0.8;

    //Chest
    let chest_geometry: THREE.BufferGeometry = new THREE.CylinderGeometry(
        top_chest_length * Math.SQRT1_2,
        bottom_chest_length * Math.SQRT1_2,
        chest_height,
        4,
        1
    );
    chest_geometry.rotateY(Math.PI / 4);
    chest_geometry = chest_geometry.toNonIndexed();
    chest_geometry.computeVertexNormals();
    chest_geometry.scale(depth / top_chest_length, 1, 1);
    const chest_material = new THREE.MeshPhongMaterial({ color: "green" });
    const chest = new THREE.Mesh(chest_geometry, chest_material);
    chest.position.set(0, leg_height + chest_height / 2, 0);
    scene.add(chest);

    //Head
    const head_geometry = new THREE.SphereGeometry(head_height / 2);
    head_geometry.scale(0.8, 1, 0.8);
    const head = new THREE.Mesh(head_geometry, chest_material);
    head.position.set(0, chest_height / 2 + head_height / 2 + head_chest_offset, 0);
    chest.add(head);

    //Shoulders
    const shoulder_material = new THREE.MeshPhongMaterial({ color: "red" });
    const shoulder_geometry = new THREE.SphereGeometry(shoulder_radius);
    const right_shoulder = new THREE.Mesh(shoulder_geometry, shoulder_material);
    right_shoulder.position.set(0, chest_height / 2, top_chest_length / 2);
    //right_shoulder.material.visible = false;
    right_shoulder.rotateZ(-Math.PI / 2);
    right_shoulder.rotateY(-0.2);
    chest.add(right_shoulder);
    const left_shoulder = new THREE.Mesh(shoulder_geometry, shoulder_material);
    left_shoulder.position.set(0, chest_height / 2, -top_chest_length / 2);
    left_shoulder.rotateZ(-Math.PI / 2);
    left_shoulder.rotateY(0.2);
    chest.add(left_shoulder);

    //Arms
    const arm_material = new THREE.MeshPhongMaterial({ color: "white" });
    const arm_geometry = new THREE.BoxGeometry(arm_length, arm_diameter, arm_diameter);
    // const arm_geometry = new THREE.CylinderGeometry(0.03, 0.03, arm_length);
    // arm_geometry.rotateZ(Math.PI / 2);
    const right_arm = new THREE.Mesh(arm_geometry, arm_material);
    right_arm.position.set(arm_length / 2, 0, 0);
    right_shoulder.add(right_arm);
    const left_arm = new THREE.Mesh(arm_geometry, arm_material);
    left_arm.position.set(arm_length / 2, 0, 0);
    left_shoulder.add(left_arm);

    //Elbows
    const elbow_geometry = new THREE.SphereGeometry(elbow_radius);
    const right_elbow = new THREE.Mesh(elbow_geometry, shoulder_material);
    right_elbow.position.set(arm_length / 2, 0, 0);
    right_elbow.rotateZ(Math.PI / 2);
    right_arm.add(right_elbow);
    const left_elbow = new THREE.Mesh(elbow_geometry, shoulder_material);
    left_elbow.position.set(arm_length / 2, 0, 0);
    left_elbow.rotateZ(Math.PI / 2);
    left_arm.add(left_elbow);

    //Forearms
    const right_forearm = new THREE.Mesh(arm_geometry, arm_material);
    right_forearm.position.set(arm_length / 2, 0, 0);
    right_elbow.add(right_forearm);
    const left_forearm = new THREE.Mesh(arm_geometry, arm_material);
    left_forearm.position.set(arm_length / 2, 0, 0);
    left_elbow.add(left_forearm);

    //Hands
    const hand_geometry = new THREE.SphereGeometry(hand_length);
    hand_geometry.scale(1, hand_width / hand_length, hand_width / hand_length);
    const hand_material = new THREE.MeshPhongMaterial({ color: "black" });
    const right_hand = new THREE.Mesh(hand_geometry, hand_material);
    right_hand.position.set(arm_length / 2, 0, 0);
    right_forearm.add(right_hand);
    const left_hand = new THREE.Mesh(hand_geometry, hand_material);
    left_hand.position.set(arm_length / 2, 0, 0);
    left_forearm.add(left_hand);

    //Legs
    const leg_width = (3 / 7) * (bottom_chest_length / 2);
    const leg_depth = ((3 / 4) * (bottom_chest_length * depth)) / top_chest_length;
    const leg_geometry = new THREE.BoxGeometry(leg_depth, leg_height, leg_width);
    leg_geometry.translate(0, -leg_height / 2, 0);
    const right_leg = new THREE.Mesh(leg_geometry, chest_material);
    right_leg.position.set(0, -chest_height / 2, bottom_chest_length / 2 - (5 / 8) * leg_width);
    chest.add(right_leg);
    const left_leg = new THREE.Mesh(leg_geometry, chest_material);
    left_leg.position.set(0, -chest_height / 2, -(bottom_chest_length / 2 - (5 / 8) * leg_width));
    chest.add(left_leg);

    return {
        head: head,
        chest: chest,
        right_shoulder: right_shoulder,
        right_arm: right_arm,
        right_elbow: right_elbow,
        right_forearm: right_forearm,
        right_hand: right_hand,
        left_shoulder: left_shoulder,
        left_arm: left_arm,
        left_elbow: left_elbow,
        left_forearm: left_forearm,
        left_hand: left_hand,
        right_leg: right_leg,
        left_leg: left_leg
    };
}

class Juggler {
    height: number;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    mesh: THREE.Mesh;
    readonly hands: [Hand, Hand];
    readonly right_hand: Hand;
    readonly left_hand: Hand;
    juggling_origin: THREE.Object3D;
    shoulder: THREE.Object3D;
    elbow: THREE.Object3D;
    arm_length: number;
    target: THREE.Object3D;

    constructor(height = 1.8, width = 0.3, depth = 0.5, arm_length = 0.4) {
        this.height = height;
        this.arm_length = arm_length;
        const basic_geometry = new THREE.BoxGeometry(width, height, depth);
        //this.geometry = new THREE.EdgesGeometry(basic_geometry);
        //this.material = new THREE.LineBasicMaterial({ color: "black", linewidth: 2 });
        basic_geometry.translate(0, height / 2, 0);
        this.geometry = basic_geometry;
        this.material = new THREE.MeshPhongMaterial({ color: "yellow", wireframe: false });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //this.wireframe = new THREE.LineSegments(this.geometry, this.material);
        //this.mesh.translateY(height / 2);
        this.juggling_origin = new THREE.Object3D();
        const hand_physics_handling: HandPhysicsHandling = {
            min_dist: 0.05,
            max_dist: depth / 2,
            up_vector: new THREE.Vector3(0, 1, 0),
            right_vector: new THREE.Vector3(0, 0, 1),
            origin_object: this.juggling_origin
        };
        this.right_hand = new Hand(hand_physics_handling, true);
        this.left_hand = new Hand(hand_physics_handling, false);
        this.hands = [this.right_hand, this.left_hand];

        this.juggling_origin.add(new Object3DHelper());
        this.juggling_origin.position.set(arm_length, height - 0.4 - arm_length, 0);

        this.mesh.add(this.juggling_origin);
        this.juggling_origin.add(this.hands[0].mesh);
        this.juggling_origin.add(this.hands[1].mesh);

        this.shoulder = new THREE.Object3D();
        this.shoulder.position.set(0, height - 0.4, depth / 2);
        this.mesh.add(this.shoulder);
        this.shoulder.add(new Object3DHelper());

        this.elbow = new THREE.Object3D();
        this.elbow.position.set(0, 0, 0);
        this.mesh.add(this.elbow);
        this.elbow.add(new Object3DHelper());

        this.target = new THREE.Object3D();
        this.target.position.set(0, 0, depth / 2);
        this.mesh.add(this.target);
        this.target.add(new Object3DHelper());
    }

    render = (time: number): void => {
        //Receives the time in seconds.
        this.hands[0].render(time);
        this.hands[1].render(time);
        this.elbow.position.copy(
            find_elbow(
                this.shoulder.position,
                this.mesh.worldToLocal(this.right_hand.get_global_position(time)),
                this.arm_length,
                this.arm_length,
                this.target.position
            )
        );
    };

    /**
     * Properly deletes the resources. Call when instance is not needed anymore to free ressources.
     */
    //TODO : Handle elbow, whole mesh, etc...
    dispose() {
        if (this.mesh.parent !== null) {
            this.mesh.parent.remove(this.mesh);
        }
        this.geometry.dispose();
        this.material.dispose();

        // juggling_origin: THREE.Object3D;
        // shoulder: THREE.Object3D;
        // elbow: THREE.Object3D;
        // arm_length: number;
        // target: THREE.Object3D;

        for (const hand of this.hands) {
            hand.dispose();
        }
    }
}

export { Juggler };
