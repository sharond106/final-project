import GrammarRule from "./GrammarRule";
import Shape from "./Shape";
import Mesh from "../geometry/Mesh";
import TransformationRule from "./TransformationRule";
import {glMatrix, mat4, vec3, vec4} from 'gl-matrix';
import PolygonLibrary from "./PolygonLibrary";

class Parser {
  iterations: number;
  shapes: Shape[] = [];
  terminalShapes: Shape[] = [];
  windows: Shape[] = [];
  terminalMap: Map<string, boolean> = new Map();
  grammarRules: Map<string, GrammarRule[]> = new Map();
  drawableMap: Map<string, Mesh> = new Map();
  dimensionsMap: Map<string, vec3> = new Map();
  colorsMap: Map<string, vec3> = new Map();
  polyLibrary: PolygonLibrary;

  constructor (box1: Mesh, box2: Mesh, box3: Mesh, box4: Mesh, box5: Mesh, box6: Mesh, window1: Mesh, door: Mesh, window2: Mesh, terrace: Mesh,
    building_color: number[], windows_color: number[], terrace_color: number[], iterations: number, window_density: number) {
    this.iterations = iterations;
    this.drawableMap.set('A', box1);
    this.dimensionsMap.set('A', vec3.fromValues(1, 1, 1));
    this.drawableMap.set('B', box2);
    this.dimensionsMap.set('B', vec3.fromValues(1.5, 1.5, 1.5));
    this.drawableMap.set('C', box3);
    this.dimensionsMap.set('C', vec3.fromValues(2, 2, 2));
    this.drawableMap.set('D', box4);
    this.dimensionsMap.set('D', vec3.fromValues(1, 1, 1));
    this.drawableMap.set('E', box5);
    this.dimensionsMap.set('E', vec3.fromValues(1.5, 1.5, 1.5));
    this.drawableMap.set('F', box6);
    this.dimensionsMap.set('F', vec3.fromValues(2, 2, 2));
    this.drawableMap.set('T', terrace);
    this.dimensionsMap.set('T', vec3.fromValues(1, 1, 1));
    this.drawableMap.set('W', window1);
    this.dimensionsMap.set('W', vec3.fromValues(1, 1, .2));
    this.drawableMap.set('X', window2);
    this.dimensionsMap.set('X', vec3.fromValues(1, 1, .2));
    this.drawableMap.set('Y', door);
    this.dimensionsMap.set('Y', vec3.fromValues(1, 1, 1));
    this.setColorMap(building_color, windows_color, terrace_color);
                    
    this.polyLibrary = new PolygonLibrary(this.dimensionsMap);
    this.polyLibrary.windowDensity = window_density;
  }

  setColorMap(building_c: number[], windows_c: number[], terrace_c: number[]) {
    let building_color = vec3.fromValues(building_c[0], building_c[1], building_c[2]);
    let windows_color = vec3.fromValues(windows_c[0], windows_c[1], windows_c[2]);
    let terrace_color = vec3.fromValues(terrace_c[0], terrace_c[1], terrace_c[2]);
    vec3.divide(building_color, building_color, vec3.fromValues(255, 255, 255));
    vec3.divide(windows_color, windows_color, vec3.fromValues(255, 255, 255));
    vec3.divide(terrace_color, terrace_color, vec3.fromValues(255, 255, 255));
    this.colorsMap.set('A',building_color); 
    this.colorsMap.set('B',building_color); 
    this.colorsMap.set('C',building_color); 
    this.colorsMap.set('D',building_color); 
    this.colorsMap.set('E',building_color); 
    this.colorsMap.set('F',building_color); 
    this.colorsMap.set('T',terrace_color); 
    this.colorsMap.set('W',windows_color); 
    this.colorsMap.set('X',windows_color); 
    this.colorsMap.set('Y',windows_color); 
  }

  // Initialize this.shapes, this.terminalShapes, this.terminalMap
  initShapes() {  
    this.shapes.push(new Shape("A", vec3.fromValues(0, -1.5, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 1, 1)));
    this.terminalMap.set("D", true);
    this.terminalMap.set("E", true);
    this.terminalMap.set("F", true);
    this.terminalMap.set("T", true);
    this.terminalMap.set("W", true);
  }

  flipList(l: number[]) {
    for (let i = 0; i < l.length; i++) {
      l[i] *= -1
    }
  }

  initRule(nextSymbols: string[], 
    tx: number[], ty: number[], tz: number[], 
    rx: number[], ry: number[], rz: number[],
    sx: number[], sy: number[], sz: number[],
    randomizeDirection: boolean) : GrammarRule {
    
    let tRules: TransformationRule[] = [];
    
    if (randomizeDirection) {
      let seed: number = Math.random();
      if (seed > .5) {
        this.flipList(tx);
      }
      if (seed > .75 || seed < .25) {
        let l: number[] = tx;
        tx = tz;
        tz = l;
      }
    }

    for (let i = 0; i < nextSymbols.length; i++) {
      tRules.push(new TransformationRule(tx[i], ty[i], tz[i], rx[i], ry[i], rz[i], sx[i], sy[i], sz[i]))
    }
    return new GrammarRule(nextSymbols, tRules);
  }

