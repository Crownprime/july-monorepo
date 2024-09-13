const configMerge = (configs, config) => {
  return configs.map((conf) => ({ ...conf, ...config }));
};

export { configMerge };
