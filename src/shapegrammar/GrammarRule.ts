import TransformationRule from "./TransformationRule";
import Shape from "./Shape";

// Maps a symbol to a list of possible resulting symbols and their transformations
class GrammarRule {
  nextSymbols: string[];
  transformations: TransformationRule[];

  constructor(rules: TransformationRule[]) {
    this.transformations = rules;
  }

  expand(shape: Shape) : Shape[] {
    let retList: Shape[] = []; 
    for (let i = 0; i < this.nextSymbols.length; i++) {
      let s: Shape = shape.copy();
      s.symbol = this.nextSymbols[i];
      shape = this.transformations[i].transform(shape);
      retList.push(s);
    }
    return retList;
  }
}

export default GrammarRule;