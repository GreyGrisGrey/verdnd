
class ColInst {
    blue: number
    green: number
    red: number
    alpha: number
    
    constructor(newR: number, newG: number, newB: number, newA: number) {
        this.red = newR;
        this.green = newG;
        this.blue = newB;
        this.alpha = newA;
    }
    
    setR(newR: number) {
        this.red = newR
    }
    
    setG(newG: number) {
        this.green = newG
    }
    
    setB(newB: number) {
        this.blue = newB
    }
    
    setA(newA: number) {
        this.alpha = newA
    }
}

const GREY = '#cccccc';
const GREY_LIGHT = '#eeeeee';
const RED = '#cc0000';
const BLUE = '#0000cc';
const GOLD = '#ffd500';
const BLACK = '#000000';
const WHITE = 'rgba(255, 255, 255, 1)';
const WHITE_50 = 'rgba(255, 255, 255, 0.5)';


function getRequiredElement<T extends HTMLElement>(
    id: string,
    elementType: { new (): T },
) {
    const element = document.getElementById(id);
    if (!(element instanceof elementType)) {
        throw new Error(
            `Expected #${id} to be a ${elementType.name}, but it was missing or mismatched.`,
        );
    }
    return element;
}


enum Shape {
    Rect = 'Rect',
    Circle = 'Circle',
    Poly = 'Polyline',
    Line = 'Line',
    Token = 'Token',
}

enum Entity {
    Layer = 'LAYER',
    Object = 'OBJECT',
}

enum Action {
    Create = 'CREATE',
    Destroy = 'DESTROY',
    Move = 'MOVE',
    Add = 'ADD',
    Remove = 'REMOVE',
    Recolour = 'RECOLOUR',
    ZOrder = 'ZORDER',
}

interface RectCreatePayload {
    kind: Shape.Rect;
    x: number;
    y: number;
    width: number;
    height: number;
    colour: ColInst | string;
    layerId: number;
    objectId?: number;
}

interface CircleCreatePayload {
    kind: Shape.Circle;
    x: number;
    y: number;
    diameter: number;
    colour: ColInst | string;
    layerId: number;
    objectId?: number;
}

interface TokenCreatePayload {
    kind: Shape.Token;
    x: number;
    y: number;
    diameter: number;
    colour: ColInst | string;
    name: string;
    layerId: number;
    objectId?: number;
}

interface PolyCreatePayload {
    kind: Shape.Poly;
    x: number;
    y: number;
    points: Vec2[];
    colour: ColInst | string;
    layerId: number;
    objectId?: number;
}

interface LineCreatePayload {
    kind: Shape.Line;
    x: number;
    y: number;
    points: Vec2[];
    colour: ColInst | string;
    layerId: number;
    objectId?: number;
}

type CreateObjectPayload =
    | CircleCreatePayload
    | LineCreatePayload
    | PolyCreatePayload
    | RectCreatePayload
    | TokenCreatePayload;

interface LayerCreateEvent {
    entity: Entity.Layer;
    action: Action.Create;
    layerId: number;
}

interface LayerDestroyEvent {
    entity: Entity.Layer;
    action: Action.Destroy;
    layerId: number;
}

interface LayerMoveEvent {
    entity: Entity.Layer;
    action: Action.Move;
    layerId: number;
    x: number;
    y: number;
}

interface LayerAddObjectEvent {
    entity: Entity.Layer;
    action: Action.Add;
    layerId: number;
    objectId: number;
}

interface LayerRemoveObjectEvent {
    entity: Entity.Layer;
    action: Action.Remove;
    layerId: number;
    objectId: number;
}

interface ObjectCreateEvent {
    entity: Entity.Object;
    action: Action.Create;
    object: CreateObjectPayload;
}

interface ObjectMoveEvent {
    entity: Entity.Object;
    action: Action.Move;
    objectId: number;
    x: number;
    y: number;
}

interface ObjectDestroyEvent {
    entity: Entity.Object;
    action: Action.Destroy;
    objectId: number;
}

interface ObjectRecolourEvent {
    entity: Entity.Object;
    action: Action.Recolour;
    objectId: number;
    colour: ColInst;
}

interface LayerZOrderEvent {
    entity: Entity.Layer;
    action: Action.ZOrder;
    layerId: number;
    newZOrder: number;
}

type ServerEvent =
    | LayerAddObjectEvent
    | LayerCreateEvent
    | LayerDestroyEvent
    | LayerMoveEvent
    | LayerRemoveObjectEvent
    | ObjectCreateEvent
    | ObjectDestroyEvent
    | ObjectMoveEvent
    | ObjectRecolourEvent
    | LayerZOrderEvent;

type ObjectChangeEvent = ObjectCreateEvent | ObjectDestroyEvent;


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

class tempStore {
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

// Class handling canvas' draw mode.
// I do not like this, but it was the cleanest way I could think to do the job.
class BoardDrawMode {
    board: Board;
    active: boolean;
    shape: Shape;
    params: Vec2[];
    completeObjCheck: boolean;
    selectMode: boolean;
    selectState: number;
    tempObject: CreateObjectPayload | null;
    stickTemp: boolean;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.shape = Shape.Rect;
        this.params = [];
        this.completeObjCheck = false;
        this.selectMode = false;
        this.selectState = 0;
        this.tempObject = null;
        this.stickTemp = false;

        this.addEventListeners();
    }

    // Flips the active state of the mode and resets key variables.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        drawModeButton.disabled = setOn;
        this.params = [];
        this.selectMode = false;
        this.selectState = 0;
        this.completeObjCheck = false;
    }

    // Adds all relevant event listeners.
    addEventListeners() {
        // Handling for switching between drawn shape.
        document.addEventListener('keydown', (event) => {
            if (this.active) {
                this.selectMode = false;
            }
            if (this.active && this.params.length === 0) {
                if (event.key === '1') {
                    this.shape = Shape.Rect;
                } else if (event.key === '2') {
                    this.shape = Shape.Circle;
                } else if (event.key === '3') {
                    this.shape = Shape.Poly;
                } else if (event.key === '4') {
                    this.shape = Shape.Line;
                } else if (event.key === '6') {
                    this.shape = Shape.Rect;
                    this.selectMode = true;
                }
                this.params = [];
            } else if (
                this.active &&
                event.key === '5' &&
                this.params.length > 2 &&
                (this.shape === Shape.Poly || this.shape === Shape.Line)
            ) {
                this.setNewObject();
            } else if (this.active && event.key === '7') {
                this.params = [];
            }
        });

        can.addEventListener('mousedown', () => {
            if (this.active) {
                if (this.shape !== Shape.Poly && this.shape !== Shape.Line) {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    );
                } else if (this.params.length > 0) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        true,
                    );
                    this.params.push({
                        x: res.x - this.params[0].x,
                        y: res.y - this.params[0].y,
                    });
                } else {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            true,
                        ),
                    );
                }
            }
        });

        // Seriously suboptimal code for finishing construction of circles and rectangles.
        can.addEventListener('mouseup', () => {
            if (this.params.length === 0) {
                return;
            } else if (this.active && this.selectMode) {
                const newPos = this.board.determineTile(
                    this.board.mouseCoords.x + 1,
                    this.board.mouseCoords.y + 1,
                    false,
                );
                if (
                    newPos.x === this.params[0].x &&
                    newPos.y === this.params[0].y
                ) {
                    this.selectState = 1;
                } else {
                    const topLeft: Vec2 = {
                        x: Math.min(newPos.x, this.params[0].x),
                        y: Math.min(newPos.y, this.params[0].y),
                    };
                    const bottomRight: Vec2 = {
                        x: Math.max(newPos.x, this.params[0].x) + 1,
                        y: Math.max(newPos.y, this.params[0].y) + 1,
                    };
                    this.selectState = 2;
                    this.params = [];
                    this.params.push(topLeft);
                    this.params.push(bottomRight);
                }
            } else if (
                this.active &&
                this.shape !== Shape.Poly &&
                this.shape !== Shape.Line
            ) {
                if (this.shape === Shape.Rect) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    );
                    if (res.x >= this.params[0].x) {
                        res.x += 1;
                    }
                    if (res.y >= this.params[0].y) {
                        res.y += 1;
                    }
                    this.params.push({ x: res.x, y: res.y });
                    this.setNewObject();
                } else if (this.shape === Shape.Circle) {
                    const res = this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    );
                    if (res.x >= this.params[0].x) {
                        res.x += 1;
                    }
                    if (res.y >= this.params[0].y) {
                        res.y += 1;
                    }
                    this.params.push({ x: res.x, y: res.y });
                    this.setNewObject();
                }
            }
        });
    }

    // Text for the information bar.
    getText() {
        return `\
        1 : Create Rectangle
        2 : Create Circle
        3 : Create Polyline
        4 : Create Wall
        5 : Complete Wall/Polyline
        6 : Select
        7 : Cancel Draw`;
    }

    // Finalizes the current object and sends it to the server.
    setNewObject() {
        let tempObj: CreateObjectPayload;
        if (this.shape === Shape.Rect && this.params.length === 2) {
            const one = Math.min(this.params[0].x, this.params[1].x);
            const two = Math.min(this.params[0].y, this.params[1].y);
            const sizes = [
                Math.abs(this.params[1].x - this.params[0].x),
                Math.abs(this.params[1].y - this.params[0].y),
            ];
            if (this.params[1].x < this.params[0].x) {
                sizes[0] += 1;
            }
            if (this.params[1].y < this.params[0].y) {
                sizes[1] += 1;
            }
            tempObj = {
                kind: Shape.Rect,
                x: one,
                y: two,
                width: sizes[0],
                height: sizes[1],
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer,
            };
            this.completeObjCheck = true;
        } else if (this.shape === Shape.Circle && this.params.length === 2) {
            const newX = Math.min(this.params[0].x, this.params[1].x);
            const newY = Math.min(this.params[0].y, this.params[1].y);
            const radius = Math.max(
                Math.abs(this.params[0].x - this.params[1].x),
                Math.abs(this.params[0].y - this.params[1].y),
            );
            tempObj = {
                kind: Shape.Circle,
                x: newX,
                y: newY,
                diameter: radius,
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer,
            };
            this.completeObjCheck = true;
        } else if (this.shape === Shape.Poly && this.params.length > 2) {
            tempObj = {
                kind: Shape.Poly,
                x: this.params[0].x,
                y: this.params[0].y,
                points: this.params.slice(1),
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer,
            };
            this.completeObjCheck = true;
        } else if (this.shape === Shape.Line && this.params.length > 2) {
            tempObj = {
                kind: Shape.Line,
                x: this.params[0].x,
                y: this.params[0].y,
                points: this.params.slice(1),
                colour: colourSquare.style.background,
                layerId: this.board.activeLayer,
            };

            this.completeObjCheck = true;
        } else {
            return;
        }
        this.board.serveInter.createObject({
            entity: Entity.Object,
            action: Action.Create,
            object: tempObj,
        });
        this.params = [];
        this.tempObject = tempObj;
        this.stickTemp = true;
    }

    // Returns a temporary board object to display the shape about to be drawn.
    getTempObject() {
        if (!this.active) {
            return undefined;
        }
        if (this.tempObject !== null) {
            if (this.tempObject.kind === Shape.Rect) {
                return new Rect(
                    -1,
                    this.tempObject.x,
                    this.tempObject.y,
                    this.tempObject.width,
                    this.tempObject.height,
                    this.tempObject.colour,
                );
            } else if (this.tempObject.kind === Shape.Circle) {
                return new Circle(
                    -1,
                    this.tempObject.x,
                    this.tempObject.y,
                    this.tempObject.diameter,
                    this.tempObject.colour,
                );
            } else if (this.tempObject.kind === Shape.Poly) {
                return new Polyline(
                    -1,
                    this.tempObject.x,
                    this.tempObject.y,
                    this.tempObject.points,
                    this.tempObject.colour,
                );
            } else if (this.tempObject.kind === Shape.Line) {
                return new Line(
                    -1,
                    this.tempObject.x,
                    this.tempObject.y,
                    this.tempObject.points,
                    this.tempObject.colour,
                );
            }
            return this.tempObject;
        }
        if (
            this.shape !== Shape.Poly &&
            this.shape !== Shape.Line &&
            this.params.length >= 1
        ) {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
            );
            if (this.shape === Shape.Rect) {
                if (res.x >= this.params[0].x) {
                    res.x += 1;
                }
                if (res.y >= this.params[0].y) {
                    res.y += 1;
                }
                const coords = {
                    x: Math.min(this.params[0].x, res.x),
                    y: Math.min(this.params[0].y, res.y),
                };
                const sizes: Vec2 = {
                    x: Math.abs(res.x - this.params[0].x),
                    y: Math.abs(res.y - this.params[0].y),
                };
                if (res.x < this.params[0].x) {
                    sizes.x += 1;
                }
                if (res.y < this.params[0].y) {
                    sizes.y += 1;
                }
                if (this.selectMode) {
                    return new Rect(
                        -1,
                        coords.x,
                        coords.y,
                        sizes.x,
                        sizes.y,
                        WHITE_50,
                    );
                }
                return new Rect(
                    -1,
                    coords.x,
                    coords.y,
                    sizes.x,
                    sizes.y,
                    colourSquare.style.background,
                );
            } else if (this.shape === Shape.Circle) {
                if (res.x >= this.params[0].x) {
                    res.x += 1;
                }
                if (res.y >= this.params[0].y) {
                    res.y += 1;
                }
                const coords: Vec2 = {
                    x: Math.min(this.params[0].x, res.x),
                    y: Math.min(this.params[0].y, res.y),
                };
                const radius = Math.max(
                    Math.abs(this.params[0].x - res.x),
                    Math.abs(this.params[0].y - res.y),
                );
                const newObj = new Circle(
                    -1,
                    coords.x,
                    coords.y,
                    radius,
                    colourSquare.style.background,
                );
                return newObj;
            }
        } else if (this.params.length >= 2 && this.shape === Shape.Poly) {
            const newParams = this.params.slice(1);
            const newObj = new Polyline(
                -1,
                this.params[0].x,
                this.params[0].y,
                newParams,
                colourSquare.style.background,
            );
            return newObj;
        } else if (this.params.length >= 2 && this.shape === Shape.Line) {
            const newParams = this.params.slice(1);
            const newObj = new Line(
                -1,
                this.params[0].x,
                this.params[0].y,
                newParams,
                colourSquare.style.background,
            );
            return newObj;
        }
        return undefined;
    }

    clearObject() {
        if (!this.stickTemp) {
            this.tempObject = null;
        }
        this.stickTemp = false;
    }
}


