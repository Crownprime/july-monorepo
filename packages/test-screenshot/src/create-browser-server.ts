import bodyParser from 'body-parser';
import express from 'express';
import playwright, { Page } from 'playwright';

import { PORTS } from './constants';

const createBrowserServer = async () => {
  let id = 0;
  const getID = () => {
    id += 1;
    return id;
  };

  const cache = new Map<number, Page>();

  const browser = await playwright.chromium.launch();
  const app = express();
  app.use(bodyParser.json());
  app.get('/', (req, res) => {
    res.send(`
  <html>
    <body>
      <div>
        React Screenshot Server
      </div>
    </body>
  </html>
  `);
  });

  app.post('/page', async (req, res) => {
    const currentID = getID();
    try {
      const context = await browser.newContext({
        viewport: {
          width: 1024 / 2,
          height: 768 / 2,
        },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      cache.set(currentID, page);
      res.send({ id: currentID });
    } catch (err: any) {
      res.status(400);
      res.send({
        message: err.message,
      });
      const page = cache.get(currentID);
      if (page) {
        await page.close();
        cache.delete(currentID);
      }
    }
  });

  app.post('/page/:id/_screenshot', async (req, res) => {
    try {
      const id = req.params.id;
      const { fullPage, timeout, type } = req.body;
      const page = cache.get(Number(id));
      if (!page) {
        throw new Error(`page ${id} is not found`);
      }
      res.send(await page.screenshot({ fullPage, timeout, type }));
    } catch (err: any) {
      res.status(400);
      res.send({
        message: err.message,
      });
    }
  });

  app.post('/page/:id/_goto', async (req, res) => {
    try {
      const id = req.params.id;
      const { url } = req.body;
      const page = cache.get(Number(id));
      if (!page) {
        throw new Error(`page ${id} is not found`);
      }
      await page.goto(url, {
        waitUntil: 'networkidle',
      });
      // 添加样式，隐藏光标
      await page.addStyleTag({ content: '* {caret-color: transparent !important;}' });
      res.end();
    } catch (err: any) {
      res.status(400);
      res.send({
        message: err.message,
      });
    }
  });

  const server = app.listen(PORTS.BROWSER, () => {
    console.log(`screenshot server is listening at port ${PORTS.BROWSER}`);
  });
  return async () => {
    server.close();
    await browser.close();
  };
};

export { createBrowserServer };
