import axios from 'axios';

import { PORTS } from './constants';

const getUrl = (path: string) => {
  return `http://localhost:${PORTS.COMPONENT}/#/${path}`;
};

const createClient = () => {
  const client = axios.create({
    baseURL: `http://localhost:${PORTS.BROWSER}`,
  });
  return {
    create: () => client.post('/page/_create'),
    screenshot: (id: number, payload?: any) =>
      axios.post<ArrayBuffer>(`/page/${id}/_screenshot`, payload, {
        responseType: 'arraybuffer',
      }),
    goto: (id: number, payload) => axios.post(`/page/${id}/_goto`, payload),
    close: (id: number) => axios.delete(`/page/${id}`),
  };
};

const createRender = () => {
  const client = createClient();
  const createPage = async () => {
    const { data } = await client.create();
    const id = data.id;

    const screenshot = async () => {
      const res = Buffer.from((await client.screenshot(id)).data);
      return res;
    };
    const goto = async (path: string) => {
      const url = getUrl(path);
      await client.goto(id, {
        url,
      });
    };
    return {
      screenshot,
      goto,
    };
  };
  return {
    createPage,
  };
};

export { createRender };
