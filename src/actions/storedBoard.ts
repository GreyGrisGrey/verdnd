export class StoredBoard {
  // TODO: Make these proper types when we start using them
  storedObjects: any[];
  storedLayers: Map<number, [boolean, boolean, number]>;

  constructor() {
    this.storedObjects = [];
    this.storedLayers = new Map();
  }

  createLayer() {
    let next = 0;
    while (this.storedLayers.has(next)) {
      next++;
    }
    this.storedLayers.set(next, [true, true, 0]);
    return next;
  }

  getLayers() {
    return this.storedLayers;
  }
}
