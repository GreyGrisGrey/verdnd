import {
    ObjectCreateEvent,
    LayerUpdateEvent,
    RollComplete,
    Token,
    SingleRoll,
} from '../shared/objectEvents.ts';
import { Vec2 } from '../shared/coords.ts';
import { Action, Entity } from '../shared/objectEvents.ts';

// Converts rows into map of object payloads.
export function objectTableToPayloads(
    rows: any[],
): Map<number, ObjectCreateEvent> {
    const mapping: Map<number, ObjectCreateEvent> = new Map();
    for (const row of rows) {
        const structData: Vec2[] = row[4].split(':').map((item: string) => {
            let newItem = item.split(',');
            return { x: Number(newItem[0]), y: Number(newItem[1]) };
        });
        const hasImage = row[0] < 8;
        const newParams = {
            ellipse: row[0] % 2 === 0,
            fill: row[0] % 4 < 2,
            close: row[0] % 8 < 4,
        };
        mapping.set(row[3], {
            entity: Entity.Object,
            action: Action.Create,
            userId: '0',
            object: {
                image: hasImage,
                points: structData,
                colour: row[1],
                layerId: row[2],
                objectId: row[3],
                params: newParams,
                token: {
                    name: '',
                    colour: '#cccccc',
                    active: false,
                    movable: false,
                },
            },
            token: {
                name: '',
                colour: '#cccccc',
                active: false,
                movable: false,
            },
        });
    }
    return mapping;
}

// Converts rows into map of layer payloads.
export function layerTableToPayloads(
    rows: any[],
): Map<number, LayerUpdateEvent> {
    const mapping: Map<number, LayerUpdateEvent> = new Map();
    for (const row of rows) {
        mapping.set(row[3], {
            entity: Entity.Layer,
            action: Action.Update,
            layer: {
                gmVisible: row[0],
                playerVisible: row[1],
                zOrder: row[2],
                id: row[3],
                name: row[6],
                x: row[4],
                y: row[5],
            },
        });
    }
    return mapping;
}

// Converts rows into map of roll payloads.
export function rollTableToPayloads(rows: any[]): Map<number, RollComplete> {
    const mapping: Map<number, RollComplete> = new Map();
    for (const row of rows) {
        let structData: SingleRoll[];
        if (row[4] === '') {
            structData = [];
        } else {
            structData = row[4].split(':').map((item: string) => {
                let newItem = item.split(',');
                return {
                    result: Number(newItem[0]),
                    size: Number(newItem[1]),
                    exclude: newItem[2] === 'true',
                };
            });
        }
        mapping.set(row[0], {
            entity: Entity.Roll,
            action: Action.Update,
            id: row[0],
            userId: row[2],
            result: { result: row[1], rolls: structData },
            userName: row[3],
        });
    }
    return mapping;
}

// Converts rows into token payloads, assigns them to the provided map of ObjectCreateEvents.
export function tokenTableToPayloads(
    rows: any[],
    objMapping: Map<number, ObjectCreateEvent>,
) {
    for (const row of rows) {
        const currObj = objMapping.get(row[0]);
        if (currObj) {
            currObj.token = {
                name: row[1],
                colour: row[2],
                movable: row[3],
                active: row[4],
            };
            currObj.object.token = {
                name: row[1],
                colour: row[2],
                movable: row[3],
                active: row[4],
            };
        }
    }
}

// Converts object into a row for the database.
export function objectPayloadToRow(payload: ObjectCreateEvent): string {
    let newVal = 0;
    newVal += payload.object.params.ellipse ? 0 : 1;
    newVal += payload.object.params.fill ? 0 : 2;
    newVal += payload.object.params.close ? 0 : 4;
    newVal += payload.object.image ? 0 : 8;
    let returnString = `(${newVal}, '${payload.object.colour}', ${payload.object.layerId}, ${payload.object.objectId}, '`;
    returnString += `${(payload.object as any).points
        .map((item: Vec2) => {
            return `${item.x},${item.y}`;
        })
        .join(':')}')`;
    return returnString;
}

// Converts object into an update event for the database.
export function updateObjectToRow(
    payload: ObjectCreateEvent,
): (number | string)[] {
    let newVal = 0;
    newVal += payload.object.params.ellipse ? 0 : 1;
    newVal += payload.object.params.fill ? 0 : 2;
    newVal += payload.object.params.close ? 0 : 4;
    newVal += payload.object.image ? 0 : 8;
    return [
        newVal,
        payload.object.colour,
        (payload.object as any).points
            .map((item: Vec2) => {
                return `${item.x},${item.y}`;
            })
            .join(':'),
        payload.object.layerId,
    ];
}

// Converts layer object into a row for the database.
export function layerPayloadToRow(payload: LayerUpdateEvent): string {
    let returnVal = `(${payload.layer.gmVisible}, ${payload.layer.playerVisible}, ${payload.layer.zOrder}, `;
    returnVal += `${payload.layer.id}, ${payload.layer.x}, `;
    returnVal += `${payload.layer.y}, '${payload.layer.name}')`;
    return returnVal;
}

// Converts layer into an update event for the database.
export function updateLayerToRow(
    payload: LayerUpdateEvent,
): (boolean | number | string)[] {
    return [
        payload.layer.gmVisible,
        payload.layer.playerVisible,
        payload.layer.zOrder,
        payload.layer.name,
        payload.layer.x,
        payload.layer.y,
    ];
}

// Takes roll object and turns it into a row for the database.
export function rollPayloadToRow(payload: RollComplete): string {
    let convertString = payload.result.rolls
        .map((item: SingleRoll) => {
            return `${item.result},${item.size},${item.exclude}`;
        })
        .join(':');
    return `(${payload.id}, ${payload.result.result}, '${payload.userId}', '${payload.userName}', '${convertString}')`;
}

// Takes token object and turns it into a row for the database.
export function tokenPayloadToRow(payload: Token, id: number): string {
    return `(${id}, '${payload.name}', '${payload.colour}', '${payload.movable}', '${payload.active}')`;
}

// Takes token object and turns it into a row for the database. Specifically to update it.
export function updateTokenToRow(payload: Token): string[] {
    return [
        payload.name,
        payload.colour,
        payload.movable.toString(),
        payload.active.toString(),
    ];
}
