import json
import random

class boardRoll:
    def __init__(self, newJson):
        print(newJson)
        self.res = newJson["modifier"]
        if newJson["advantage"]:
            self.res += max([random.randint(1, 20), random.randint(1, 20)])
        elif newJson["disadvantage"]:
            self.res += min([random.randint(1, 20), random.randint(1, 20)])
        else:
            print(newJson)
            mainDie = [newJson["diceSize"], newJson["diceCount"]]
            while mainDie[1] > 0:
                self.res += random.randint(1, mainDie[0])
                mainDie[1] -= 1
    
    def getRes(self):
        print(self.res)
        return self.res