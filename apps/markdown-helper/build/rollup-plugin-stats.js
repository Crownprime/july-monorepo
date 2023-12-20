/**
 * rollup 本身没有特殊的 log 用来识别开始构建和结束构建
 * 这里增加一个简单的打点插件，用于给 problemMatcher 做字符串识别
 */
const PLUGIN_NAME = 'rollup-plugin-stats';
const stats = () => {
  return {
    name: PLUGIN_NAME,
    buildStart: () => {
      console.log(`[${PLUGIN_NAME}]: build start`);
    },
    buildEnd: () => {
      console.log(`[${PLUGIN_NAME}]: build end`);
    },
  };
};

module.exports = stats;
