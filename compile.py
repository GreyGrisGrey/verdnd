from os import listdir

def splitFile(filePath):
    newText = open(filePath, "r").read().split("\n")
    res = [[], ""]
    importStep = False
    constStep = False
    currIndex = 0
    while not importStep:
        if newText[currIndex] == "":
            importStep = True
        else:
            currLine = newText[currIndex].split(" ")
            if currLine[0] == "const":
                importStep = True
            else:
                currIndex += 1
    while not constStep:
        if newText[currIndex] == "":
            constStep = True
        else:
            currLine = newText[currIndex].split(" ")
            if currLine[0] != "const":
                constStep = True
            else:
                res[0].append(newText[currIndex])
            currIndex += 1
    while currIndex < len(newText):
        currLine = newText[currIndex].split(" ")
        if len(currLine) > 1 and currLine[0] == "export":
            res[1] += " ".join(currLine[1::]) + "\n"
        else:
            res[1] += newText[currIndex] + "\n"
        currIndex += 1
    return res

items = listdir("C:/greybox/verdDnD/src")
files = []
dirs = []
currIndex = 0
while (currIndex < len(items)):
    nextItem = items[currIndex].split(".")
    if (len(nextItem) == 1):
        newItems = listdir("C:/greybox/verdDnD/src/" + items[currIndex])
        for i in newItems:
            items.append(items[currIndex] + "/" + i)
        dirs.append("C:/greybox/verdDnD/src/" + items[currIndex])
    elif (nextItem[1] == "ts"):
        files.append("C:/greybox/verdDnD/src/" + items[currIndex])
    currIndex += 1

constDict = {}
codeBlock = ""

for i in files:
    if i != "C:/greybox/verdDnD/src/mainDriver.ts":
        res = splitFile(i)
        for j in res[0]:
            constDict[j] = True
        codeBlock += res[1]

res = splitFile("C:/greybox/verdDnD/src/mainDriver.ts")
for j in res[0]:
    constDict[j] = True

finalBlock = ""
finalBlock += codeBlock
for i in constDict:
    finalBlock += i + "\n"
finalBlock += res[1]


open("out.ts", "w").write(finalBlock)