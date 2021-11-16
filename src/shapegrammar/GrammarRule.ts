import TransformationRule from "./TransformationRule";

// Maps a symbol to a list of possible resulting symbols and their transformations
class GrammarRule {
  symbol: string;
  transformations: TransformationRule[];

  constructor(symbol: string, rules: TransformationRule[]) {
    this.symbol = symbol;
    this.transformations = rules;
  }
}

export default GrammarRule;