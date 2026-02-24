import type {
    CreateObjectPayload,
    ServerEvent,
} from '../scripts/objectEvents.ts';

import type { LayerState } from '../scripts/rightBar/layerBarMenu.ts';

export class StoredBoard {
    // TODO: Make these proper types when we start using them
    storedObjects: any[];
    storedLayers: Map<number, LayerState>;

    constructor() {
        this.storedObjects = [];
        this.storedLayers = new Map();
    }

    createObject(newObj: CreateObjectPayload) {}

    createLayer() {
        let next = 0;
        while (this.storedLayers.has(next)) {
            next++;
        }
        this.storedLayers.set(next, {
            id: next,
            gmVisible: true,
            playerVisible: true,
            zOrder: next,
        });
        return next;
    }

    getLayers() {
        return this.storedLayers;
    }
}
