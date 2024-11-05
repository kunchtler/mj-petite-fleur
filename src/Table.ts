import { FollowableTargetInterface } from "./Timeline";
import * as THREE from "three";
import { Ball } from "./Ball";
import { Object3DHelper } from "./Object3DHelper";
import { theWindow } from "tone/build/esm/core/context/AudioContext";

//TODO : Rename Ball_placement en balls_spot

interface TableConstructorParameters {
    height?: number;
    surface_real_dimensions?: [number, number];
    surface_internal_dimensions?: [number, number];
    balls_placement?: Record<string, THREE.Vector2>;
}

class Table {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    mesh: THREE.Mesh;
    height: number;
    width: number;
    depth: number;
    balls_placement: Record<string, THREE.Vector2>;
    _surface_internal: THREE.Object3D;

    constructor({
        height = 1,
        surface_real_dimensions = [1.1, 0.7],
        surface_internal_dimensions = [1, 1],
        balls_placement = {}
    }: TableConstructorParameters) {
        this.height = height;
        this.width = surface_real_dimensions[1];
        this.depth = surface_real_dimensions[0];
        this.balls_placement = balls_placement;
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        this.geometry.translate(0, this.height / 2, 0);
        this.material = new THREE.MeshPhongMaterial({ color: "brown" });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this._surface_internal = new THREE.Object3D();
        this._surface_internal.position.set(-this.width / 2, this.height, -this.depth / 2);
        this._surface_internal.add(new Object3DHelper(true, undefined, true));
        this.mesh.add(this._surface_internal);
        this._surface_internal.scale.set(
            this.width / surface_internal_dimensions[1],
            1,
            this.depth / surface_internal_dimensions[0]
        );
        this._surface_internal.add(new THREE.GridHelper(10, 10, "orange", "orange"));
    }

    global_ball_position(ball_name: string): THREE.Vector3 {
        if (ball_name in this.balls_placement) {
            const pos = this.balls_placement[ball_name];
            return this._surface_internal.localToWorld(new THREE.Vector3(pos.x, 0, pos.y));
        }
        return new THREE.Vector3(0, 0, 0);
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
