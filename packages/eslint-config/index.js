const path = require('path');

const defineConfig = (config) => {
  const { extends: customExtends = [], ...customConfig } = config;
  return {
    extends: [path.resolve(__dirname, '.eslintrc.base.js'), ...customExtends],
    ...customConfig,
  };
};

module.exports = { defineConfig };
