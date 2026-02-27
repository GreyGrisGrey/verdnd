import { g as getActionQueryString, a as astroCalledServerError, A as ActionError, d as deserializeActionResult, b as ACTION_QUERY_PARAMS, c as appendForwardSlash } from './chunks/astro-designed-error-pages_D3xzmujX.mjs';
import 'piccolore';
import 'es-module-lexer';
import './chunks/astro/server_bTjnUxVN.mjs';
import 'clsx';
import { d as defineAction } from './chunks/server_cAxjEAg9.mjs';

var Entity = /* @__PURE__ */ ((Entity2) => {
  Entity2["Layer"] = "LAYER";
  Entity2["Object"] = "OBJECT";
  return Entity2;
})(Entity || {});
var Action = /* @__PURE__ */ ((Action2) => {
  Action2["Create"] = "CREATE";
  Action2["Destroy"] = "DESTROY";
  Action2["Move"] = "MOVE";
  Action2["Add"] = "ADD";
  Action2["Remove"] = "REMOVE";
  Action2["Recolour"] = "RECOLOUR";
  Action2["ZOrder"] = "ZORDER";
  return Action2;
})(Action || {});

function comparePayloads(serveObj, cliObj) {
  if (serveObj.kind !== cliObj.kind) {
    return false;
  }
  if (serveObj.x !== cliObj.x || serveObj.y !== cliObj.y || serveObj.colour !== cliObj.colour || serveObj.layerId !== cliObj.layerId) {
    return false;
  }
  return true;
}
class StoredBoard {
  storedObjects;
  storedLayers;
  recentCreation;
  lastTime;
  lockMainWrite;
  lockRecentWrite;
  lockLayerWrite;
  constructor() {
    this.storedObjects = /* @__PURE__ */ new Map();
    this.storedLayers = /* @__PURE__ */ new Map();
    this.recentCreation = [];
    this.lastTime = 0;
    this.lockMainWrite = false;
    this.lockRecentWrite = false;
    this.lockLayerWrite = false;
  }
  compareObjects(clientObjs) {
    const result = [];
    for (const val of clientObjs) {
      const res = this.compareObject(val);
      if (res) {
        result.push(res);
      }
    }
    return result;
  }
  compareObject(clientObj) {
    const obj = this.storedObjects.get(clientObj.objectId);
    if (!obj) {
      return {
        entity: Entity.Object,
        action: Action.Destroy,
        objectId: clientObj.objectId
      };
    }
    if (comparePayloads(obj.object, clientObj)) {
      return null;
    }
    return {
      entity: Entity.Object,
      action: Action.Create,
      object: obj.object
    };
  }
  async createObject(newObj) {
    await this.waitForMain();
    this.lockMainWrite = true;
    await this.waitForRecent();
    this.lockRecentWrite = true;
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
    this.lockMainWrite = false;
    this.lockRecentWrite = false;
    return next;
  }
  getObjects() {
    return this.storedObjects;
  }
  getNewObjects() {
    return this.recentCreation;
  }
  async createLayer() {
    await this.waitForLayer();
    this.lockLayerWrite = true;
    let next = 0;
    while (this.storedLayers.has(next)) {
      next++;
    }
    this.storedLayers.set(next, {
      id: next,
      gmVisible: true,
      playerVisible: true,
      zOrder: next
    });
    this.lockLayerWrite = false;
    return next;
  }
  getLayers() {
    return this.storedLayers;
  }
  async destroyObjects(targetIds) {
    await this.waitForMain();
    this.lockMainWrite = true;
    await this.waitForRecent();
    this.lockRecentWrite = true;
    for (const id of targetIds) {
      if (this.storedObjects.has(id)) {
        this.storedObjects.delete(id);
        this.deleteRecentId(id);
      }
    }
    this.lockMainWrite = false;
    this.lockRecentWrite = false;
  }
  deleteRecentId(targetId) {
    for (let i = 0; i < 3; i++) {
      if (this.recentCreation.length > i && this.recentCreation[i].objectId === targetId) {
        this.recentCreation.splice(i, 1);
      }
    }
  }
  async moveObjects(events) {
    await this.waitForMain();
    this.lockMainWrite = true;
    for (const event of events) {
      const targetObj = this.storedObjects.get(event.objectId);
      if (targetObj) {
        targetObj.object.x += event.x;
        targetObj.object.y += event.y;
      }
    }
    this.lockMainWrite = false;
  }
  async recolourObjects(events) {
    await this.waitForMain();
    this.lockMainWrite = true;
    for (const event of events) {
      const targetObj = this.storedObjects.get(event.objectId);
      if (targetObj) {
        targetObj.object.colour = event.colour;
      }
    }
    this.lockMainWrite = false;
  }
  async waitForRecent() {
    while (this.lockRecentWrite) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }
  async waitForMain() {
    while (this.lockMainWrite) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }
  async waitForLayer() {
    while (this.lockLayerWrite) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }
  async updateLayer(input) {
    await this.waitForLayer();
    this.lockLayerWrite = true;
    const targetObj = this.storedLayers.get(input.id);
    if (targetObj) {
      this.storedLayers.set(input.id, input);
    }
    this.lockLayerWrite = false;
  }
}

const internalFetchHeaders = {};