// Manages a single layer of the board.
// Currently has little functionality.
class BoardLayer {
    layerOffset: Vec2;
    heldObjects: BoardObject[];
    heldMap: Map<number, BoardObject>;
    zOrder: number;
    GMVisible: boolean;
    playerVisible: boolean;

    constructor(newOrder: number, newGM: boolean, newPlayer: boolean) {
        this.layerOffset = { x: 0, y: 0 };
        this.heldObjects = [];
        this.heldMap = new Map();
        this.zOrder = newOrder;
        this.GMVisible = newGM;
        this.playerVisible = newPlayer;
    }

    updateVis(newGM: boolean, newPlayer: boolean) {
        this.GMVisible = newPlayer;
        this.playerVisible = newGM;
    }

    // Sorts the board objects based on zOrder.
    sortObjects() {
        this.heldObjects = this.heldObjects.sort((n1, n2) => {
            if (n1.objType === Shape.Token && n2.objType !== Shape.Token) {
                return 1;
            }
            if (n1.objType !== Shape.Token && n2.objType === Shape.Token) {
                return -1;
            }
            if (n1.selected && !n2.selected) {
                return 1;
            }
            if (!n1.selected && n2.selected) {
                return -1;
            }
            if (n1.zOrder > n2.zOrder) {
                return 1;
            }
            if (n1.zOrder < n2.zOrder) {
                return -1;
            }
            return 0;
        });
    }

    // Adds a new board object, then sorts the board objects.
    addObject(newObj: BoardObject, newId: number) {
        this.heldObjects.push(newObj);
        this.heldMap.set(newId, newObj);
        this.sortObjects();
    }

    // Removes a board object.
    removeObject(removeId: number) {
        const toRemove = this.heldMap.get(removeId);
        if (!toRemove) {
            alert('Error no object with such Id exists to remove');
            return false;
        }
        const removeIndex = this.heldObjects.indexOf(toRemove);
        if (!this.heldMap.delete(removeId)) {
            alert('Error no object with such Id exists to remove');
            return false;
        }
        this.heldObjects.splice(removeIndex, 1);
        this.sortObjects();
        this.heldMap.delete(removeId);
        return true;
    }

    // Attempts to move a board object.
    // If no board object with a corresponding Id exists, returns false, otherwise true.
    moveObject(moveId: number, moveX: number, moveY: number) {
        const targetObj = this.heldMap.get(moveId);
        if (!targetObj) {
            return false;
        }
        targetObj.move(moveX, moveY);
        return true;
    }

    // Draws each board object on the layer.
    drawLayer(
        ctx: CanvasRenderingContext2D,
        squareSize: number,
        offset: Vec2,
        thirdOffset: Vec2 = { x: 0, y: 0 },
    ) {
        if (this.GMVisible) {
            const localOffset: Vec2 = {
                x: offset.x + this.layerOffset.x,
                y: offset.y + this.layerOffset.y,
            };
            for (const obj of this.heldObjects) {
                if (obj.selected) {
                    obj.draw(ctx, squareSize, {
                        x: localOffset.x + thirdOffset.x,
                        y: localOffset.y + thirdOffset.y,
                    });
                } else {
                    obj.draw(ctx, squareSize, localOffset);
                }
            }
        }
    }

    // Shifts the layer's offset.
    shiftLayer(moveCoords: Vec2) {
        this.layerOffset.x += moveCoords.x;
        this.layerOffset.y += moveCoords.y;
    }

    // Selects all objects on the layer that match the corresponding coordinates.
    // If one coordinate point is provided, checks if said point is contained within the object.
    // If two points are provided, checks if each object's center is contained within the produced rectangle.
    selectObjects(selectCoords: Vec2[], matchType: string = 'any') {
        const acceptable: BoardObject[] = [];
        for (const candidate of this.heldObjects) {
            if (
                selectCoords.length === 1 &&
                'isPointInside' in candidate &&
                candidate.isPointInside(selectCoords[0]) &&
                (candidate.objType === matchType || matchType === 'any')
            ) {
                acceptable.push(candidate);
                break;
            } else if (
                selectCoords.length === 2 &&
                candidate.isCenterInsideRect(
                    selectCoords[0],
                    selectCoords[1],
                ) &&
                (candidate.objType === matchType || matchType === 'any')
            ) {
                acceptable.push(candidate);
            }
        }
        return acceptable;
    }
}


type BoardObject = Circle | Line | Polyline | Rect | Token;

// General purpose superclass for any shape that appears on the board.
// Includes tokens, rectangles, polylines.
// Future plans to include more specific subclasses
class BoardObjectBase {
    objectId: number;
    zOrder: number;
    location: Vec2;
    colour: ColInst | string;
    hasImage: boolean;
    imagePath: string;
    centerPoint: Vec2;
    selected: boolean;
    layerId: number;

    constructor(
        objId: number,
        x: number,
        y: number,
        colour: ColInst | string,
    ) {
        this.objectId = objId;
        this.zOrder = 0;
        this.location = { x, y };
        this.colour = colour;
        this.hasImage = false;
        this.imagePath = '';
        this.selected = false;
        this.centerPoint = { x: 0, y: 0 };
        this.layerId = 0;
    }

    // Moves the object a set amount
    move(xChange: number, yChange: number) {
        this.location.x += xChange;
        this.location.y += yChange;
        this.setCenter();
        return this.location;
    }

    setColour(newColour: ColInst | string) {
        this.colour = newColour;
    }

    setZOrder(newOrder: number) {
        this.zOrder = newOrder;
    }

    // Checks if the center of the object is contained within a given rectangle.
    // Used for selection of board objects.
    isCenterInsideRect(point1: Vec2, point2: Vec2) {
        if (
            this.centerPoint.x >= point1.x &&
            this.centerPoint.x <= point2.x &&
            this.centerPoint.y >= point1.y &&
            this.centerPoint.y <= point2.y
        ) {
            return true;
        }
        return false;
    }

    // Function to set the center point of the object.
    setCenter() {
        this.centerPoint = { x: 0, y: 0 };
    }

    setSelected(newSelection: boolean) {
        this.selected = newSelection;
    }
}

// Subclass for token objects.
class Token extends BoardObjectBase {
    owner: string;
    diameter: number;
    name: string;
    objType: Shape;
    currPathSpecs: Array<number>;
    currPath: Path2D;
    currOutPath: Path2D;

    constructor(
        id: number,
        x: number,
        y: number,
        diam: number,
        colour: ColInst | string,
        name: string = '',
        owner: string = '',
    ) {
        super(id, x, y, colour);
        this.owner = owner;
        this.diameter = diam;
        this.name = name;
        this.objType = Shape.Token;
        this.currPathSpecs = [0, 0, 0];
        this.currPath = new Path2D();
        this.currOutPath = new Path2D();
        this.setCenter();
    }

    draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        if (
            squareSize !== this.currPathSpecs[0] ||
            offset.x !== this.currPathSpecs[1] ||
            offset.y !== this.currPathSpecs[2]
        ) {
            const coords: Vec2 = {
                x:
                    this.location.x * squareSize +
                    offset.x +
                    (squareSize * this.diameter) / 2,
                y:
                    this.location.y * squareSize +
                    offset.y +
                    (squareSize * this.diameter) / 2,
            };

            this.currOutPath = new Path2D();
            this.currOutPath.arc(
                coords.x,
                coords.y,
                (this.diameter * squareSize) / 2,
                0,
                2 * Math.PI,
                false,
            );
            this.currOutPath.closePath();

            this.currPath = new Path2D();
            this.currPath.arc(
                coords.x,
                coords.y,
                (this.diameter * squareSize) / 2 - 2,
                0,
                2 * Math.PI,
                false,
            );
            this.currPath.closePath();

            this.currPathSpecs = [squareSize, offset.x, offset.y];
        }

        ctx.strokeStyle = this.selected ? GOLD.toString() : GREY.toString();
        ctx.lineWidth = 4;
        ctx.stroke(this.currOutPath);

        ctx.fillStyle = this.colour.toString();
        ctx.fill(this.currPath);
    }

    drawLabel(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        ctx.font = '20px serif';
        ctx.fillStyle = GREY_LIGHT.toString();
        ctx.textAlign = 'center';
        const textSize = ctx.measureText(this.name).width;
        ctx.fillRect(
            this.location.x * squareSize +
                offset.x +
                (squareSize * this.diameter) / 2 -
                textSize / 2 -
                5,
            this.location.y * squareSize + offset.y - 35,
            textSize + 10,
            25,
        );
        ctx.fillStyle = BLACK.toString();
        ctx.fillText(
            this.name,
            this.location.x * squareSize +
                offset.x +
                (squareSize * this.diameter) / 2,
            this.location.y * squareSize + offset.y - 20,
        );
    }

    isPointInside(point: Vec2) {
        const adj = Math.abs(
            this.location.x + this.diameter / 2 - point.x - 0.5,
        );
        const opp = Math.abs(
            this.location.y + this.diameter / 2 - point.y - 0.5,
        );
        const distance = Math.sqrt(adj * adj + opp * opp);
        if (distance <= this.diameter / 2) {
            return true;
        }
        return false;
    }

    setCenter() {
        this.centerPoint = {
            x: this.location.x + this.diameter / 2,
            y: this.location.y + this.diameter / 2,
        };
    }

    payloadFromObject(): TokenCreatePayload {
        return {
            kind: Shape.Token,
            x: this.location.x,
            y: this.location.y,
            diameter: this.diameter,
            colour: this.colour,
            name: this.name,
            layerId: this.layerId,
            objectId: this.objectId,
        };
    }

    updateFromPayload(newSetting: TokenCreatePayload) {
        this.location.x = newSetting.x;
        this.location.y = newSetting.y;
        this.diameter = newSetting.diameter;
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
    }
}

// Subclass for rectangle objects.
class Rect extends BoardObjectBase {
    size: Vec2;
    objType: Shape;

    constructor(
        id: number,
        x: number,
        y: number,
        xSize: number,
        ySize: number,
        colour: ColInst | string,
    ) {
        super(id, x, y, colour);
        this.size = { x: xSize, y: ySize };
        this.objType = Shape.Rect;
        this.setCenter();
    }

    draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        if (this.selected) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 4;
            ctx.strokeRect(
                this.location.x * squareSize + offset.x - 2,
                this.location.y * squareSize + offset.y - 2,
                this.size.x * squareSize + 4,
                this.size.y * squareSize + 4,
            );
        }
        ctx.fillStyle = this.colour.toString();
        ctx.fillRect(
            this.location.x * squareSize + offset.x,
            this.location.y * squareSize + offset.y,
            this.size.x * squareSize,
            this.size.y * squareSize,
        );
    }

    isPointInside(point: Vec2) {
        if (
            point.x + 0.5 >= this.location.x &&
            point.y + 0.5 >= this.location.y &&
            point.x + 0.5 <= this.location.x + this.size.x &&
            point.y + 0.5 <= this.location.y + this.size.y
        ) {
            return true;
        }
        return false;
    }

    setCenter() {
        this.centerPoint = {
            x: this.location.x + this.size.x / 2,
            y: this.location.y + this.size.y / 2,
        };
    }

    payloadFromObject(): RectCreatePayload {
        return {
            kind: Shape.Rect,
            x: this.location.x,
            y: this.location.y,
            width: this.size.x,
            height: this.size.y,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
        };
    }

    updateFromPayload(newSetting: RectCreatePayload) {
        this.location.x = newSetting.x;
        this.location.y = newSetting.y;
        this.size.x = newSetting.width;
        this.size.y = newSetting.height;
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
    }
}

// Subclass for circle objects.
class Circle extends BoardObjectBase {
    diameter: number;
    objType: Shape;
    currPathSpecs: Array<number>;
    currPath: Path2D;

    constructor(
        id: number,
        x: number,
        y: number,
        diam: number,
        colour: ColInst | string,
    ) {
        super(id, x, y, colour);
        this.diameter = diam;
        this.objType = Shape.Circle;
        this.currPathSpecs = [0, 0, 0];
        this.currPath = new Path2D();
        this.setCenter();
    }

    draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        if (
            squareSize !== this.currPathSpecs[0] ||
            offset.x !== this.currPathSpecs[1] ||
            offset.y !== this.currPathSpecs[2]
        ) {
            const coords: Vec2 = {
                x:
                    this.location.x * squareSize +
                    offset.x +
                    (squareSize * this.diameter) / 2,
                y:
                    this.location.y * squareSize +
                    offset.y +
                    (squareSize * this.diameter) / 2,
            };
            this.currPath = new Path2D();
            this.currPath.arc(
                coords.x,
                coords.y,
                (this.diameter * squareSize) / 2,
                0,
                2 * Math.PI,
                false,
            );
            this.currPathSpecs = [squareSize, offset.x, offset.y];
            this.currPath.closePath();
        }
        if (this.selected) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 4;
            ctx.stroke(this.currPath);
        }
        ctx.fillStyle = this.colour.toString();
        ctx.fill(this.currPath);
    }

    isPointInside(point: Vec2) {
        const adj = Math.abs(
            this.location.x + this.diameter / 2 - point.x - 0.5,
        );
        const opp = Math.abs(
            this.location.y + this.diameter / 2 - point.y - 0.5,
        );
        const distance = Math.sqrt(adj * adj + opp * opp);
        if (distance <= this.diameter / 2) {
            return true;
        }
        return false;
    }

    setCenter() {
        this.centerPoint = {
            x: this.location.x + this.diameter / 2,
            y: this.location.y + this.diameter / 2,
        };
    }

    payloadFromObject(): CircleCreatePayload {
        return {
            kind: Shape.Circle,
            x: this.location.x,
            y: this.location.y,
            diameter: this.diameter,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
        };
    }

    updateFromPayload(newSetting: CircleCreatePayload) {
        this.location.x = newSetting.x;
        this.location.y = newSetting.y;
        this.diameter = newSetting.diameter;
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
    }
}

// Subclass for polyline objects.
class Polyline extends BoardObjectBase {
    points: Vec2[];
    objType: Shape;
    currPath: Path2D;
    currPathSpecs: Array<number>;
    ctx?: CanvasRenderingContext2D;

    constructor(
        id: number,
        x: number,
        y: number,
        structure: Vec2[],
        colour: ColInst | string,
    ) {
        super(id, x, y, colour);
        this.points = structure;
        this.objType = Shape.Poly;
        this.currPath = new Path2D();
        this.currPathSpecs = [0, 0, 0];
        this.ctx = undefined;
        this.setCenter();
    }

    draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        if (
            squareSize !== this.currPathSpecs[0] ||
            offset.x !== this.currPathSpecs[1] ||
            offset.y !== this.currPathSpecs[2]
        ) {
            this.currPath = new Path2D();
            this.currPath.moveTo(
                this.location.x * squareSize + offset.x,
                this.location.y * squareSize + offset.y,
            );
            for (const pt of this.points) {
                this.currPath.lineTo(
                    (this.location.x + pt.x) * squareSize + offset.x,
                    (this.location.y + pt.y) * squareSize + offset.y,
                );
            }
            this.currPathSpecs = [squareSize, offset.x, offset.y];
            this.currPath.closePath();
        }
        if (this.selected) {
            ctx.strokeStyle = GOLD.toString();
            ctx.lineWidth = 4;
            ctx.stroke(this.currPath);
        }
        ctx.fillStyle = this.colour.toString();
        ctx.fill(this.currPath);
        this.ctx = ctx;
    }

    isPointInside(point: Vec2) {
        if (
            this.ctx?.isPointInPath(
                this.currPath,
                (point.x + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[1],
                (point.y + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[2],
            )
        ) {
            return true;
        }
        return false;
    }

    setCenter() {
        const topLeft: Vec2 = { x: 0, y: 0 };
        const bottomRight: Vec2 = { x: 0, y: 0 };
        for (const pt of this.points) {
            if (pt.x < topLeft.x) {
                topLeft.x = pt.x;
            } else if (pt.x > bottomRight.x) {
                bottomRight.x = pt.x;
            }
            if (pt.y < topLeft.y) {
                topLeft.y = pt.y;
            } else if (pt.y > bottomRight.y) {
                bottomRight.y = pt.y;
            }
        }
        this.centerPoint = {
            x: (bottomRight.x + topLeft.x) / 2 + this.location.x,
            y: (bottomRight.y + topLeft.y) / 2 + this.location.y,
        };
    }

    payloadFromObject(): PolyCreatePayload {
        return {
            kind: Shape.Poly,
            x: this.location.x,
            y: this.location.y,
            points: this.points,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
        };
    }

    updateFromPayload(newSetting: PolyCreatePayload) {
        this.location.x = newSetting.x;
        this.location.y = newSetting.y;
        this.points = newSetting.points;
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
    }
}

// Subclass for handling line objects.
class Line extends BoardObjectBase {
    points: Vec2[];
    objType: Shape;

    constructor(
        id: number,
        x: number,
        y: number,
        structure: Vec2[],
        colour: ColInst | string,
    ) {
        super(id, x, y, colour);
        this.points = structure;
        this.objType = Shape.Line;
        this.setCenter();
    }

    draw(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        ctx.beginPath();
        ctx.moveTo(
            this.location.x * squareSize + offset.x,
            this.location.y * squareSize + offset.y,
        );
        for (const pt of this.points) {
            ctx.lineTo(
                (this.location.x + pt.x) * squareSize + offset.x,
                (this.location.y + pt.y) * squareSize + offset.y,
            );
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.colour.toString();
        ctx.stroke();
    }

    setCenter() {
        const topLeft: Vec2 = { x: 0, y: 0 };
        const bottomRight: Vec2 = { x: 0, y: 0 };
        for (const pt of this.points) {
            if (pt.x < topLeft.x) {
                topLeft.x = pt.x;
            } else if (pt.x > bottomRight.x) {
                bottomRight.x = pt.x;
            }
            if (pt.y < topLeft.y) {
                topLeft.y = pt.y;
            } else if (pt.y > bottomRight.y) {
                bottomRight.y = pt.y;
            }
        }
        this.centerPoint = {
            x: (bottomRight.x + topLeft.x) / 2 + this.location.x,
            y: (bottomRight.y + topLeft.y) / 2 + this.location.y,
        };
    }

    payloadFromObject(): LineCreatePayload {
        return {
            kind: Shape.Line,
            x: this.location.x,
            y: this.location.y,
            points: this.points,
            colour: this.colour,
            layerId: this.layerId,
            objectId: this.objectId,
        };
    }

    updateFromPayload(newSetting: LineCreatePayload) {
        this.location.x = newSetting.x;
        this.location.y = newSetting.y;
        this.points = newSetting.points;
        this.colour = newSetting.colour;
        this.layerId = newSetting.layerId;
    }
}


// Activates following a completed selection from draw mode or token mode.
class BoardSelectMode {
    board: Board;
    active: boolean;
    exitOnNextStep: boolean;
    selectedObjects: BoardObject[];
    selectClick: boolean;
    thirdOffset: Vec2;
    currColour: string;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.exitOnNextStep = false;
        this.selectedObjects = [];
        this.selectClick = false;
        this.thirdOffset = { x: 0, y: 0 };
        this.currColour = 'none';

        this.addEventListeners();
    }

    flipListeners(setOn: boolean) {
        for (const obj of this.selectedObjects) {
            obj.setSelected(false);
        }
        this.active = setOn;
        this.selectedObjects = [];
        this.exitOnNextStep = false;
        this.currColour = colourSquare.style.background;
        this.selectClick = this.board.leftMouseDown;
        this.thirdOffset = { x: 0, y: 0 };
    }

    addEventListeners() {
        can.addEventListener('mousemove', (event) => {
            if (this.active && this.selectClick) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                this.thirdOffset.x -= change.x;
                this.thirdOffset.y -= change.y;
            }
        });

        can.addEventListener('mousedown', (event) => {
            if (this.active) {
                const point = this.board.determineTile(
                    event.clientX,
                    event.clientY,
                    false,
                );
                for (const candidate of this.selectedObjects) {
                    if (
                        'isPointInside' in candidate &&
                        candidate.isPointInside(point)
                    ) {
                        this.selectClick = true;
                        break;
                    }
                }
            }
        });

        can.addEventListener('mouseup', () => {
            if (this.active && this.selectClick) {
                this.moveObjects();
                this.selectClick = false;
                if (
                    this.selectedObjects.length === 1 &&
                    this.selectedObjects[0].objType === Shape.Token
                ) {
                    this.exitOnNextStep = true;
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (this.active && event.key === 'Escape') {
                this.exitOnNextStep = true;
            } else if (this.active && event.key === 'Backspace') {
                const idList: number[] = [];
                for (const obj of this.selectedObjects) {
                    idList.push(obj.objectId);
                }
                this.board.serveInter.destroyObjects(idList);
                this.exitOnNextStep = true;
            }
        });
    }

    moveObjects() {
        const point = this.board.determineTile(
            this.board.originCoords.x + this.thirdOffset.x,
            this.board.originCoords.y + this.thirdOffset.y,
            true,
        );
        const moveList = [];
        for (const i of this.selectedObjects) {
            moveList.push({
                entity: Entity.Object,
                action: Action.Move,
                objectId: i.objectId,
                x: point.x,
                y: point.y,
            });
            i.move(point.x, point.y);
        }
        this.board.serveInter.moveObjects((moveList as any));
        this.thirdOffset.x = 0;
        this.thirdOffset.y = 0;
    }

    recolour() {
        if (this.currColour !== colourSquare.style.background) {
            this.currColour = colourSquare.style.background;
            const recolourList = [];
            for (const obj of this.selectedObjects) {
                recolourList.push({
                    entity: Entity.Object,
                    action: Action.Recolour,
                    objectId: obj.objectId,
                    colour: this.currColour,
                });
                obj.setColour(this.currColour);
            }
            this.board.serveInter.recolourObjects((recolourList as any));
        }
    }

    getText() {
        return 'nah';
    }

    setSelected(newObjs: BoardObject[]) {
        this.selectedObjects = newObjs;
        for (const obj of this.selectedObjects) {
            obj.setSelected(true);
        }
    }
}


// Class handling canvas' token mode.
// Currently WIP.
class BoardTokenMode {
    board: Board;
    active: boolean;
    params: Vec2[];
    shift: boolean;
    completeSelectCheck: boolean;
    currHover?: Token;
    newTokenCheck: boolean;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = false;
        this.params = [];
        this.shift = false;
        this.completeSelectCheck = false;
        this.currHover = undefined;
        this.newTokenCheck = false;
        this.addEventListeners();
    }

    flipListeners(setOn: boolean) {
        this.active = setOn;
        tokenModeButton.disabled = setOn;
        if (setOn) {
            sizeInput.value = '1';
            nameInput.value = 'Gremlin';
            sizeInput.style.visibility = 'visible';
            nameInput.style.visibility = 'visible';
            sizeLabel.style.visibility = 'visible';
            nameLabel.style.visibility = 'visible';
        } else {
            sizeInput.style.visibility = 'hidden';
            nameInput.style.visibility = 'hidden';
            sizeLabel.style.visibility = 'hidden';
            nameLabel.style.visibility = 'hidden';
        }
    }

    addEventListeners() {
        can.addEventListener('mousemove', () => {
            if (this.active) {
                this.currHover = this.board.selectToken([
                    this.board.determineTile(
                        this.board.mouseCoords.x,
                        this.board.mouseCoords.y,
                        false,
                    ),
                ]);
            }
        });

        can.addEventListener('mousedown', () => {
            if (this.active) {
                if (!this.shift) {
                    const res = this.board.selectToken([
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    ]);
                    this.currHover = res;
                    if (!this.currHover) {
                        this.createToken();
                        this.newTokenCheck = true;
                    } else {
                        this.completeSelectCheck = true;
                    }
                } else {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    );
                }
            }
        });

        can.addEventListener('mouseup', () => {
            if (this.active) {
                if (this.shift) {
                    this.params.push(
                        this.board.determineTile(
                            this.board.mouseCoords.x,
                            this.board.mouseCoords.y,
                            false,
                        ),
                    );
                    const newCoords: Vec2[] = [];
                    newCoords.push({
                        x: Math.min(this.params[0].x, this.params[1].x),
                        y: Math.min(this.params[0].y, this.params[1].y),
                    });
                    newCoords.push({
                        x: Math.max(this.params[0].x, this.params[1].x) + 1,
                        y: Math.max(this.params[0].y, this.params[1].y) + 1,
                    });
                    this.params = newCoords;
                    this.completeSelectCheck = true;
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (this.active && event.key === 'Shift') {
                this.shift = true;
            }
        });

        // Should this event listener not check if token mode is active? Probably not, but it causes a bug with single token selection if it does.
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.shift = false;
            }
        });

        sizeInput.addEventListener('input', () => {
            if (sizeInput.value.length > 3) {
                sizeInput.value = '1';
            } else {
                for (const char of sizeInput.value) {
                    if (char.charCodeAt(0) < 48 || char.charCodeAt(0) > 57) {
                        sizeInput.value = '1';
                        break;
                    }
                }
                if (parseInt(sizeInput.value, 10) < 1) {
                    sizeInput.value = '1';
                } else if (parseInt(sizeInput.value, 10) > 300) {
                    alert(
                        'u have no legitimate need to make a token this big\npls be serious',
                    );
                    sizeInput.value = '1';
                }
            }
        });
    }

    getText() {
        return 'Left Click : Create Token\nLeft Click on Token : Select Token\nShift + Left Click : Select Tokens';
    }

    createToken() {
        if (nameInput.value && sizeInput.value) {
            const coords = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
            );
            this.board.serveInter.createObject({
                entity: Entity.Object,
                action: Action.Create,
                object: {
                    kind: Shape.Token,
                    x: coords.x,
                    y: coords.y,
                    diameter: parseInt(sizeInput.value, 10),
                    colour: colourSquare.style.background,
                    name: nameInput.value,
                    layerId: this.board.activeLayer,
                },
            });
        }
    }

    tryDrawLabel(
        ctx: CanvasRenderingContext2D,
        squareSize: number,
        offset: Vec2,
    ) {
        this.currHover?.drawLabel(ctx, squareSize, offset);
    }

    getNewHover() {
        if (this.newTokenCheck) {
            this.currHover = this.board.selectToken([
                this.board.determineTile(
                    this.board.mouseCoords.x,
                    this.board.mouseCoords.y,
                    false,
                ),
            ]);
        }
    }

    getTempObject() {
        if (this.params.length > 0) {
            const res = this.board.determineTile(
                this.board.mouseCoords.x,
                this.board.mouseCoords.y,
                false,
            );
            let coords: Vec2 = { x: 0, y: 0 };
            if (res.x >= this.params[0].x) {
                res.x += 1;
            }
            if (res.y >= this.params[0].y) {
                res.y += 1;
            }
            coords = {
                x: Math.min(this.params[0].x, res.x),
                y: Math.min(this.params[0].y, res.y),
            };
            const sizes = [
                Math.abs(res.x - this.params[0].x),
                Math.abs(res.y - this.params[0].y),
            ];
            if (res.x < this.params[0].x) {
                sizes[0] += 1;
            }
            if (res.y < this.params[0].y) {
                sizes[1] += 1;
            }
            return new Rect(
                -1,
                coords.x,
                coords.y,
                sizes[0],
                sizes[1],
                WHITE_50,
            );
        }
        return undefined;
    }

    getNewObject() {
        this.getNewHover();
        this.newTokenCheck = false;
        return this.createToken();
    }
}


// Class handling canvas' view mode.
// I do not like this, but it was the cleanest way I could think to do the job.
class BoardViewMode {
    board: Board;
    active: boolean;

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.active = true;
        this.addEventListeners();
    }

    // Flips the active state of the mode.
    flipListeners(setOn: boolean) {
        this.active = setOn;
        viewModeButton.disabled = setOn;
    }

    // Adds relevant event listeners
    addEventListeners() {
        can.addEventListener('mousemove', (event) => {
            if (this.active) {
                const change: Vec2 = {
                    x: Math.round(this.board.mouseCoords.x - event.clientX),
                    y: Math.round(this.board.mouseCoords.y - event.clientY),
                };
                if (this.board.leftMouseDown) {
                    this.board.moveCamera(change.x, change.y);
                }
            }
        });

        // Changes the zoom level when scrolled
        can.addEventListener('wheel', (event) => {
            if (this.active) {
                const old = this.board.zoomVal;
                if (
                    event.deltaY < 0 &&
                    this.board.zoomGlobal < this.board.zoomLevels.length - 1
                ) {
                    this.board.zoomGlobal += 1;
                    this.board.zoomVal =
                        this.board.zoomLevels[this.board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: this.board.mouseCoords.x - this.board.originCoords.x,
                        y: this.board.mouseCoords.y - this.board.originCoords.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * this.board.zoomVal) / old,
                        y: (originDist.y * this.board.zoomVal) / old,
                    };
                    this.board.originCoords.x -= goals.x - originDist.x;
                    this.board.originCoords.y -= goals.y - originDist.y;
                } else if (event.deltaY > 0 && this.board.zoomGlobal > 0) {
                    this.board.zoomGlobal -= 1;
                    this.board.zoomVal =
                        this.board.zoomLevels[this.board.zoomGlobal];
                    const originDist: Vec2 = {
                        x: this.board.mouseCoords.x - this.board.originCoords.x,
                        y: this.board.mouseCoords.y - this.board.originCoords.y,
                    };
                    const goals: Vec2 = {
                        x: (originDist.x * this.board.zoomVal) / old,
                        y: (originDist.y * this.board.zoomVal) / old,
                    };
                    this.board.originCoords.x -= goals.x - originDist.x;
                    this.board.originCoords.y -= goals.y - originDist.y;
                }
                this.board.originCoords.x =
                    Math.round(this.board.originCoords.x * 10000) / 10000;
                this.board.originCoords.y =
                    Math.round(this.board.originCoords.y * 10000) / 10000;
            }
        });
    }

    // Text for the information bar.
    getText() {
        return 'Scroll : Zoom\nLeft Click + Drag : Pan';
    }
}


