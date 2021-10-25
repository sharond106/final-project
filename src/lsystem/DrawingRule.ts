import { vec4 } from "gl-matrix";
import Mesh from "../geometry/Mesh";
import Drawable from "../rendering/gl/Drawable";

class DrawingRule {
  symbol: string;
  mesh: Drawable;
  color: vec4;
  rule: any;

  constructor(symbol: string, mesh: Drawable, color: vec4, rule: any) {
    this.symbol = symbol;
    this.mesh = mesh;
    this.color = color;
    this.rule = rule;
  }

  drawRule() {
    if (this.rule != null) {
      this.rule();
    }

  }
}

export default DrawingRule;