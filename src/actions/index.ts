import { z } from 'astro/zod';

import { boardActions } from './boardActions.ts';
import { defineAction } from 'astro:actions';

export const server = {
    boardActions,
};
