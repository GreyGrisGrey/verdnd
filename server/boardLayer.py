import json

class boardLayer:
    def __init__(self, newGM, newPlay, z, id):
        self.gmVisible = newGM
        self.playerVisible = newPlay
        self.zOrder = z
        self.id = id
        
    def toString(self):
        return json.dumps({"entity": "LAYER", "data": {"gmVisible": self.gmVisible, 
                           "playerVisible": self.playerVisible,
                             "zOrder": self.zOrder,
                               "id": self.id}})
    
    def updateLayer(self, newJson):
        self.gmVisible = newJson["gmVisible"]
        self.playerVisible = newJson["playerVisible"]
        self.zOrder = newJson["zOrder"]
        self.id = newJson["id"]