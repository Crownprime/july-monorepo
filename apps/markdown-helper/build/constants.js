const { join } = require('path');

const ROOT_DIR = join(__dirname, '../');

const isProd = process.env.NODE_ENV === 'production';

const resolve = (path) => join(ROOT_DIR, path);

module.exports = {
  ROOT_DIR,
  isProd,
  resolve,
};
