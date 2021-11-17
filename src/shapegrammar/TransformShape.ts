import {glMatrix, mat4, vec3, vec4} from 'gl-matrix';

class TransformShape {
    transformation: mat4;

    constructor(t: mat4) {
        this.transformation = t;
    }

    transform(): Shape {
        
    }
}

export default TransformShape;