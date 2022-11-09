module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
    '@july_cm'
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 0
  }
}
