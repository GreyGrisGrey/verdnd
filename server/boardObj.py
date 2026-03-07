import json

class boardObj:
    def __init__(self, kind, x, y, col, layer, id, points = [], diameter = 0, width = 0, height = 0, name = "", client = 0):
        self.kind = kind
        self.x = x
        self.y = y
        self.colour = col
        self.layerId = layer
        self.objectId = id
        self.points = points
        self.diameter = diameter
        self.width = width
        self.height = height
        self.name = name
        self.active = True
        self.client = client
    
    def recolour(self, newCol):
        self.colour = newCol
    
    def setInactive(self):
        self.active = False
    
    def move(self, addX, addY):
        self.x += addX
        self.y += addY
    
    def toString(self):
        if self.active == False:
            return json.dumps({"entity": "OBJECT", "action": "DESTROY", "objectId": self.objectId})
        if self.kind == "RECT" or self.kind == "ELLIPSE":
            return json.dumps({"entity": "OBJECT", "action": "CREATE", "clientId": self.client, "object": {"kind": self.kind, 
                               "x": self.x, 
                               "y": self.y, 
                               "width": self.width, 
                               "height": self.height, 
                               "colour": self.colour, 
                               "layerId": self.layerId,
                               "objectId": self.objectId}})
        elif self.kind == "TOKEN":
            return json.dumps({"entity": "OBJECT", "action": "CREATE", "clientId": self.client, "object": {"kind": self.kind, 
                               "x": self.x, 
                               "y": self.y, 
                               "diameter": self.diameter,
                               "name": self.name,
                               "colour": self.colour, 
                               "layerId": self.layerId,
                               "objectId": self.objectId}})
        elif self.kind == "POLYLINE" or self.kind == "LINE":
            return json.dumps({"entity": "OBJECT", "action": "CREATE", "clientId": self.client, "object": {"kind": self.kind, 
                               "x": self.x, 
                               "y": self.y, 
                               "points": self.points,
                               "colour": self.colour, 
                               "layerId": self.layerId,
                               "objectId": self.objectId}})