import { StoredBoard } from './storedBoard.ts';
import { defineAction } from 'astro:actions';

const serveBoard = new StoredBoard();

export const boardActions = {
  createLayer: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      const res = serveBoard.createLayer();
      return res;
    },
  }),
  getLayers: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      return serveBoard.getLayers();
    },
  }),
};
