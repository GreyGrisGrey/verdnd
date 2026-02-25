import type {
    CreateObjectPayload,
    ServerEvent,
    ObjectCreateEvent,
} from '../scripts/objectEvents.ts';

import type { LayerState } from '../scripts/rightBar/layerBarMenu.ts';


export class StoredBoard {
    // TODO: Make these proper types when we start using them
    storedObjects: Map<number, CreateObjectPayload>;
    storedLayers: Map<number, LayerState>;

    constructor() {
        this.storedObjects = new Map();
        this.storedLayers = new Map();
    }

    createObject(newObj: ObjectCreateEvent) {
        let next = 0;
        while (this.storedObjects.has(next)) {
            next++;
        }
        console.log(newObj)
        this.storedObjects.set(next, newObj.object);
        return next;
    }
    
    getObjects() {
        return this.storedObjects;
    }

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
