import type {
    CreateObjectPayload,
    ServerEvent,
    ObjectCreateEvent, ObjectMoveEvent
} from '../scripts/objectEvents.ts';
import { Action, Entity, Shape } from '../scripts/objectEvents.ts';
import { Circle, Line, Polyline, Rect, Token } from '../scripts/boardCanvas/boardObject.ts';
import type { BoardObject } from '../scripts/boardCanvas/boardObject.ts';

import type { LayerState } from '../scripts/rightBar/layerBarMenu.ts';

import Color from 'color';

export class StoredBoard {
    storedObjects: Map<number, ObjectCreateEvent>
    storedStrings: Map<number, string>
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
    
    stringifyObjectPayload(obj: CreateObjectPayload) {
        if (obj.kind === Shape.Rect) {
            return Shape.Rect + obj.x + ":" + obj.y + ":" + obj.width + ":" + obj.height + obj.colour + obj.layerId
        } else if (obj.kind === Shape.Circle || obj.kind === Shape.Token) {
            let retString = obj.kind + obj.x + ":" + obj.y + ":" + obj.diameter + obj.colour + obj.layerId
            if (obj.kind === Shape.Token) {
                retString += obj.name
            }
            return retString
        } else {
            let retString = obj.kind + obj.x + ":" + obj.y + obj.colour + obj.layerId
            for (const i of obj.points) {
                retString += ":" + i.x + ":" + i.y
            }
            return retString
        }
    }
    
    compareObjects(clientObjs: Map<number, CreateObjectPayload>) {
        const result: Map<number, CreateObjectPayload | null> = new Map()
        for (const [key, val] of clientObjs) {
            const bools = this.compareObject(Number(key), val)
            if (!bools[0] && bools[1]) {
                result.set(Number(key), this.storedObjects.get(Number(key))!.object)
            } else if (!bools[0]) {
                result.set(Number(key), null)
            }
        }
        return Object.fromEntries(result)
    }
    
    compareObject(key: number, clientObj: CreateObjectPayload): boolean[] {
        if (!this.storedObjects.has(key)) {
            return [false, false]
        }
        const localObj = this.storedObjects.get(key)!.object
        if (this.stringifyObjectPayload(localObj) === this.stringifyObjectPayload(clientObj)) {
            return [true, true]
        }
        return [false, true]
    }

    createObject(newObj: ObjectCreateEvent) {
        let next = 0;
        while (this.storedObjects.has(next)) {
            next++;
        }
        newObj.object.objectId = next
        this.storedObjects.set(next, newObj);
        this.recentCreation.push([next, newObj.object])
        if (this.recentCreation.length === 4) {
            this.recentCreation.slice(1)
        }
        return next;
    }
    
    getObjects(): Map<number, ObjectCreateEvent>  {
        return this.storedObjects
    }
    
    getNewObjects() {
        console.log(this.recentCreation)
        return this.recentCreation
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
            this.storedObjects.delete(id)
        }
    }
    
    moveObject(event: ObjectMoveEvent){
        const targetObj = this.storedObjects.get(event.objectId)
        if (targetObj) {
            targetObj.object.x += event.x
            targetObj.object.y += event.y
        }
    }
}