interface Vec2 {
    x: number;
    y: number;
}

interface BoardBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}


// Main class controlling the state of the canvas.
// Somewhat oversized, may be split up eventually.
class Board {
    zoomGlobal: number;
    zoomLevels: number[];
    zoomVal: number;
    originCoords: Vec2;
    mouseCoords: Vec2;
    boardBounds: BoardBounds;
    leftMouseDown: boolean;
    boardLayers: BoardLayer[];
    layerMap: Map<number, BoardLayer>;
    objectMap: Map<number, BoardObject>;
    modeMan: ModeManager;
    activeLayer: number;
    serveInter: tempStore;

    constructor(server: tempStore) {
        this.zoomGlobal = 3;
        this.zoomLevels = [4, 6, 8, 10, 13, 16, 20, 24, 28, 32];
        this.zoomVal = this.zoomLevels[this.zoomGlobal];
        this.originCoords = { x: 0, y: 0 };
        this.mouseCoords = { x: 0, y: 0 };
        this.boardBounds = { minX: -200, maxX: 200, minY: -200, maxY: 200 };
        this.leftMouseDown = false;
        this.boardLayers = [];
        this.layerMap = new Map();
        this.objectMap = new Map();
        this.modeMan = new ModeManager(this);
        this.activeLayer = 0;
        this.serveInter = server;
    }

    // Test function for pointer drawing.
    // Will be removed when a proper laser tool is added.
    drawMousePointer() {
        ctx.beginPath();
        ctx.arc(
            this.mouseCoords.x,
            this.mouseCoords.y,
            1 * this.zoomVal,
            0,
            2 * Math.PI,
            false,
        );
        ctx.fillStyle = BLUE.toString();
        if (this.leftMouseDown) {
            ctx.fillStyle = RED.toString();
        }
        ctx.fill();
        ctx.closePath();
    }

    // Ensures camera is kept within the board boundaries.
    bindCamera() {
        if (
            this.originCoords.x <
            (this.boardBounds.minX - 100) * this.zoomVal
        ) {
            this.originCoords.x = (this.boardBounds.minX - 100) * this.zoomVal;
        } else if (
            this.originCoords.x >
            (this.boardBounds.maxX + 100) * this.zoomVal
        ) {
            this.originCoords.x = (this.boardBounds.maxX + 100) * this.zoomVal;
        }
        if (
            this.originCoords.y <
            (this.boardBounds.minY - 100) * this.zoomVal
        ) {
            this.originCoords.y = (this.boardBounds.minY - 100) * this.zoomVal;
        } else if (
            this.originCoords.y >
            (this.boardBounds.maxY + 100) * this.zoomVal
        ) {
            this.originCoords.y = (this.boardBounds.maxY + 100) * this.zoomVal;
        }
    }

    // Updates the center of the camera, subject to the boundaries of the board.
    moveCamera(xMod: number, yMod: number) {
        this.originCoords.x -= xMod;
        this.originCoords.y -= yMod;
        this.bindCamera();
    }

    // Sorts held board layers by zOrder.
    sortLayers() {
        this.boardLayers = this.boardLayers.sort((n1, n2) => {
            if (n1.zOrder > n2.zOrder) {
                return 1;
            }
            if (n1.zOrder < n2.zOrder) {
                return -1;
            }
            return 0;
        });
    }

    // Adds a new board layer, then sorts the layers.
    addLayer(newLayer: LayerState) {
        if (newLayer.id === undefined) {
            return;
        }
        const currLayer = this.layerMap.get(newLayer.id!);
        if (currLayer) {
            currLayer.updateVis(newLayer.playerVisible, newLayer.gmVisible);
        } else {
            const toAdd = new BoardLayer(
                newLayer.zOrder,
                newLayer.gmVisible,
                newLayer.playerVisible,
            );
            this.layerMap.set(newLayer.id!, toAdd);
            this.boardLayers.push(toAdd);
            this.boardLayers.sort();
        }
    }

    getLayer(layerID: number) {
        return this.layerMap.get(layerID);
    }

    getObjectById(objectId: number) {
        for (const [key, val] of this.layerMap) {
            const obj = val.heldMap.get(objectId);
            if (obj) {
                return obj;
            }
        }
        return null;
    }

    // Removes a new board layer, then sorts the layers.
    // Returns false if the provided layer is not found.
    removeLayer(removeID: number) {
        const layer = this.layerMap.get(removeID);
        if (!layer) {
            return false;
        }
        const removeIndex = this.boardLayers.indexOf(layer);
        if (!this.layerMap.delete(removeID)) {
            return false;
        }
        this.boardLayers.splice(removeIndex, 1);
        this.sortLayers();
        return true;
    }

    // Moves an object based on the ID of just the object.
    moveObject(objID: number, layerID: number, moveX: number, moveY: number) {
        const layer = this.layerMap.get(layerID);
        if (layer) {
            layer.moveObject(objID, moveX, moveY);
        }
    }

    // Deletes an object based on the ID of the object and the layer it belongs on.
    removeObject(objId: number, layerId: number = -1) {
        this.objectMap.delete(objId);
        if (layerId === -1) {
            for (const layer of this.boardLayers) {
                if (layer.removeObject(objId)) {
                    return true;
                }
            }
            return false;
        } else {
            const layer = this.layerMap.get(layerId);
            if (layer) {
                layer.removeObject(objId);
            }
            return true;
        }
    }

    // Adds an object to a specified layer.
    addObject(layerId: number, newObject: BoardObject) {
        const layer = this.layerMap.get(layerId);
        this.objectMap.set(newObject.objectId, newObject);
        if (layer) {
            layer.addObject(newObject, newObject.objectId);
        }
    }

    // Changes the offset of specified layer.
    moveLayer(moveID: number, moveX: number, moveY: number) {
        const layer = this.layerMap.get(moveID);
        if (layer) {
            layer.shiftLayer({ x: moveX, y: moveY });
        }
    }

    // Checks if the mode manager is in a state to complete a selection, retrieves all objects in the selection if so.
    selectObjects(targetType: string = 'any') {
        const layer = this.layerMap.get(this.activeLayer);
        if (layer) {
            return layer.selectObjects(
                this.modeMan.getSelectCoords(),
                targetType,
            );
        }
        return [];
    }

    selectToken(fixedPoint: Vec2[]) {
        const layer = this.layerMap.get(this.activeLayer);
        if (layer) {
            const selected = layer.selectObjects(fixedPoint, Shape.Token)[0];
            if (selected instanceof Token) {
                return selected;
            }
        }
        return undefined;
    }

    // Draws points at the vertices of the tiles for.
    drawPointGrid(squareSize: number) {
        let currX = this.originCoords.x;
        while (currX + squareSize > 0) {
            currX -= squareSize;
        }
        while (currX < can.width + 100) {
            let currY = this.originCoords.y;
            while (currY + squareSize > 0) {
                currY -= squareSize;
            }
            while (currY < can.height + 100) {
                if (
                    currX <= this.originCoords.x &&
                    currX + squareSize >= this.originCoords.x
                ) {
                    ctx.fillStyle = WHITE.toString();
                } else {
                    ctx.fillStyle = WHITE.toString();
                }
                ctx.fillRect(currX - 1, currY - 1, 2, 2);
                currY += squareSize;
            }
            currX += squareSize;
        }
    }

    // Determines which tile/vertex a coordinate pair is located on.
    determineTile(x: number, y: number, vertex: boolean) {
        const squareSize = 5 * this.zoomVal;
        if (vertex) {
            return {
                x: Math.round((x - this.originCoords.x) / squareSize),
                y: Math.round((y - this.originCoords.y) / squareSize),
            };
        } else {
            return {
                x: Math.floor((x - this.originCoords.x) / squareSize),
                y: Math.floor((y - this.originCoords.y) / squareSize),
            };
        }
    }

    // Draws the board.
    draw() {
        const squareSize = 5 * this.zoomVal;
        for (const [i, layer] of this.boardLayers.entries()) {
            layer.drawLayer(
                ctx,
                squareSize,
                this.originCoords,
                this.modeMan.selectMan.thirdOffset,
            );
            if (i === this.activeLayer) {
                const tempObj = this.modeMan.getObject(GetObjectReason.Draw) as
                    | BoardObject
                    | undefined;
                if (tempObj) {
                    tempObj.draw(ctx, squareSize, this.originCoords);
                }
            }
        }
        this.drawPointGrid(squareSize);
        this.drawMousePointer();
        this.modeMan.step(ctx, squareSize, this.originCoords);
    }

    // Performs a single drawing step.
    step() {
        if (can.width !== window.innerWidth) {
            can.width = window.innerWidth;
            can.height = window.innerHeight;
        }
        ctx.clearRect(0, 0, can.width, can.height);
        this.draw();
    }

    changeLayerZ(layerId: number, newVal: number): void {
        const layer = this.layerMap.get(layerId);
        if (layer) {
            layer.zOrder = newVal;
        }
        this.sortLayers();
    }
}


enum Mode {
    View = 'VIEW',
    Draw = 'DRAW',
    Token = 'TOKEN',
}

enum GetObjectReason {
    Draw = 'DRAW',
    Create = 'CREATE',
}

// Class handling the draw/token/view modes.
// Also handles behaviour when a selection of board objects has been made. This may be split off.
class ModeManager {
    board: Board;
    currMode: Mode;
    viewMan: BoardViewMode;
    tokenMan: BoardTokenMode;
    drawMan: BoardDrawMode;
    selectMan: BoardSelectMode;
    selectClick: boolean;
    selectInstruct: HTMLElement

