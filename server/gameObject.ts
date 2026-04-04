import type {
    ObjectCreateEvent,
    LayerUpdateEvent,
    LaserEvent,
    RollComplete,
} from '../shared/objectEvents.ts';
import { PostGresData } from './dataMain.ts';
import { PlayerPacket } from './gamePlayerPacket.ts';
import { Action, Entity } from '../shared/objectEvents.ts';
import WebSocket from 'ws';
import { updateLayerToRow } from './converter.ts';

export class GameObject {
    owner: string;
    objectMap: Map<number, ObjectCreateEvent>;
    layerMap: Map<number, LayerUpdateEvent>;
    diceMap: Map<number, RollComplete>;
    userMap: Map<string, PlayerPacket>;
    laserMap: Map<string, LaserEvent>;
    currCol: string;
    currObj: number;
    currLayer: number;
    currDice: number;
    laserTimer: number;
    finishedSetup: boolean;
    allGm: boolean;
    gameId: number;
    objectLock: boolean;
    layerLock: boolean;
    diceLock: boolean;
    userLock: boolean;
    dbLock: boolean;
    count: number;
    image: boolean;

    constructor(gameId: number) {
        this.owner = '';
        this.objectMap = new Map();
        this.layerMap = new Map();
        this.diceMap = new Map();
        this.userMap = new Map();
        this.laserMap = new Map();

        this.currCol = '#444444';
        this.currObj = 0;
        this.currLayer = 0;
        this.currDice = 0;
        this.laserTimer = 0;
        this.finishedSetup = false;

        this.allGm = true;
        this.gameId = gameId;

        // Having a database mutex on a per game basis does indeed defeat the entire purpose.
        // Should be moved into the database server itself instead.
        this.objectLock = false;
        this.layerLock = false;
        this.diceLock = false;
        this.userLock = false;
        this.dbLock = false;
        this.count = 0;

        this.image = false;
    }

    // Swaps the Z orders of two layers, given the id of one layer and its new Z order.
    swapLayers(id: number, newZ: number, cli: PostGresData) {
        const curr = this.layerMap.get(id);
        if (curr) {
            const oldZ = curr.layer.zOrder;
            for (const [key, layer] of this.layerMap) {
                if (layer.layer.zOrder === newZ) {
                    layer.layer.zOrder = oldZ;
                    curr.layer.zOrder = newZ;
                    cli.updateLayer(
                        this.gameId,
                        id,
                        updateLayerToRow({
                            entity: Entity.Layer,
                            action: Action.Update,
                            layer: curr.layer,
                        }),
                    );
                    const sendObj = JSON.stringify(curr);
                    this.broadcast(sendObj);
                    cli.updateLayer(
                        this.gameId,
                        layer.layer.id,
                        updateLayerToRow({
                            entity: Entity.Layer,
                            action: Action.Update,
                            layer: layer.layer,
                        }),
                    );
                    const sendObj2 = JSON.stringify(layer);
                    this.broadcast(sendObj2);
                }
            }
        }
    }

    // Remove a layer by id and update the Z indices of layers ranked above it.
    updateLayerMapRemoved(removedId: number, cli: PostGresData) {
        const removedLayer = this.layerMap.get(removedId);
        if (!removedLayer) {
            return;
        }
        const removedZ = removedLayer.layer.zOrder;
        for (const [key, layer] of this.layerMap) {
            if (key !== removedId) {
                const curr = layer.layer;
                let updateReq = false;
                if (curr.zOrder > removedZ) {
                    curr.zOrder -= 1;
                    updateReq = true;
                }
                if (updateReq) {
                    cli.updateLayer(
                        this.gameId,
                        curr.id,
                        updateLayerToRow({
                            entity: Entity.Layer,
                            action: Action.Update,
                            layer: curr,
                        }),
                    );
                    const sendObj = JSON.stringify({
                        entity: Entity.Layer,
                        action: Action.Update,
                        layer: curr,
                    });
                    this.broadcast(sendObj);
                }
            }
        }
        this.layerMap.delete(removedId);
    }

    // Moves stored object.
    moveObject(id: number, xChange: number, yChange: number) {
        const currObj = this.objectMap.get(id);
        if (currObj) {
            for (const pt of currObj.object.points) {
                pt.x += xChange;
                pt.y += yChange;
            }
        }
    }

    // Checks if given user Id has gm privileges
    checkUserGm(id: string): boolean {
        if (this.allGm) {
            return true;
        }
        const playerPacket = this.userMap.get(id);
        if (playerPacket && playerPacket.isGm) {
            return true;
        }
        return false;
    }

    // Removes user from list of active users.
    removeUser(id: string) {
        if (this.userMap.has(id)) {
            this.broadcast(
                JSON.stringify({
                    entity: Entity.User,
                    action: Action.Remove,
                    id: id,
                }),
            );
            this.userMap.delete(id);
        }
    }

