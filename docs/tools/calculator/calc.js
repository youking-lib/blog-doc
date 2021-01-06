// function calculator(str) {
//   const [tokens] = parse(str);
//   const result = flatCalc(tokens);

//   return result;
// }

const OPERATOR_TOKEN_MAP = {
  "+": (pre, next) => pre + next,
  "-": (pre, next) => pre - next,
  "*": (pre, next) => pre * next,
  "/": (pre, next) => pre / next,
};
const isPriority = (operator) => ["*", "/"].indexOf(operator) > -1;
const BRACKET = {
  start: "(",
  end: ")",
};

// /**
//  * @param {string} str
//  * @return {array[tokens, parsedLength]} token数组, 处理的长度
//  */
// function parse(str) {
//   const res = [];
//   const len = str.length;
//   let index = 0;
//   let i = 0;

//   while (i < len) {
//     const token = str[i];

//     if (typeof OPERATOR_TOKEN_MAP[token] === "function") {
//       forward();
//       res.push(token);
//       i += 1;
//       index = i;
//     } else if (BRACKET.start === token) {
//       const [childTokens, parsedLength] = parse(str.slice(i + 1));
//       res.push(childTokens);
//       i += parsedLength + 1;
//       index = i;
//     } else if (BRACKET.end === token) {
//       forward();
//       i += 1;
//       index = i;
//       break;
//     } else {
//       // 普通数字
//       i++;
//     }
//   }

//   forward();

//   function forward() {
//     if (index < i) {
//       res.push(+str.slice(index, i));
//     }
//   }

//   return [res, i];
// }

// function flatCalc(tokens) {
//   if (!Array.isArray(tokens)) return tokens;

//   let tempOperator = null;

//   // 处理乘法
//   tokens.reduce((pre, next, index, arr) => {
//     pre = flatCalc(pre);
//     next = flatCalc(next);

//     if (tempOperator) {
//       const result = tempOperator(pre, next);
//       tempOperator = null;
//       arr.splice(index - 2, 3, result);
//       return result;
//     }

//     if (isPriority(next)) {
//       tempOperator = OPERATOR_TOKEN_MAP[next];
//       return pre;
//     }

//     return next;
//   });

//   // 处理加减
//   let res = tokens.reduce((pre, cur) => {
//     pre = flatCalc(pre);
//     cur = flatCalc(cur);

//     if (tempOperator) {
//       const result = tempOperator(pre, cur);
//       tempOperator = null;
//       return result;
//     }

//     const operatorFun = OPERATOR_TOKEN_MAP[cur];

//     if (operatorFun) {
//       tempOperator = operatorFun;
//       return pre;
//     }

//     return cur;
//   }, 0);

//   return res;
// }

// const str1 = "+12.1+2+2*(3*4*(3+1)-(4/2))-5";
// const str2 = "-.1+2+2*(3*4*(3+1)-(4/2))-5";

const str3 = '1+2+(4+(2+3+4)-(2+3+1))'

// console.log(`${str1}=${calculator(str1)}`);
// console.log(`${str2}=${calculator(str2)}`);

function calc (str) {
  const stack = [] // [1,+,2]
  let count = 0
  let cur = ''

  for (var i=0; i<str.length; i++) {
    const token = str[i]

    if (token === BRACKET.start) {
      stack.push(cur)
      cur = ''
    } else if (token === BRACKET.end) {
      cur && stack.push(cur)
      cur = ''
    } else {
      cur += str[i]
    }
  }

  let res = 0

  console.log(stack)

  while (stack.length) {
    const s = stack.pop()

  }
}

console.log(`${str3}=${calc(str3)}`);
