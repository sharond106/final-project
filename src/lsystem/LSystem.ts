import { mat4, vec3, vec4 } from "gl-matrix";
import Mesh from "../geometry/Mesh";
import DrawingRule from "./DrawingRule";
import ExpansionRule from "./ExpansionRule";
import Turtle from "./Turtle";

class LSystem {
  cylinder: Mesh;
  needle: Mesh;
  light: Mesh;
  iterations: number = 6;
  axiom: string = "FFFFFFFFFFFFAV";
  turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0));
  stack: Turtle[] = [];
  expansionRules: Map<string, ExpansionRule> = new Map();
  drawRules: Map<string, DrawingRule> = new Map();

  constructor(cylinder: Mesh, needle: Mesh, light: Mesh) {
    this.cylinder = cylinder;
    this.needle = needle;
    this.light = light;
  }

  initRules(angle: number, sparse: number) {
    this.expansionRules.set('V', new ExpansionRule('V', '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]/'+
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]~' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]/' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]~' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]/' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]~' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]/' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]~' +
                                                        '[+!+XW][-?-WX][++WW][--XX][+!+W][-?-X]' +
                                                        'Y'+
                                                        '[++WW][--XX][+!+W][-?-X]/'+
                                                        '[++WW][--XX][+!+W][-?-X]~'+
                                                        '[++WW][--XX][+!+W][-?-X]/'+
                                                        '[++WW][--XX][+!+W][-?-X]~'+
                                                        '[++WW][--XX][+!+W][-?-X]/'+
                                                        '[++WW][--XX][+!+W][-?-X]'+
                                                        'Y'+
                                                        '[++W][--X][+++W][---X]='+
                                                        '[++W][--X][+++W][---X]~'+
                                                        '[++W][--X][+++W][---X]='+
                                                        '[++W][--X][+++W][---X]/'+
                                                        '[++W][--X][+++W][---X]'+
                                                        'Y'+
                                                        '[++W][--X][+++W][---X]~[++W][--X][+++W][---X]/[++W][--X][+++W][---X]V'));
    this.expansionRules.set('W', new ExpansionRule('W', '@X[$WW]Z')); // the branches on each large branch
    this.expansionRules.set('X', new ExpansionRule('X', '$W[@XX]Z')); // the branches on each large branch
    this.expansionRules.set('Y', new ExpansionRule('Y', 'YZ')); // overall tree height
    // pine needle length and density
    if (sparse == 0) {
      this.expansionRules.set('Z', new ExpansionRule('Z', '[*G][*G][*G][*G][*L]H[*G][*G][*G][*G]H')); 
    } else if (sparse == 1) {
      this.expansionRules.set('Z', new ExpansionRule('Z', '[*G][*G][*G][*G][*L]HH[*G][*G][*G][*G]HH')); 
    } else if (sparse == 2) {
      this.expansionRules.set('Z', new ExpansionRule('Z', '[*G][*G][*G][*G][*L]HHH[*G][*G][*G][*G]HHH')); 
    } else {
      this.expansionRules.set('Z', new ExpansionRule('Z', '[*G][*G][*G][*G][*L]HHHH[*G][*G][*G][*G]HHHH')); 
    }
 
    this.drawRules.set('F', new DrawingRule('F', this.cylinder, vec4.fromValues(117/ 255, 72/ 255, 32/ 255, 1), [this.turtle.moveUpAndScale.bind(this.turtle, 10)]));  
    this.drawRules.set('A', new DrawingRule('A', null, null, [this.turtle.scale.bind(this.turtle, 1)]));  
    this.drawRules.set('/', new DrawingRule('/', null, null, [this.turtle.rotateAboutUp.bind(this.turtle, 30)]));
    this.drawRules.set('~', new DrawingRule('~', null, null, [this.turtle.rotateAboutUp.bind(this.turtle, 15)]));
    this.drawRules.set('=', new DrawingRule('=', null, null, [this.turtle.rotateAboutUp.bind(this.turtle, 60)]));
    this.drawRules.set('H', new DrawingRule('H', this.cylinder, vec4.fromValues(117/ 255, 72/ 255, 32/ 255, 1), [this.turtle.moveUpLeaf.bind(this.turtle)]));  
    this.drawRules.set('G', new DrawingRule('G', this.needle, vec4.fromValues(.2, .5, .2, 1), [this.turtle.moveUp.bind(this.turtle)]));  
    this.drawRules.set('L', new DrawingRule('L', this.light, vec4.fromValues(20.5, 20.5, .5, .3), [this.turtle.moveUp.bind(this.turtle)]));  
    this.drawRules.set('+', new DrawingRule('+', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, 29 + angle * 3)])); 
    this.drawRules.set('-', new DrawingRule('-', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, -29 - angle * 3)]));
    this.drawRules.set('@', new DrawingRule('@', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, 38),
                                                              this.turtle.rotateAboutUpAndForward.bind(this.turtle, 15, 38)]));
    this.drawRules.set('$', new DrawingRule('$', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, -38),
                                                              this.turtle.rotateAboutUpAndForward.bind(this.turtle, -15, -38)]));
    this.drawRules.set('!', new DrawingRule('!', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, 35),
                                                              this.turtle.rotateAboutForward.bind(this.turtle, 40),
                                                              this.turtle.rotateAboutForward.bind(this.turtle, 45)]));
    this.drawRules.set('?', new DrawingRule('?', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, -35),
                                                              this.turtle.rotateAboutForward.bind(this.turtle, -40),
                                                              this.turtle.rotateAboutForward.bind(this.turtle, -45)]));                                                          
    this.drawRules.set('*', new DrawingRule('*', null, null, [this.turtle.rotateAboutForward.bind(this.turtle, 70),
                                                              this.turtle.rotateAboutForward.bind(this.turtle, -70),
                                                              this.turtle.rotateAboutUpAndForward.bind(this.turtle, 70, 60),
                                                              this.turtle.rotateAboutUpAndForward.bind(this.turtle, 150, 60),
                                                              this.turtle.rotateAboutUpAndRight.bind(this.turtle, -30, -70),
                                                              this.turtle.rotateAboutUpAndRight.bind(this.turtle, 30, -80)]));
  
  }

  getRandomNum(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  expandAxiom() {
    let newAxiom: string = "";
    for (let i = 0; i < this.iterations; i++) {
      for (let j = 0; j < this.axiom.length; j++) {
        let symbol: string = this.axiom.charAt(j);
        if (symbol == "[") {
          newAxiom += symbol;
        } else if (symbol == "]") {
          newAxiom += symbol;
        } else {
          let expansion = this.expansionRules.get(symbol); 
          if (expansion != null) {
            newAxiom += expansion.postcondition;
          } else {
            newAxiom += symbol;
          }
        }
      }
      this.axiom = newAxiom;
      newAxiom = "";
    }
  }

  drawLSystem() {
    let transformCol0Array = [];
    let transformCol1Array = [];
    let transformCol2Array = [];
    let transformCol3Array = [];
    let transformCol0ArrayNeedle = [];
    let transformCol1ArrayNeedle = [];
    let transformCol2ArrayNeedle = [];
    let transformCol3ArrayNeedle = [];
    let transformCol0ArrayLight = [];
    let transformCol1ArrayLight = [];
    let transformCol2ArrayLight = [];
    let transformCol3ArrayLight = [];
    let colorsArray = [];
    let colorsArrayNeedle = [];
    let colorsArrayLight = [];
    let n: number = 1;
    let nNeedle: number = 1;
    let nLight: number = 1;
    let oldPos: vec3 = vec3.create();
    for (let j = 0; j < this.axiom.length; j++) {
      let symbol: string = this.axiom.charAt(j);
      if (symbol == "[") {
        let copy = new Turtle(vec3.clone(this.turtle.position), vec3.clone(this.turtle.forward), vec3.clone(this.turtle.right), vec3.clone(this.turtle.up));
        this.stack.push(copy);
        vec3.copy(oldPos, copy.position);
        continue;
      } else if (symbol == "]") {
        let popped = this.stack.pop();
        this.turtle.position = popped.position;
        this.turtle.forward = popped.forward;
        this.turtle.right = popped.right;
        this.turtle.up = popped.up;
        vec3.copy(oldPos, popped.position);
        continue;
      } 
      let drawRule: DrawingRule = this.drawRules.get(symbol);
      if (drawRule == null) {
        vec3.copy(oldPos, this.turtle.position);
        continue;
      }
      drawRule.drawRule();
      if (drawRule.mesh == this.cylinder) {
        colorsArray.push(drawRule.color[0]);
        colorsArray.push(drawRule.color[1]);
        colorsArray.push(drawRule.color[2]);
        colorsArray.push(drawRule.color[3]);

        let mat: mat4 = this.turtle.getMatrix(oldPos);
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
      } else if (drawRule.mesh == this.needle) {
        colorsArrayNeedle.push(drawRule.color[0]);
        colorsArrayNeedle.push(drawRule.color[1]);
        colorsArrayNeedle.push(drawRule.color[2]);
        colorsArrayNeedle.push(drawRule.color[3]);

        let mat: mat4 = this.turtle.getMatrix(oldPos);
        for (let i = 0; i < 4; i++) {
          transformCol0ArrayNeedle.push(mat[i]);
        }
        for (let i = 4; i < 8; i++) {
          transformCol1ArrayNeedle.push(mat[i]);
        }
        for (let i = 8; i < 12; i++) {
          transformCol2ArrayNeedle.push(mat[i]);
        }
        for (let i = 12; i < 16; i++) {
          transformCol3ArrayNeedle.push(mat[i]);
        }
        nNeedle++;
      } else if (drawRule.mesh == this.light) {
        colorsArrayLight.push(drawRule.color[0]);
        colorsArrayLight.push(drawRule.color[1]);
        colorsArrayLight.push(drawRule.color[2]);
        colorsArrayLight.push(drawRule.color[3]);

        let mat: mat4 = this.turtle.getMatrix(oldPos);
        for (let i = 0; i < 4; i++) {
          transformCol0ArrayLight.push(mat[i]);
        }
        for (let i = 4; i < 8; i++) {
          transformCol1ArrayLight.push(mat[i]);
        }
        for (let i = 8; i < 12; i++) {
          transformCol2ArrayLight.push(mat[i]);
        }
        for (let i = 12; i < 16; i++) {
          transformCol3ArrayLight.push(mat[i]);
        }
        nLight++;
      }
    }
    let colors: Float32Array = new Float32Array(colorsArray);
    let transformCol0: Float32Array = new Float32Array(transformCol0Array);
    let transformCol1: Float32Array = new Float32Array(transformCol1Array);
    let transformCol2: Float32Array = new Float32Array(transformCol2Array);
    let transformCol3: Float32Array = new Float32Array(transformCol3Array);
    this.cylinder.setColorsVBOs(colors);
    this.cylinder.setNumInstances(n);
    this.cylinder.setRotateVBOs(transformCol0, transformCol1, transformCol2, transformCol3);
    let colorsNeedle: Float32Array = new Float32Array(colorsArrayNeedle);
    let transformCol0Needle: Float32Array = new Float32Array(transformCol0ArrayNeedle);
    let transformCol1Needle: Float32Array = new Float32Array(transformCol1ArrayNeedle);
    let transformCol2Needle: Float32Array = new Float32Array(transformCol2ArrayNeedle);
    let transformCol3Needle: Float32Array = new Float32Array(transformCol3ArrayNeedle);
    this.needle.setColorsVBOs(colorsNeedle);
    this.needle.setNumInstances(nNeedle);
    this.needle.setRotateVBOs(transformCol0Needle, transformCol1Needle, transformCol2Needle, transformCol3Needle);
    let colorsLight: Float32Array = new Float32Array(colorsArrayLight);
    let transformCol0Light: Float32Array = new Float32Array(transformCol0ArrayLight);
    let transformCol1Light: Float32Array = new Float32Array(transformCol1ArrayLight);
    let transformCol2Light: Float32Array = new Float32Array(transformCol2ArrayLight);
    let transformCol3Light: Float32Array = new Float32Array(transformCol3ArrayLight);
    this.light.setColorsVBOs(colorsLight);
    this.light.setNumInstances(nLight);
    this.light.setRotateVBOs(transformCol0Light, transformCol1Light, transformCol2Light, transformCol3Light);

  }

  lSystemParse(angle: number, sparse: number) {
    this.initRules(angle, sparse);
    this.expandAxiom();
    this.drawLSystem();
  }
}

export default LSystem;