    constructor(parentBoard: Board) {
        this.board = parentBoard;
        this.currMode = Mode.View;
        this.viewMan = new BoardViewMode(parentBoard);
        this.tokenMan = new BoardTokenMode(parentBoard);
        this.drawMan = new BoardDrawMode(parentBoard);
        this.selectMan = new BoardSelectMode(parentBoard);
        this.selectInstruct = document.getElementById('selectInstruct')!
        this.selectClick = false;
        this.addEventListeners();
        this.modifyText(this.viewMan);
        this.viewMan.flipListeners(true);
        this.selectInstruct.style.visibility = 'hidden';
    }

    // Adds event listeners for all modes, as well as some of its own.
    addEventListeners() {
        viewButton.addEventListener('click', () => {
            this.currMode = Mode.View;
            this.viewMan.flipListeners(true);
            this.tokenMan.flipListeners(false);
            this.drawMan.flipListeners(false);
            this.selectMan.flipListeners(false);
            this.modifyText(this.viewMan);
            this.selectInstruct.style.visibility = 'hidden';
        });

        tokenButton.addEventListener('click', () => {
            this.currMode = Mode.Token;
            this.viewMan.flipListeners(false);
            this.tokenMan.flipListeners(true);
            this.drawMan.flipListeners(false);
            this.selectMan.flipListeners(false);
            this.modifyText(this.tokenMan);
            this.selectInstruct.style.visibility = 'visible';
        });

        drawButton.addEventListener('click', () => {
            this.currMode = Mode.Draw;
            this.viewMan.flipListeners(false);
            this.tokenMan.flipListeners(false);
            this.drawMan.flipListeners(true);
            this.selectMan.flipListeners(false);
            this.modifyText(this.drawMan);
            this.selectInstruct.style.visibility = 'visible';
        });

        can.addEventListener('mousemove', (event) => {
            this.board.mouseCoords.x = event.clientX;
            this.board.mouseCoords.y = event.clientY;
        });

        can.addEventListener(
            'mousedown',
            () => {
                this.board.leftMouseDown = true;
            },
            { capture: true },
        );

        can.addEventListener(
            'mouseup',
            () => {
                this.board.leftMouseDown = false;
            },
            { capture: true },
        );
    }

    // Switches the information bar's text to match the current mode.
    modifyText(
        selectMode:
            | BoardSelectMode
            | BoardViewMode
            | BoardTokenMode
            | BoardDrawMode,
    ) {
        modeParagraph.innerText = selectMode.getText();
    }

    // Checks if the user has selected an area of the canvas.
    hasCompleteSelection() {
        if (this.currMode === Mode.Draw && this.drawMan.selectState > 0) {
            return true;
        } else if (
            this.currMode === Mode.Token &&
            this.tokenMan.completeSelectCheck
        ) {
            return true;
        }
        return false;
    }

    // Retrieves the coordinates corresponding to the currently selected area of the canvas.
    getSelectCoords() {
        if (this.currMode === Mode.Draw && this.drawMan.selectState !== 0) {
            return this.drawMan.params;
        } else if (
            this.currMode === Mode.Token &&
            this.tokenMan.completeSelectCheck
        ) {
            return this.tokenMan.params;
        }
        return [{ x: 0, y: 0 }];
    }

    // Retrieves the object currently being drawn by the draw mode.
    getObject(reason: GetObjectReason) {
        if (reason === GetObjectReason.Draw) {
            if (this.currMode === Mode.Draw) {
                return this.drawMan.getTempObject();
            } else if (this.currMode === Mode.Token) {
                return this.tokenMan.getTempObject();
            }
        }
        return undefined;
    }

    clearTemp() {
        if (this.currMode === Mode.Draw) {
            this.drawMan.clearObject();
        }
    }

    // Returns all board objects that are currently selected.
    getSelected() {
        return this.selectMan.selectedObjects;
    }

    // Clears the list of selected objects.
    clearSelected() {
        this.exitSelected();
    }

    enterSelected() {
        let res: (BoardObject | undefined)[] = this.board.selectObjects();
        if (this.currMode === Mode.Token && this.tokenMan.params.length === 0) {
            res = [this.tokenMan.currHover];
            this.tokenMan.currHover = undefined;
        } else if (this.currMode === Mode.Token) {
            res = this.board.selectObjects(Shape.Token);
        }
        const selected = res.filter((obj) => obj !== undefined);
        if (selected.length !== 0) {
            this.selectMan.flipListeners(true);
            this.selectMan.setSelected(selected);
            if (this.currMode === Mode.Draw) {
                this.drawMan.active = false;
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
            } else if (this.currMode === Mode.Token) {
                this.tokenMan.active = false;
                this.tokenMan.completeSelectCheck = false;
                this.tokenMan.params = [];
            }
        } else {
            if (this.currMode === Mode.Draw) {
                this.drawMan.selectState = 0;
                this.drawMan.params = [];
            } else if (this.currMode === Mode.Token) {
                this.tokenMan.completeSelectCheck = false;
                this.tokenMan.params = [];
            }
        }
    }

    exitSelected() {
        this.selectMan.flipListeners(false);
        if (this.currMode === Mode.Draw) {
            this.drawMan.active = true;
        } else if (this.currMode === Mode.Token) {
            this.tokenMan.active = true;
        }
    }

    attemptSelectedSwap() {
        if (!this.selectMan.active && this.hasCompleteSelection()) {
            this.enterSelected();
        } else if (this.selectMan.active && this.selectMan.exitOnNextStep) {
            this.exitSelected();
        }
    }

    step(ctx: CanvasRenderingContext2D, squareSize: number, offset: Vec2) {
        this.attemptSelectedSwap();
        if (this.tokenMan.active) {
            this.tokenMan.tryDrawLabel(ctx, squareSize, offset);
            this.tokenMan.getNewHover();
        }
        if (this.selectMan.active) {
            this.selectMan.recolour();
        }
    }
}


type ColourComponent = 'red' | 'green' | 'blue' | 'alpha';
const colourComponents: ColourComponent[] = ['red', 'green', 'blue', 'alpha'];

const RGBSliders: Record<ColourComponent, HTMLInputElement> = {
    red: getRequiredElement('redColSlide', HTMLInputElement),
    green: getRequiredElement('greenColSlide', HTMLInputElement),
    blue: getRequiredElement('blueColSlide', HTMLInputElement),
    alpha: getRequiredElement('opacColSlide', HTMLInputElement),
};
const RGBTexts: Record<ColourComponent, HTMLInputElement> = {
    red: getRequiredElement('redColText', HTMLInputElement),
    green: getRequiredElement('greenColText', HTMLInputElement),
    blue: getRequiredElement('blueColText', HTMLInputElement),
    alpha: getRequiredElement('opacColText', HTMLInputElement),
};

class ColourBox {
    savedColours: ColInst[];
    currColour: ColInst;
    currRGBString: string;
    mainBox: HTMLElement;
    adjBoxes: HTMLElement[];
    can: HTMLElement;
    shiftIsPressed: boolean;

    constructor() {
        this.savedColours = [
            new ColInst(255, 0, 0, 100),
            new ColInst(0, 255, 0, 100),
            new ColInst(0, 0, 255, 100),
            new ColInst(50, 50, 50, 100),
            new ColInst(150, 150, 150, 100),
            new ColInst(255, 255, 255, 100),
        ];
        this.currColour = new ColInst(120, 120, 120, 100);
        this.currRGBString = `rgba(${120}, ${120}, ${120}, ${1})`;
        this.mainBox = colorSquare;
        this.adjBoxes = [];
        this.can = colorSquare;
        this.shiftIsPressed = false;
        for (const i of [0, 1, 2, 3, 4, 5]) {
            this.adjBoxes.push(getRequiredElement(`col${i + 1}`, HTMLElement));
            this.adjBoxes[i].style.left = `${i * 40 + 10}px`;
            this.adjBoxes[i].style.background = this.savedColours[i].toString();
        }
        this.addEventListeners();
        this.changeCurrColour();
    }

    addEventListeners() {
        colourComponents.forEach((component) => {
            RGBSliders[component].addEventListener('input', () => {
                const value = parseInt(RGBSliders[component].value, 10);
                if (component === 'red') {
                    this.currColour.setR(value);
                } else if (component === 'green') {
                    this.currColour.setG(value);
                } else if (component === 'blue') {
                    this.currColour.setB(value);
                } else if (component === 'alpha') {
                    this.currColour.setA(value);
                }
                this.changeCurrColour();
            });

            RGBTexts[component].addEventListener('input', () => {
                const value = parseInt(RGBTexts[component].value, 10);
                if (component === 'red') {
                    this.currColour.setR(value);
                } else if (component === 'green') {
                    this.currColour.setG(value);
                } else if (component === 'blue') {
                    this.currColour.setB(value);
                } else if (component === 'alpha') {
                    this.currColour.setA(value);
                }
                this.changeCurrColour();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Shift') {
                this.shiftIsPressed = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.shiftIsPressed = false;
            }
        });

        this.adjBoxes.forEach((box, i) => {
            box.addEventListener('click', () => {
                if (this.shiftIsPressed) {
                    this.changeSubColour(i);
                } else {
                    this.changeCurrColour(true, i);
                }
            });
        });
    }

    changeCurrColour(swap: boolean = false, swapID: number = -1) {
        if (swap) {
            this.currColour = this.savedColours[swapID];
        }
        this.mainBox.style.background = this.currColour.toString();
        colourComponents.forEach((component) => {
            this.matchInput(component);
        });
    }

    matchInput(component: ColourComponent) {
        if (component === 'red') {
            RGBSliders[component].value = this.currColour.red.toString();
            RGBTexts[component].value = this.currColour.red.toString();
        } else if (component === 'green') {
            RGBSliders[component].value = this.currColour.green.toString();
            RGBTexts[component].value = this.currColour.green.toString();
        } else if (component === 'blue') {
            RGBSliders[component].value = this.currColour.blue.toString();
            RGBTexts[component].value = this.currColour.blue.toString();
        } else if (component === 'alpha') {
            RGBSliders[component].value = (
                this.currColour.alpha
            ).toString();
            RGBTexts[component].value = (
                this.currColour.alpha
            ).toString();
        }
    }

    changeSubColour(swapID: number = -1) {
        this.savedColours[swapID] = this.currColour;
        this.adjBoxes[swapID].style.background =
            this.savedColours[swapID].toString();
    }
}


class LeftBarManager {
    colourPicker: ColourBox;
    constructor() {
        this.colourPicker = new ColourBox();
    }
}


class CharacterMenu {}


interface LayerState {
    gmVisible: boolean;
    playerVisible: boolean;
    zOrder: number;
    id: number;
    element?: HTMLElement;
}

class LayerMenu {
    active: boolean;
    button: HTMLElement;
    layers: LayerState[];
    descObj: HTMLElement;
    currElements: HTMLElement[];
    layerMap: Map<number, LayerState>;
    layerObj: HTMLElement;
    boxHeight: number;
    currSelect: number;
    tempButtonObj: HTMLElement;
    serveInter: tempStore;

