import TransformationRule from "./TransformationRule";
import Shape from "./Shape";

// Maps a symbol to its resulting symbols and their transformations (should be of same length)
class GrammarRule {
  nextSymbols: string[];
  transformations: TransformationRule[];

  constructor(nextSymbols: string[], rules: TransformationRule[]) {
    this.nextSymbols = nextSymbols;
    this.transformations = rules;
  }

  expand(shape: Shape) : Shape[] {
    let retList: Shape[] = []; 
    for (let i = 0; i < this.nextSymbols.length; i++) {
      let s: Shape = shape.copy();
      s.symbol = this.nextSymbols[i];
      s = this.transformations[i].transform(s);
      retList.push(s);
    }

    return retList;
  }
}

export default GrammarRule;