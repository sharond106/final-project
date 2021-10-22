import Mesh from "../geometry/Mesh";
import Drawable from "../rendering/gl/Drawable";

class DrawingRule {
  symbol: string;
  mesh: Drawable;
  rule: any;

  constructor(symbol: string, mesh: Drawable, rule: any) {
    this.symbol = symbol;
    this.mesh = mesh;
    this.rule = rule;
  }

  drawRule() {
    if (this.rule != null) {
      this.rule();
    }

  }
}

export default DrawingRule;