import type {
    CreateObjectPayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectChangeEvent,
    ObjectRecolourEvent,
} from '../scripts/objectEvents.ts';
import { Action, Entity, Shape } from '../scripts/objectEvents.ts';

import type { LayerState } from '../scripts/rightBar/layerBarMenu.ts';

function comparePayloads(
    serveObj: CreateObjectPayload,
    cliObj: CreateObjectPayload,
) {
    if (serveObj.kind !== cliObj.kind) {
        return false;
    }
    if (
        serveObj.x !== cliObj.x ||
        serveObj.y !== cliObj.y ||
        serveObj.colour !== cliObj.colour ||
        serveObj.layerId !== cliObj.layerId
    ) {
        return false;
    }
    return true;
}

export class StoredBoard {
    storedObjects: Map<number, ObjectCreateEvent>;
    storedStrings: Map<number, string>;
    storedLayers: Map<number, LayerState>;
    recentCreation: any[];
    lastTime: number;

    constructor() {
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.storedStrings = new Map();
        this.recentCreation = [];
        this.lastTime = 0;
    }

    compareObjects(clientObjs: CreateObjectPayload[]) {
        const result: ObjectChangeEvent[] = [];
        for (const val of clientObjs) {
            const res = this.compareObject(val);
            if (res) {
                result.push(res);
            }
        }
        return result;
    }

    compareObject(clientObj: CreateObjectPayload) {
        const obj = this.storedObjects.get(clientObj.objectId!);
        if (!obj) {
            return {
                entity: Entity.Object,
                action: Action.Destroy,
                objectId: clientObj.objectId!,
            };
        }
        if (comparePayloads(obj.object, clientObj)) {
            return null;
        }
        return {
            entity: Entity.Object,
            action: Action.Create,
            object: obj.object,
        };
    }

    createObject(newObj: ObjectCreateEvent) {
        let next = 0;
        while (this.storedObjects.has(next)) {
            next++;
        }
        newObj.object.objectId = next;
        this.storedObjects.set(next, newObj);
        this.recentCreation.push(newObj.object);
        if (this.recentCreation.length >= 4) {
            this.recentCreation = this.recentCreation.slice(1);
        }
        return next;
    }

    getObjects(): Map<number, ObjectCreateEvent> {
        return this.storedObjects;
    }

    getNewObjects() {
        return this.recentCreation;
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

    destroyObjects(targetIds: number[]) {
        for (const id of targetIds) {
            if (this.storedObjects.has(id)) {
                this.storedObjects.delete(id);
                this.deleteRecentId(id);
            }
        }
    }

    deleteRecentId(targetId: number) {
        for (let i = 0; i < 3; i++) {
            if (
                this.recentCreation.length > i &&
                this.recentCreation[i].objectId === targetId
            ) {
                this.recentCreation.splice(i, 1);
            }
        }
    }

    moveObject(event: ObjectMoveEvent) {
        const targetObj = this.storedObjects.get(event.objectId);
        if (targetObj) {
            targetObj.object.x += event.x;
            targetObj.object.y += event.y;
        }
    }

    recolourObjects(events: ObjectRecolourEvent[]) {
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.object.colour = event.colour;
            }
        }
    }
}
