import * as THREE from "three";

export class Object3DHelper extends THREE.Group {
    constructor(show_point = true, color: number | string = 0x000000, show_axes = true) {
        super();
        if (show_point) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 2);
            const material = new THREE.MeshBasicMaterial({
                wireframe: true,
                fog: false,
                toneMapped: false,
                color: color
            });
            const mesh = new THREE.Mesh(geometry, material);
            this.add(mesh);
        }
        if (show_axes) {
            const axes = new THREE.AxesHelper(0.15);
            this.add(axes);
        }
    }
}

/**
 * Converts a vector (in the mathematical sense) from world to local coordinates.
 * @param vec a Vector3 in world coordinates.
 * @param obj the target Object3D for local coordinates.
 * @returns a vector in local coordinates.
 */
export function worlToLocalVector(vec: THREE.Vector3, obj: THREE.Object3D) {
    return obj.worldToLocal(vec.clone()).sub(obj.worldToLocal(new THREE.Vector3(0, 0, 0)));
}

export function localToWorldVector(vec: THREE.Vector3, obj: THREE.Object3D) {
    return obj.localToWorld(vec.clone()).sub(obj.localToWorld(new THREE.Vector3(0, 0, 0)));
}

export function worldToLocalPosition(pos: THREE.Vector3, obj: THREE.Object3D) {
    return obj.worldToLocal(pos.clone());
}

export function localToWorldPosition(pos: THREE.Vector3, obj: THREE.Object3D) {
    return obj.localToWorld(pos.clone());
}
