import { vec3 } from "gl-matrix";
import Shape from "./Shape";

// Stores a list of resulting symbols and their transformations 
class TransformationRule {
  symbolResult: string;
  translations: vec3[];
  rotations: vec3[];
  scales: vec3[];

  constructor(symbols: string, t: vec3[], r: vec3[], s: vec3[]) {
    this.symbolResult = symbols;
    this.translations = t;
    this.rotations = r;
    this.scales = s;
  } 

  transform(shape: Shape) : Shape {

  }
}

export default TransformationRule;