    constructor(server: tempStore) {
        this.active = false;
        this.serveInter = server;
        this.button = getRequiredElement('layerTab', HTMLElement);
        this.layers = [];
        this.descObj = getRequiredElement('descLayerObj', HTMLElement);
        this.currElements = [];
        this.layerMap = new Map();
        this.layerObj = getRequiredElement('layerLayerObj', HTMLElement);
        this.boxHeight = 50;
        this.currSelect = 0;
        this.tempButtonObj = document.createElement('input');
        this.setMainElements();
        this.moveLayers();
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        this.layerObj.style.visibility = this.active ? 'visible' : 'hidden';
        this.layerObj.style.pointerEvents = this.active ? 'auto' : 'none';
    }

    setMainElements() {
        this.layerObj.style.background = GREY.toString();
        this.layerObj.style.visibility = 'hidden';
        this.layerObj.style.fontSize = '14px';

        this.descObj.style.border = 'solid black';
        this.descObj.style.height = `${this.boxHeight}px`;
        this.descObj.style.width = '250px';

        const numText = document.createElement('p');
        numText.innerText = 'Layer #';
        numText.style.position = 'absolute';
        numText.style.left = '10px';

        const firstCheck = document.createElement('p');
        firstCheck.innerText = 'GM\nVis';
        firstCheck.style.width = '50px';
        firstCheck.style.position = 'absolute';
        firstCheck.style.left = '187px';
        firstCheck.style.textAlign = 'center';

        const secondCheck = document.createElement('p');
        secondCheck.innerText = 'Player\nVis';
        secondCheck.style.width = '50px';
        secondCheck.style.position = 'absolute';
        secondCheck.style.left = '137px';
        secondCheck.style.textAlign = 'center';

        (this.tempButtonObj as any).type = 'button';
        (this.tempButtonObj as any).value = 'Make layer';
        this.tempButtonObj.style.width = '190px';
        this.tempButtonObj.style.position = 'absolute';
        this.tempButtonObj.style.left = '0px';
        this.tempButtonObj.style.bottom = '0px';
        this.tempButtonObj.style.height = '50px';

        this.layerObj.append(this.tempButtonObj);
        this.descObj.append(numText);
        this.descObj.append(firstCheck);
        this.descObj.append(secondCheck);

        this.tempButtonObj.addEventListener('mousedown', () => {
            if (this.active) {
                this.createLayer();
            }
        });
    }

    createLayer() {
        this.serveInter.createLayer();
    }

    updateLayer(key: number, val: LayerState) {
        const toUpdate = this.layerMap.get(key)!;
        toUpdate.gmVisible = val.gmVisible;
        toUpdate.playerVisible = val.playerVisible;
        toUpdate.zOrder = val.zOrder;
        (toUpdate.element!.children[1] as any).checked = val.playerVisible;
        (toUpdate.element!.children[2] as any).checked = val.gmVisible;
    }

    handleNewLayers(newLayers: Map<number, LayerState>) {
        for (const [key, val] of newLayers) {
            if (!this.layerMap.has(key)) {
                this.constructLayer(val);
            } else {
                this.updateLayer(key, val);
            }
        }
        this.moveLayers();
        this.resizeLayerBoxes();
    }

    addNewLayer(layer: LayerState) {
        this.constructLayer(layer);
        this.moveLayers();
        this.resizeLayerBoxes();
    }

    constructLayer(buildData: LayerState) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        const checkVisibleAll = document.createElement('input');
        const checkVisibleGM = document.createElement('input');
        this.layerMap.set(buildData.id!, {
            id: buildData.id,
            gmVisible: buildData.gmVisible,
            playerVisible: buildData.playerVisible,
            zOrder: buildData.zOrder,
            element: newBox,
        });

        newBox.style.position = 'absolute';
        newBox.style.border = 'solid black';
        newBox.style.height = `${this.boxHeight}px`;
        newBox.style.width = '100px';
        newBox.style.left = '0px';
        newBox.style.top = '50px';

        newText.style.position = 'absolute';
        newText.style.width = '100px';
        newText.style.left = '10px';
        newText.style.top = '5px';
        newText.innerText = `Layer ${buildData.id}`;

        checkVisibleAll.type = 'checkbox';
        checkVisibleAll.style.position = 'absolute';
        checkVisibleAll.style.top = '15px';
        checkVisibleAll.style.left = '150px';
        checkVisibleAll.checked = buildData.playerVisible;
        checkVisibleAll.id = 'check1';

        checkVisibleGM.type = 'checkbox';
        checkVisibleGM.style.position = 'absolute';
        checkVisibleGM.style.top = '15px';
        checkVisibleGM.style.left = '200px';
        checkVisibleGM.checked = buildData.gmVisible;

        this.layerObj.append(newBox);
        newBox.append(newText);
        newBox.append(checkVisibleAll);
        newBox.append(checkVisibleGM);
        this.currElements.push(newBox);

        newBox.addEventListener('mousedown', () => {
            if (this.active) {
                if (
                    this.currSelect !== parseInt(newText.innerText.slice(6), 10)
                ) {
                    this.exitCurrSelect();
                    this.currSelect = parseInt(newText.innerText.slice(6), 10);
                }
            }
        });

        checkVisibleGM.addEventListener('mousedown', () => {
            if (this.active) {
                this.serveInter.updateLayer({
                    id: buildData.id,
                    gmVisible: !checkVisibleGM.checked,
                    playerVisible: checkVisibleAll.checked,
                    zOrder: buildData.zOrder,
                });
            }
        });

        checkVisibleAll.addEventListener('mousedown', () => {
            if (this.active) {
                this.serveInter.updateLayer({
                    id: buildData.id,
                    gmVisible: checkVisibleGM.checked,
                    playerVisible: !checkVisibleAll.checked,
                    zOrder: buildData.zOrder,
                });
            }
        });
    }

    moveLayers() {
        this.currElements.forEach((el, i) => {
            el.style.top = `${(this.boxHeight + 4) * (i + 1)}px`;
        });
    }

    resizeLayerBoxes() {
        const w = `${parseInt(this.layerObj.style.width, 10) - 4}px`;
        for (const el of this.currElements) {
            el.style.width = w;
        }
        this.tempButtonObj.style.width = `${parseInt(this.layerObj.style.width, 10)}px`;
    }

    exitCurrSelect() {
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = GREY.toString();
        }
    }

    step() {
        const layer = this.layerMap.get(this.currSelect);
        if (layer) {
            layer.element!.style.background = RED.toString();
        }
        if (this.layerObj.style.width !== rightBar.style.width) {
            this.layerObj.style.width = rightBar.style.width;
            this.layerObj.style.height = rightBar.style.height;
            this.descObj.style.width = `${parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2), 10) - 4}px`;
            this.resizeLayerBoxes();
        }
    }
}


enum RightBarTab {
    None = 'NONE',
    Layer = 'LAYER',
    Token = 'TOKEN',
    Roll = 'ROLL',
    Character = 'CHARACTER',
}

class RightBarManager {
    layerMan: LayerMenu;
    tokenMan: TokenMenu;
    characterMan: CharacterMenu;
    rollMan: RollMenu;
    currActive: RightBarTab;
    serveInter: tempStore

    constructor(server: tempStore) {
        this.serveInter = server;
        this.layerMan = new LayerMenu(this.serveInter);
        this.tokenMan = new TokenMenu();
        this.characterMan = new CharacterMenu();
        this.rollMan = new RollMenu(this.serveInter);
        this.currActive = RightBarTab.Layer;
        rightBar.style.width = '250px';
        this.addEventListeners();
        this.layerMan.toggleActive(true);
        this.setText();
    }

    addEventListeners() {
        layerTab.addEventListener('click', () => {
            this.layerMan.toggleActive(true);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Layer;
            this.setText();
        });

        tokenTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Token;
            this.setText();
        });

        rollTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(true);
            this.currActive = RightBarTab.Roll;
            this.setText();
        });

        characterTab.addEventListener('click', () => {
            this.layerMan.toggleActive(false);
            this.rollMan.toggleActive(false);
            this.currActive = RightBarTab.Character;
            this.setText();
        });
    }

    step() {
        rightBar.style.height = `${window.innerHeight - 20}px`;
        if (this.currActive === RightBarTab.Layer) {
            this.layerMan.step();
        } else if (this.currActive === RightBarTab.Roll) {
            this.rollMan.step();
        }
    }

    setText() {
        if (this.currActive === RightBarTab.Layer) {
            rightPara.innerText = '';
        } else if (this.currActive === RightBarTab.Roll) {
            rightPara.innerText = '';
        } else {
            rightPara.innerText = 'WIP';
        }
    }

    addLayer(newLayer: LayerState) {
        this.layerMan.addNewLayer(newLayer);
    }
}


interface DicePayload {
    four: number;
    six: number;
    eight: number;
    ten: number;
    twelve: number;
    twenty: number;
    hundred: number;
    dropLow: number;
    dropHigh: number;
    singleDice: boolean;
    singleNum: number;
    modifier: number;
    result: number;
}

class RollMenu {
    textBox: HTMLElement;
    active: boolean;
    modifier: number;
    currChats: HTMLElement[];
    serveInter: tempStore;

    constructor(server: tempStore) {
        this.textBox = document.createElement('textarea');
        this.active = false;
        this.modifier = 0;
        this.currChats = [];
        this.textBox.style.visibility = 'hidden';
        this.textBox.style.pointerEvents = 'none';
        chatBox.style.visibility = 'hidden';
        chatBox.style.pointerEvents = 'none';
        this.setMainElements();
        this.setRollElements();
        this.constructChats();
        this.serveInter = server;
    }

    setMainElements() {
        chatBox.append(this.textBox);
        chatBox.style.background = GREY.toString();
    }

