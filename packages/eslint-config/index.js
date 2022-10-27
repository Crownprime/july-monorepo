module.exports = {
  extends: ["plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": ["error", {
      tabWidth: 2,
      printWidth: 80,
      useTabs: false,
      semi: false,
      singleQuote: true,
      // 多行数组、对象是否需要尾随逗号 "es5"/"none"/"all"
      trailingComma: "none",
      // 对象括号间是否需要空格 { a: '' } or {a: ''}
      bracketSpacing: true,
      // jsx 末尾 > 不换行 
      jsxBracketSameLine: false,
      // 箭头函数唯一参数是否需要括弧，建议还是加上，方便 ts 写类型
      arrowParens: "always"
    }]
  }
}