import {glMatrix, mat4, vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';

class Shape {
  symbol: string;
  geometry: Drawable;
  position: vec3;
  forward: vec3;
  right: vec3;
  up: vec3;
  scale: vec3;
  terminal: boolean;

  constructor(symbol: string, geo: Drawable, pos: vec3, f: vec3, r: vec3, u: vec3, s: vec3, terminal: boolean) {
    this.symbol = symbol;
    this.geometry = geo;
    this.position = pos;
    this.forward = f;
    this.right = r;
    this.up = u;
    this.scale = s;
    this.terminal = terminal;
  }

  moveForward(stepSize: number) {
    this.move(this.forward, stepSize);
  }

  moveRight(stepSize: number) {
    this.move(this.right, stepSize);
  }

  moveUp(stepSize: number) {
    this.move(this.up, stepSize);
  }

  move(dir: vec3, step: number) {
    let offset: vec3 = vec3.create();
    vec3.scale(offset, dir, step);
    vec3.add(this.position, this.position, offset);
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

  scaleX(factor: number) {
    this.scale[0] *= factor;
  }

  scaleY(factor: number) {
    this.scale[1] *= factor;
  }

  scaleZ(factor: number) {
    this.scale[2] *= factor;
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
    mat4.scale(scale, mat4.create(), this.scale);

    mat4.multiply(rotate, rotate, scale);
    mat4.multiply(translate, translate, rotate);
    return translate;
  }
}

export default Shape;