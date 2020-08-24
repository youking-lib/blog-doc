# Vue 编译

## 编译流程

```html
<div id="app">
  {{userName}}
</div>
<script>
new Vue({
  el: '#app',
  data: { f: 'y', l: 'z' },
  computed: {
    userName () {
      return this.f + this.l
    }
  },
  mounted () {
    setTimeout(() => {
      this.f = 'x'
    }, 1000)
  }
})
</script>
```

编译流程：

1. 生成 ast 语法树
2. 优化 ast 语法树
3. ast 语法树生成 render 函数

```js
/**
 *	template = `<div id="app">
 *    {{userName}}
 *  </div>`
 */
function compileToFunctions (template, options, vm) {}
function compile (template, options) {
	const ast = parse(template, options)
	optimize(ast, options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}
```

```json
// ast
const code = {
  "type": 1,
  "tag": "ul",
  "attrsList": [],
  "attrsMap": {
    "class": "list-group",
    "v-if": "articles"
  },
  "rawAttrsMap": {
    "class": {
      "name": "class",
      "value": "list-group",
      "start": 4,
      "end": 22
    },
    "v-if": {
      "name": "v-if",
      "value": "articles",
      "start": 23,
      "end": 38
    }
  },
  "children": [
    {
      "type": 1,
      "tag": "li",
      "attrsList": [],
      "attrsMap": {
        "v-for": "item in articles",
        ":key": "item",
        "class": "list-group-item"
      },
      "rawAttrsMap": {
        "v-for": {
          "name": "v-for",
          "value": "item in articles",
          "start": 50,
          "end": 74
        },
        ":key": {
          "name": ":key",
          "value": "item",
          "start": 75,
          "end": 86
        },
        "class": {
          "name": "class",
          "value": "list-group-item",
          "start": 87,
          "end": 110
        }
      },
      "parent": code, // 引用 ul ast
      "children": [
        {
          "type": 2,
          "expression": "\"\\n        \"+_s(item)+\"\\n      \"",
          "tokens": [
            "\n        ",
            {
              "@binding": "item"
            },
            "\n      "
          ],
          "text": "\n        {{item}}\n      ",
          "start": 111,
          "end": 135,
          "static": false
        }
      ],
      "start": 46,
      "end": 140,
      "for": "articles",
      "alias": "item",
      "key": "item",
      "plain": false,
      "staticClass": "\"list-group-item\"",
      "static": false,
      "staticRoot": false,
      "forProcessed": true
    }
  ],
  "start": 0,
  "end": 150,
  "if": "articles",
  "ifConditions": [
    {
      "exp": "articles",
      "block": code // 引用 ul ast
    }
  ],
  "plain": false,
  "staticClass": "\"list-group\"",
  "static": false,
  "staticRoot": false,
  "ifProcessed": true
}
```

```js
code = {
  render: `with(this){return _c('div',{attrs:{"id":"app"}},[_v(_s(userName))])}`,
  staticRenderFns: []
}
```

### AST 语法树的生成

#### parseHTML

1. handleStartTag('ul') -> options.start(el) -> stack.push(el)

2. handleStartTag('li') -> options.start(el) -> stack.push(el)

3. options.chars(text) 处理 li.innerHTML

   ```js
   /**
   cosnt res = parseText('  {{item}}\n')
   res为：
   {
   	expression: "\n        "+_s(item)+"\n      ",
   	tokens: ['\n    ', {'@binding': 'item'}, '\n    ']
   }
   	
   **/
   const child = {
     type: 2,
     expression: res.expression,
   	end: 135,
   	start: 111,
   	text,
   	tokens: res.tokens
   }
   li.children.push(child)
   ```

4. parseEndTag('li') -> options.end(el) -> stack.length -= 1 -> closeElement(el)
5. parseEndTag('ul') -> options.end(el) -> stack.length -= 1 -> closeElement(el)
6. return root

**closeElement**

1. processKey(element)
2. processRef(element)
3. processSlotContent(element)
4. proccessSlotOutlet(element)
5. processComponent(element)
6. Transform hooks
7. processAttrs(element)



1. 完成 html -> tag, attr 的解析 createASTElement(tag, attrs, currentParent)

2. processFor(element)

   ```js
   var exp = getAndRemoveAttr(el, 'v-for')
   extend(el, parseFor(exp))
   ```

3. processIf(element)

   ```js
   const ifExp = getAndRemoveAttr(el, 'v-if')
   if (ifExp) {
    	el.if = ifExp
   	el.ifConditions.push({ block: el, exp: ifExp });
   } else {
   	if (getAndRemoveAttr(el, 'v-else') !== null) {
       v.else = true
     }
     var elseIfExp = getAndRemoveAttr(el, 'v-else')
     if (elseifExp) {
       el.elseif = elseifExp
     }
   }
   ```

4. processOnce(element)

   ```js
   once = getAndRemoveAttr(el, 'v-once')
   if (once !== null) {
     el.once = true
   }
   ```

### AST 优化

> Goal of the optimizer: walk the generated template AST tree
>
> and detect sub-trees that are purely static, i.e. parts of
>
> the DOM that never needs to change.
>
> Once we detect these sub-trees, we can:
>
> 1. Hoist them into constants, so that we no longer need to  create fresh nodes for them on each re-render;
>
> 2. Completely skip them in the patching process.

递归 markStatic(node) ，如果是静态节点，那么 node.static = true

isStatic (node) 判断逻辑

- node.type == 3 // text
- node.pre
- !node.hasBindings // no dynamic binding
- !node.if && !node.for // not v-if or v-foror v-else

### 代码生成

#### genElement

genStatic
genOnce
genFor
genIf
genChildren
genSlot
genComponent
genData
genChildren

##### genIF

```js
function genIfConditions (
    conditions,
    state,
    altGen,
    altEmpty
  ) {
    if (!conditions.length) {
      return altEmpty || '_e()'
    }

    var condition = conditions.shift();
    if (condition.exp) {
      return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
    } else {
      return ("" + (genTernaryExp(condition.block)))
    }

    // v-if with v-once should generate code like (a)?_m(0):_m(1)
    function genTernaryExp (el) {
      return altGen
        ? altGen(el, state)
        : el.once
          ? genOnce(el, state)
          : genElement(el, state)
    }
  }

```

##### genData

##### genElement 

```js
// "_c('li',{key:item,staticClass:"list-group-item"},[_v("\n        "+_s(item)+"\n      ")])"
// "_c('ul',{staticClass:"list-group"},_l((articles),function(item){return _c('li',{key:item,staticClass:"list-group-item"},[_v("\n        "+_s(item)+"\n      ")])}),0)"
// "(articles)?_c('ul',{staticClass:"list-group"},_l((articles),function(item){return _c('li',{key:item,staticClass:"list-group-item"},[_v("\n        "+_s(item)+"\n      ")])}),0):_e()"

const render = ("with(this){return " + code + "}")
```

#### createFunction

```js
res.render = createFunction(compiled.render, fnGenErrors);
function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop
  }
}
cache[key] = res
// render 挂载到 $options.render = render
// 在最终的 Vue.prototype._render 方法中调用
// render.call(vm._renderProxy, vm.$createElement)
```
















