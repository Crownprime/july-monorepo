import { beforeAll, describe, expect, test } from 'vitest';

import { createRender } from './create-client';

const render = createRender();

const screenshotTest = (meta) => {
  const { title, components } = meta;

  let page;

  beforeAll(async () => {
    page = await render.createPage();
  });

  describe(`${title}: screenshot`, () => {
    test.each(Object.keys(components))('%s', async (key) => {
      const path = `${title}/${key}`;
      await page.goto(path);
      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: path,
      });
    });
  });
};

export { screenshotTest };
