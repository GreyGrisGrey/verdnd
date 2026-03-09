export class ColInst {
    blue: number;
    green: number;
    red: number;
    alpha: number;

    constructor(newR: number, newG: number, newB: number, newA: number) {
        this.red = newR;
        this.green = newG;
        this.blue = newB;
        this.alpha = newA;
    }

    setR(newR: number) {
        this.red = newR;
    }

    setG(newG: number) {
        this.green = newG;
    }

    setB(newB: number) {
        this.blue = newB;
    }

    setA(newA: number) {
        this.alpha = newA;
    }

    toString(): string {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha / 100})`;
    }
}

// Just a bunch of enums and interfaces used by other files.
export interface Vec2 {
    x: number;
    y: number;
}

export interface DicePayload {
    diceSize: number;
    diceCount: number;
    advantage: boolean;
    disadvantage: boolean;
    modifier: number;
    result: number;
}

export enum Shape {
    Rect = 'RECT',
    Ellipse = 'ELLIPSE',
    Polyline = 'POLYLINE',
    Line = 'LINE',
    Token = 'TOKEN',
    None = 'NONE',
}

export enum Entity {
    Layer = 'LAYER',
    Object = 'OBJECT',
    Roll = 'ROLL',
    Name = 'NAME',
}

export enum Action {
    Create = 'CREATE',
    Destroy = 'DESTROY',
    Move = 'MOVE',
    Add = 'ADD',
    Remove = 'REMOVE',
    Recolour = 'RECOLOUR',
    ZOrder = 'ZORDER',
    Update = 'UPDATE',
}

export interface LayerState {
    gmVisible: boolean;
    playerVisible: boolean;
    zOrder: number;
    id: number;
    element?: HTMLElement;
}

export interface RectCreatePayload {
    kind: Shape.Rect | Shape.Ellipse;
    x: number;
    y: number;
    width: number;
    height: number;
    colour: ColInst | string;
    layerId: number;
    objectId: number;
}

export interface TokenCreatePayload {
    kind: Shape.Token;
    x: number;
    y: number;
    diameter: number;
    colour: ColInst | string;
    name: string;
    layerId: number;
    objectId: number;
}

export interface PolyCreatePayload {
    kind: Shape.Polyline | Shape.Line;
    x: number;
    y: number;
    points: Vec2[];
    colour: ColInst | string;
    layerId: number;
    objectId: number;
}

export type ObjectCreatePayload =
    | PolyCreatePayload
    | RectCreatePayload
    | TokenCreatePayload;

export interface LayerCreateEvent {
    entity: Entity.Layer;
    action: Action.Create;
    layerId: number;
}

export interface LayerDestroyEvent {
    entity: Entity.Layer;
    action: Action.Destroy;
    layerId: number;
}

export interface LayerUpdateEvent {
    entity: Entity.Layer;
    action: Action.Update;
    layer: LayerState;
}

export interface ObjectCreateEvent {
    entity: Entity.Object;
    action: Action.Create;
    object: ObjectCreatePayload;
    userId: number;
}

export interface ObjectMoveEvent {
    entity: Entity.Object;
    action: Action.Move;
    objectId: number;
    x: number;
    y: number;
}

export interface ObjectDestroyEvent {
    entity: Entity.Object;
    action: Action.Destroy;
    objectId: number;
}

export interface ObjectRecolourEvent {
    entity: Entity.Object;
    action: Action.Recolour;
    objectId: number;
    colour: ColInst | string;
}

export interface RollEvent {
    entity: Entity.Roll;
    action: Action.Create;
    id: number;
    dice: DicePayload;
}

export interface ServerPacket {
    userId: number;
    event: ServerEvent;
}

export type ServerEvent =
    | LayerCreateEvent
    | LayerDestroyEvent
    | LayerUpdateEvent
    | ObjectCreateEvent
    | ObjectDestroyEvent
    | ObjectMoveEvent
    | ObjectRecolourEvent
    | RollEvent;

export type ObjectChangeEvent = ObjectCreateEvent | ObjectDestroyEvent;
