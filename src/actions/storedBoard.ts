import * as BoardLayer from "/src/scripts/boardCanvas/boardLayer.ts"
import * as BoardObject from "/src/scripts/boardCanvas/boardObject.ts"

export class StoredBoard {
    storedObjects: Array<any>
    storedLayers: Map<number, any>
    
    constructor() {
        this.storedObjects = new Array()
        this.storedLayers = new Map()
    }
    
    createLayer() {
        let next = 0
        while (this.storedLayers.has(next)) {
            next++
        }
        this.storedLayers.set(next, [true, true, 0])
        return next
    }
    
    getLayers(): Map<number, any> {
        return this.storedLayers
    }
}