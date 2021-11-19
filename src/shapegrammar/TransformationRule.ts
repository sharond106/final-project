import { vec3 } from "gl-matrix";
import Shape from "./Shape";

// Stores a list of resulting symbols and their transformations 
class TransformationRule {
  tx: number;
  ty: number;
  tz: number;
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;

  constructor(tx: number, ty: number, tz: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number) {
    this.tx = tx;
    this.ty = ty;
    this.tz = tz;
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
  } 

  transform(shape: Shape) : Shape{
    if (this.tx != 0) {
      shape.moveRight(this.tx);
    }
    if (this.ty != 0) {
      shape.moveUp(this.ty);
    }
    if (this.tz != 0) {
      shape.moveForward(this.tz);
    }
    if (this.rx != 0) {
      shape.rotateAboutRight(this.rx);
    }
    if (this.ry != 0) {
      shape.rotateAboutUp(this.ry);
    }
    if (this.rz != 0) {
      shape.rotateAboutForward(this.rz);
    }
    if (this.sx != 1) {
      shape.scaleX(this.sx);
    }
    if (this.sy != 1) {
      shape.scaleY(this.sy);
    }
    if (this.sz != 1) {
      shape.scaleZ(this.sz);
    }
    return shape;
  }
}

export default TransformationRule;