    // Adds user to list of active users.
    addUser(newUser: string, id: string, gm: boolean, ws: WebSocket): boolean {
        if (this.userMap.has(id)) {
            this.broadcast(
                JSON.stringify({
                    entity: Entity.User,
                    action: Action.Remove,
                    id: id,
                }),
            );
            this.userMap.delete(id);
        }
        if (this.owner === id) {
            this.userMap.set(id, new PlayerPacket(newUser, id, true, ws));
            this.broadcast(
                JSON.stringify({
                    entity: Entity.User,
                    action: Action.Update,
                    name: newUser,
                    id: id,
                    gm: true,
                }),
            );
        } else {
            this.userMap.set(id, new PlayerPacket(newUser, id, gm, ws));
            this.broadcast(
                JSON.stringify({
                    entity: Entity.User,
                    action: Action.Update,
                    name: newUser,
                    id: id,
                    gm: gm,
                }),
            );
        }
        return this.userMap.get(id)!.isGm;
    }

    // Collects game from database if it exists, otherwise creates a new one.
    async setUp(
        cli: PostGresData,
        gmId: string | null = null,
    ): Promise<boolean> {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const res = await cli.getGame(this.gameId);
        if (res) {
            this.objectMap = res[0] as any;
            this.layerMap = res[1] as any;
            this.diceMap = res[2] as any;
            for (const [key, val] of this.objectMap) {
                if (val.object.objectId >= this.currObj) {
                    this.currObj = val.object.objectId + 1;
                }
            }
            for (const [key, val] of this.layerMap) {
                if (val.layer.id >= this.currLayer) {
                    this.currLayer = val.layer.id + 1;
                }
            }
            for (const [key, val] of this.diceMap) {
                if (val.id >= this.currDice) {
                    this.currDice = val.id + 1;
                }
            }
            this.currCol = res[3];
            this.owner = res[4];
            this.image = res[5];
            this.finishedSetup = true;
            if (this.currLayer === 0) {
                return false;
            }
            return true;
        } else if (gmId) {
            await cli.constructGame(gmId);
            this.finishedSetup = true;
            return false;
        }
        return false;
    }

    // Broadcasts updates made to the game to all connected users.
    async broadcast(newMessage: string, layerId: number = -1) {
        if (newMessage) {
            this.userMap.forEach((player) => {
                if (player.ws.readyState === WebSocket.OPEN) {
                    if (
                        layerId === -1 ||
                        this.layerMap.get(layerId)!.layer.playerVisible ||
                        player.isGm
                    ) {
                        player.ws.send(newMessage!, { binary: false });
                    }
                }
            });
        }
    }

    // Waits for the mutex corresponding to the input string to become free.
    // More complicated than the ./metaEvents/metaEvents.ts version because stupid.
    async waitLock(name: string) {
        if (name === 'db') {
            while (this.dbLock) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 50 + Math.round(Math.random() * 5)),
                );
            }
        } else if (name === 'obj') {
            while (this.objectLock) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 50 + Math.round(Math.random() * 5)),
                );
            }
        } else if (name === 'layer') {
            while (this.layerLock) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 50 + Math.round(Math.random() * 5)),
                );
            }
        } else if (name === 'user') {
            while (this.userLock) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 50 + Math.round(Math.random() * 5)),
                );
            }
        } else if (name === 'dice') {
            while (this.diceLock) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 50 + Math.round(Math.random() * 5)),
                );
            }
        }
    }

    // Sends all objects on a given layer.
    // Intended to update players when a layer is made visible.
    async sendMasses(targetLayer: number) {
        for (const [key, val] of this.objectMap) {
            if (val.object.layerId === targetLayer) {
                await new Promise((resolve) => setTimeout(resolve, 2));
                this.broadcast(JSON.stringify(val), val.object.layerId);
            }
        }
    }

    // Sends all details about the game to a given websocket.
    // For new connections, primarily.
    async sendAll(ws: WebSocket) {
        while (!this.finishedSetup) {
            await new Promise((resolve) => setTimeout(resolve, 2));
        }
        for (const [key, val] of this.layerMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(JSON.stringify(val));
        }
        for (const [key, val] of this.objectMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(JSON.stringify(val));
        }
        for (const [key, val] of this.diceMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(JSON.stringify(val));
        }
        for (const [key, val] of this.userMap) {
            await new Promise((resolve) => setTimeout(resolve, 2));
            ws.send(
                JSON.stringify({
                    entity: Entity.User,
                    action: Action.Update,
                    name: val.name,
                    id: val.id,
                    gm: val.isGm,
                }),
            );
        }
        ws.send(
            JSON.stringify({
                entity: Entity.Meta,
                action: Action.Recolour,
                newColour: this.currCol,
            }),
        );
        ws.send(
            JSON.stringify({
                entity: Entity.Meta,
                action: Action.Image,
                image: this.image,
            }),
        );
        ws.send(JSON.stringify({ entity: Entity.Meta, action: Action.Finish }));
    }

    // Sends all current lasers to all active players.
    // This can be made more efficient I'm fairly certain, but not now.
    async sendAllLasers() {
        this.count += 1;
        const currTime = Date.now();
        if (currTime - this.laserTimer < 30) {
            return;
        } else {
            this.laserTimer = currTime;
        }
        for (const [key, val] of this.laserMap) {
            if (this.laserTimer - val.time > 2000) {
                this.laserMap.delete(key);
            } else {
                this.broadcast(JSON.stringify(val));
            }
        }
    }
}
