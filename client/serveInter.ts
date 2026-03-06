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
    storedObjects: Map<number, CreateObjectPayload>;
    storedLayers: Map<number, LayerState>;
    recentCreation: any[];
    currIndex: number;
    prevMapping: Map<number, number>;
    socket: WebSocket;
    
    constructor() {
        this.storedObjects = new Map();
        this.storedLayers = new Map();
        this.recentCreation = [];
        this.currIndex = 0;
        this.prevMapping = new Map();
        this.socket = new WebSocket("ws://47.55.46.138:4322/")
        this.socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data)
            if (message.entity === "LAYER") {
                this.storedLayers.set(message.data.id, message.data)
            } else if (message.entity === "OBJECT") {
                if (message.action === "DESTROY" && this.storedObjects.has(message.objectId)) {
                    this.storedObjects.delete(message.object.objectId)
                } else {
                    this.storedObjects.set(message.object.objectId, message.object)
                }
            } else if (message.entity === "ROLL") {
                console.log(message)
                this.prevMapping.set(message.index, message.result)
            }
        })
    }
    
    ping() {
        this.socket.send("PING")
    }
    
    rollDice(newDice: DicePayload) {
        this.socket.send(JSON.stringify({"entity": "ROLL", "data": newDice}))
    }

    getDice() {
        return this.prevMapping;
    }

    async createObject(newObj: ObjectCreateEvent) {
        newObj.object.objectId = -1;
        this.socket.send(JSON.stringify(newObj))
        return -1;
    }

    getObjects(): Map<number, CreateObjectPayload> {
        return this.storedObjects;
    }

    getNewObjects() {
        return this.recentCreation;
    }

    async createLayer() {
        this.socket.send(JSON.stringify({"entity": "LAYER", "action": "Create", "data": {
            id: -1,
            gmVisible: true,
            playerVisible: true,
            zOrder: 0,
        }}))
        return;
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
                targetObj.x += event.x;
                targetObj.y += event.y;
                this.socket.send(JSON.stringify({"entity": "OBJECT", "action": "MOVE", 
                            "objectId": event.objectId, "x": event.x, "y": event.y}))
            }
        }
    }

    async recolourObjects(events: ObjectRecolourEvent[]) {
        for (const event of events) {
            const targetObj = this.storedObjects.get(event.objectId);
            if (targetObj) {
                console.log(event.objectId)
                targetObj.colour = event.colour;
                this.socket.send(JSON.stringify({"entity": "OBJECT", "action": "RECOLOUR", 
                            "objectId": event.objectId, "colour": event.colour}))
            }
        }
    }

    async updateLayer(input: LayerState) {
        const targetObj = this.storedLayers.get(input.id);
        if (targetObj) {
            this.storedLayers.set(input.id, input);
        }
        this.socket.send(JSON.stringify({"entity": "LAYER", "action": "Update", "data": input}))
    }
}