import type {
    ObjectCreatePayload,
    ObjectCreateEvent,
    ObjectMoveEvent,
    ObjectRecolourEvent,
    LayerState,
    ServerEvent,
    DicePayload,
    LaserEvent,
    RollComplete,
    Token,
} from '../shared/objectEvents.ts';
import { Board } from './boardCanvas/localBoard.ts';
import { ColInst } from '../shared/colours.ts';
import { Action, Entity, Shape } from '../shared/objectEvents.ts';
import { BoardObject } from './boardCanvas/boardObject.ts';
import { BoardLayer } from './boardCanvas/boardLayer.ts';
import { Box, Polyline } from './boardCanvas/boardObject.ts';
import { LayerMenu } from './rightBar/layerBarMenu.ts';
import { RollMenu } from './rightBar/rollBarMenu.ts';
import { getRequiredElement } from './dom.ts';
const loadWall = document.getElementById('loadBlock')!;
const can = getRequiredElement('board', HTMLCanvasElement);

function payloadToBoardObject(p: ObjectCreatePayload): BoardObject {
    switch (p.kind) {
        case Shape.Ellipse:
        case Shape.Rect:
            return new Box(
                p.objectId,
                p.x,
                p.y,
                p.width,
                p.height,
                p.colour,
                p.kind,
            );
        case Shape.Line:
        case Shape.Polyline:
            return new Polyline(
                p.objectId,
                p.x,
                p.y,
                p.points,
                p.colour,
                p.kind,
            );
        default: {
            throw new Error('Unknown shape');
        }
    }
}

// Main interface with the server.
// Will it stick around in the long run? I do not know.
export class tempStore {
    undoMap: Map<number, any>;
    undoCreateTracker: Map<number, number>;
    storedObjects: Map<number, BoardObject>;
    storedObjectPayloads: Map<number, ObjectCreatePayload>;
    storedLayerStates: Map<number, LayerState>;
    storedLayers: Map<number, BoardLayer>;
    currIndex: number;
    secondIndex: number;
    rollMapping: Map<number, RollComplete>;
    socket: WebSocket;
    board: Board | null;
    lasers: Map<number, LaserEvent>;
    designal: boolean;
    layMenu: LayerMenu | null;
    rollMenu: RollMenu | null;
    isGm: boolean;
    id: string;
    pass: string;
    name: string;
    currGame: number;

