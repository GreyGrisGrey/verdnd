import json
import random

class boardRoll:
    def __init__(self, newJson):
        print(newJson)
        self.res = newJson["modifier"]
        if newJson["dropHigh"] == 1:
            self.res += max([random.randint(1, 20), random.randint(1, 20)])
        elif newJson["dropLow"] == 1:
            self.res += min([random.randint(1, 20), random.randint(1, 20)])
        else:
            mainDie = [newJson["singleNum"], 0]
            if newJson["singleNum"] == 4:
                mainDie[1] = newJson["four"]
            if newJson["singleNum"] == 6:
                mainDie[1] = newJson["six"]
            if newJson["singleNum"] == 8:
                mainDie[1] = newJson["eight"]
            if newJson["singleNum"] == 10:
                mainDie[1] = newJson["ten"]
            if newJson["singleNum"] == 12:
                mainDie[1] = newJson["twelve"]
            if newJson["singleNum"] == 20:
                mainDie[1] = newJson["twenty"]
            if newJson["singleNum"] == 100:
                mainDie[1] = newJson["hundred"]
            while mainDie[1] > 0:
                self.res += random.randint(1, mainDie[0])
                mainDie[1] -= 1
    
    def getRes(self):
        print(self.res)
        return self.res