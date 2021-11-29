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
      
      let t: TransformationRule = this.transformations[i];
      console.log("transform " + s.symbol + " at " + s.position + " by " + t.tx + " " + t.ty + " " + t.tz + " ");

      s = this.transformations[i].transform(s);
      console.log("result: " + s.position)
      retList.push(s);
    }
    console.log(this.nextSymbols);
    // console.log("---------------------------------------")
    // for (let i = 0; i < this.nextSymbols.length; i++) {
    //   let t: TransformationRule = this.transformations[i];
    //   let r: Shape = retList[i];
    //   console.log(this.nextSymbols[i]);
    //   console.log("with transform " + t.tx + " " + t.ty + " " + t.tz + " ");
    //   console.log("with shape transform " + r.position);
    // }
    return retList;
  }
}

export default GrammarRule;