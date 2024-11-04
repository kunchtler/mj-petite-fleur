import { FollowableTargetInterface } from "./Timeline";
import * as THREE from "three";
import { Ball } from "./Ball";

// const table_placement = {
//     "do": THREE.Vector2(1, 1);
//     "re": THREE.Vector2(1, 2);
//     "mi": THREE.Vector2
//     "fa":
//     "sol":
//     "la":
//     "si":
// }

class Table /*implements FollowableTargetInterface*/ {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    mesh: THREE.Mesh;
    height: number;

    constructor() {
        this.height = 1;
        this.geometry = new THREE.BoxGeometry(3, this.height, 2);
        this.material = new THREE.MeshPhongMaterial({ color: "brown" });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    global_spot_position(ball: Ball): THREE.Vector3 {
        return this.mesh.localToWorld(this.mesh.up.clone().multiplyScalar(this.height / 2));
    }

    dispose(): void {
        if (this.mesh.parent !== null) {
            this.mesh.parent.remove(this.mesh);
        }
        this.geometry.dispose();
        this.material.dispose();
    }
}

export { Table };
