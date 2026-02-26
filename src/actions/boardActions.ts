import { StoredBoard } from './storedBoard.ts';
import { defineAction } from 'astro:actions';
import type {
    CreateObjectPayload,
    ServerEvent,
    ObjectCreateEvent, ObjectMoveEvent
} from '../scripts/objectEvents.ts';

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
    
    createObject: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async (input: ObjectCreateEvent) => {
            const res = serveBoard.createObject(input);
            return res;
        },
    }),
    
    getObjects: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async () => {
            return serveBoard.getObjects();
        },
    }),
    
    destroyObjects: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async (input: number[]) => {
            return serveBoard.destroyObjects(input);
        },
    }),
    
    moveObject: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async (input: ObjectMoveEvent) => {
            return serveBoard.moveObject(input);
        },
    }),
    
    checkIds: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async (input) => {
            const map = new Map(Object.entries(input))
            return serveBoard.compareObjects(map);
        },
    }),
    
    getRecents: defineAction({
        // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
        handler: async () => {
            return serveBoard.getNewObjects();
        },
    })
};