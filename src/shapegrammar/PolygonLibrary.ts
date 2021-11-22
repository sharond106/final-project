import { vec2, vec3 } from "gl-matrix";
import Shape from "./Shape";

class PolygonLibrary {
  dimensionsMap: Map<string, vec3> = new Map();
  windowDimensions: vec2;
  
  constructor(dimensions: Map<string, vec3>) {
    this.dimensionsMap = dimensions;
    this.windowDimensions = vec2.fromValues(1, 1);
  }

  subdivideWindows(shape: Shape, outSymbol: string) : Shape[] {
    let dimensions = vec3.clone(this.dimensionsMap.get(shape.symbol));
    dimensions[0] *= Math.floor(shape.scale[0]);
    dimensions[1] *= Math.floor(shape.scale[1]);
    dimensions[2] *= Math.floor(shape.scale[2]);
    // how many rows of windows we want on each face
    let rows = dimensions[1];
    // how many cols of windows we want on front/back faces and left/right faces
    let frontBackCols = dimensions[0];
    let leftRightCols = dimensions[2];
    let outShapes: Shape[] = [];
    
    //front wall
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < frontBackCols; j++) {
        let pos = vec3.fromValues(dimensions[0] / frontBackCols / 2. + j - (dimensions[0] / 2.), i, dimensions[2] / 2.);
        vec3.add(pos, pos, shape.position);
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    // back wall
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < frontBackCols; j++) {
        let pos = vec3.fromValues(dimensions[0] / frontBackCols / 2. + j - (dimensions[0] / 2.), i, -dimensions[2] / 2.);
        vec3.add(pos, pos, shape.position);
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(0, 0, -1), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    // left wall
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < leftRightCols; j++) {
        let pos = vec3.fromValues(-dimensions[0] / 2., i, dimensions[2] / leftRightCols / 2. + j - (dimensions[2] / 2.));
        vec3.add(pos, pos, shape.position);
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(-1, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    // right wall
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < leftRightCols; j++) {
        let pos = vec3.fromValues(dimensions[0] / 2., i, dimensions[2] / leftRightCols / 2. + j - (dimensions[2] / 2.));
        vec3.add(pos, pos, shape.position);
        outShapes.push(new Shape(outSymbol, pos, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
      }
    }
    return outShapes;
  }
}

export default PolygonLibrary;