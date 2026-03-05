import type {
    CreateObjectPayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectChangeEvent,
    ObjectRecolourEvent,
} from './objectEvents.ts';
import { Action, Entity } from './objectEvents.ts';
import type { LayerState } from './rightBar/layerBarMenu.ts';
import type { DicePayload } from './rightBar/rollBarMenu.ts';

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

export class tempStore {
    storedObjects: Map<number, ObjectCreateEvent>;
    storedLayers: Map<number, LayerState>;
    recentCreation: any[];
    currIndex: number;
    prevMapping: Map<number, DicePayload>;
    
    constructor() {
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.recentCreation = [];
        this.currIndex = 0;
        this.prevMapping = new Map();
    }
    
    rollDice(newDice: DicePayload) {
        let result = newDice.modifier;
        if (newDice.singleDice) {
            const mainDice = [newDice.singleNum, 0];
            switch (newDice.singleNum) {
                case 4:
                    mainDice[1] = newDice.four;
                    break;
                case 6:
                    mainDice[1] = newDice.six;
                    break;
                case 8:
                    mainDice[1] = newDice.eight;
                    break;
                case 10:
                    mainDice[1] = newDice.ten;
                    break;
                case 12:
                    mainDice[1] = newDice.twelve;
                    break;
                case 20:
                    mainDice[1] = newDice.twenty;
                    break;
                case 100:
                    mainDice[1] = newDice.hundred;
                    break;
            }
            if (newDice.dropLow + newDice.dropHigh < mainDice[1]) {
                let results = [];
                while (mainDice[1] > 0) {
                    results.push(
                        (Math.ceil(Math.random() * 10000) % mainDice[0]),
                    );
                    mainDice[1]--;
                }
                while (mainDice[1] < 0) {
                    results.push(
                        -(
                            (Math.ceil(Math.random() * 10000) % mainDice[0])
                        ),
                    );
                    mainDice[1]++;
                }
                results = results.sort(function (curr, next) {
                    return next - curr;
                });
                let currIndex = newDice.dropLow;
                while (currIndex < results.length - newDice.dropHigh) {
                    result += results[currIndex];
                    currIndex++;
                }
                newDice.result = result;
                this.recordDice(newDice);
                return result;
            }
        } else {
            //WIP
            this.recordDice(newDice);
            return result;
        }
    }

    async recordDice(newDice: DicePayload) {
        this.prevMapping.set(this.currIndex, newDice);
        this.currIndex = (this.currIndex + 1) % 50;
    }

    getDice() {
        return { start: this.currIndex, map: this.prevMapping };
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

    async createLayer() {
        if (this.storedLayers.size >= 11) {
            return -1;
        }
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

    async destroyObjects(targetIds: number[]) {
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

    async moveObjects(events: ObjectMoveEvent[]) {
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.object.x += event.x;
                targetObj.object.y += event.y;
            }
        }
    }

    async recolourObjects(events: ObjectRecolourEvent[]) {
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                targetObj.object.colour = event.colour;
            }
        }
    }

    async updateLayer(input: LayerState) {
        const targetObj = this.storedLayers.get(input.id);
        if (targetObj) {
            this.storedLayers.set(input.id, input);
        }
    }
}