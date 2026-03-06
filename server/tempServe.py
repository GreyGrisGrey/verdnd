import asyncio
import websockets
import boardObj
import boardLayer
import boardRoll
import json

HOST = "192.168.2.142"
PORT = 8765
heldObj = {}
heldLayer = {}
heldRoll = {}
currRoll = 0
currLayer = 1
currObj = 0
currActive = 0

async def repeatSend(websocket):
    for i in heldLayer:
        await websocket.send(heldLayer[i].toString())
    for i in heldObj:
        await websocket.send(heldObj[i].toString())
    for i in heldRoll:
        await websocket.send(json.dumps({"entity": "ROLL", "index": i, "result": heldRoll[i].getRes()}))

async def handler(websocket):
    await repeatSend(websocket)
    async for message in websocket:
        if (message != "PING"):
            res = json.loads(message)
            if "entity" in res:
                if res["entity"] == "OBJECT":
                    handleObj(res)
                if res["entity"] == "LAYER":
                    handleLayer(res)
                if res["entity"] == "ROLL":
                    handleRoll(res)
        if (message == "PING"):
            print("PONG")
        await repeatSend(websocket)
            

def handleObj(newJson):
    if newJson["action"] == "CREATE":
        curr = 0
        while curr in heldObj and heldObj[curr].active:
            curr += 1
        heldObj[curr] = constructObj(newJson["object"], curr)
    elif newJson["action"] == "DESTROY" and newJson["objectId"] in heldObj:
        heldObj[newJson["objectId"]].setInactive()
    elif newJson["action"] == "MOVE" and newJson["objectId"] in heldObj:
        heldObj[newJson["objectId"]].move(newJson["x"], newJson["y"])
    elif newJson["action"] == "RECOLOUR" and newJson["objectId"] in heldObj:
        heldObj[newJson["objectId"]].recolour(newJson["colour"])
    return

def constructObj(newJson, id):
    print(newJson)
    if newJson["kind"] == "RECT":
        return boardObj.boardObj(newJson["kind"], newJson["x"], newJson["y"],
                        newJson["colour"], newJson["layerId"], id, 
                        width = newJson["width"], height = newJson["height"])
    if newJson["kind"] == "CIRCLE":
        return boardObj.boardObj(newJson["kind"], newJson["x"], newJson["y"],
                        newJson["colour"], newJson["layerId"], id, 
                        diameter = newJson["diameter"])
    if newJson["kind"] == "POLYLINE":
        return boardObj.boardObj(newJson["kind"], newJson["x"], newJson["y"],
                        newJson["colour"], newJson["layerId"], id, 
                        points = newJson["points"])
    if newJson["kind"] == "LINE":
        return boardObj.boardObj(newJson["kind"], newJson["x"], newJson["y"],
                        newJson["colour"], newJson["layerId"], id, 
                        points = newJson["points"])
    if newJson["kind"] == "TOKEN":
        return boardObj.boardObj(newJson["kind"], newJson["x"], newJson["y"],
                        newJson["colour"], newJson["layerId"], id, 
                        diameter = newJson["diameter"], name = newJson["name"])
    return None

def handleLayer(newJson):
    global currLayer
    if newJson["action"] == "Update" and newJson['data']["id"] in heldLayer:
        print(newJson)
        heldLayer[newJson['data']["id"]].updateLayer(newJson['data'])
    elif newJson["action"] == "Create" and currLayer < 12:
        heldLayer[currLayer] = boardLayer.boardLayer(newJson['data']["gmVisible"],
                                          newJson['data']["playerVisible"],
                                          newJson['data']["zOrder"],
                                          currLayer)
        currLayer += 1
    elif newJson["action"] == "Destroy" and newJson['data']["id"] in heldLayer:
        heldLayer[newJson['data']["id"]] = False

def handleRoll(newJson):
    global currRoll
    heldRoll[currRoll] = boardRoll.boardRoll(newJson["data"])
    currRoll += 1

async def main():
    heldLayer[0] = boardLayer.boardLayer(True, True, 0, 0)
    async with websockets.serve(handler, HOST, PORT):
        print(f"WebSocket server started on ws://{HOST}:{PORT}")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
