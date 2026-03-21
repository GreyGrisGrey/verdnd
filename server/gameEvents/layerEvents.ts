import type { LayerState } from '../../shared/objectEvents.ts';
import { Action, Entity } from '../../shared/objectEvents.ts';
import { layerPayloadToRow, updateLayerToRow } from '../converter.ts';
import { PostGresData } from '../dataMain.ts';
import { GameObject } from '../gameObject.ts';

// Function for adding a new layer to a specified game.
export async function createLayer(currGame: GameObject, cli: PostGresData) {
    await currGame.waitLock(currGame.layerLock);
    currGame.layerLock = true;
    currGame.layerMap.set(currGame.currLayer, {
        entity: Entity.Layer,
        action: Action.Update,
        layer: {
            gmVisible: true,
            playerVisible: true,
            zOrder: currGame.layerMap.size,
            id: currGame.currLayer,
            name: 'none',
            x: 0,
            y: 0,
        },
    });
    const sendObj = JSON.stringify(currGame.layerMap.get(currGame.currLayer));
    await currGame.waitLock(currGame.dbLock);
    currGame.dbLock = true;
    cli.addLayer(
        currGame.gameId,
        layerPayloadToRow(currGame.layerMap.get(currGame.currLayer)!),
    );
    currGame.dbLock = false;
    currGame.currLayer++;
    currGame.layerLock = false;
    currGame.broadcast(sendObj);
}

// Function for updating a specified layer on a specified game.
export async function updateLayer(
    layerId: number,
    newLayer: LayerState,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock(currGame.layerLock);
    currGame.layerLock = true;
    const oldVis = currGame.layerMap.get(layerId)!.layer.playerVisible;
    currGame.layerMap.set(layerId, {
        entity: Entity.Layer,
        action: Action.Update,
        layer: newLayer,
    });
    const sendObj = JSON.stringify({
        entity: Entity.Layer,
        action: Action.Update,
        layer: newLayer,
    });
    await currGame.waitLock(currGame.dbLock);
    currGame.dbLock = true;
    cli.updateLayer(
        currGame.gameId,
        layerId,
        updateLayerToRow({
            entity: Entity.Layer,
            action: Action.Update,
            layer: newLayer,
        }),
    );
    currGame.dbLock = false;
    if (oldVis !== newLayer.playerVisible) {
        currGame.sendMasses(newLayer.id);
    }
    currGame.layerLock = false;
    currGame.broadcast(sendObj);
}

// Function for destroying a specified layer on a specified game.
export async function destroyLayer(
    layerId: number,
    currGame: GameObject,
    cli: PostGresData,
) {
    await currGame.waitLock(currGame.layerLock);
    currGame.layerLock = true;
    if (currGame.layerMap.size > 1) {
        currGame.layerMap.delete(layerId);
        await currGame.waitLock(currGame.dbLock);
        currGame.dbLock = true;
        cli.destroyLayer(currGame.gameId, layerId);
        currGame.dbLock = false;
        currGame.layerLock = false;
        const sendObj = JSON.stringify({
            entity: Entity.Layer,
            action: Action.Destroy,
            layerId: layerId,
        });
        currGame.broadcast(sendObj);
    }
    currGame.layerLock = false;
}
