function calculator (str) {
  const [tokens] = parse(str)
  const result = flatCalc(tokens)
  
  return result
}

const OPERATOR_TOKEN_MAP = {
  '+': (pre, next) => pre + next,
  '-': (pre, next) => pre - next,
  '*': (pre, next) => pre * next,
  '/': (pre, next) => pre / next,
}
const BRACKET = {
  start: '(',
  end: ')'
}

/**
 * @param {string} str 
 * @return {array[tokens, parsedLength]} token数组, 处理的长度
 */
function parse (str) {
  const res = []
  const len = str.length
  let index = 0
  let i=0

  while (i < len) {
    const token = str[i]

    if ((typeof OPERATOR_TOKEN_MAP[token]) === 'function') {
      forward()
      res.push(token)
      i += 1
      index = i
    } else if (BRACKET.start === token) {
      const [childTokens, parsedLength] = parse(str.slice(i + 1))
      res.push(childTokens)
      i += parsedLength + 1
      index = i
    } else if (BRACKET.end === token) {
      forward()
      i += 1
      index = i
      break
    } else {
      // 普通数字
      i++
    }
  }

  forward()

  function forward () {
    if (index < i) {
      res.push(+str.slice(index, i))
    }
  }

  return [res, i]
}

function flatCalc (tokens) {
  if (!Array.isArray(tokens)) return tokens
  
  let temp = null

  // 处理乘法
  tokens.reduce((pre, next, index, arr) => {
    pre = flatCalc(pre)
    next = flatCalc(next)

    if (temp) {
      const result = temp(pre, next)
      temp = null
      arr.splice(index - 2, 3, result)
      return result
    }

    if (next === '*') {
      temp = OPERATOR_TOKEN_MAP[next]
      return pre
    }

    return next
  })

  // 处理加减
  let res = tokens.reduce((pre, next) => {
    pre = flatCalc(pre)
    next = flatCalc(next)

    if (temp) {
      const result = temp(pre, next)
      temp = null
      return result
    }

    const operatorFun = OPERATOR_TOKEN_MAP[next]

    if (operatorFun) {
      temp = operatorFun
      return pre
    }

    return next
  })

  return res
}

const str = '12+2+2*(3*4*(3+1)-(4/2))-5'

console.log(`${str}=${calculator(str)}`)