    setRollElements() {
        let count = 0;
        for (const i of [3, 4, 6, 8, 10, 12, 20, 100, 101]) {
            const newBox = document.createElement('div');
            rollBox.append(newBox);
            newBox.style.position = 'absolute';
            newBox.style.width = '100px';
            newBox.style.height = '20px';
            newBox.style.top = count * 30 + 5 + 'px';
            newBox.style.left = '10px';
            if (i !== 3 && i !== 101) {
                const newText = document.createElement('p');
                const setCount = document.createElement('input');
                const roll = document.createElement('input');

                roll.type = 'button';

                newBox.append(newText);
                newBox.append(setCount);
                newBox.append(roll);

                newText.style.position = 'absolute';
                newText.style.width = '30px';
                newText.style.height = '20px';
                newText.style.top = '-13px';
                newText.style.left = '0px';
                newText.innerText = 'Roll';

                setCount.style.position = 'absolute';
                setCount.style.width = '40px';
                setCount.style.height = '20px';
                setCount.style.top = '0px';
                setCount.style.left = '30px';
                setCount.value = '1';

                roll.style.position = 'absolute';
                roll.style.width = '50px';
                roll.style.height = '20px';
                roll.style.left = '80px';
                roll.style.top = '3px';
                roll.value = `D${i}`;

                setCount.addEventListener('input', () => {
                    if (
                        Number(setCount.value) &&
                        Math.abs(Number(setCount.value)) < 9999
                    ) {
                        this.modifier = Number(setCount.value);
                    } else if (Number(setCount.value) > 0) {
                        setCount.value = '9999';
                    } else if (Number(setCount.value)) {
                        setCount.value = '-9999';
                    } else {
                        setCount.value = '0';
                    }
                });

                roll.addEventListener('click', () => {
                    this.constructPayload(
                        i,
                        Number(setCount.value),
                        false,
                        false,
                    );
                });
            } else if (i === 3) {
                const rollAdv = document.createElement('input');
                const rollDis = document.createElement('input');
                rollAdv.type = 'button';
                rollDis.type = 'button';
                rollAdv.value = 'Roll 2d20 (Adv)';
                rollDis.value = 'Roll 2d20 (Disadv)';
                newBox.append(rollAdv);
                newBox.append(rollDis);

                rollAdv.style.position = 'absolute';
                rollAdv.style.width = '100px';
                rollAdv.style.height = '20px';
                rollAdv.style.left = '0px';
                rollAdv.style.top = '3px';

                rollDis.style.position = 'absolute';
                rollDis.style.width = '120px';
                rollDis.style.height = '20px';
                rollDis.style.left = '110px';
                rollDis.style.top = '3px';

                rollAdv.addEventListener('click', () => {
                    this.constructPayload(20, 2, true, false);
                });

                rollDis.addEventListener('click', () => {
                    this.constructPayload(20, 2, false, true);
                });
            } else if (i === 101) {
                const newText = document.createElement('p');
                const setCount = document.createElement('input');

                newBox.append(newText);
                newBox.append(setCount);

                newText.style.position = 'absolute';
                newText.style.width = '30px';
                newText.style.height = '20px';
                newText.style.top = '-13px';
                newText.style.left = '0px';
                newText.innerText = 'Mod';

                setCount.style.position = 'absolute';
                setCount.style.width = '40px';
                setCount.style.height = '20px';
                setCount.style.top = '0px';
                setCount.style.left = '30px';
                setCount.value = '0';

                setCount.addEventListener('input', () => {
                    if (
                        Number(setCount.value) &&
                        Math.abs(Number(setCount.value)) < 9999
                    ) {
                        this.modifier = Number(setCount.value);
                    } else if (Number(setCount.value) > 0) {
                        setCount.value = '9999';
                        this.modifier = 9999;
                    } else if (Number(setCount.value)) {
                        setCount.value = '-9999';
                        this.modifier = -9999;
                    } else {
                        setCount.value = '1';
                        this.modifier = 1;
                    }
                });
            }
            count++;
        }
    }

    toggleActive(newAct: boolean) {
        this.active = newAct;
        rollBox.style.visibility = this.active ? 'visible' : 'hidden';
        rollBox.style.pointerEvents = this.active ? 'auto' : 'none';
        colBox.style.visibility = this.active ? 'hidden' : 'visible';
        colBox.style.pointerEvents = this.active ? 'none' : 'auto';
        chatBox.style.visibility = this.active ? 'visible' : 'hidden';
        chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
        for (const text of this.currChats) {
            text.style.visibility = this.active ? 'visible' : 'hidden';
        }
    }

    async step() {
        const rH = rightBar.style.height;
        const rW = rightBar.style.width;
        if (chatBox.style.height !== rH || chatBox.style.width !== rW) {
            chatBox.style.width = rW;
            chatBox.style.height = rH;
            const w = parseInt(rW, 10);
            if (!Number.isNaN(w)) {
                this.textBox.style.width = `${w - 30}px`;
            }
        }
        const data = this.serveInter.getDice();
        if (data) {
            this.updateChats(data.map, data.start);
        }
    }

    async constructChats() {
        for (let i = 0; i < 50; i++) {
            this.constructChat(i);
        }
    }

    constructChat(currIndex: number) {
        const newBox = document.createElement('div');
        const newText = document.createElement('p');
        chatBox.append(newBox);
        newBox.append(newText);
        newBox.style.position = 'absolute';
        newBox.style.bottom = currIndex * 30 + 10 + 'px';
        newBox.style.left = '10px';
        newBox.style.width = '100px';
        newBox.style.height = '30px';

        newText.style.position = 'absolute';
        newText.style.width = '100px';
        newText.style.height = '30px';
        this.currChats.push(newText);
    }

    updateChats(data: Map<number, DicePayload>, startIndex: number) {
        let currIndex = startIndex;
        let curr = 0;
        while (currIndex != (startIndex + 1) % 50) {
            currIndex = (currIndex + 49) % 50;
            if (data.has(currIndex)) {
                this.updateChat(data.get(currIndex)!, curr);
            }
            curr++;
        }
    }

    updateChat(dataLine: DicePayload, currIndex: number) {
        this.currChats[currIndex].innerText = `Rolled ${dataLine.result}`;
        this.currChats[currIndex].style.visibility = 'visible';
    }

    constructPayload(
        diceSize: number,
        diceCount: number,
        advantage: boolean,
        disadvantage: boolean,
    ) {
        let currLoad = {
            four: 0,
            six: 0,
            eight: 0,
            ten: 0,
            twelve: 0,
            twenty: 0,
            hundred: 0,
            dropLow: 0,
            dropHigh: 0,
            singleDice: true,
            singleNum: diceSize,
            modifier: this.modifier,
            result: 0,
        };
        switch (diceSize) {
            case 4:
                currLoad.four = diceCount;
            case 6:
                currLoad.six = diceCount;
            case 8:
                currLoad.eight = diceCount;
            case 10:
                currLoad.ten = diceCount;
            case 12:
                currLoad.twelve = diceCount;
            case 20:
                currLoad.twenty = diceCount;
            case 100:
                currLoad.hundred = diceCount;
        }
        if (advantage) {
            currLoad.dropHigh = 1;
        }
        if (disadvantage) {
            currLoad.dropLow = 1;
        }
        this.serveInter.rollDice(currLoad);
    }
}


class TokenMenu {}

const can = getRequiredElement('board', HTMLCanvasElement);
const drawModeButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const colourSquare = getRequiredElement('colourSquare', HTMLElement);
const tokenModeButton = getRequiredElement('tokenMenuButton', HTMLButtonElement);
const sizeInput = getRequiredElement('tokenSize', HTMLInputElement);
const nameInput = getRequiredElement('tokenName', HTMLInputElement);
const sizeLabel = getRequiredElement('tokenSizeLabel', HTMLLabelElement);
const nameLabel = getRequiredElement('tokenNameLabel', HTMLLabelElement);
const viewModeButton = getRequiredElement('viewMenuButton', HTMLButtonElement);
const ctx = can.getContext('2d') as CanvasRenderingContext2D;
const modeParagraph = getRequiredElement('modeParagraph', HTMLElement);
const viewButton = getRequiredElement('viewMenuButton', HTMLButtonElement);
const tokenButton = getRequiredElement('tokenMenuButton', HTMLButtonElement);
const drawButton = getRequiredElement('drawMenuButton', HTMLButtonElement);
const colorSquare = getRequiredElement('colourSquare', HTMLElement);
const rightBar = getRequiredElement('rightBar', HTMLElement);
const rightPara = getRequiredElement('rightPara', HTMLElement);
const layerTab = getRequiredElement('layerTab', HTMLElement);
const tokenTab = getRequiredElement('tokenTab', HTMLElement);
const rollTab = getRequiredElement('rollTab', HTMLElement);
const characterTab = getRequiredElement('characterTab', HTMLElement);
const chatBox = getRequiredElement('chatBox', HTMLElement);
const rollBox = getRequiredElement('rollContainer', HTMLElement);
const colBox = getRequiredElement('colContainer', HTMLElement);
const serveInter = new tempStore();
const loadWall = document.getElementById('loadBlock')!;
const board = new Board(serveInter);
const rightMan = new RightBarManager(serveInter);
const leftMan = new LeftBarManager();

function payloadToBoardObject(p: CreateObjectPayload): BoardObject {
    switch (p.kind) {
        case Shape.Circle:
            return new Circle(p.objectId!, p.x, p.y, p.diameter, p.colour);
        case Shape.Rect:
            return new Rect(p.objectId!, p.x, p.y, p.width, p.height, p.colour);
        case Shape.Token:
            return new Token(
                p.objectId!,
                p.x,
                p.y,
                p.diameter,
                p.colour,
                p.name ?? '',
            );
        case Shape.Poly:
            return new Polyline(p.objectId!, p.x, p.y, p.points, p.colour);
        case Shape.Line:
            return new Line(p.objectId!, p.x, p.y, p.points, p.colour);
        default: {
            throw new Error('Unknown shape');
        }
    }
}

async function runBoardStep() {
    board.step();
}

async function syncServer() {
    const checkList: CreateObjectPayload[] = [];
    for (const [key, val] of board.objectMap) {
        checkList.push(val.payloadFromObject());
    }
    const data = serveInter.compareObjects(checkList);
    if (data) {
        for (const val of data) {
            if (val.action === Action.Create) {
                // note : not too sure about this "as any" chief
                board.objectMap
                    .get(val.object.objectId!)!
                    .updateFromPayload((val as any).object);
            } else if (val.action === Action.Destroy) {
                board.removeObject(val.objectId);
            }
        }
    }
    getRecent();
    updateLayers();
}

async function updateLayers() {
    const data = serveInter.getLayers();
    if (data) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    }
}

async function getRecent() {
    const data = serveInter.getNewObjects();
    if (data) {
        for (const obj of data) {
            if (!board.objectMap.has(obj.objectId)) {
                board.addObject(obj.layerId, payloadToBoardObject(obj));
            }
        }
    }
}

async function setUpLayers() {
    const data = serveInter.getLayers();
    if (data && data.size != 0) {
        rightMan.layerMan.handleNewLayers(data);
        for (const [key, val] of data) {
            board.addLayer(val);
        }
    } else {
        rightMan.layerMan.createLayer();
        board.addLayer({gmVisible: true,
    playerVisible: true,
    zOrder: 0,
    id: 0});
    }
}

async function setUpObjects() {
    const data = serveInter.getObjects();
    if (data) {
        for (const [key, val] of data) {
            board.addObject(
                val.object.layerId!,
                payloadToBoardObject(val.object),
            );
        }
    }
}

async function setUp() {
    await setUpLayers();
    await setUpObjects();
}

function updateActiveLayer() {
    board.activeLayer = rightMan.layerMan.currSelect;
}

async function mainLoop() {
    if (counter % 25 === 0) {
        syncServer();
        board.modeMan.clearTemp();
    }
    if (counter % 25 === 0) {
        rightMan.step();
        counter = 1;
    }
    updateActiveLayer();
    runBoardStep();
    counter++;
    if (counter === 2) {
        loadWall.style.visibility = 'hidden';
    }
    requestAnimationFrame(mainLoop);
}

setUp();
let counter = 0;

requestAnimationFrame(mainLoop);

