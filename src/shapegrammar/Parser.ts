import GrammarRule from "./GrammarRule";
import Shape from "./Shape";
import Mesh from "../geometry/Mesh";
import {glMatrix, mat4, vec3, vec4} from 'gl-matrix';


class Parser {
  iterations: number;
  shapes: Shape[] = [];
  terminalShapes: Shape[] = [];
  terminalMap: Map<string, boolean> = new Map();
  grammarRules: Map<string, GrammarRule[]> = new Map();
  drawableMap: Map<string, Mesh> = new Map();

  constructor(i: number, box1: Mesh, box2: Mesh, box3: Mesh) {
    this.iterations = i;
    this.drawableMap.set('A', box1);
    this.drawableMap.set('B', box2);
    this.drawableMap.set('C', box3);
  }

  // Initialize this.shapes, this.terminalShapes, this.terminalMap
  initShapes() {
    this.terminalShapes.push(new Shape("A", vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
  }

  // Initialize this.grammarRules
  initRules() {
    
  }

  // Expands this.shapes and this.terminalShapes for this.iterations
  expand() {
    for (let i = 0; i < this.iterations; i++) {
      let newShapes: Shape[] = [];
      for (let j = 0; j < this.shapes.length; j++) {
        let currShape: Shape = this.shapes[j];
        // Check if shape is terminal
        if (this.terminalMap.get(currShape.symbol) == true) {
          this.terminalShapes.push(currShape);
          continue;
        }
        // Get the symbol's successors and save them until next iteration
        let rules: GrammarRule[] = this.grammarRules.get(currShape.symbol);
        let rule: GrammarRule = rules[this.getRandomNum(0, rules.length)];
        let successors: Shape[] = rule.expand(currShape);
        newShapes.concat(successors);
      }
      this.shapes = newShapes;
    }
  }

  getRandomNum(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  
  //Draws all Shapes with given Mesh
  drawMesh(slist: Shape[], mesh: Mesh) {
    let transformCol0Array = [];
    let transformCol1Array = [];
    let transformCol2Array = [];
    let transformCol3Array = [];
    let colorsArray = [];
    let n = 1;
    for (let i = 0; i < slist.length; i++) {
      colorsArray.push(.8);
      colorsArray.push(.8);
      colorsArray.push(.8);
      colorsArray.push(1.);

      let mat: mat4 = slist[i].getMatrix();
      for (let i = 0; i < 4; i++) {
        transformCol0Array.push(mat[i]);
      }
      for (let i = 4; i < 8; i++) {
        transformCol1Array.push(mat[i]);
      }
      for (let i = 8; i < 12; i++) {
        transformCol2Array.push(mat[i]);
      }
      for (let i = 12; i < 16; i++) {
        transformCol3Array.push(mat[i]);
      }
      n++;
    }
    let colors: Float32Array = new Float32Array(colorsArray);
    let transformCol0: Float32Array = new Float32Array(transformCol0Array);
    let transformCol1: Float32Array = new Float32Array(transformCol1Array);
    let transformCol2: Float32Array = new Float32Array(transformCol2Array);
    let transformCol3: Float32Array = new Float32Array(transformCol3Array);
    mesh.setColorsVBOs(colors);
    mesh.setNumInstances(n);
    mesh.setRotateVBOs(transformCol0, transformCol1, transformCol2, transformCol3);
  }

  draw() {
    let allShapes: Shape[] = this.shapes.concat(this.terminalShapes);
    this.drawableMap.forEach((value: Mesh, key: string) => {
      let keyShapes: Shape[] = [];
      //Gets all shape instances associated with that symbol
      for (let i = 0; i < allShapes.length; i++) {
        if (allShapes[i].symbol == key) {
          keyShapes.push(allShapes[i]);
        }
      }
      this.drawMesh(keyShapes, value);
    });
  }

  parse() {
    this.initShapes();
    this.initRules();
    this.expand();
    this.draw();
  }
}

export default Parser;