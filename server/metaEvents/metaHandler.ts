import { Action, Entity } from '../../shared/objectEvents.ts';
import { PostGresData } from '../dataMain.ts';
import { establishGlobalUser, getUserGames } from './metaEvents.ts';
import WebSocket from 'ws';
import { WebSocketData } from '../wsData.ts';

// Function handling all events the websocket server decides are not related to a specific game.
export async function handleMetaEvent(
    message: any,
    ws: WebSocket,
    cli: PostGresData,
    userMap: Map<string, WebSocket>,
    userLock: boolean,
    dbLock: boolean,
    wsMap: Map<WebSocket, WebSocketData>,
) {
    const payload = message.event;
    if (
        message.gameId === -1 &&
        payload.entity === Entity.Name &&
        payload.pass &&
        payload.name &&
        payload.id
    ) {
        establishGlobalUser(payload, ws, userLock, dbLock, cli, userMap, wsMap);
    } else if (
        payload.entity === Entity.Meta &&
        payload.action === Action.Create
    ) {
        const res = await cli.constructGame(message.userId);
        if (res) {
            ws.send(JSON.stringify({ newId: res }));
        }
    } else if (
        payload.entity === Entity.Meta &&
        payload.action === Action.Enumerate
    ) {
        const res = await getUserGames(message.userId, cli);
        ws.send(
            JSON.stringify({
                entity: Entity.Meta,
                action: Action.Enumerate,
                list: res,
            }),
        );
    }
}
