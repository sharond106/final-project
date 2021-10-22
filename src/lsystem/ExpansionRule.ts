class ExpansionRule {
  precondition: string;
  postcondition: string;

  constructor(pre: string, post: string) {
    this.precondition = pre;
    this.postcondition = post;
  }
}

export default ExpansionRule;