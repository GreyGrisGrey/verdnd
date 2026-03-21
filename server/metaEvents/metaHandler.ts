import { Action, Entity } from '../../shared/objectEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { establishGlobalUser } from './metaEvents.ts';
import WebSocket from 'ws';

export async function handleMetaEvent(
    event: any,
    ws: WebSocket,
    cli: PostGresData,
    userMap: Map<string, boolean>,
    userLock: boolean,
    dbLock: boolean,
) {
    const message = JSON.parse(event);
    const payload = message.event;
    if (
        message.gameId === -1 &&
        payload.entity === Entity.Name &&
        payload.pass &&
        payload.name &&
        payload.id
    ) {
        establishGlobalUser(payload, ws, userLock, dbLock, cli, userMap);
    } else if (
        payload.entity === Entity.Meta &&
        payload.action === Action.Create
    ) {
        const res = await cli.constructGame(message.userId);
        if (res) {
            ws.send(JSON.stringify({ newId: res }));
        }
    }
}
