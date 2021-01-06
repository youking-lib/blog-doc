const BRACKET = {
  start: "(",
  end: ")",
};

const OPERATOR_TOKEN_MAP = {
  "+": (pre: string, next: string) => Number(pre) + Number(next),
  "-": (pre: string, next: string) => Number(pre) - Number(next),
  "*": (pre: string, next: string) => Number(pre) * Number(next),
  "/": (pre: string, next: string) => Number(pre) / Number(next),
};

// const isBracketStart = (token: string) => BRACKET.start === token;
const isBracketEnd = (token: string) => BRACKET.end === token;
const isPriority = (operator: string) => ["*", "/"].indexOf(operator) > -1;

export default class Calculator {
  constructor() {}

  parse(str: string) {
    const stack = [];
    const len = str.length;
    const self = this;
    let index = 0;

    while (index < len) {
      const token = str[index++];

      if (isBracketEnd(token)) {
        run();
      } else {
        stack.push(token);
      }
    }

    return this.evaluate(stack);

    function run() {
      const lastBracketIndex = stack.lastIndexOf(BRACKET.start);

      const tokens = stack.splice(lastBracketIndex + 1);
      stack[lastBracketIndex] = self.evaluate(tokens);
    }
  }

  evaluate(tokens: string[]) {
    let tempOperator = null;

    // 处理高优先级: 乘除
    tokens.reduce((pre, next, index) => {
      if (tempOperator) {
        const result = tempOperator(pre, next);
        tempOperator = null;
        tokens.splice(index - 2, 3, result);
        return result;
      }

      if (isPriority(next)) {
        tempOperator = OPERATOR_TOKEN_MAP[next];
        return pre;
      }

      return next;
    });

    // 处理加减
    return tokens.reduce((pre, next) => {
      if (tempOperator) {
        const tempResult = tempOperator(pre, next);
        tempOperator = null;
        return tempResult;
      }

      const operator = OPERATOR_TOKEN_MAP[next];

      if (operator) {
        tempOperator = operator;
        return pre;
      }

      return next;
    }, 0);
  }
}

export const calc = new Calculator();
