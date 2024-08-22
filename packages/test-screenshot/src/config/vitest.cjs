const path = require('path');
const { defineConfig: viteDefineConfig, mergeConfig } = require('vitest/config');

const OutdatedSnapshotReporter = require('jest-image-snapshot/src/outdated-snapshot-reporter');

const defineConfig = (customConfig) => {
  const config = {
    test: {
      environment: 'node',
      /**
       * screenshot.test.tsx
       * xxxx.screenshot.test.tsx
       */
      include: ['**/__test__/**/?(*.)screenshot.test.[jt]s?(x)'],
      reporters: ['default', new OutdatedSnapshotReporter()],
      globalSetup: [path.resolve(__dirname, '../global-setup.ts')],
      setupFiles: [path.resolve(__dirname, '../setup.ts')],
    },
  };
  return mergeConfig(config, viteDefineConfig(customConfig));
};

module.exports = defineConfig;
