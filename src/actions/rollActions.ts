import { defineAction } from 'astro:actions';

import { StoredDice } from './diceStore.ts';

const diceObj = new StoredDice();

export const rollActions = {
    roll: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async (input) => {
            return diceObj.rollDice(input);
        },
    }),

    getDice: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async () => {
            return diceObj.getDice();
        },
    }),
};
