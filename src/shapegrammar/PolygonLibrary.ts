import { vec2, vec3 } from "gl-matrix";
import Shape from "./Shape";

class PolygonLibrary {
  dimensionsMap: Map<string, vec3> = new Map();
  windowDimensions: vec2;
  shapes: Shape[] = [];
  windows: Shape[] = [];
  
  constructor(dimensions: Map<string, vec3>) {
    this.dimensionsMap = dimensions;
    this.windowDimensions = vec2.fromValues(1, 1);
  }

  getShapeDimensions(shape: Shape): vec3 {
    let dimensions = vec3.clone(this.dimensionsMap.get(shape.symbol));
    dimensions[0] *= shape.scale[0];
    dimensions[1] *= shape.scale[1];
    dimensions[2] *= shape.scale[2];
    return dimensions;
  }

  intersectsSomething(currShape: Shape, pos: vec3, p: vec3): boolean {
    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      let relativeP: vec3 = vec3.fromValues(0, 0, 0);
      // Get p relative to shape's center (shape's position is center of bottom)
      let dimensions: vec3 = this.getShapeDimensions(shape);
      vec3.subtract(relativeP, p, shape.position);
      relativeP[1] -= dimensions[1] / 2.;
      vec3.divide(dimensions, dimensions, vec3.fromValues(2, 2, 2));
      if (shape != currShape && shape.isInside(relativeP, dimensions)) {
        return true;
      }
    }
    console.log("p=" + pos)
    for (let i = 0; i < this.windows.length; i++) {
      let shape = this.windows[i];
      console.log("total:" + this.windows.length + " " + shape.symbol + " " + shape.position);
      let relativeP: vec3 = vec3.fromValues(0, 0, 0);
      let dimensions: vec3 = this.getShapeDimensions(shape);
      vec3.subtract(relativeP, p, shape.position);
      relativeP[1] -= dimensions[1] / 2.;
      vec3.divide(dimensions, dimensions, vec3.fromValues(2, 2, 2));
      if (vec3.equals(shape.position, pos) || shape.isInside(relativeP, dimensions)) {
        console.log("inside")
        return true;
      }
    }
    return false;
  }

  // center = center of object, leftEdgeDist = distance from center of left edge
  objIntersectsSomething(currShape: Shape, pos: vec3, center: vec3, leftEdgeDist: vec3, topEdgeDist: vec3): boolean {
    let topLeft: vec3 = vec3.fromValues(0, 0, 0);
    vec3.subtract(topLeft, center, leftEdgeDist);
    vec3.add(topLeft, topLeft, topEdgeDist);
    if (this.intersectsSomething(currShape, pos, topLeft)) {
      return true;
    }
    let bottomLeft: vec3 = vec3.fromValues(0, 0, 0);
    vec3.subtract(bottomLeft, center, leftEdgeDist);
    vec3.subtract(bottomLeft, bottomLeft, topEdgeDist);
    if (this.intersectsSomething(currShape, pos, bottomLeft)) {
      return true;
    }
    let topRight: vec3 = vec3.fromValues(0, 0, 0);
    vec3.add(topRight, center, leftEdgeDist);
    vec3.add(topRight, topRight, topEdgeDist);
    if (this.intersectsSomething(currShape, pos, topRight)) {
      return true;
    }
    let bottomRight: vec3 = vec3.fromValues(0, 0, 0);
    vec3.add(bottomRight, center, leftEdgeDist);
    vec3.subtract(bottomRight, bottomRight, topEdgeDist);
    if (this.intersectsSomething(currShape, pos, bottomRight)) {
      return true;
    }
    if (Math.random() > .5) {
      return true;
    }
    return false;
  }

  subdivideWindows(shape: Shape, outSymbols: string[]) : Shape[] {
    let dimensions = this.getShapeDimensions(shape);

    // how many rows of windows we want on each face
    let rows = Math.floor(dimensions[1]);
    // how many cols of windows we want on front/back faces and left/right faces
    let frontBackCols = Math.floor(dimensions[0]);
    let leftRightCols = Math.floor(dimensions[2]);
    let outShapes: Shape[] = [];
    // console.log("subdividing " + shape.symbol + " at " + shape.position + " scale " + shape.scale + " r" + rows + " c" + frontBackCols + " " + leftRightCols)
    
    //front wall
    let unifNum = .4;
    let unifSmall = .001
    let outSymbol = outSymbols[Math.floor(Math.random() * outSymbols.length)];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < frontBackCols; j++) {
        let pos = vec3.fromValues(dimensions[0] / frontBackCols / 2. + j - (dimensions[0] / 2.), i, dimensions[2] / 2.);
        vec3.add(pos, pos, shape.position);
        if (this.objIntersectsSomething(shape, pos, vec3.fromValues(pos[0], pos[1] + unifNum, pos[2] + unifSmall), vec3.fromValues(unifNum, 0, 0), vec3.fromValues(0, unifNum, 0))) {
          continue;
        }
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    // back wall
    outSymbol = outSymbols[Math.floor(Math.random() * outSymbols.length)];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < frontBackCols; j++) {
        let pos = vec3.fromValues(dimensions[0] / frontBackCols / 2. + j - (dimensions[0] / 2.), i, -dimensions[2] / 2.);
        vec3.add(pos, pos, shape.position);
        if (this.objIntersectsSomething(shape, pos, vec3.fromValues(pos[0], pos[1] + unifNum, pos[2] - unifSmall), vec3.fromValues(unifNum, 0, 0), vec3.fromValues(0, unifNum, 0))) {
          continue;
        }
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(0, 0, -1), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    // left wall
    outSymbol = outSymbols[Math.floor(Math.random() * outSymbols.length)];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < leftRightCols; j++) {
        let pos = vec3.fromValues(-dimensions[0] / 2., i, dimensions[2] / leftRightCols / 2. + j - (dimensions[2] / 2.));
        vec3.add(pos, pos, shape.position);
        if (this.objIntersectsSomething(shape, pos, vec3.fromValues(pos[0] - unifSmall, pos[1] + unifNum, pos[2]), vec3.fromValues(0, 0, unifNum), vec3.fromValues(0, unifNum, 0))) {
          continue;
        }
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(-1, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    // right wall
    outSymbol = outSymbols[Math.floor(Math.random() * outSymbols.length)];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < leftRightCols; j++) {
        let pos = vec3.fromValues(dimensions[0] / 2., i, dimensions[2] / leftRightCols / 2. + j - (dimensions[2] / 2.));
        vec3.add(pos, pos, shape.position);
        if (this.objIntersectsSomething(shape, pos, vec3.fromValues(pos[0]  + unifSmall, pos[1] + unifNum, pos[2]), vec3.fromValues(0, 0, unifNum), vec3.fromValues(0, unifNum, 0))) {
          continue;
        }
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    this.windows = this.windows.concat(outShapes);
    return outShapes;
  }
}

export default PolygonLibrary;