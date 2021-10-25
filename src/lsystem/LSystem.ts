import { mat4, vec3, vec4 } from "gl-matrix";
import Mesh from "../geometry/Mesh";
import DrawingRule from "./DrawingRule";
import ExpansionRule from "./ExpansionRule";
import Turtle from "./Turtle";

class LSystem {
  cylinder: Mesh;
  iterations: number = 3;
  axiom: string = "FFFFFFFV";
  turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0));
  stack: Turtle[] = [];
  expansionRules: Map<string, ExpansionRule> = new Map();
  drawRules: Map<string, DrawingRule> = new Map();

  constructor(cylinder: Mesh) {
    this.cylinder = cylinder;
  }

  initRules() {
    // this.expansionRules.set('F', new ExpansionRule('F', 'F[+F][-F]'));

    // this.drawRules.set('F', new DrawingRule('F', this.cylinder, vec4.fromValues(.2, .1, 0, 1), this.turtle.moveUp.bind(this.turtle)));  
    // this.drawRules.set('+', new DrawingRule('+', null, null, this.turtle.rotateAboutForward.bind(this.turtle, 45)));  
    // this.drawRules.set('-', new DrawingRule('-', null, null, this.turtle.rotateAboutForward.bind(this.turtle, -45)));
    
    this.expansionRules.set('V', new ExpansionRule('V', '[+++XW][---WX][++WW][--XX][+++W][---X]Y[++WW][--XX][+++W][---X]Y[++W][--X][+++W][---X]Y[++W][--X][+++W][---X]V'));
    this.expansionRules.set('W', new ExpansionRule('W', '+X[-WW]Z'));
    this.expansionRules.set('X', new ExpansionRule('X', '-W[+XX]Z'));
    this.expansionRules.set('Y', new ExpansionRule('Y', 'YZ')); // overall tree height
    this.expansionRules.set('Z', new ExpansionRule('Z', '[&GG][^GG][&&GG][^^GG][+GG][-GG][#GG][%GG]F[&GG][^GG][&&GG][^^GG][+GG][-GG][#GG][%GG]F')); // pine needle length and density

    this.drawRules.set('F', new DrawingRule('F', this.cylinder, vec4.fromValues(.2, .1, 0, 1), this.turtle.moveUp.bind(this.turtle)));  
    this.drawRules.set('G', new DrawingRule('G', this.cylinder, vec4.fromValues(.2, 1, .2, 1), this.turtle.moveUp.bind(this.turtle)));  
    this.drawRules.set('+', new DrawingRule('+', null, null, this.turtle.rotateAboutForward.bind(this.turtle, 38)));  
    this.drawRules.set('-', new DrawingRule('-', null, null, this.turtle.rotateAboutForward.bind(this.turtle, -38)));
    this.drawRules.set('&', new DrawingRule('&', null, null, this.turtle.rotateAboutRight.bind(this.turtle, 30)));  
    this.drawRules.set('^', new DrawingRule('^', null, null, this.turtle.rotateAboutRight.bind(this.turtle, -30)));
    this.drawRules.set('#', new DrawingRule('#', null, null, this.turtle.rotateAboutForwardAndRight.bind(this.turtle, 30, 30)));  
    this.drawRules.set('%', new DrawingRule('%', null, null, this.turtle.rotateAboutForwardAndRight.bind(this.turtle, -30, -30)));
  
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
    let offsetsArray = [];
    let transformCol0Array = [];
    let transformCol1Array = [];
    let transformCol2Array = [];
    let transformCol3Array = [];
    let scaleArray = [];
    let colorsArray = [];
    let n: number = 1;
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
      if (drawRule.mesh != null) {
        offsetsArray.push(this.turtle.position[0]);
        offsetsArray.push(this.turtle.position[1]);
        offsetsArray.push(this.turtle.position[2]);

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

        for (let i = 0; i < 3; i++) {
          scaleArray.push(2);
        }
        n++;
      }
    }
    let offsets: Float32Array = new Float32Array(offsetsArray);
    let colors: Float32Array = new Float32Array(colorsArray);
    let transformCol0: Float32Array = new Float32Array(transformCol0Array);
    let transformCol1: Float32Array = new Float32Array(transformCol1Array);
    let transformCol2: Float32Array = new Float32Array(transformCol2Array);
    let transformCol3: Float32Array = new Float32Array(transformCol3Array);
    let scale: Float32Array = new Float32Array(scaleArray);
    this.cylinder.setInstanceVBOs(offsets, colors);
    this.cylinder.setNumInstances(n);
    this.cylinder.setRotateVBOs(transformCol0, transformCol1, transformCol2, transformCol3);
    this.cylinder.setScaleVBO(scale);
  }

  lSystemParse() {
    this.initRules();
    this.expandAxiom();
    this.drawLSystem();
  }
}

export default LSystem;