import type {
    CreateObjectPayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectChangeEvent,
    ObjectRecolourEvent,
} from '../scripts/objectEvents.ts';
import { Action, Entity } from '../scripts/objectEvents.ts';

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
    storedLayers: Map<number, LayerState>;
    recentCreation: any[];
    lastTime: number;
    lockMainWrite: boolean;
    lockRecentWrite: boolean;
    lockLayerWrite: boolean;

    constructor() {
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.recentCreation = [];
        this.lastTime = 0;
        this.lockMainWrite = false;
        this.lockRecentWrite = false;
        this.lockLayerWrite = false;
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

    compareObject(clientObj: CreateObjectPayload): ObjectChangeEvent | null {
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

    async createObject(newObj: ObjectCreateEvent) {
        await this.waitForMain();
        this.lockMainWrite = true;
        await this.waitForRecent();
        this.lockRecentWrite = true;
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
        this.lockMainWrite = false;
        this.lockRecentWrite = false;
        return next;
    }

    getObjects(): Map<number, ObjectCreateEvent> {
        return this.storedObjects;
    }

    getNewObjects() {
        return this.recentCreation;
    }

    async createLayer() {
        if (this.storedLayers.size >= 11) {
            return -1;
        }
        await this.waitForLayer();
        this.lockLayerWrite = true;
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
        this.lockLayerWrite = false;
        return next;
    }

    getLayers() {
        return this.storedLayers;
    }

    async destroyObjects(targetIds: number[]) {
        await this.waitForMain();
        this.lockMainWrite = true;
        await this.waitForRecent();
        this.lockRecentWrite = true;
        for (const id of targetIds) {
            if (this.storedObjects.has(id)) {
                this.storedObjects.delete(id);
                this.deleteRecentId(id);
            }
        }
        this.lockMainWrite = false;
        this.lockRecentWrite = false;
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

    async moveObjects(events: ObjectMoveEvent[]) {
        await this.waitForMain();
        this.lockMainWrite = true;
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.object.x += event.x;
                targetObj.object.y += event.y;
            }
        }
        this.lockMainWrite = false;
    }

    async recolourObjects(events: ObjectRecolourEvent[]) {
        await this.waitForMain();
        this.lockMainWrite = true;
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.object.colour = event.colour;
            }
        }
        this.lockMainWrite = false;
    }

    async waitForRecent() {
        while (this.lockRecentWrite) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }

    async waitForMain() {
        while (this.lockMainWrite) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }

    async waitForLayer() {
        while (this.lockLayerWrite) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    }

    async updateLayer(input: LayerState) {
        await this.waitForLayer();
        this.lockLayerWrite = true;
        const targetObj = this.storedLayers.get(input.id);
        if (targetObj) {
            this.storedLayers.set(input.id, input);
        }
        this.lockLayerWrite = false;
    }
}
