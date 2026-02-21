import { defineAction } from 'astro:actions';
import type { APIContext } from 'astro';
import { z } from 'astro/zod';
import * as storedBoard from "./storedBoard.ts"

export const boardActions = {
    createLayer: defineAction({
        handler: async () => {
            const res = serveBoard.createLayer()
            return res
        }
    }),
    getLayers: defineAction({
        handler: async () => {
            return serveBoard.getLayers()
        }
    }),
}

const serveBoard = new storedBoard.StoredBoard()