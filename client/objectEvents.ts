import type { ColInst } from './colours.ts';
import type { Vec2 } from './boardCanvas/coords.ts';

// Just a bunch of enums and interfaces used by other files.

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
    Laser = 'LASER',
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

export interface singleRoll {
    result: number;
    size: number;
    exclude: boolean;
}

export interface RollComplete {
    entity: Entity.Roll;
    action: Action.Update;
    id: number;
    result: RollResult;
    userId: number;
}

export interface RollResult {
    result: number;
    rolls: singleRoll[];
}

export interface ServerPacket {
    userId: number;
    event: ServerEvent;
}

export interface LaserEvent {
    entity: Entity.Laser;
    id: number;
    colour: ColInst | string;
    time: number;
    coords: Vec2;
}

export type ServerEvent =
    | LayerCreateEvent
    | LayerDestroyEvent
    | LayerUpdateEvent
    | ObjectCreateEvent
    | ObjectDestroyEvent
    | ObjectMoveEvent
    | ObjectRecolourEvent
    | RollEvent
    | LaserEvent;

export type ObjectChangeEvent = ObjectCreateEvent | ObjectDestroyEvent;