const apiContextRoutesSymbol = /* @__PURE__ */ Symbol.for("context.routes");
const ENCODED_DOT = "%2E";
function toActionProxy(actionCallback = {}, aggregatedPath = "") {
  return new Proxy(actionCallback, {
    get(target, objKey) {
      if (target.hasOwnProperty(objKey) || typeof objKey === "symbol") {
        return target[objKey];
      }
      const path = aggregatedPath + encodeURIComponent(objKey.toString()).replaceAll(".", ENCODED_DOT);
      function action(param) {
        return handleAction(param, path, this);
      }
      Object.assign(action, {
        queryString: getActionQueryString(path),
        toString: () => action.queryString,
        // redefine prototype methods as the object's own property, not the prototype's
        bind: action.bind,
        valueOf: () => action.valueOf,
        // Progressive enhancement info for React.
        $$FORM_ACTION: function() {
          const searchParams = new URLSearchParams(action.toString());
          return {
            method: "POST",
            // `name` creates a hidden input.
            // It's unused by Astro, but we can't turn this off.
            // At least use a name that won't conflict with a user's formData.
            name: "_astroAction",
            action: "?" + searchParams.toString()
          };
        },
        // Note: `orThrow` does not have progressive enhancement info.
        // If you want to throw exceptions,
        //  you must handle those exceptions with client JS.
        async orThrow(param) {
          const { data, error } = await handleAction(param, path, this);
          if (error) throw error;
          return data;
        }
      });
      return toActionProxy(action, path + ".");
    }
  });
}
function _getActionPath(toString) {
  let path = `${"/".replace(/\/$/, "")}/_actions/${new URLSearchParams(toString()).get(ACTION_QUERY_PARAMS.actionName)}`;
  {
    path = appendForwardSlash(path);
  }
  return path;
}
async function handleAction(param, path, context) {
  if (context) {
    const pipeline = Reflect.get(context, apiContextRoutesSymbol);
    if (!pipeline) {
      throw astroCalledServerError();
    }
    const action = await pipeline.getAction(path);
    if (!action) throw new Error(`Action not found: ${path}`);
    return action.bind(context)(param);
  }
  const headers = new Headers();
  headers.set("Accept", "application/json");
  for (const [key, value] of Object.entries(internalFetchHeaders)) {
    headers.set(key, value);
  }
  let body = param;
  if (!(body instanceof FormData)) {
    try {
      body = JSON.stringify(param);
    } catch (e) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: `Failed to serialize request body to JSON. Full error: ${e.message}`
      });
    }
    if (body) {
      headers.set("Content-Type", "application/json");
    } else {
      headers.set("Content-Length", "0");
    }
  }
  const rawResult = await fetch(
    _getActionPath(() => getActionQueryString(path)),
    {
      method: "POST",
      body,
      headers
    }
  );
  if (rawResult.status === 204) {
    return deserializeActionResult({ type: "empty", status: 204 });
  }
  const bodyText = await rawResult.text();
  if (rawResult.ok) {
    return deserializeActionResult({
      type: "data",
      body: bodyText,
      status: 200,
      contentType: "application/json+devalue"
    });
  }
  return deserializeActionResult({
    type: "error",
    body: bodyText,
    status: rawResult.status,
    contentType: "application/json"
  });
}
toActionProxy();

const serveBoard = new StoredBoard();
const boardActions = {
  createLayer: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      const res = serveBoard.createLayer();
      return res;
    }
  }),
  getLayers: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      return serveBoard.getLayers();
    }
  }),
  createObject: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      const res = serveBoard.createObject(input);
      return res;
    }
  }),
  getObjects: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      return serveBoard.getObjects();
    }
  }),
  destroyObjects: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return serveBoard.destroyObjects(input);
    }
  }),
  moveObjects: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return serveBoard.moveObjects(input);
    }
  }),
  checkIds: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return serveBoard.compareObjects(input);
    }
  }),
  getRecents: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      return serveBoard.getNewObjects();
    }
  }),
  recolourObjects: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return serveBoard.recolourObjects(input);
    }
  }),
  updateLayer: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return serveBoard.updateLayer(input);
    }
  })
};

class StoredDice {
  currIndex;
  prevMapping;
  diceLock;
  constructor() {
    this.currIndex = 0;
    this.prevMapping = /* @__PURE__ */ new Map();
    this.diceLock = false;
  }
  rollDice(newDice) {
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
            Math.round(Math.random() * 1e4) % mainDice[0] + 1
          );
          mainDice[1]--;
        }
        while (mainDice[1] < 0) {
          results.push(
            -(Math.round(Math.random() * 1e4) % mainDice[0] + 1)
          );
          mainDice[1]++;
        }
        results = results.sort(function(curr, next) {
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
      this.recordDice(newDice);
      return result;
    }
  }
  async recordDice(newDice) {
    await this.waitDiceLock();
    this.diceLock = true;
    this.prevMapping.set(this.currIndex, newDice);
    this.currIndex = (this.currIndex + 1) % 50;
    this.diceLock = false;
  }
  async waitDiceLock() {
    while (this.diceLock) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }
  getDice() {
    return { start: this.currIndex, map: this.prevMapping };
  }
}

const diceObj = new StoredDice();
const rollActions = {
  roll: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async (input) => {
      return diceObj.rollDice(input);
    }
  }),
  getDice: defineAction({
    // biome-ignore lint/suspicious/useAwait: handler signature must be async for defineAction
    handler: async () => {
      return diceObj.getDice();
    }
  })
};

const server = {
  boardActions,
  rollActions
};

export { server };
