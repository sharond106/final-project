import { vec4 } from "gl-matrix";
import Mesh from "../geometry/Mesh";
import Drawable from "../rendering/gl/Drawable";

class DrawingRule {
  symbol: string;
  mesh: Drawable;
  color: vec4;
  rules: any[];

  constructor(symbol: string, mesh: Drawable, color: vec4, rules: any[]) {
    this.symbol = symbol;
    this.mesh = mesh;
    this.color = color;
    this.rules = rules;
  }

  drawRule() {
    if (this.rules.length > 0) {
      this.rules[Math.floor(Math.random() * this.rules.length)]();
    }

  }
}

export default DrawingRule;