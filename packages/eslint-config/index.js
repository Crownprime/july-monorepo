module.exports = {
  extends: ["plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": ["error", {
      tabWidth: 2,
      printWidth: 80,
      useTabs: false,
      semi: false,
      singleQuote: true
    }]
  }
}