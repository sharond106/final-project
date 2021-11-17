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
      shape.rotateAboutRight(this.tx);
    }
    if (this.ry != 0) {
      shape.rotateAboutUp(this.ty);
    }
    if (this.rz != 0) {
      shape.rotateAboutForward(this.tz);
    }
    if (this.sx != 0) {
      shape.scaleX(this.tx);
    }
    if (this.sy != 0) {
      shape.scaleY(this.ty);
    }
    if (this.sz != 0) {
      shape.scaleZ(this.tz);
    }
    return shape;
  }
}

export default TransformationRule;