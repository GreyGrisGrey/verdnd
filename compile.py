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
            if currLine[0] == "const" or currLine[0] == "export":
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

def clientCompile():
    items = listdir("C:/greybox/verdDnD/client/")
    files = []
    dirs = []
    currIndex = 0
    while (currIndex < len(items)):
        nextItem = items[currIndex].split(".")
        if (len(nextItem) == 1):
            newItems = listdir("C:/greybox/verdDnD/client/" + items[currIndex])
            for i in newItems:
                items.append(items[currIndex] + "/" + i)
            dirs.append("C:/greybox/verdDnD/client/" + items[currIndex])
        elif (nextItem[1] == "ts"):
            files.append("C:/greybox/verdDnD/client/" + items[currIndex])
        currIndex += 1
        
    items = listdir("C:/greybox/verdDnD/shared/")
    currIndex = 0
    while (currIndex < len(items)):
        nextItem = items[currIndex].split(".")
        if (len(nextItem) == 2 and nextItem[1] == "ts"):
            files.append("C:/greybox/verdDnD/shared/" + items[currIndex])
        currIndex += 1

    constDict = {}
    codeBlock = ""

    for i in files:
        if i != "C:/greybox/verdDnD/client/mainDriver.ts":
            res = splitFile(i)
            for j in res[0]:
                constDict[j] = True
            codeBlock += res[1]

    res = splitFile("C:/greybox/verdDnD/client/mainDriver.ts")
    for j in res[0]:
        constDict[j] = True

    finalBlock = ""
    finalBlock += codeBlock
    for i in constDict:
        finalBlock += i + "\n"
    finalBlock += res[1]


    open("clientOut.ts", "w").write(finalBlock)

def serverCompile():
    items = listdir("C:/greybox/verdDnD/shared/")
    files = []
    dirs = []
    currIndex = 0
    while (currIndex < len(items)):
        nextItem = items[currIndex].split(".")
        if (len(nextItem) == 2 and nextItem[1] == "ts"):
            files.append("C:/greybox/verdDnD/shared/" + items[currIndex])
        currIndex += 1
    
    items = listdir("C:/greybox/verdDnD/server/")
    currIndex = 0
    while (currIndex < len(items)):
        nextItem = items[currIndex].split(".")
        if (len(nextItem) == 1):
            newItems = listdir("C:/greybox/verdDnD/server/" + items[currIndex])
            for i in newItems:
                items.append(items[currIndex] + "/" + i)
            dirs.append("C:/greybox/verdDnD/server/" + items[currIndex])
        elif (nextItem[1] == "ts"):
            files.append("C:/greybox/verdDnD/server/" + items[currIndex])
        currIndex += 1

    constDict = {}
    codeBlock = ""

    for i in files:
        res = splitFile(i)
        for j in res[0]:
            constDict[j] = True
        codeBlock += res[1]

    finalBlock = ""
    finalBlock += codeBlock
    for i in constDict:
        finalBlock += i + "\n"

    open("serveOut.ts", "w").write(finalBlock)

clientCompile()
serverCompile()