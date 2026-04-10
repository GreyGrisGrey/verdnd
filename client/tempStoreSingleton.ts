import type { TempStore } from './serveInter.ts';

let tempStore: TempStore | null = null;

export function setTempStore(store: TempStore) {
    tempStore = store;
}

export function getTempStore(): TempStore {
    if (!tempStore) {
        throw new Error('TempStore not initialized');
    }
    return tempStore;
}
