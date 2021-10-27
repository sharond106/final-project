import {glMatrix, mat4, vec3, vec4} from 'gl-matrix';

class Turtle {
  position: vec3;
  forward: vec3;
  right: vec3;
  up: vec3;
  recursionDepth: number; // number of [ before any ]
  stepSize: number;
  xScale: number;
  zScale: number;

  constructor(pos: vec3, f: vec3, r: vec3, u: vec3) {
    this.position = pos;
    this.forward = f;
    this.right = r;
    this.up = u;
    this.recursionDepth = 0;
    this.stepSize = 2;
    this.xScale = 1;
    this.zScale = 1;
  }

  moveForward() {
    this.move(this.forward, this.stepSize);
  }

  moveRight() {
    this.move(this.right, this.stepSize);
  }

  moveUp() {
    this.move(this.up, this.stepSize);
  }

  moveUpAndScale(factor: number) {
    this.move(this.up, this.stepSize);
    this.scale(factor);
  }

  moveUpLeaf() {
    this.move(this.up, 1);
  }

  move(dir: vec3, step: number) {
    let offset: vec3 = vec3.create();
    vec3.scale(offset, dir, step);
    vec3.add(this.position, this.position, offset);
  }

  scale(factor: number) {
    this.xScale = factor;
    this.zScale = factor;
  }

  rotateAboutForward(deg: number) {
    let mat: mat4 = mat4.create();
    mat4.rotate(mat, mat4.create(), glMatrix.toRadian(deg), this.forward);
    let right: vec4 = vec4.create();
    vec4.transformMat4(right, vec4.fromValues(this.right[0], this.right[1], this.right[2], 0), mat);
    vec4.normalize(right, right);
    this.right = vec3.fromValues(right[0], right[1], right[2]);
    let up: vec4 = vec4.create();
    vec4.transformMat4(up, vec4.fromValues(this.up[0], this.up[1], this.up[2], 0), mat);
    vec4.normalize(up, up);
    this.up = vec3.fromValues(up[0], up[1], up[2]);
  }

  rotateAboutRight(deg: number) {
    let mat: mat4 = mat4.create();
    mat4.rotate(mat, mat4.create(), glMatrix.toRadian(deg), this.right);
    let forward: vec4 = vec4.create();
    vec4.transformMat4(forward, vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0), mat);
    vec4.normalize(forward, forward);
    this.forward = vec3.fromValues(forward[0], forward[1], forward[2]);
    let up: vec4 = vec4.create();
    vec4.transformMat4(up, vec4.fromValues(this.up[0], this.up[1], this.up[2], 0), mat);
    vec4.normalize(up, up);
    this.up = vec3.fromValues(up[0], up[1], up[2]);
  }

  rotateAboutUp(deg: number) {
    let mat: mat4 = mat4.create();
    mat4.rotate(mat, mat4.create(), glMatrix.toRadian(deg), this.up);
    let forward: vec4 = vec4.create();
    vec4.transformMat4(forward, vec4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0), mat);
    vec4.normalize(forward, forward);
    this.forward = vec3.fromValues(forward[0], forward[1], forward[2]);
    let right: vec4 = vec4.create();
    vec4.transformMat4(right, vec4.fromValues(this.right[0], this.right[1], this.right[2], 0), mat);
    vec4.normalize(right, right);
    this.right = vec3.fromValues(right[0], right[1], right[2]);
  }

  rotateAboutUpAndRight(degUp: number, degRight: number) {
    this.rotateAboutUp(degUp);
    this.rotateAboutRight(degRight);
  }

  rotateAboutUpAndForward(degUp: number, degForward: number) {
    this.rotateAboutUp(degUp);
    this.rotateAboutForward(degForward);
  }

  incRecursionDepth() {
    this.recursionDepth++;
  }

  decRecursionDepth() {
    this.recursionDepth--;
  }

  getMatrix(oldPos: vec3): mat4 {
    let translate: mat4 = mat4.create();
    mat4.fromTranslation(translate, this.position);

    let rotate: mat4 = mat4.create();
    mat4.set(rotate, this.right[0], this.right[1], this.right[2], 0, 
                    this.up[0], this.up[1], this.up[2], 0,
                    this.forward[0], this.forward[1], this.forward[2], 0,
                    0, 0, 0, 1);

    let scale: mat4 = mat4.create();
    mat4.scale(scale, mat4.create(), vec3.fromValues(this.xScale, vec3.distance(oldPos, this.position), this.zScale))

    mat4.multiply(rotate, rotate, scale);
    mat4.multiply(translate, translate, rotate);
    return translate;
  }
}

export default Turtle;