    constructor(
        newObjects: Map<number, BoardObject>,
        newLayers: Map<number, BoardLayer>,
        newStates: Map<number, LayerState>,
    ) {
        this.undoMap = new Map();
        this.undoCreateTracker = new Map();
        this.storedObjects = newObjects;
        this.storedObjectPayloads = new Map();
        this.storedLayerStates = newStates;
        this.storedLayers = newLayers;
        this.currIndex = 0;
        this.secondIndex = 0;
        this.rollMapping = new Map();
        this.lasers = new Map();
        this.board = null;
        this.designal = false;
        this.layMenu = null;
        this.rollMenu = null;
        this.isGm = false;

        this.currGame = Number(window.location.pathname.split('/')[2]) | 0;
        this.id =
            localStorage['id'] ||
            (Math.round(Math.random() * 1000000) + 500).toString();
        this.pass = localStorage['pass'] || '1';
        this.name = localStorage['name'] || 'wuog';
        // Switch to say if we're using local network or not
        // No doubt a better way of doing this exists, but also it's so minor I don't care.
        const online = true;

        if (online) {
            this.socket = new WebSocket('ws://47.55.46.138:4322/');
        } else {
            this.socket = new WebSocket('ws://192.168.2.142:8765/');
        }
        this.socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.entity === Entity.Name && message.accepted) {
                this.id = message.id;
                localStorage['id'] = message.id;
                this.isGm = message.gm;
                console.log('yay');
                this.board!.modeMan.toggleModeSwitcher(this.isGm);
            } else if (message.entity === Entity.Name) {
                localStorage['id'] = (
                    Math.round(Math.random() * 1000000) + 500
                ).toString();
                console.log('boo');
                alert('failed to log in');
            }
            if (message.entity === Entity.Layer) {
                if (message.action === Action.Destroy) {
                    if (this.storedLayers.has(message.layerId)) {
                        this.layMenu!.destroyLayerElement(message.layerId);
                        this.storedLayers.delete(message.layerId);
                    }
                } else if (this.storedLayerStates.has(message.layer.id)) {
                    this.layMenu!.updateLayer(message.layer.id, message.layer);
                    this.storedLayers
                        .get(message.layer.id)!
                        .updateFromLayerState(message.layer);
                } else {
                    this.createLayerLocal(message.layer);
                }
            } else if (message.entity === Entity.Object) {
                if (
                    message.action === Action.Destroy &&
                    this.storedObjectPayloads.has(message.objectId)
                ) {
                    this.storedObjectPayloads.delete(message.objectId);
                    if (this.board) {
                        this.board.removeObject(message.objectId);
                    }
                } else if (message.action !== Action.Destroy) {
                    if (
                        message.userId === this.id &&
                        !this.storedObjectPayloads.has(message.object.objectId)
                    ) {
                        this.secondIndex--;
                        this.undoMap.set(
                            this.undoCreateTracker.get(this.secondIndex)!,
                            [message.object.objectId],
                        );
                        this.undoCreateTracker.delete(this.secondIndex);
                    }
                    this.storedObjectPayloads.set(
                        message.object.objectId,
                        message.object,
                    );
                    this.createObjectLocal(message);
                }
            } else if (message.entity === Entity.Roll) {
                this.rollMapping.set(message.id, message);
            } else if (message.entity === Entity.Laser) {
                if (message.id !== this.id) {
                    this.lasers.set(message.id, message);
                }
            } else if (message.entity === Entity.Token) {
                const currObj = this.storedObjectPayloads.get(message.id);
                if (currObj) {
                    currObj.token = message.token;
                    this.storedObjects
                        .get(message.id)!
                        .updateToken(message.token);
                }
            } else if (message.entity === Entity.Meta) {
                if (message.action === Action.Finish) {
                    loadWall.style.visibility = 'hidden';
                } else if (message.action === Action.Recolour) {
                    can.style.background = message.newColour;
                }
            }
        });
        this.ping();
    }

    getLasers() {
        return this.lasers;
    }

    undoLast() {
        if (this.currIndex === 0) {
            return;
        }
        this.currIndex--;
        const last = this.undoMap.get(this.currIndex)!;
        if (!last[0].action) {
            this.destroyObjects(last, true);
        } else if (last[0].action === Action.Create) {
            for (const obj of last) {
                this.createObject(obj);
            }
        } else if (last[0].action === Action.Recolour) {
            this.recolourObjects(last, new ColInst(0, 0, 0, 0), true);
        } else if (last[0].action === Action.Move) {
            this.moveObjects(last, true);
        }
    }

    setBoard(newBoard: Board) {
        this.board = newBoard;
    }

    setMan(newMan: LayerMenu) {
        this.layMenu = newMan;
    }

    setup() {
        this.createLayer();
    }

    async ping() {
        while (this.socket.readyState === 0) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Name,
                pass: this.pass,
                name: this.name,
                id: this.id,
            }),
        );
    }

    async signIn(name: string, pass: string, id: string) {
        localStorage['pass'] = pass;
        localStorage['name'] = name;
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Name,
                pass: pass,
                name: name,
                id: id,
            }),
        );
    }

    rollDice(newDice: DicePayload) {
        this.socket.send(
            this.parcelServeEvent({
                dice: newDice,
                id: 0,
                action: Action.Create,
                entity: Entity.Roll,
                userId: this.id,
                userName: this.name,
            }),
        );
    }

    getDice() {
        return this.rollMapping;
    }

    // Sends a packet telling the backend to create an object with those parameters.
    async createObject(newObj: ObjectCreateEvent, undo: boolean = false) {
        if (!this.isGm) {
            return;
        }
        newObj.object.objectId = -1;
        newObj.userId = this.id;
        if (!undo) {
            newObj.object.objectId = -1;
            this.undoMap.set(this.currIndex, [-1]);
            this.undoCreateTracker.set(this.secondIndex, this.currIndex);
            this.currIndex += 1;
            this.secondIndex += 1;
        }
        this.socket.send(this.parcelServeEvent(newObj));
        return -1;
    }

    createObjectLocal(newObj: ObjectCreateEvent) {
        if (this.storedObjects.has(newObj.object.objectId)) {
            this.storedObjects
                .get(newObj.object.objectId)!
                .updateFromPayload(newObj.object);
            return;
        }
        const finalObj = payloadToBoardObject(newObj.object);
        finalObj.updateToken(newObj.token);
        this.storedObjects.set(newObj.object.objectId, finalObj);
        const layer = this.storedLayers.get(newObj.object.layerId);
        if (layer) {
            layer.addObject(finalObj, finalObj.objectId);
        }
    }

    updateToken(newToken: Token, newId: number) {
        if (!this.isGm) {
            return;
        }
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Token,
                token: newToken,
                id: newId,
            }),
        );
    }

    // Tells the backend to create a layer.
    async createLayer() {
        if (!this.isGm) {
            return;
        }
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Layer,
                action: Action.Create,
                layerId: -1,
            }),
        );
    }

    createLayerLocal(layerPacket: LayerState) {
        const newLayer = new BoardLayer(layerPacket.id, true, true);
        newLayer.updateFromLayerState(layerPacket);
        this.storedLayers.set(layerPacket.id, newLayer);
        this.layMenu!.constructLayer(layerPacket);
        this.board!.boardLayers.push(newLayer);
        this.board!.sortLayers();
    }

    // Tells the backend to destroy a bunch of objects.
    async destroyObjects(targetIds: number[], undo: boolean = false) {
        if (!this.isGm) {
            return;
        }
        const undoPackets: ObjectCreateEvent[] = [];
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
        for (const id of targetIds) {
            if (this.storedObjectPayloads.has(id)) {
                if (!undo) {
                    undoPackets.push({
                        entity: Entity.Object,
                        action: Action.Create,
                        object: this.storedObjectPayloads.get(id)!,
                        userId: this.id,
                        token: this.storedObjectPayloads.get(id)!.token,
                    });
                }
                this.socket.send(
                    this.parcelServeEvent({
                        entity: Entity.Object,
                        action: Action.Destroy,
                        objectId: id,
                    }),
                );
                this.storedObjectPayloads.delete(id);
                if (this.board) {
                    this.board.removeObject(id);
                }
            }
        }
    }

    // Receives a list of objects to move, checks each object's existence, if it exists moves it and tells the backend to move it too.
    // Questionable that it sends a packet for each object.
    async moveObjects(events: ObjectMoveEvent[], undo: boolean = false) {
        const undoPackets: ObjectMoveEvent[] = [];
        for (const event of events) {
            if (!undo) {
                undoPackets.push({
                    entity: event.entity,
                    action: event.action,
                    objectId: event.objectId,
                    x: -event.x,
                    y: -event.y,
                });
            }
            const targetObj = this.storedObjectPayloads.get(event.objectId);
            if (targetObj && (this.isGm || targetObj.token.active)) {
                this.storedObjects.get(event.objectId)!.move(event.x, event.y);
                this.socket.send(this.parcelServeEvent(event));
            }
        }
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
    }

    // Receives a list of objects to recolour, checks each object's existence, if it exists recolours it and tells the backend to recolour it too.
    // Questionable that it sends a packet for each object.
    recolourObjects(
        events: ObjectRecolourEvent[],
        oldCol: ColInst,
        undo: boolean = false,
    ) {
        if (!this.isGm) {
            return;
        }
        const undoPackets: ObjectRecolourEvent[] = [];
        for (const event of events) {
            if (!undo) {
                undoPackets.push({
                    entity: event.entity,
                    action: event.action,
                    objectId: event.objectId,
                    colour: oldCol.toString(),
                });
            }
            const targetObj = this.storedObjectPayloads.get(event.objectId);
            if (targetObj) {
                this.storedObjects
                    .get(event.objectId)!
                    .setColour(event.colour.toString());
                this.socket.send(
                    this.parcelServeEvent({
                        entity: event.entity,
                        action: event.action,
                        objectId: event.objectId,
                        colour: event.colour.toString(),
                    }),
                );
            }
        }
        if (!undo) {
            this.undoMap.set(this.currIndex, undoPackets);
            this.currIndex += 1;
        }
    }

    async updateLayer(input: LayerState) {
        if (!this.isGm) {
            return;
        }
        const targetObj = this.storedLayerStates.get(input.id);
        if (targetObj) {
            this.storedLayers.get(input.id)!.updateFromLayerState(input);
        }
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Layer,
                action: Action.Update,
                layer: input,
            }),
        );
    }

    async destroyLayer(input: LayerState) {
        if (!this.isGm) {
            return;
        }
        this.board!.clearLayer(input.id);
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Layer,
                action: Action.Destroy,
                layerId: input.id,
            }),
        );
    }

    parcelServeEvent(payload: ServerEvent) {
        return JSON.stringify({
            userId: this.id,
            event: payload,
            gameId: this.currGame,
        });
    }

    sendLaser(x: number, y: number, send: boolean) {
        if (send) {
            this.socket.send(
                this.parcelServeEvent({
                    entity: Entity.Laser,
                    id: this.id,
                    colour: this.board!.laserCol,
                    coords: { x: x, y: y },
                    time: Date.now(),
                }),
            );
            this.designal = false;
        } else if (!this.designal) {
            this.socket.send(
                this.parcelServeEvent({
                    entity: Entity.Laser,
                    id: this.id,
                    colour: '#cc00cc',
                    coords: { x: 0, y: 0 },
                    time: 0,
                }),
            );
            this.designal = true;
        }
    }

    sendChangeBackground(newCol: string) {
        this.socket.send(
            this.parcelServeEvent({
                entity: Entity.Meta,
                action: Action.Recolour,
                newColour: newCol,
            }),
        );
    }
}