  initEntry(symbol: string, rule: GrammarRule) {
    if (this.grammarRules.has(symbol)) {
      this.grammarRules.get(symbol).push(rule);
    } else {
      this.grammarRules.set(symbol, [rule]); 
    }
  }

  // Initialize this.grammarRules
  initRules() {
    this.initEntry("A", this.initRule(["A", "B"], [0, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 1], [1, 1], [1, 1], false));
    this.initEntry("A", this.initRule(["A", "A", "B"], [0, 1, 1], [0, 0, 0], [0, .5, -.75], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1.5, 1], [1, 1, 1], [1, 1, 1], false));
    this.initEntry("A", this.initRule(["D", "C"], [-1, -2], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [2, 1], [1, 1], [1, 1.5], false));
    this.initEntry("B", this.initRule(["B", "C"], [0, 0], [0, 0], [0, -1.5], [0, 0], [0, 0], [0, 0], [1, 1], [1, 1], [1, 1], false));
    this.initEntry("B", this.initRule(["E", "F", "C"], [0, 0, 1.5], [0, 0, 0], [0, 1.5, 1.5], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1], false));
    this.initEntry("B", this.initRule(["B", "C"], [0, -1.5], [0, 0], [0, 1.5], [0, 0], [0, 0], [0, 0], [1, 1], [1, 1], [1, 1], false));
    this.initEntry("C", this.initRule(["C", "D"], [0, 0], [0, 1.5], [0, 0], [0, 0], [0, 0], [0, 0], [1, 1.5], [1, 1], [1, 1], false));
    this.initEntry("C", this.initRule(["F", "B"], [0, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 2], [1, 1], [1, 1], false));
    this.initEntry("C", this.initRule(["F", "T", "T", "T", "T", "T", "T"], 
                                      [0, 1.5, 2.5, 3.5, 1.5, 2.5, 3.5], [0, 0, 0, 0, 0, 0, 0], [0, .5, .5 ,.5, -.5, -.5, -.5], 
                                      [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], 
                                      [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], true));
    
  }

  // Expands this.shapes and this.terminalShapes for this.iterations
  expand() {
    for (let i = 0; i < this.iterations; i++) {
      let newShapes: Shape[] = [];
      for (let j = 0; j < this.shapes.length; j++) {
        let currShape: Shape = this.shapes[j];
        
        //Making it such tha terraces do not scale
        if (currShape.symbol == "T") {
          currShape.scale = vec3.fromValues(1.0, 1.0, 1.0);
        }
        // Check if shape is terminal
        if (this.terminalMap.get(currShape.symbol) == true) {
          this.terminalShapes.push(currShape);
          continue;
        }
        // Get the symbol's successors and save them until next iteration
        let rules: GrammarRule[] = this.grammarRules.get(currShape.symbol);
        let rule: GrammarRule = rules[Math.floor(Math.random() * rules.length)];
        let successors: Shape[] = rule.expand(currShape);
        newShapes = newShapes.concat(successors);
      }
      this.shapes = newShapes;
    }
  }

  subdivide() {
    this.polyLibrary.shapes = this.shapes;
    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      if (shape.symbol == "A" || shape.symbol == "B" || shape.symbol == "C" || 
          shape.symbol == "D" || shape.symbol == "E" || shape.symbol == "F")  {
        let outShapes = this.polyLibrary.subdivideWindows(shape, ["W", "X"]);
        this.shapes = this.shapes.concat(outShapes);
        this.windows = this.windows.concat(outShapes);
      }
    }

    //Makes one door
    let bottomWindows: Shape[] = [];
    for (let i = 0; i < this.windows.length; i++) {
      let shape = this.windows[i];
      if (shape.position[1] == 0) {
        bottomWindows.push(shape);
      }
    }
    if (bottomWindows.length != 0) {
      bottomWindows[Math.floor(Math.random() * bottomWindows.length)].symbol = "Y";
    }
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
      let color: vec3 = this.colorsMap.get(slist[i].symbol);
      colorsArray.push(color[0]);
      colorsArray.push(color[1]);
      colorsArray.push(color[2]);
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

  removeWindows() {
    let newShapes: Shape[] = [];
    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      if (shape.symbol != "W" && shape.symbol != "X" && shape.symbol != "Y") {
        newShapes.push(shape); 
      }
    }
    this.shapes = newShapes;
  }

  draw() {
    this.drawableMap.forEach((value: Mesh, key: string) => {
      let keyShapes: Shape[] = [];
      //Gets all shape instances associated with that symbol
      for (let i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].symbol == key) {
          keyShapes.push(this.shapes[i]);
        }
      }
      this.drawMesh(keyShapes, value);
    });
  }

  parse() {
    this.initShapes();
    this.initRules();
    this.expand(); 
    this.shapes = this.shapes.concat(this.terminalShapes);
    this.subdivide();
    this.draw();
  }
}

export default Parser;