import { z } from 'astro/zod';

import { boardActions } from './boardActions.ts';
import { defineAction } from 'astro:actions';

export const server = {
  getGreeting: defineAction({
    input: z.object({
      name: z.string(),
    }),
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return `Hello, ${input.name}!`;
    },
  }),
  boardActions,
};
