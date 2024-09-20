import * as THREE from "three";
import { Ball } from "./Ball";
import { Juggler } from "./Juggler";
import { CWeakRef } from "./CustomWeakRef";

//TODO : Custom positions for balls ?
//TODO : What about multiple balls in the same place ?
class Table {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    mesh: THREE.Mesh;

    constructor() {
        const leg_geometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    }

    // _compute_positions(notes: string[]) {

    // }

    // find_position(ball: Ball) {

    // }
}
