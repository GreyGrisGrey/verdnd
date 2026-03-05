var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
System.register("colours", ["color"], function (exports_1, context_1) {
    "use strict";
    var color_1, GREY, GREY_LIGHT, RED, BLUE, GOLD, BLACK, WHITE, WHITE_50;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (color_1_1) {
                color_1 = color_1_1;
            }
        ],
        execute: function () {
            exports_1("GREY", GREY = color_1.default('#cccccc'));
            exports_1("GREY_LIGHT", GREY_LIGHT = color_1.default('#eeeeee'));
            exports_1("RED", RED = color_1.default('#cc0000'));
            exports_1("BLUE", BLUE = color_1.default('#0000cc'));
            exports_1("GOLD", GOLD = color_1.default('#ffd500'));
            exports_1("BLACK", BLACK = color_1.default('#000000'));
            exports_1("WHITE", WHITE = color_1.default('rgba(255, 255, 255, 1)'));
            exports_1("WHITE_50", WHITE_50 = color_1.default('white').alpha(0.5));
        }
    };
});
System.register("dom", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function getRequiredElement(id, elementType) {
        var element = document.getElementById(id);
        if (!(element instanceof elementType)) {
            throw new Error("Expected #".concat(id, " to be a ").concat(elementType.name, ", but it was missing or mismatched."));
        }
        return element;
    }
    exports_2("getRequiredElement", getRequiredElement);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("boardCanvas/coords", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("objectEvents", [], function (exports_4, context_4) {
    "use strict";
    var Shape, Entity, Action;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            (function (Shape) {
                Shape["Rect"] = "Rect";
                Shape["Circle"] = "Circle";
                Shape["Poly"] = "Polyline";
                Shape["Line"] = "Line";
                Shape["Token"] = "Token";
            })(Shape || (exports_4("Shape", Shape = {})));
            (function (Entity) {
                Entity["Layer"] = "LAYER";
                Entity["Object"] = "OBJECT";
            })(Entity || (exports_4("Entity", Entity = {})));
            (function (Action) {
                Action["Create"] = "CREATE";
                Action["Destroy"] = "DESTROY";
                Action["Move"] = "MOVE";
                Action["Add"] = "ADD";
                Action["Remove"] = "REMOVE";
                Action["Recolour"] = "RECOLOUR";
                Action["ZOrder"] = "ZORDER";
            })(Action || (exports_4("Action", Action = {})));
        }
    };
});
System.register("boardCanvas/boardObject", ["colours", "objectEvents"], function (exports_5, context_5) {
    "use strict";
    var colours_ts_1, objectEvents_ts_1, BoardObjectBase, Token, Rect, Circle, Polyline, Line;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (colours_ts_1_1) {
                colours_ts_1 = colours_ts_1_1;
            },
            function (objectEvents_ts_1_1) {
                objectEvents_ts_1 = objectEvents_ts_1_1;
            }
        ],
        execute: function () {
            BoardObjectBase = (function () {
                function BoardObjectBase(objId, x, y, colour) {
                    this.objectId = objId;
                    this.zOrder = 0;
                    this.location = { x: x, y: y };
                    this.colour = colour;
                    this.hasImage = false;
                    this.imagePath = '';
                    this.selected = false;
                    this.centerPoint = { x: 0, y: 0 };
                    this.layerId = 0;
                }
                BoardObjectBase.prototype.move = function (xChange, yChange) {
                    this.location.x += xChange;
                    this.location.y += yChange;
                    this.setCenter();
                    return this.location;
                };
                BoardObjectBase.prototype.setColour = function (newColour) {
                    this.colour = newColour;
                };
                BoardObjectBase.prototype.setZOrder = function (newOrder) {
                    this.zOrder = newOrder;
                };
                BoardObjectBase.prototype.isCenterInsideRect = function (point1, point2) {
                    if (this.centerPoint.x >= point1.x &&
                        this.centerPoint.x <= point2.x &&
                        this.centerPoint.y >= point1.y &&
                        this.centerPoint.y <= point2.y) {
                        return true;
                    }
                    return false;
                };
                BoardObjectBase.prototype.setCenter = function () {
                    this.centerPoint = { x: 0, y: 0 };
                };
                BoardObjectBase.prototype.setSelected = function (newSelection) {
                    this.selected = newSelection;
                };
                return BoardObjectBase;
            }());
            exports_5("BoardObjectBase", BoardObjectBase);
            Token = (function (_super) {
                __extends(Token, _super);
                function Token(id, x, y, diam, colour, name, owner) {
                    if (name === void 0) { name = ''; }
                    if (owner === void 0) { owner = ''; }
                    var _this = _super.call(this, id, x, y, colour) || this;
                    _this.owner = owner;
                    _this.diameter = diam;
                    _this.name = name;
                    _this.objType = objectEvents_ts_1.Shape.Token;
                    _this.currPathSpecs = [0, 0, 0];
                    _this.currPath = new Path2D();
                    _this.currOutPath = new Path2D();
                    _this.setCenter();
                    return _this;
                }
                Token.prototype.draw = function (ctx, squareSize, offset) {
                    if (squareSize !== this.currPathSpecs[0] ||
                        offset.x !== this.currPathSpecs[1] ||
                        offset.y !== this.currPathSpecs[2]) {
                        var coords = {
                            x: this.location.x * squareSize +
                                offset.x +
                                (squareSize * this.diameter) / 2,
                            y: this.location.y * squareSize +
                                offset.y +
                                (squareSize * this.diameter) / 2,
                        };
                        this.currOutPath = new Path2D();
                        this.currOutPath.arc(coords.x, coords.y, (this.diameter * squareSize) / 2, 0, 2 * Math.PI, false);
                        this.currOutPath.closePath();
                        this.currPath = new Path2D();
                        this.currPath.arc(coords.x, coords.y, (this.diameter * squareSize) / 2 - 2, 0, 2 * Math.PI, false);
                        this.currPath.closePath();
                        this.currPathSpecs = [squareSize, offset.x, offset.y];
                    }
                    ctx.strokeStyle = this.selected ? colours_ts_1.GOLD.toString() : colours_ts_1.GREY.toString();
                    ctx.lineWidth = 4;
                    ctx.stroke(this.currOutPath);
                    ctx.fillStyle = this.colour.toString();
                    ctx.fill(this.currPath);
                };
                Token.prototype.drawLabel = function (ctx, squareSize, offset) {
                    ctx.font = '20px serif';
                    ctx.fillStyle = colours_ts_1.GREY_LIGHT.toString();
                    ctx.textAlign = 'center';
                    var textSize = ctx.measureText(this.name).width;
                    ctx.fillRect(this.location.x * squareSize +
                        offset.x +
                        (squareSize * this.diameter) / 2 -
                        textSize / 2 -
                        5, this.location.y * squareSize + offset.y - 35, textSize + 10, 25);
                    ctx.fillStyle = colours_ts_1.BLACK.toString();
                    ctx.fillText(this.name, this.location.x * squareSize +
                        offset.x +
                        (squareSize * this.diameter) / 2, this.location.y * squareSize + offset.y - 20);
                };
                Token.prototype.isPointInside = function (point) {
                    var adj = Math.abs(this.location.x + this.diameter / 2 - point.x - 0.5);
                    var opp = Math.abs(this.location.y + this.diameter / 2 - point.y - 0.5);
                    var distance = Math.sqrt(adj * adj + opp * opp);
                    if (distance <= this.diameter / 2) {
                        return true;
                    }
                    return false;
                };
                Token.prototype.setCenter = function () {
                    this.centerPoint = {
                        x: this.location.x + this.diameter / 2,
                        y: this.location.y + this.diameter / 2,
                    };
                };
                Token.prototype.payloadFromObject = function () {
                    return {
                        kind: objectEvents_ts_1.Shape.Token,
                        x: this.location.x,
                        y: this.location.y,
                        diameter: this.diameter,
                        colour: this.colour,
                        name: this.name,
                        layerId: this.layerId,
                        objectId: this.objectId,
                    };
                };
                Token.prototype.updateFromPayload = function (newSetting) {
                    this.location.x = newSetting.x;
                    this.location.y = newSetting.y;
                    this.diameter = newSetting.diameter;
                    this.colour = newSetting.colour;
                    this.layerId = newSetting.layerId;
                };
                return Token;
            }(BoardObjectBase));
            exports_5("Token", Token);
            Rect = (function (_super) {
                __extends(Rect, _super);
                function Rect(id, x, y, xSize, ySize, colour) {
                    var _this = _super.call(this, id, x, y, colour) || this;
                    _this.size = { x: xSize, y: ySize };
                    _this.objType = objectEvents_ts_1.Shape.Rect;
                    _this.setCenter();
                    return _this;
                }
                Rect.prototype.draw = function (ctx, squareSize, offset) {
                    if (this.selected) {
                        ctx.strokeStyle = colours_ts_1.GOLD.toString();
                        ctx.lineWidth = 4;
                        ctx.strokeRect(this.location.x * squareSize + offset.x - 2, this.location.y * squareSize + offset.y - 2, this.size.x * squareSize + 4, this.size.y * squareSize + 4);
                    }
                    ctx.fillStyle = this.colour.toString();
                    ctx.fillRect(this.location.x * squareSize + offset.x, this.location.y * squareSize + offset.y, this.size.x * squareSize, this.size.y * squareSize);
                };
                Rect.prototype.isPointInside = function (point) {
                    if (point.x + 0.5 >= this.location.x &&
                        point.y + 0.5 >= this.location.y &&
                        point.x + 0.5 <= this.location.x + this.size.x &&
                        point.y + 0.5 <= this.location.y + this.size.y) {
                        return true;
                    }
                    return false;
                };
                Rect.prototype.setCenter = function () {
                    this.centerPoint = {
                        x: this.location.x + this.size.x / 2,
                        y: this.location.y + this.size.y / 2,
                    };
                };
                Rect.prototype.payloadFromObject = function () {
                    return {
                        kind: objectEvents_ts_1.Shape.Rect,
                        x: this.location.x,
                        y: this.location.y,
                        width: this.size.x,
                        height: this.size.y,
                        colour: this.colour,
                        layerId: this.layerId,
                        objectId: this.objectId,
                    };
                };
                Rect.prototype.updateFromPayload = function (newSetting) {
                    this.location.x = newSetting.x;
                    this.location.y = newSetting.y;
                    this.size.x = newSetting.width;
                    this.size.y = newSetting.height;
                    this.colour = newSetting.colour;
                    this.layerId = newSetting.layerId;
                };
                return Rect;
            }(BoardObjectBase));
            exports_5("Rect", Rect);
            Circle = (function (_super) {
                __extends(Circle, _super);
                function Circle(id, x, y, diam, colour) {
                    var _this = _super.call(this, id, x, y, colour) || this;
                    _this.diameter = diam;
                    _this.objType = objectEvents_ts_1.Shape.Circle;
                    _this.currPathSpecs = [0, 0, 0];
                    _this.currPath = new Path2D();
                    _this.setCenter();
                    return _this;
                }
                Circle.prototype.draw = function (ctx, squareSize, offset) {
                    if (squareSize !== this.currPathSpecs[0] ||
                        offset.x !== this.currPathSpecs[1] ||
                        offset.y !== this.currPathSpecs[2]) {
                        var coords = {
                            x: this.location.x * squareSize +
                                offset.x +
                                (squareSize * this.diameter) / 2,
                            y: this.location.y * squareSize +
                                offset.y +
                                (squareSize * this.diameter) / 2,
                        };
                        this.currPath = new Path2D();
                        this.currPath.arc(coords.x, coords.y, (this.diameter * squareSize) / 2, 0, 2 * Math.PI, false);
                        this.currPathSpecs = [squareSize, offset.x, offset.y];
                        this.currPath.closePath();
                    }
                    if (this.selected) {
                        ctx.strokeStyle = colours_ts_1.GOLD.toString();
                        ctx.lineWidth = 4;
                        ctx.stroke(this.currPath);
                    }
                    ctx.fillStyle = this.colour.toString();
                    ctx.fill(this.currPath);
                };
                Circle.prototype.isPointInside = function (point) {
                    var adj = Math.abs(this.location.x + this.diameter / 2 - point.x - 0.5);
                    var opp = Math.abs(this.location.y + this.diameter / 2 - point.y - 0.5);
                    var distance = Math.sqrt(adj * adj + opp * opp);
                    if (distance <= this.diameter / 2) {
                        return true;
                    }
                    return false;
                };
                Circle.prototype.setCenter = function () {
                    this.centerPoint = {
                        x: this.location.x + this.diameter / 2,
                        y: this.location.y + this.diameter / 2,
                    };
                };
                Circle.prototype.payloadFromObject = function () {
                    return {
                        kind: objectEvents_ts_1.Shape.Circle,
                        x: this.location.x,
                        y: this.location.y,
                        diameter: this.diameter,
                        colour: this.colour,
                        layerId: this.layerId,
                        objectId: this.objectId,
                    };
                };
                Circle.prototype.updateFromPayload = function (newSetting) {
                    this.location.x = newSetting.x;
                    this.location.y = newSetting.y;
                    this.diameter = newSetting.diameter;
                    this.colour = newSetting.colour;
                    this.layerId = newSetting.layerId;
                };
                return Circle;
            }(BoardObjectBase));
            exports_5("Circle", Circle);
            Polyline = (function (_super) {
                __extends(Polyline, _super);
                function Polyline(id, x, y, structure, colour) {
                    var _this = _super.call(this, id, x, y, colour) || this;
                    _this.points = structure;
                    _this.objType = objectEvents_ts_1.Shape.Poly;
                    _this.currPath = new Path2D();
                    _this.currPathSpecs = [0, 0, 0];
                    _this.ctx = undefined;
                    _this.setCenter();
                    return _this;
                }
                Polyline.prototype.draw = function (ctx, squareSize, offset) {
                    if (squareSize !== this.currPathSpecs[0] ||
                        offset.x !== this.currPathSpecs[1] ||
                        offset.y !== this.currPathSpecs[2]) {
                        this.currPath = new Path2D();
                        this.currPath.moveTo(this.location.x * squareSize + offset.x, this.location.y * squareSize + offset.y);
                        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                            var pt = _a[_i];
                            this.currPath.lineTo((this.location.x + pt.x) * squareSize + offset.x, (this.location.y + pt.y) * squareSize + offset.y);
                        }
                        this.currPathSpecs = [squareSize, offset.x, offset.y];
                        this.currPath.closePath();
                    }
                    if (this.selected) {
                        ctx.strokeStyle = colours_ts_1.GOLD.toString();
                        ctx.lineWidth = 4;
                        ctx.stroke(this.currPath);
                    }
                    ctx.fillStyle = this.colour.toString();
                    ctx.fill(this.currPath);
                    this.ctx = ctx;
                };
                Polyline.prototype.isPointInside = function (point) {
                    var _a;
                    if ((_a = this.ctx) === null || _a === void 0 ? void 0 : _a.isPointInPath(this.currPath, (point.x + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[1], (point.y + 0.5) * this.currPathSpecs[0] + this.currPathSpecs[2])) {
                        return true;
                    }
                    return false;
                };
                Polyline.prototype.setCenter = function () {
                    var topLeft = { x: 0, y: 0 };
                    var bottomRight = { x: 0, y: 0 };
                    for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                        var pt = _a[_i];
                        if (pt.x < topLeft.x) {
                            topLeft.x = pt.x;
                        }
                        else if (pt.x > bottomRight.x) {
                            bottomRight.x = pt.x;
                        }
                        if (pt.y < topLeft.y) {
                            topLeft.y = pt.y;
                        }
                        else if (pt.y > bottomRight.y) {
                            bottomRight.y = pt.y;
                        }
                    }
                    this.centerPoint = {
                        x: (bottomRight.x + topLeft.x) / 2 + this.location.x,
                        y: (bottomRight.y + topLeft.y) / 2 + this.location.y,
                    };
                };
                Polyline.prototype.payloadFromObject = function () {
                    return {
                        kind: objectEvents_ts_1.Shape.Poly,
                        x: this.location.x,
                        y: this.location.y,
                        points: this.points,
                        colour: this.colour,
                        layerId: this.layerId,
                        objectId: this.objectId,
                    };
                };
                Polyline.prototype.updateFromPayload = function (newSetting) {
                    this.location.x = newSetting.x;
                    this.location.y = newSetting.y;
                    this.points = newSetting.points;
                    this.colour = newSetting.colour;
                    this.layerId = newSetting.layerId;
                };
                return Polyline;
            }(BoardObjectBase));
            exports_5("Polyline", Polyline);
            Line = (function (_super) {
                __extends(Line, _super);
                function Line(id, x, y, structure, colour) {
                    var _this = _super.call(this, id, x, y, colour) || this;
                    _this.points = structure;
                    _this.objType = objectEvents_ts_1.Shape.Line;
                    _this.setCenter();
                    return _this;
                }
                Line.prototype.draw = function (ctx, squareSize, offset) {
                    ctx.beginPath();
                    ctx.moveTo(this.location.x * squareSize + offset.x, this.location.y * squareSize + offset.y);
                    for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                        var pt = _a[_i];
                        ctx.lineTo((this.location.x + pt.x) * squareSize + offset.x, (this.location.y + pt.y) * squareSize + offset.y);
                    }
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = this.colour.toString();
                    ctx.stroke();
                };
                Line.prototype.setCenter = function () {
                    var topLeft = { x: 0, y: 0 };
                    var bottomRight = { x: 0, y: 0 };
                    for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
                        var pt = _a[_i];
                        if (pt.x < topLeft.x) {
                            topLeft.x = pt.x;
                        }
                        else if (pt.x > bottomRight.x) {
                            bottomRight.x = pt.x;
                        }
                        if (pt.y < topLeft.y) {
                            topLeft.y = pt.y;
                        }
                        else if (pt.y > bottomRight.y) {
                            bottomRight.y = pt.y;
                        }
                    }
                    this.centerPoint = {
                        x: (bottomRight.x + topLeft.x) / 2 + this.location.x,
                        y: (bottomRight.y + topLeft.y) / 2 + this.location.y,
                    };
                };
                Line.prototype.payloadFromObject = function () {
                    return {
                        kind: objectEvents_ts_1.Shape.Line,
                        x: this.location.x,
                        y: this.location.y,
                        points: this.points,
                        colour: this.colour,
                        layerId: this.layerId,
                        objectId: this.objectId,
                    };
                };
                Line.prototype.updateFromPayload = function (newSetting) {
                    this.location.x = newSetting.x;
                    this.location.y = newSetting.y;
                    this.points = newSetting.points;
                    this.colour = newSetting.colour;
                    this.layerId = newSetting.layerId;
                };
                return Line;
            }(BoardObjectBase));
            exports_5("Line", Line);
        }
    };
});
System.register("boardCanvas/boardLayer", ["objectEvents"], function (exports_6, context_6) {
    "use strict";
    var objectEvents_ts_2, BoardLayer;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (objectEvents_ts_2_1) {
                objectEvents_ts_2 = objectEvents_ts_2_1;
            }
        ],
        execute: function () {
            BoardLayer = (function () {
                function BoardLayer(newOrder, newGM, newPlayer) {
                    this.layerOffset = { x: 0, y: 0 };
                    this.heldObjects = [];
                    this.heldMap = new Map();
                    this.zOrder = newOrder;
                    this.GMVisible = newGM;
                    this.playerVisible = newPlayer;
                }
                BoardLayer.prototype.updateVis = function (newGM, newPlayer) {
                    this.GMVisible = newPlayer;
                    this.playerVisible = newGM;
                };
                BoardLayer.prototype.sortObjects = function () {
                    this.heldObjects = this.heldObjects.sort(function (n1, n2) {
                        if (n1.objType === objectEvents_ts_2.Shape.Token && n2.objType !== objectEvents_ts_2.Shape.Token) {
                            return 1;
                        }
                        if (n1.objType !== objectEvents_ts_2.Shape.Token && n2.objType === objectEvents_ts_2.Shape.Token) {
                            return -1;
                        }
                        if (n1.selected && !n2.selected) {
                            return 1;
                        }
                        if (!n1.selected && n2.selected) {
                            return -1;
                        }
                        if (n1.zOrder > n2.zOrder) {
                            return 1;
                        }
                        if (n1.zOrder < n2.zOrder) {
                            return -1;
                        }
                        return 0;
                    });
                };
                BoardLayer.prototype.addObject = function (newObj, newId) {
                    this.heldObjects.push(newObj);
                    this.heldMap.set(newId, newObj);
                    this.sortObjects();
                };
                BoardLayer.prototype.removeObject = function (removeId) {
                    var toRemove = this.heldMap.get(removeId);
                    if (!toRemove) {
                        alert('Error no object with such Id exists to remove');
                        return false;
                    }
                    var removeIndex = this.heldObjects.indexOf(toRemove);
                    if (!this.heldMap.delete(removeId)) {
                        alert('Error no object with such Id exists to remove');
                        return false;
                    }
                    this.heldObjects.splice(removeIndex, 1);
                    this.sortObjects();
                    this.heldMap.delete(removeId);
                    return true;
                };
                BoardLayer.prototype.moveObject = function (moveId, moveX, moveY) {
                    var targetObj = this.heldMap.get(moveId);
                    if (!targetObj) {
                        return false;
                    }
                    targetObj.move(moveX, moveY);
                    return true;
                };
                BoardLayer.prototype.drawLayer = function (ctx, squareSize, offset, thirdOffset) {
                    if (thirdOffset === void 0) { thirdOffset = { x: 0, y: 0 }; }
                    if (this.GMVisible) {
                        var localOffset = {
                            x: offset.x + this.layerOffset.x,
                            y: offset.y + this.layerOffset.y,
                        };
                        for (var _i = 0, _a = this.heldObjects; _i < _a.length; _i++) {
                            var obj = _a[_i];
                            if (obj.selected) {
                                obj.draw(ctx, squareSize, {
                                    x: localOffset.x + thirdOffset.x,
                                    y: localOffset.y + thirdOffset.y,
                                });
                            }
                            else {
                                obj.draw(ctx, squareSize, localOffset);
                            }
                        }
                    }
                };
                BoardLayer.prototype.shiftLayer = function (moveCoords) {
                    this.layerOffset.x += moveCoords.x;
                    this.layerOffset.y += moveCoords.y;
                };
                BoardLayer.prototype.selectObjects = function (selectCoords, matchType) {
                    if (matchType === void 0) { matchType = 'any'; }
                    var acceptable = [];
                    for (var _i = 0, _a = this.heldObjects; _i < _a.length; _i++) {
                        var candidate = _a[_i];
                        if (selectCoords.length === 1 &&
                            'isPointInside' in candidate &&
                            candidate.isPointInside(selectCoords[0]) &&
                            (candidate.objType === matchType || matchType === 'any')) {
                            acceptable.push(candidate);
                            break;
                        }
                        else if (selectCoords.length === 2 &&
                            candidate.isCenterInsideRect(selectCoords[0], selectCoords[1]) &&
                            (candidate.objType === matchType || matchType === 'any')) {
                            acceptable.push(candidate);
                        }
                    }
                    return acceptable;
                };
                return BoardLayer;
            }());
            exports_6("BoardLayer", BoardLayer);
        }
    };
});
System.register("boardCanvas/boardDrawMode", ["boardCanvas/boardObject", "colours", "dom", "objectEvents"], function (exports_7, context_7) {
    "use strict";
    var boardObject_ts_1, colours_ts_2, dom_ts_1, objectEvents_ts_3, can, modeButton, colourSquare, BoardDrawMode;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (boardObject_ts_1_1) {
                boardObject_ts_1 = boardObject_ts_1_1;
            },
            function (colours_ts_2_1) {
                colours_ts_2 = colours_ts_2_1;
            },
            function (dom_ts_1_1) {
                dom_ts_1 = dom_ts_1_1;
            },
            function (objectEvents_ts_3_1) {
                objectEvents_ts_3 = objectEvents_ts_3_1;
            }
        ],
        execute: function () {
            can = dom_ts_1.getRequiredElement('board', HTMLCanvasElement);
            modeButton = dom_ts_1.getRequiredElement('drawMenuButton', HTMLButtonElement);
            colourSquare = dom_ts_1.getRequiredElement('colourSquare', HTMLElement);
            BoardDrawMode = (function () {
                function BoardDrawMode(parentBoard) {
                    this.board = parentBoard;
                    this.active = false;
                    this.shape = objectEvents_ts_3.Shape.Rect;
                    this.params = [];
                    this.completeObjCheck = false;
                    this.selectMode = false;
                    this.selectState = 0;
                    this.tempObject = null;
                    this.stickTemp = false;
                    this.addEventListeners();
                }
                BoardDrawMode.prototype.flipListeners = function (setOn) {
                    this.active = setOn;
                    modeButton.disabled = setOn;
                    this.params = [];
                    this.selectMode = false;
                    this.selectState = 0;
                    this.completeObjCheck = false;
                };
                BoardDrawMode.prototype.addEventListeners = function () {
                    var _this = this;
                    document.addEventListener('keydown', function (event) {
                        if (_this.active) {
                            _this.selectMode = false;
                        }
                        if (_this.active && _this.params.length === 0) {
                            if (event.key === '1') {
                                _this.shape = objectEvents_ts_3.Shape.Rect;
                            }
                            else if (event.key === '2') {
                                _this.shape = objectEvents_ts_3.Shape.Circle;
                            }
                            else if (event.key === '3') {
                                _this.shape = objectEvents_ts_3.Shape.Poly;
                            }
                            else if (event.key === '4') {
                                _this.shape = objectEvents_ts_3.Shape.Line;
                            }
                            else if (event.key === '6') {
                                _this.shape = objectEvents_ts_3.Shape.Rect;
                                _this.selectMode = true;
                            }
                            _this.params = [];
                        }
                        else if (_this.active &&
                            event.key === '5' &&
                            _this.params.length > 2 &&
                            (_this.shape === objectEvents_ts_3.Shape.Poly || _this.shape === objectEvents_ts_3.Shape.Line)) {
                            _this.setNewObject();
                        }
                        else if (_this.active && event.key === '7') {
                            _this.params = [];
                        }
                    });
                    can.addEventListener('mousedown', function () {
                        if (_this.active) {
                            if (_this.shape !== objectEvents_ts_3.Shape.Poly && _this.shape !== objectEvents_ts_3.Shape.Line) {
                                _this.params.push(_this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false));
                            }
                            else if (_this.params.length > 0) {
                                var res = _this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, true);
                                _this.params.push({
                                    x: res.x - _this.params[0].x,
                                    y: res.y - _this.params[0].y,
                                });
                            }
                            else {
                                _this.params.push(_this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, true));
                            }
                        }
                    });
                    can.addEventListener('mouseup', function () {
                        if (_this.params.length === 0) {
                            return;
                        }
                        else if (_this.active && _this.selectMode) {
                            var newPos = _this.board.determineTile(_this.board.mouseCoords.x + 1, _this.board.mouseCoords.y + 1, false);
                            if (newPos.x === _this.params[0].x &&
                                newPos.y === _this.params[0].y) {
                                _this.selectState = 1;
                            }
                            else {
                                var topLeft = {
                                    x: Math.min(newPos.x, _this.params[0].x),
                                    y: Math.min(newPos.y, _this.params[0].y),
                                };
                                var bottomRight = {
                                    x: Math.max(newPos.x, _this.params[0].x) + 1,
                                    y: Math.max(newPos.y, _this.params[0].y) + 1,
                                };
                                _this.selectState = 2;
                                _this.params = [];
                                _this.params.push(topLeft);
                                _this.params.push(bottomRight);
                            }
                        }
                        else if (_this.active &&
                            _this.shape !== objectEvents_ts_3.Shape.Poly &&
                            _this.shape !== objectEvents_ts_3.Shape.Line) {
                            if (_this.shape === objectEvents_ts_3.Shape.Rect) {
                                var res = _this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false);
                                if (res.x >= _this.params[0].x) {
                                    res.x += 1;
                                }
                                if (res.y >= _this.params[0].y) {
                                    res.y += 1;
                                }
                                _this.params.push({ x: res.x, y: res.y });
                                _this.setNewObject();
                            }
                            else if (_this.shape === objectEvents_ts_3.Shape.Circle) {
                                var res = _this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false);
                                if (res.x >= _this.params[0].x) {
                                    res.x += 1;
                                }
                                if (res.y >= _this.params[0].y) {
                                    res.y += 1;
                                }
                                _this.params.push({ x: res.x, y: res.y });
                                _this.setNewObject();
                            }
                        }
                    });
                };
                BoardDrawMode.prototype.getText = function () {
                    return "        1 : Create Rectangle\n        2 : Create Circle\n        3 : Create Polyline\n        4 : Create Wall\n        5 : Complete Wall/Polyline\n        6 : Select\n        7 : Cancel Draw";
                };
                BoardDrawMode.prototype.setNewObject = function () {
                    var tempObj;
                    if (this.shape === objectEvents_ts_3.Shape.Rect && this.params.length === 2) {
                        var one = Math.min(this.params[0].x, this.params[1].x);
                        var two = Math.min(this.params[0].y, this.params[1].y);
                        var sizes = [
                            Math.abs(this.params[1].x - this.params[0].x),
                            Math.abs(this.params[1].y - this.params[0].y),
                        ];
                        if (this.params[1].x < this.params[0].x) {
                            sizes[0] += 1;
                        }
                        if (this.params[1].y < this.params[0].y) {
                            sizes[1] += 1;
                        }
                        tempObj = {
                            kind: objectEvents_ts_3.Shape.Rect,
                            x: one,
                            y: two,
                            width: sizes[0],
                            height: sizes[1],
                            colour: colourSquare.style.background,
                            layerId: this.board.activeLayer,
                        };
                        this.completeObjCheck = true;
                    }
                    else if (this.shape === objectEvents_ts_3.Shape.Circle && this.params.length === 2) {
                        var newX = Math.min(this.params[0].x, this.params[1].x);
                        var newY = Math.min(this.params[0].y, this.params[1].y);
                        var radius = Math.max(Math.abs(this.params[0].x - this.params[1].x), Math.abs(this.params[0].y - this.params[1].y));
                        tempObj = {
                            kind: objectEvents_ts_3.Shape.Circle,
                            x: newX,
                            y: newY,
                            diameter: radius,
                            colour: colourSquare.style.background,
                            layerId: this.board.activeLayer,
                        };
                        this.completeObjCheck = true;
                    }
                    else if (this.shape === objectEvents_ts_3.Shape.Poly && this.params.length > 2) {
                        tempObj = {
                            kind: objectEvents_ts_3.Shape.Poly,
                            x: this.params[0].x,
                            y: this.params[0].y,
                            points: this.params.slice(1),
                            colour: colourSquare.style.background,
                            layerId: this.board.activeLayer,
                        };
                        this.completeObjCheck = true;
                    }
                    else if (this.shape === objectEvents_ts_3.Shape.Line && this.params.length > 2) {
                        tempObj = {
                            kind: objectEvents_ts_3.Shape.Line,
                            x: this.params[0].x,
                            y: this.params[0].y,
                            points: this.params.slice(1),
                            colour: colourSquare.style.background,
                            layerId: this.board.activeLayer,
                        };
                        this.completeObjCheck = true;
                    }
                    else {
                        return;
                    }
                    this.board.serveInter.createObject({
                        entity: objectEvents_ts_3.Entity.Object,
                        action: objectEvents_ts_3.Action.Create,
                        object: tempObj,
                    });
                    this.params = [];
                    this.tempObject = tempObj;
                    this.stickTemp = true;
                };
                BoardDrawMode.prototype.getTempObject = function () {
                    if (!this.active) {
                        return undefined;
                    }
                    if (this.tempObject !== null) {
                        if (this.tempObject.kind === objectEvents_ts_3.Shape.Rect) {
                            return new boardObject_ts_1.Rect(-1, this.tempObject.x, this.tempObject.y, this.tempObject.width, this.tempObject.height, this.tempObject.colour);
                        }
                        else if (this.tempObject.kind === objectEvents_ts_3.Shape.Circle) {
                            return new boardObject_ts_1.Circle(-1, this.tempObject.x, this.tempObject.y, this.tempObject.diameter, this.tempObject.colour);
                        }
                        else if (this.tempObject.kind === objectEvents_ts_3.Shape.Poly) {
                            return new boardObject_ts_1.Polyline(-1, this.tempObject.x, this.tempObject.y, this.tempObject.points, this.tempObject.colour);
                        }
                        else if (this.tempObject.kind === objectEvents_ts_3.Shape.Line) {
                            return new boardObject_ts_1.Line(-1, this.tempObject.x, this.tempObject.y, this.tempObject.points, this.tempObject.colour);
                        }
                        return this.tempObject;
                    }
                    if (this.shape !== objectEvents_ts_3.Shape.Poly &&
                        this.shape !== objectEvents_ts_3.Shape.Line &&
                        this.params.length >= 1) {
                        var res = this.board.determineTile(this.board.mouseCoords.x, this.board.mouseCoords.y, false);
                        if (this.shape === objectEvents_ts_3.Shape.Rect) {
                            if (res.x >= this.params[0].x) {
                                res.x += 1;
                            }
                            if (res.y >= this.params[0].y) {
                                res.y += 1;
                            }
                            var coords = {
                                x: Math.min(this.params[0].x, res.x),
                                y: Math.min(this.params[0].y, res.y),
                            };
                            var sizes = {
                                x: Math.abs(res.x - this.params[0].x),
                                y: Math.abs(res.y - this.params[0].y),
                            };
                            if (res.x < this.params[0].x) {
                                sizes.x += 1;
                            }
                            if (res.y < this.params[0].y) {
                                sizes.y += 1;
                            }
                            if (this.selectMode) {
                                return new boardObject_ts_1.Rect(-1, coords.x, coords.y, sizes.x, sizes.y, colours_ts_2.WHITE_50);
                            }
                            return new boardObject_ts_1.Rect(-1, coords.x, coords.y, sizes.x, sizes.y, colourSquare.style.background);
                        }
                        else if (this.shape === objectEvents_ts_3.Shape.Circle) {
                            if (res.x >= this.params[0].x) {
                                res.x += 1;
                            }
                            if (res.y >= this.params[0].y) {
                                res.y += 1;
                            }
                            var coords = {
                                x: Math.min(this.params[0].x, res.x),
                                y: Math.min(this.params[0].y, res.y),
                            };
                            var radius = Math.max(Math.abs(this.params[0].x - res.x), Math.abs(this.params[0].y - res.y));
                            var newObj = new boardObject_ts_1.Circle(-1, coords.x, coords.y, radius, colourSquare.style.background);
                            return newObj;
                        }
                    }
                    else if (this.params.length >= 2 && this.shape === objectEvents_ts_3.Shape.Poly) {
                        var newParams = this.params.slice(1);
                        var newObj = new boardObject_ts_1.Polyline(-1, this.params[0].x, this.params[0].y, newParams, colourSquare.style.background);
                        return newObj;
                    }
                    else if (this.params.length >= 2 && this.shape === objectEvents_ts_3.Shape.Line) {
                        var newParams = this.params.slice(1);
                        var newObj = new boardObject_ts_1.Line(-1, this.params[0].x, this.params[0].y, newParams, colourSquare.style.background);
                        return newObj;
                    }
                    return undefined;
                };
                BoardDrawMode.prototype.clearObject = function () {
                    if (!this.stickTemp) {
                        this.tempObject = null;
                    }
                    this.stickTemp = false;
                };
                return BoardDrawMode;
            }());
            exports_7("BoardDrawMode", BoardDrawMode);
        }
    };
});
System.register("boardCanvas/boardSelectMode", ["dom", "objectEvents"], function (exports_8, context_8) {
    "use strict";
    var dom_ts_2, objectEvents_ts_4, can, colourSquare, BoardSelectMode;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (dom_ts_2_1) {
                dom_ts_2 = dom_ts_2_1;
            },
            function (objectEvents_ts_4_1) {
                objectEvents_ts_4 = objectEvents_ts_4_1;
            }
        ],
        execute: function () {
            can = dom_ts_2.getRequiredElement('board', HTMLCanvasElement);
            colourSquare = dom_ts_2.getRequiredElement('colourSquare', HTMLElement);
            BoardSelectMode = (function () {
                function BoardSelectMode(parentBoard) {
                    this.board = parentBoard;
                    this.active = false;
                    this.exitOnNextStep = false;
                    this.selectedObjects = [];
                    this.selectClick = false;
                    this.thirdOffset = { x: 0, y: 0 };
                    this.currColour = 'none';
                    this.addEventListeners();
                }
                BoardSelectMode.prototype.flipListeners = function (setOn) {
                    for (var _i = 0, _a = this.selectedObjects; _i < _a.length; _i++) {
                        var obj = _a[_i];
                        obj.setSelected(false);
                    }
                    this.active = setOn;
                    this.selectedObjects = [];
                    this.exitOnNextStep = false;
                    this.currColour = colourSquare.style.background;
                    this.selectClick = this.board.leftMouseDown;
                    this.thirdOffset = { x: 0, y: 0 };
                };
                BoardSelectMode.prototype.addEventListeners = function () {
                    var _this = this;
                    can.addEventListener('mousemove', function (event) {
                        if (_this.active && _this.selectClick) {
                            var change = {
                                x: Math.round(_this.board.mouseCoords.x - event.clientX),
                                y: Math.round(_this.board.mouseCoords.y - event.clientY),
                            };
                            _this.thirdOffset.x -= change.x;
                            _this.thirdOffset.y -= change.y;
                        }
                    });
                    can.addEventListener('mousedown', function (event) {
                        if (_this.active) {
                            var point = _this.board.determineTile(event.clientX, event.clientY, false);
                            for (var _i = 0, _a = _this.selectedObjects; _i < _a.length; _i++) {
                                var candidate = _a[_i];
                                if ('isPointInside' in candidate &&
                                    candidate.isPointInside(point)) {
                                    _this.selectClick = true;
                                    break;
                                }
                            }
                        }
                    });
                    can.addEventListener('mouseup', function () {
                        if (_this.active && _this.selectClick) {
                            _this.moveObjects();
                            _this.selectClick = false;
                            if (_this.selectedObjects.length === 1 &&
                                _this.selectedObjects[0].objType === objectEvents_ts_4.Shape.Token) {
                                _this.exitOnNextStep = true;
                            }
                        }
                    });
                    document.addEventListener('keydown', function (event) {
                        if (_this.active && event.key === 'Escape') {
                            _this.exitOnNextStep = true;
                        }
                        else if (_this.active && event.key === 'Backspace') {
                            var idList = [];
                            for (var _i = 0, _a = _this.selectedObjects; _i < _a.length; _i++) {
                                var obj = _a[_i];
                                idList.push(obj.objectId);
                            }
                            _this.board.serveInter.destroyObjects(idList);
                            _this.exitOnNextStep = true;
                        }
                    });
                };
                BoardSelectMode.prototype.moveObjects = function () {
                    var point = this.board.determineTile(this.board.originCoords.x + this.thirdOffset.x, this.board.originCoords.y + this.thirdOffset.y, true);
                    var moveList = [];
                    for (var _i = 0, _a = this.selectedObjects; _i < _a.length; _i++) {
                        var i = _a[_i];
                        moveList.push({
                            entity: objectEvents_ts_4.Entity.Object,
                            action: objectEvents_ts_4.Action.Move,
                            objectId: i.objectId,
                            x: point.x,
                            y: point.y,
                        });
                        i.move(point.x, point.y);
                    }
                    this.board.serveInter.moveObjects(moveList);
                    this.thirdOffset.x = 0;
                    this.thirdOffset.y = 0;
                };
                BoardSelectMode.prototype.recolour = function () {
                    if (this.currColour !== colourSquare.style.background) {
                        this.currColour = colourSquare.style.background;
                        var recolourList = [];
                        for (var _i = 0, _a = this.selectedObjects; _i < _a.length; _i++) {
                            var obj = _a[_i];
                            recolourList.push({
                                entity: objectEvents_ts_4.Entity.Object,
                                action: objectEvents_ts_4.Action.Recolour,
                                objectId: obj.objectId,
                                colour: this.currColour,
                            });
                            obj.setColour(this.currColour);
                        }
                        this.board.serveInter.recolourObjects(recolourList);
                    }
                };
                BoardSelectMode.prototype.getText = function () {
                    return 'nah';
                };
                BoardSelectMode.prototype.setSelected = function (newObjs) {
                    this.selectedObjects = newObjs;
                    for (var _i = 0, _a = this.selectedObjects; _i < _a.length; _i++) {
                        var obj = _a[_i];
                        obj.setSelected(true);
                    }
                };
                return BoardSelectMode;
            }());
            exports_8("BoardSelectMode", BoardSelectMode);
        }
    };
});
System.register("boardCanvas/boardTokenMode", ["boardCanvas/boardObject", "colours", "dom", "objectEvents"], function (exports_9, context_9) {
    "use strict";
    var boardObject_ts_2, colours_ts_3, dom_ts_3, objectEvents_ts_5, can, modeButton, sizeInput, nameInput, sizeLabel, nameLabel, colourSquare, BoardTokenMode;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (boardObject_ts_2_1) {
                boardObject_ts_2 = boardObject_ts_2_1;
            },
            function (colours_ts_3_1) {
                colours_ts_3 = colours_ts_3_1;
            },
            function (dom_ts_3_1) {
                dom_ts_3 = dom_ts_3_1;
            },
            function (objectEvents_ts_5_1) {
                objectEvents_ts_5 = objectEvents_ts_5_1;
            }
        ],
        execute: function () {
            can = dom_ts_3.getRequiredElement('board', HTMLCanvasElement);
            modeButton = dom_ts_3.getRequiredElement('tokenMenuButton', HTMLButtonElement);
            sizeInput = dom_ts_3.getRequiredElement('tokenSize', HTMLInputElement);
            nameInput = dom_ts_3.getRequiredElement('tokenName', HTMLInputElement);
            sizeLabel = dom_ts_3.getRequiredElement('tokenSizeLabel', HTMLLabelElement);
            nameLabel = dom_ts_3.getRequiredElement('tokenNameLabel', HTMLLabelElement);
            colourSquare = dom_ts_3.getRequiredElement('colourSquare', HTMLElement);
            BoardTokenMode = (function () {
                function BoardTokenMode(parentBoard) {
                    this.board = parentBoard;
                    this.active = false;
                    this.params = [];
                    this.shift = false;
                    this.completeSelectCheck = false;
                    this.currHover = undefined;
                    this.newTokenCheck = false;
                    this.addEventListeners();
                }
                BoardTokenMode.prototype.flipListeners = function (setOn) {
                    this.active = setOn;
                    modeButton.disabled = setOn;
                    if (setOn) {
                        sizeInput.value = '1';
                        nameInput.value = 'Gremlin';
                        sizeInput.style.visibility = 'visible';
                        nameInput.style.visibility = 'visible';
                        sizeLabel.style.visibility = 'visible';
                        nameLabel.style.visibility = 'visible';
                    }
                    else {
                        sizeInput.style.visibility = 'hidden';
                        nameInput.style.visibility = 'hidden';
                        sizeLabel.style.visibility = 'hidden';
                        nameLabel.style.visibility = 'hidden';
                    }
                };
                BoardTokenMode.prototype.addEventListeners = function () {
                    var _this = this;
                    can.addEventListener('mousemove', function () {
                        if (_this.active) {
                            _this.currHover = _this.board.selectToken([
                                _this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false),
                            ]);
                        }
                    });
                    can.addEventListener('mousedown', function () {
                        if (_this.active) {
                            if (!_this.shift) {
                                var res = _this.board.selectToken([
                                    _this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false),
                                ]);
                                _this.currHover = res;
                                if (!_this.currHover) {
                                    _this.createToken();
                                    _this.newTokenCheck = true;
                                }
                                else {
                                    _this.completeSelectCheck = true;
                                }
                            }
                            else {
                                _this.params.push(_this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false));
                            }
                        }
                    });
                    can.addEventListener('mouseup', function () {
                        if (_this.active) {
                            if (_this.shift) {
                                _this.params.push(_this.board.determineTile(_this.board.mouseCoords.x, _this.board.mouseCoords.y, false));
                                var newCoords = [];
                                newCoords.push({
                                    x: Math.min(_this.params[0].x, _this.params[1].x),
                                    y: Math.min(_this.params[0].y, _this.params[1].y),
                                });
                                newCoords.push({
                                    x: Math.max(_this.params[0].x, _this.params[1].x) + 1,
                                    y: Math.max(_this.params[0].y, _this.params[1].y) + 1,
                                });
                                _this.params = newCoords;
                                _this.completeSelectCheck = true;
                            }
                        }
                    });
                    document.addEventListener('keydown', function (event) {
                        if (_this.active && event.key === 'Shift') {
                            _this.shift = true;
                        }
                    });
                    document.addEventListener('keyup', function (event) {
                        if (event.key === 'Shift') {
                            _this.shift = false;
                        }
                    });
                    sizeInput.addEventListener('input', function () {
                        if (sizeInput.value.length > 3) {
                            sizeInput.value = '1';
                        }
                        else {
                            for (var _i = 0, _a = sizeInput.value; _i < _a.length; _i++) {
                                var char = _a[_i];
                                if (char.charCodeAt(0) < 48 || char.charCodeAt(0) > 57) {
                                    sizeInput.value = '1';
                                    break;
                                }
                            }
                            if (parseInt(sizeInput.value, 10) < 1) {
                                sizeInput.value = '1';
                            }
                            else if (parseInt(sizeInput.value, 10) > 300) {
                                alert('u have no legitimate need to make a token this big\npls be serious');
                                sizeInput.value = '1';
                            }
                        }
                    });
                };
                BoardTokenMode.prototype.getText = function () {
                    return 'Left Click : Create Token\nLeft Click on Token : Select Token\nShift + Left Click : Select Tokens';
                };
                BoardTokenMode.prototype.createToken = function () {
                    if (nameInput.value && sizeInput.value) {
                        var coords = this.board.determineTile(this.board.mouseCoords.x, this.board.mouseCoords.y, false);
                        this.board.serveInter.createObject({
                            entity: objectEvents_ts_5.Entity.Object,
                            action: objectEvents_ts_5.Action.Create,
                            object: {
                                kind: objectEvents_ts_5.Shape.Token,
                                x: coords.x,
                                y: coords.y,
                                diameter: parseInt(sizeInput.value, 10),
                                colour: colourSquare.style.background,
                                name: nameInput.value,
                                layerId: this.board.activeLayer,
                            },
                        });
                    }
                };
                BoardTokenMode.prototype.tryDrawLabel = function (ctx, squareSize, offset) {
                    var _a;
                    (_a = this.currHover) === null || _a === void 0 ? void 0 : _a.drawLabel(ctx, squareSize, offset);
                };
                BoardTokenMode.prototype.getNewHover = function () {
                    if (this.newTokenCheck) {
                        this.currHover = this.board.selectToken([
                            this.board.determineTile(this.board.mouseCoords.x, this.board.mouseCoords.y, false),
                        ]);
                    }
                };
                BoardTokenMode.prototype.getTempObject = function () {
                    if (this.params.length > 0) {
                        var res = this.board.determineTile(this.board.mouseCoords.x, this.board.mouseCoords.y, false);
                        var coords = { x: 0, y: 0 };
                        if (res.x >= this.params[0].x) {
                            res.x += 1;
                        }
                        if (res.y >= this.params[0].y) {
                            res.y += 1;
                        }
                        coords = {
                            x: Math.min(this.params[0].x, res.x),
                            y: Math.min(this.params[0].y, res.y),
                        };
                        var sizes = [
                            Math.abs(res.x - this.params[0].x),
                            Math.abs(res.y - this.params[0].y),
                        ];
                        if (res.x < this.params[0].x) {
                            sizes[0] += 1;
                        }
                        if (res.y < this.params[0].y) {
                            sizes[1] += 1;
                        }
                        return new boardObject_ts_2.Rect(-1, coords.x, coords.y, sizes[0], sizes[1], colours_ts_3.WHITE_50);
                    }
                    return undefined;
                };
                BoardTokenMode.prototype.getNewObject = function () {
                    this.getNewHover();
                    this.newTokenCheck = false;
                    return this.createToken();
                };
                return BoardTokenMode;
            }());
            exports_9("BoardTokenMode", BoardTokenMode);
        }
    };
});
System.register("boardCanvas/boardViewMode", ["dom"], function (exports_10, context_10) {
    "use strict";
    var dom_ts_4, can, modeButton, BoardViewMode;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (dom_ts_4_1) {
                dom_ts_4 = dom_ts_4_1;
            }
        ],
        execute: function () {
            can = dom_ts_4.getRequiredElement('board', HTMLCanvasElement);
            modeButton = dom_ts_4.getRequiredElement('viewMenuButton', HTMLButtonElement);
            BoardViewMode = (function () {
                function BoardViewMode(parentBoard) {
                    this.board = parentBoard;
                    this.active = true;
                    this.addEventListeners();
                }
                BoardViewMode.prototype.flipListeners = function (setOn) {
                    this.active = setOn;
                    modeButton.disabled = setOn;
                };
                BoardViewMode.prototype.addEventListeners = function () {
                    var _this = this;
                    can.addEventListener('mousemove', function (event) {
                        if (_this.active) {
                            var change = {
                                x: Math.round(_this.board.mouseCoords.x - event.clientX),
                                y: Math.round(_this.board.mouseCoords.y - event.clientY),
                            };
                            if (_this.board.leftMouseDown) {
                                _this.board.moveCamera(change.x, change.y);
                            }
                        }
                    });
                    can.addEventListener('wheel', function (event) {
                        if (_this.active) {
                            var old = _this.board.zoomVal;
                            if (event.deltaY < 0 &&
                                _this.board.zoomGlobal < _this.board.zoomLevels.length - 1) {
                                _this.board.zoomGlobal += 1;
                                _this.board.zoomVal =
                                    _this.board.zoomLevels[_this.board.zoomGlobal];
                                var originDist = {
                                    x: _this.board.mouseCoords.x - _this.board.originCoords.x,
                                    y: _this.board.mouseCoords.y - _this.board.originCoords.y,
                                };
                                var goals = {
                                    x: (originDist.x * _this.board.zoomVal) / old,
                                    y: (originDist.y * _this.board.zoomVal) / old,
                                };
                                _this.board.originCoords.x -= goals.x - originDist.x;
                                _this.board.originCoords.y -= goals.y - originDist.y;
                            }
                            else if (event.deltaY > 0 && _this.board.zoomGlobal > 0) {
                                _this.board.zoomGlobal -= 1;
                                _this.board.zoomVal =
                                    _this.board.zoomLevels[_this.board.zoomGlobal];
                                var originDist = {
                                    x: _this.board.mouseCoords.x - _this.board.originCoords.x,
                                    y: _this.board.mouseCoords.y - _this.board.originCoords.y,
                                };
                                var goals = {
                                    x: (originDist.x * _this.board.zoomVal) / old,
                                    y: (originDist.y * _this.board.zoomVal) / old,
                                };
                                _this.board.originCoords.x -= goals.x - originDist.x;
                                _this.board.originCoords.y -= goals.y - originDist.y;
                            }
                            _this.board.originCoords.x =
                                Math.round(_this.board.originCoords.x * 10000) / 10000;
                            _this.board.originCoords.y =
                                Math.round(_this.board.originCoords.y * 10000) / 10000;
                        }
                    });
                };
                BoardViewMode.prototype.getText = function () {
                    return 'Scroll : Zoom\nLeft Click + Drag : Pan';
                };
                return BoardViewMode;
            }());
            exports_10("BoardViewMode", BoardViewMode);
        }
    };
});
System.register("boardCanvas/modeManager", ["boardCanvas/boardDrawMode", "objectEvents", "boardCanvas/boardSelectMode", "boardCanvas/boardTokenMode", "boardCanvas/boardViewMode", "dom"], function (exports_11, context_11) {
    "use strict";
    var boardDrawMode_ts_1, objectEvents_ts_6, boardSelectMode_ts_1, boardTokenMode_ts_1, boardViewMode_ts_1, dom_ts_5, modeParagraph, viewButton, tokenButton, drawButton, can, Mode, GetObjectReason, ModeManager;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (boardDrawMode_ts_1_1) {
                boardDrawMode_ts_1 = boardDrawMode_ts_1_1;
            },
            function (objectEvents_ts_6_1) {
                objectEvents_ts_6 = objectEvents_ts_6_1;
            },
            function (boardSelectMode_ts_1_1) {
                boardSelectMode_ts_1 = boardSelectMode_ts_1_1;
            },
            function (boardTokenMode_ts_1_1) {
                boardTokenMode_ts_1 = boardTokenMode_ts_1_1;
            },
            function (boardViewMode_ts_1_1) {
                boardViewMode_ts_1 = boardViewMode_ts_1_1;
            },
            function (dom_ts_5_1) {
                dom_ts_5 = dom_ts_5_1;
            }
        ],
        execute: function () {
            modeParagraph = dom_ts_5.getRequiredElement('modeParagraph', HTMLElement);
            viewButton = dom_ts_5.getRequiredElement('viewMenuButton', HTMLButtonElement);
            tokenButton = dom_ts_5.getRequiredElement('tokenMenuButton', HTMLButtonElement);
            drawButton = dom_ts_5.getRequiredElement('drawMenuButton', HTMLButtonElement);
            can = dom_ts_5.getRequiredElement('board', HTMLCanvasElement);
            (function (Mode) {
                Mode["View"] = "VIEW";
                Mode["Draw"] = "DRAW";
                Mode["Token"] = "TOKEN";
            })(Mode || (exports_11("Mode", Mode = {})));
            (function (GetObjectReason) {
                GetObjectReason["Draw"] = "DRAW";
                GetObjectReason["Create"] = "CREATE";
            })(GetObjectReason || (exports_11("GetObjectReason", GetObjectReason = {})));
            ModeManager = (function () {
                function ModeManager(parentBoard) {
                    this.board = parentBoard;
                    this.currMode = Mode.View;
                    this.viewMan = new boardViewMode_ts_1.BoardViewMode(parentBoard);
                    this.tokenMan = new boardTokenMode_ts_1.BoardTokenMode(parentBoard);
                    this.drawMan = new boardDrawMode_ts_1.BoardDrawMode(parentBoard);
                    this.selectMan = new boardSelectMode_ts_1.BoardSelectMode(parentBoard);
                    this.selectInstruct = document.getElementById('selectInstruct');
                    this.selectClick = false;
                    this.addEventListeners();
                    this.modifyText(this.viewMan);
                    this.viewMan.flipListeners(true);
                    this.selectInstruct.style.visibility = 'hidden';
                }
                ModeManager.prototype.addEventListeners = function () {
                    var _this = this;
                    viewButton.addEventListener('click', function () {
                        _this.currMode = Mode.View;
                        _this.viewMan.flipListeners(true);
                        _this.tokenMan.flipListeners(false);
                        _this.drawMan.flipListeners(false);
                        _this.selectMan.flipListeners(false);
                        _this.modifyText(_this.viewMan);
                        _this.selectInstruct.style.visibility = 'hidden';
                    });
                    tokenButton.addEventListener('click', function () {
                        _this.currMode = Mode.Token;
                        _this.viewMan.flipListeners(false);
                        _this.tokenMan.flipListeners(true);
                        _this.drawMan.flipListeners(false);
                        _this.selectMan.flipListeners(false);
                        _this.modifyText(_this.tokenMan);
                        _this.selectInstruct.style.visibility = 'visible';
                    });
                    drawButton.addEventListener('click', function () {
                        _this.currMode = Mode.Draw;
                        _this.viewMan.flipListeners(false);
                        _this.tokenMan.flipListeners(false);
                        _this.drawMan.flipListeners(true);
                        _this.selectMan.flipListeners(false);
                        _this.modifyText(_this.drawMan);
                        _this.selectInstruct.style.visibility = 'visible';
                    });
                    can.addEventListener('mousemove', function (event) {
                        _this.board.mouseCoords.x = event.clientX;
                        _this.board.mouseCoords.y = event.clientY;
                    });
                    can.addEventListener('mousedown', function () {
                        _this.board.leftMouseDown = true;
                    }, { capture: true });
                    can.addEventListener('mouseup', function () {
                        _this.board.leftMouseDown = false;
                    }, { capture: true });
                };
                ModeManager.prototype.modifyText = function (selectMode) {
                    modeParagraph.innerText = selectMode.getText();
                };
                ModeManager.prototype.hasCompleteSelection = function () {
                    if (this.currMode === Mode.Draw && this.drawMan.selectState > 0) {
                        return true;
                    }
                    else if (this.currMode === Mode.Token &&
                        this.tokenMan.completeSelectCheck) {
                        return true;
                    }
                    return false;
                };
                ModeManager.prototype.getSelectCoords = function () {
                    if (this.currMode === Mode.Draw && this.drawMan.selectState !== 0) {
                        return this.drawMan.params;
                    }
                    else if (this.currMode === Mode.Token &&
                        this.tokenMan.completeSelectCheck) {
                        return this.tokenMan.params;
                    }
                    return [{ x: 0, y: 0 }];
                };
                ModeManager.prototype.getObject = function (reason) {
                    if (reason === GetObjectReason.Draw) {
                        if (this.currMode === Mode.Draw) {
                            return this.drawMan.getTempObject();
                        }
                        else if (this.currMode === Mode.Token) {
                            return this.tokenMan.getTempObject();
                        }
                    }
                    return undefined;
                };
                ModeManager.prototype.clearTemp = function () {
                    if (this.currMode === Mode.Draw) {
                        this.drawMan.clearObject();
                    }
                };
                ModeManager.prototype.getSelected = function () {
                    return this.selectMan.selectedObjects;
                };
                ModeManager.prototype.clearSelected = function () {
                    this.exitSelected();
                };
                ModeManager.prototype.enterSelected = function () {
                    var res = this.board.selectObjects();
                    if (this.currMode === Mode.Token && this.tokenMan.params.length === 0) {
                        res = [this.tokenMan.currHover];
                        this.tokenMan.currHover = undefined;
                    }
                    else if (this.currMode === Mode.Token) {
                        res = this.board.selectObjects(objectEvents_ts_6.Shape.Token);
                    }
                    var selected = res.filter(function (obj) { return obj !== undefined; });
                    if (selected.length !== 0) {
                        this.selectMan.flipListeners(true);
                        this.selectMan.setSelected(selected);
                        if (this.currMode === Mode.Draw) {
                            this.drawMan.active = false;
                            this.drawMan.selectState = 0;
                            this.drawMan.params = [];
                        }
                        else if (this.currMode === Mode.Token) {
                            this.tokenMan.active = false;
                            this.tokenMan.completeSelectCheck = false;
                            this.tokenMan.params = [];
                        }
                    }
                    else {
                        if (this.currMode === Mode.Draw) {
                            this.drawMan.selectState = 0;
                            this.drawMan.params = [];
                        }
                        else if (this.currMode === Mode.Token) {
                            this.tokenMan.completeSelectCheck = false;
                            this.tokenMan.params = [];
                        }
                    }
                };
                ModeManager.prototype.exitSelected = function () {
                    this.selectMan.flipListeners(false);
                    if (this.currMode === Mode.Draw) {
                        this.drawMan.active = true;
                    }
                    else if (this.currMode === Mode.Token) {
                        this.tokenMan.active = true;
                    }
                };
                ModeManager.prototype.attemptSelectedSwap = function () {
                    if (!this.selectMan.active && this.hasCompleteSelection()) {
                        this.enterSelected();
                    }
                    else if (this.selectMan.active && this.selectMan.exitOnNextStep) {
                        this.exitSelected();
                    }
                };
                ModeManager.prototype.step = function (ctx, squareSize, offset) {
                    this.attemptSelectedSwap();
                    if (this.tokenMan.active) {
                        this.tokenMan.tryDrawLabel(ctx, squareSize, offset);
                        this.tokenMan.getNewHover();
                    }
                    if (this.selectMan.active) {
                        this.selectMan.recolour();
                    }
                };
                return ModeManager;
            }());
            exports_11("ModeManager", ModeManager);
        }
    };
});
System.register("rightBar/rollBarMenu", ["colours", "dom"], function (exports_12, context_12) {
    "use strict";
    var colours_ts_4, dom_ts_6, rightBar, chatBox, rollBox, colBox, RollMenu;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (colours_ts_4_1) {
                colours_ts_4 = colours_ts_4_1;
            },
            function (dom_ts_6_1) {
                dom_ts_6 = dom_ts_6_1;
            }
        ],
        execute: function () {
            rightBar = dom_ts_6.getRequiredElement('rightBar', HTMLElement);
            chatBox = dom_ts_6.getRequiredElement('chatBox', HTMLElement);
            rollBox = dom_ts_6.getRequiredElement('rollContainer', HTMLElement);
            colBox = dom_ts_6.getRequiredElement('colContainer', HTMLElement);
            RollMenu = (function () {
                function RollMenu(server) {
                    this.textBox = document.createElement('textarea');
                    this.active = false;
                    this.modifier = 0;
                    this.currChats = [];
                    this.textBox.style.visibility = 'hidden';
                    this.textBox.style.pointerEvents = 'none';
                    chatBox.style.visibility = 'hidden';
                    chatBox.style.pointerEvents = 'none';
                    this.setMainElements();
                    this.setRollElements();
                    this.constructChats();
                    this.serveInter = server;
                }
                RollMenu.prototype.setMainElements = function () {
                    chatBox.append(this.textBox);
                    chatBox.style.background = colours_ts_4.GREY.toString();
                };
                RollMenu.prototype.setRollElements = function () {
                    var _this = this;
                    var count = 0;
                    var _loop_1 = function (i) {
                        var newBox = document.createElement('div');
                        rollBox.append(newBox);
                        newBox.style.position = 'absolute';
                        newBox.style.width = '100px';
                        newBox.style.height = '20px';
                        newBox.style.top = count * 30 + 5 + 'px';
                        newBox.style.left = '10px';
                        if (i !== 3 && i !== 101) {
                            var newText = document.createElement('p');
                            var setCount_1 = document.createElement('input');
                            var roll = document.createElement('input');
                            roll.type = 'button';
                            newBox.append(newText);
                            newBox.append(setCount_1);
                            newBox.append(roll);
                            newText.style.position = 'absolute';
                            newText.style.width = '30px';
                            newText.style.height = '20px';
                            newText.style.top = '-13px';
                            newText.style.left = '0px';
                            newText.innerText = 'Roll';
                            setCount_1.style.position = 'absolute';
                            setCount_1.style.width = '40px';
                            setCount_1.style.height = '20px';
                            setCount_1.style.top = '0px';
                            setCount_1.style.left = '30px';
                            setCount_1.value = '1';
                            roll.style.position = 'absolute';
                            roll.style.width = '50px';
                            roll.style.height = '20px';
                            roll.style.left = '80px';
                            roll.style.top = '3px';
                            roll.value = "D".concat(i);
                            setCount_1.addEventListener('input', function () {
                                if (Number(setCount_1.value) &&
                                    Math.abs(Number(setCount_1.value)) < 9999) {
                                    _this.modifier = Number(setCount_1.value);
                                }
                                else if (Number(setCount_1.value) > 0) {
                                    setCount_1.value = '9999';
                                }
                                else if (Number(setCount_1.value)) {
                                    setCount_1.value = '-9999';
                                }
                                else {
                                    setCount_1.value = '0';
                                }
                            });
                            roll.addEventListener('click', function () {
                                _this.constructPayload(i, Number(setCount_1.value), false, false);
                            });
                        }
                        else if (i === 3) {
                            var rollAdv = document.createElement('input');
                            var rollDis = document.createElement('input');
                            rollAdv.type = 'button';
                            rollDis.type = 'button';
                            rollAdv.value = 'Roll 2d20 (Adv)';
                            rollDis.value = 'Roll 2d20 (Disadv)';
                            newBox.append(rollAdv);
                            newBox.append(rollDis);
                            rollAdv.style.position = 'absolute';
                            rollAdv.style.width = '100px';
                            rollAdv.style.height = '20px';
                            rollAdv.style.left = '0px';
                            rollAdv.style.top = '3px';
                            rollDis.style.position = 'absolute';
                            rollDis.style.width = '120px';
                            rollDis.style.height = '20px';
                            rollDis.style.left = '110px';
                            rollDis.style.top = '3px';
                            rollAdv.addEventListener('click', function () {
                                _this.constructPayload(20, 2, true, false);
                            });
                            rollDis.addEventListener('click', function () {
                                _this.constructPayload(20, 2, false, true);
                            });
                        }
                        else if (i === 101) {
                            var newText = document.createElement('p');
                            var setCount_2 = document.createElement('input');
                            newBox.append(newText);
                            newBox.append(setCount_2);
                            newText.style.position = 'absolute';
                            newText.style.width = '30px';
                            newText.style.height = '20px';
                            newText.style.top = '-13px';
                            newText.style.left = '0px';
                            newText.innerText = 'Mod';
                            setCount_2.style.position = 'absolute';
                            setCount_2.style.width = '40px';
                            setCount_2.style.height = '20px';
                            setCount_2.style.top = '0px';
                            setCount_2.style.left = '30px';
                            setCount_2.value = '0';
                            setCount_2.addEventListener('input', function () {
                                if (Number(setCount_2.value) &&
                                    Math.abs(Number(setCount_2.value)) < 9999) {
                                    _this.modifier = Number(setCount_2.value);
                                }
                                else if (Number(setCount_2.value) > 0) {
                                    setCount_2.value = '9999';
                                    _this.modifier = 9999;
                                }
                                else if (Number(setCount_2.value)) {
                                    setCount_2.value = '-9999';
                                    _this.modifier = -9999;
                                }
                                else {
                                    setCount_2.value = '1';
                                    _this.modifier = 1;
                                }
                            });
                        }
                        count++;
                    };
                    for (var _i = 0, _a = [3, 4, 6, 8, 10, 12, 20, 100, 101]; _i < _a.length; _i++) {
                        var i = _a[_i];
                        _loop_1(i);
                    }
                };
                RollMenu.prototype.toggleActive = function (newAct) {
                    this.active = newAct;
                    rollBox.style.visibility = this.active ? 'visible' : 'hidden';
                    rollBox.style.pointerEvents = this.active ? 'auto' : 'none';
                    colBox.style.visibility = this.active ? 'hidden' : 'visible';
                    colBox.style.pointerEvents = this.active ? 'none' : 'auto';
                    chatBox.style.visibility = this.active ? 'visible' : 'hidden';
                    chatBox.style.pointerEvents = this.active ? 'auto' : 'none';
                    for (var _i = 0, _a = this.currChats; _i < _a.length; _i++) {
                        var text = _a[_i];
                        text.style.visibility = this.active ? 'visible' : 'hidden';
                    }
                };
                RollMenu.prototype.step = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var rH, rW, w, data;
                        return __generator(this, function (_a) {
                            rH = rightBar.style.height;
                            rW = rightBar.style.width;
                            if (chatBox.style.height !== rH || chatBox.style.width !== rW) {
                                chatBox.style.width = rW;
                                chatBox.style.height = rH;
                                w = parseInt(rW, 10);
                                if (!Number.isNaN(w)) {
                                    this.textBox.style.width = "".concat(w - 30, "px");
                                }
                            }
                            data = this.serveInter.getDice();
                            if (data) {
                                this.updateChats(data.map, data.start);
                            }
                            return [2];
                        });
                    });
                };
                RollMenu.prototype.constructChats = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var i;
                        return __generator(this, function (_a) {
                            for (i = 0; i < 50; i++) {
                                this.constructChat(i);
                            }
                            return [2];
                        });
                    });
                };
                RollMenu.prototype.constructChat = function (currIndex) {
                    var newBox = document.createElement('div');
                    var newText = document.createElement('p');
                    chatBox.append(newBox);
                    newBox.append(newText);
                    newBox.style.position = 'absolute';
                    newBox.style.bottom = currIndex * 30 + 10 + 'px';
                    newBox.style.left = '10px';
                    newBox.style.width = '100px';
                    newBox.style.height = '30px';
                    newText.style.position = 'absolute';
                    newText.style.width = '100px';
                    newText.style.height = '30px';
                    this.currChats.push(newText);
                };
                RollMenu.prototype.updateChats = function (data, startIndex) {
                    var currIndex = startIndex;
                    var curr = 0;
                    while (currIndex != (startIndex + 1) % 50) {
                        currIndex = (currIndex + 49) % 50;
                        if (data.has(currIndex)) {
                            this.updateChat(data.get(currIndex), curr);
                        }
                        curr++;
                    }
                };
                RollMenu.prototype.updateChat = function (dataLine, currIndex) {
                    this.currChats[currIndex].innerText = "Rolled ".concat(dataLine.result);
                    this.currChats[currIndex].style.visibility = 'visible';
                };
                RollMenu.prototype.constructPayload = function (diceSize, diceCount, advantage, disadvantage) {
                    var currLoad = {
                        four: 0,
                        six: 0,
                        eight: 0,
                        ten: 0,
                        twelve: 0,
                        twenty: 0,
                        hundred: 0,
                        dropLow: 0,
                        dropHigh: 0,
                        singleDice: true,
                        singleNum: diceSize,
                        modifier: this.modifier,
                        result: 0,
                    };
                    switch (diceSize) {
                        case 4:
                            currLoad.four = diceCount;
                        case 6:
                            currLoad.six = diceCount;
                        case 8:
                            currLoad.eight = diceCount;
                        case 10:
                            currLoad.ten = diceCount;
                        case 12:
                            currLoad.twelve = diceCount;
                        case 20:
                            currLoad.twenty = diceCount;
                        case 100:
                            currLoad.hundred = diceCount;
                    }
                    if (advantage) {
                        currLoad.dropHigh = 1;
                    }
                    if (disadvantage) {
                        currLoad.dropLow = 1;
                    }
                    this.serveInter.rollDice(currLoad);
                };
                return RollMenu;
            }());
            exports_12("RollMenu", RollMenu);
        }
    };
});
System.register("serveInter", ["objectEvents"], function (exports_13, context_13) {
    "use strict";
    var objectEvents_ts_7, tempStore;
    var __moduleName = context_13 && context_13.id;
    function comparePayloads(serveObj, cliObj) {
        if (serveObj.kind !== cliObj.kind) {
            return false;
        }
        if (serveObj.x !== cliObj.x ||
            serveObj.y !== cliObj.y ||
            serveObj.colour !== cliObj.colour ||
            serveObj.layerId !== cliObj.layerId) {
            return false;
        }
        return true;
    }
    return {
        setters: [
            function (objectEvents_ts_7_1) {
                objectEvents_ts_7 = objectEvents_ts_7_1;
            }
        ],
        execute: function () {
            tempStore = (function () {
                function tempStore() {
                    this.storedObjects = new Map();
                    this.storedLayers = new Map();
                    this.recentCreation = [];
                    this.currIndex = 0;
                    this.prevMapping = new Map();
                }
                tempStore.prototype.rollDice = function (newDice) {
                    var result = newDice.modifier;
                    if (newDice.singleDice) {
                        var mainDice = [newDice.singleNum, 0];
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
                            var results = [];
                            while (mainDice[1] > 0) {
                                results.push((Math.ceil(Math.random() * 10000) % mainDice[0]));
                                mainDice[1]--;
                            }
                            while (mainDice[1] < 0) {
                                results.push(-((Math.ceil(Math.random() * 10000) % mainDice[0])));
                                mainDice[1]++;
                            }
                            results = results.sort(function (curr, next) {
                                return next - curr;
                            });
                            var currIndex = newDice.dropLow;
                            while (currIndex < results.length - newDice.dropHigh) {
                                result += results[currIndex];
                                currIndex++;
                            }
                            newDice.result = result;
                            this.recordDice(newDice);
                            return result;
                        }
                    }
                    else {
                        this.recordDice(newDice);
                        return result;
                    }
                };
                tempStore.prototype.recordDice = function (newDice) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            this.prevMapping.set(this.currIndex, newDice);
                            this.currIndex = (this.currIndex + 1) % 50;
                            return [2];
                        });
                    });
                };
                tempStore.prototype.getDice = function () {
                    return { start: this.currIndex, map: this.prevMapping };
                };
                tempStore.prototype.compareObjects = function (clientObjs) {
                    var result = [];
                    for (var _i = 0, clientObjs_1 = clientObjs; _i < clientObjs_1.length; _i++) {
                        var val = clientObjs_1[_i];
                        var res = this.compareObject(val);
                        if (res) {
                            result.push(res);
                        }
                    }
                    return result;
                };
                tempStore.prototype.compareObject = function (clientObj) {
                    var obj = this.storedObjects.get(clientObj.objectId);
                    if (!obj) {
                        return {
                            entity: objectEvents_ts_7.Entity.Object,
                            action: objectEvents_ts_7.Action.Destroy,
                            objectId: clientObj.objectId,
                        };
                    }
                    if (comparePayloads(obj.object, clientObj)) {
                        return null;
                    }
                    return {
                        entity: objectEvents_ts_7.Entity.Object,
                        action: objectEvents_ts_7.Action.Create,
                        object: obj.object,
                    };
                };
                tempStore.prototype.createObject = function (newObj) {
                    return __awaiter(this, void 0, void 0, function () {
                        var next;
                        return __generator(this, function (_a) {
                            next = 0;
                            while (this.storedObjects.has(next)) {
                                next++;
                            }
                            newObj.object.objectId = next;
                            this.storedObjects.set(next, newObj);
                            this.recentCreation.push(newObj.object);
                            if (this.recentCreation.length >= 4) {
                                this.recentCreation = this.recentCreation.slice(1);
                            }
                            return [2, next];
                        });
                    });
                };
                tempStore.prototype.getObjects = function () {
                    return this.storedObjects;
                };
                tempStore.prototype.getNewObjects = function () {
                    return this.recentCreation;
                };
                tempStore.prototype.createLayer = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var next;
                        return __generator(this, function (_a) {
                            if (this.storedLayers.size >= 11) {
                                return [2, -1];
                            }
                            next = 0;
                            while (this.storedLayers.has(next)) {
                                next++;
                            }
                            this.storedLayers.set(next, {
                                id: next,
                                gmVisible: true,
                                playerVisible: true,
                                zOrder: next,
                            });
                            return [2, next];
                        });
                    });
                };
                tempStore.prototype.getLayers = function () {
                    return this.storedLayers;
                };
                tempStore.prototype.destroyObjects = function (targetIds) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _i, targetIds_1, id;
                        return __generator(this, function (_a) {
                            for (_i = 0, targetIds_1 = targetIds; _i < targetIds_1.length; _i++) {
                                id = targetIds_1[_i];
                                if (this.storedObjects.has(id)) {
                                    this.storedObjects.delete(id);
                                    this.deleteRecentId(id);
                                }
                            }
                            return [2];
                        });
                    });
                };
                tempStore.prototype.deleteRecentId = function (targetId) {
                    for (var i = 0; i < 3; i++) {
                        if (this.recentCreation.length > i &&
                            this.recentCreation[i].objectId === targetId) {
                            this.recentCreation.splice(i, 1);
                        }
                    }
                };
                tempStore.prototype.moveObjects = function (events) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _i, events_1, event_1, targetObj;
                        return __generator(this, function (_a) {
                            for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                                event_1 = events_1[_i];
                                targetObj = this.storedObjects.get(event_1.objectId);
                                if (targetObj) {
                                    targetObj.object.x += event_1.x;
                                    targetObj.object.y += event_1.y;
                                }
                            }
                            return [2];
                        });
                    });
                };
                tempStore.prototype.recolourObjects = function (events) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _i, events_2, event_2, targetObj;
                        return __generator(this, function (_a) {
                            for (_i = 0, events_2 = events; _i < events_2.length; _i++) {
                                event_2 = events_2[_i];
                                targetObj = this.storedObjects.get(event_2.objectId);
                                if (targetObj) {
                                    targetObj.object.colour = event_2.colour;
                                }
                            }
                            return [2];
                        });
                    });
                };
                tempStore.prototype.updateLayer = function (input) {
                    return __awaiter(this, void 0, void 0, function () {
                        var targetObj;
                        return __generator(this, function (_a) {
                            targetObj = this.storedLayers.get(input.id);
                            if (targetObj) {
                                this.storedLayers.set(input.id, input);
                            }
                            return [2];
                        });
                    });
                };
                return tempStore;
            }());
            exports_13("tempStore", tempStore);
        }
    };
});
System.register("rightBar/layerBarMenu", ["colours", "dom"], function (exports_14, context_14) {
    "use strict";
    var colours_ts_5, dom_ts_7, rightBar, LayerMenu;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (colours_ts_5_1) {
                colours_ts_5 = colours_ts_5_1;
            },
            function (dom_ts_7_1) {
                dom_ts_7 = dom_ts_7_1;
            }
        ],
        execute: function () {
            rightBar = dom_ts_7.getRequiredElement('rightBar', HTMLElement);
            LayerMenu = (function () {
                function LayerMenu(server) {
                    this.active = false;
                    this.serveInter = server;
                    this.button = dom_ts_7.getRequiredElement('layerTab', HTMLElement);
                    this.layers = [];
                    this.descObj = dom_ts_7.getRequiredElement('descLayerObj', HTMLElement);
                    this.currElements = [];
                    this.layerMap = new Map();
                    this.layerObj = dom_ts_7.getRequiredElement('layerLayerObj', HTMLElement);
                    this.boxHeight = 50;
                    this.currSelect = 0;
                    this.tempButtonObj = document.createElement('input');
                    this.setMainElements();
                    this.moveLayers();
                }
                LayerMenu.prototype.toggleActive = function (newAct) {
                    this.active = newAct;
                    this.layerObj.style.visibility = this.active ? 'visible' : 'hidden';
                    this.layerObj.style.pointerEvents = this.active ? 'auto' : 'none';
                };
                LayerMenu.prototype.setMainElements = function () {
                    var _this = this;
                    this.layerObj.style.background = colours_ts_5.GREY.toString();
                    this.layerObj.style.visibility = 'hidden';
                    this.layerObj.style.fontSize = '14px';
                    this.descObj.style.border = 'solid black';
                    this.descObj.style.height = "".concat(this.boxHeight, "px");
                    this.descObj.style.width = '250px';
                    var numText = document.createElement('p');
                    numText.innerText = 'Layer #';
                    numText.style.position = 'absolute';
                    numText.style.left = '10px';
                    var firstCheck = document.createElement('p');
                    firstCheck.innerText = 'GM\nVis';
                    firstCheck.style.width = '50px';
                    firstCheck.style.position = 'absolute';
                    firstCheck.style.left = '187px';
                    firstCheck.style.textAlign = 'center';
                    var secondCheck = document.createElement('p');
                    secondCheck.innerText = 'Player\nVis';
                    secondCheck.style.width = '50px';
                    secondCheck.style.position = 'absolute';
                    secondCheck.style.left = '137px';
                    secondCheck.style.textAlign = 'center';
                    this.tempButtonObj.type = 'button';
                    this.tempButtonObj.value = 'Make layer';
                    this.tempButtonObj.style.width = '190px';
                    this.tempButtonObj.style.position = 'absolute';
                    this.tempButtonObj.style.left = '0px';
                    this.tempButtonObj.style.bottom = '0px';
                    this.tempButtonObj.style.height = '50px';
                    this.layerObj.append(this.tempButtonObj);
                    this.descObj.append(numText);
                    this.descObj.append(firstCheck);
                    this.descObj.append(secondCheck);
                    this.tempButtonObj.addEventListener('mousedown', function () {
                        if (_this.active) {
                            _this.createLayer();
                        }
                    });
                };
                LayerMenu.prototype.createLayer = function () {
                    this.serveInter.createLayer();
                };
                LayerMenu.prototype.updateLayer = function (key, val) {
                    var toUpdate = this.layerMap.get(key);
                    toUpdate.gmVisible = val.gmVisible;
                    toUpdate.playerVisible = val.playerVisible;
                    toUpdate.zOrder = val.zOrder;
                    toUpdate.element.children[1].checked = val.playerVisible;
                    toUpdate.element.children[2].checked = val.gmVisible;
                };
                LayerMenu.prototype.handleNewLayers = function (newLayers) {
                    for (var _i = 0, newLayers_1 = newLayers; _i < newLayers_1.length; _i++) {
                        var _a = newLayers_1[_i], key = _a[0], val = _a[1];
                        if (!this.layerMap.has(key)) {
                            this.constructLayer(val);
                        }
                        else {
                            this.updateLayer(key, val);
                        }
                    }
                    this.moveLayers();
                    this.resizeLayerBoxes();
                };
                LayerMenu.prototype.addNewLayer = function (layer) {
                    this.constructLayer(layer);
                    this.moveLayers();
                    this.resizeLayerBoxes();
                };
                LayerMenu.prototype.constructLayer = function (buildData) {
                    var _this = this;
                    var newBox = document.createElement('div');
                    var newText = document.createElement('p');
                    var checkVisibleAll = document.createElement('input');
                    var checkVisibleGM = document.createElement('input');
                    this.layerMap.set(buildData.id, {
                        id: buildData.id,
                        gmVisible: buildData.gmVisible,
                        playerVisible: buildData.playerVisible,
                        zOrder: buildData.zOrder,
                        element: newBox,
                    });
                    newBox.style.position = 'absolute';
                    newBox.style.border = 'solid black';
                    newBox.style.height = "".concat(this.boxHeight, "px");
                    newBox.style.width = '100px';
                    newBox.style.left = '0px';
                    newBox.style.top = '50px';
                    newText.style.position = 'absolute';
                    newText.style.width = '100px';
                    newText.style.left = '10px';
                    newText.style.top = '5px';
                    newText.innerText = "Layer ".concat(buildData.id);
                    checkVisibleAll.type = 'checkbox';
                    checkVisibleAll.style.position = 'absolute';
                    checkVisibleAll.style.top = '15px';
                    checkVisibleAll.style.left = '150px';
                    checkVisibleAll.checked = buildData.playerVisible;
                    checkVisibleAll.id = 'check1';
                    checkVisibleGM.type = 'checkbox';
                    checkVisibleGM.style.position = 'absolute';
                    checkVisibleGM.style.top = '15px';
                    checkVisibleGM.style.left = '200px';
                    checkVisibleGM.checked = buildData.gmVisible;
                    this.layerObj.append(newBox);
                    newBox.append(newText);
                    newBox.append(checkVisibleAll);
                    newBox.append(checkVisibleGM);
                    this.currElements.push(newBox);
                    newBox.addEventListener('mousedown', function () {
                        if (_this.active) {
                            if (_this.currSelect !== parseInt(newText.innerText.slice(6), 10)) {
                                _this.exitCurrSelect();
                                _this.currSelect = parseInt(newText.innerText.slice(6), 10);
                            }
                        }
                    });
                    checkVisibleGM.addEventListener('mousedown', function () {
                        if (_this.active) {
                            _this.serveInter.updateLayer({
                                id: buildData.id,
                                gmVisible: !checkVisibleGM.checked,
                                playerVisible: checkVisibleAll.checked,
                                zOrder: buildData.zOrder,
                            });
                        }
                    });
                    checkVisibleAll.addEventListener('mousedown', function () {
                        if (_this.active) {
                            _this.serveInter.updateLayer({
                                id: buildData.id,
                                gmVisible: checkVisibleGM.checked,
                                playerVisible: !checkVisibleAll.checked,
                                zOrder: buildData.zOrder,
                            });
                        }
                    });
                };
                LayerMenu.prototype.moveLayers = function () {
                    var _this = this;
                    this.currElements.forEach(function (el, i) {
                        el.style.top = "".concat((_this.boxHeight + 4) * (i + 1), "px");
                    });
                };
                LayerMenu.prototype.resizeLayerBoxes = function () {
                    var w = "".concat(parseInt(this.layerObj.style.width, 10) - 4, "px");
                    for (var _i = 0, _a = this.currElements; _i < _a.length; _i++) {
                        var el = _a[_i];
                        el.style.width = w;
                    }
                    this.tempButtonObj.style.width = "".concat(parseInt(this.layerObj.style.width, 10), "px");
                };
                LayerMenu.prototype.exitCurrSelect = function () {
                    var layer = this.layerMap.get(this.currSelect);
                    if (layer) {
                        layer.element.style.background = colours_ts_5.GREY.toString();
                    }
                };
                LayerMenu.prototype.step = function () {
                    var layer = this.layerMap.get(this.currSelect);
                    if (layer) {
                        layer.element.style.background = colours_ts_5.RED.toString();
                    }
                    if (this.layerObj.style.width !== rightBar.style.width) {
                        this.layerObj.style.width = rightBar.style.width;
                        this.layerObj.style.height = rightBar.style.height;
                        this.descObj.style.width = "".concat(parseInt(this.layerObj.style.width.slice(0, this.layerObj.style.width.length - 2), 10) - 4, "px");
                        this.resizeLayerBoxes();
                    }
                };
                return LayerMenu;
            }());
            exports_14("LayerMenu", LayerMenu);
        }
    };
});
System.register("boardCanvas/localBoard", ["boardCanvas/boardLayer", "boardCanvas/boardObject", "boardCanvas/modeManager", "colours", "dom", "objectEvents"], function (exports_15, context_15) {
    "use strict";
    var boardLayer_ts_1, boardObject_ts_3, modeManager_ts_1, colours_ts_6, dom_ts_8, objectEvents_ts_8, can, ctx, Board;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (boardLayer_ts_1_1) {
                boardLayer_ts_1 = boardLayer_ts_1_1;
            },
            function (boardObject_ts_3_1) {
                boardObject_ts_3 = boardObject_ts_3_1;
            },
            function (modeManager_ts_1_1) {
                modeManager_ts_1 = modeManager_ts_1_1;
            },
            function (colours_ts_6_1) {
                colours_ts_6 = colours_ts_6_1;
            },
            function (dom_ts_8_1) {
                dom_ts_8 = dom_ts_8_1;
            },
            function (objectEvents_ts_8_1) {
                objectEvents_ts_8 = objectEvents_ts_8_1;
            }
        ],
        execute: function () {
            can = dom_ts_8.getRequiredElement('board', HTMLCanvasElement);
            ctx = can.getContext('2d');
            Board = (function () {
                function Board(server) {
                    this.zoomGlobal = 3;
                    this.zoomLevels = [4, 6, 8, 10, 13, 16, 20, 24, 28, 32];
                    this.zoomVal = this.zoomLevels[this.zoomGlobal];
                    this.originCoords = { x: 0, y: 0 };
                    this.mouseCoords = { x: 0, y: 0 };
                    this.boardBounds = { minX: -200, maxX: 200, minY: -200, maxY: 200 };
                    this.leftMouseDown = false;
                    this.boardLayers = [];
                    this.layerMap = new Map();
                    this.objectMap = new Map();
                    this.modeMan = new modeManager_ts_1.ModeManager(this);
                    this.activeLayer = 0;
                    this.serveInter = server;
                }
                Board.prototype.drawMousePointer = function () {
                    ctx.beginPath();
                    ctx.arc(this.mouseCoords.x, this.mouseCoords.y, 1 * this.zoomVal, 0, 2 * Math.PI, false);
                    ctx.fillStyle = colours_ts_6.BLUE.toString();
                    if (this.leftMouseDown) {
                        ctx.fillStyle = colours_ts_6.RED.toString();
                    }
                    ctx.fill();
                    ctx.closePath();
                };
                Board.prototype.bindCamera = function () {
                    if (this.originCoords.x <
                        (this.boardBounds.minX - 100) * this.zoomVal) {
                        this.originCoords.x = (this.boardBounds.minX - 100) * this.zoomVal;
                    }
                    else if (this.originCoords.x >
                        (this.boardBounds.maxX + 100) * this.zoomVal) {
                        this.originCoords.x = (this.boardBounds.maxX + 100) * this.zoomVal;
                    }
                    if (this.originCoords.y <
                        (this.boardBounds.minY - 100) * this.zoomVal) {
                        this.originCoords.y = (this.boardBounds.minY - 100) * this.zoomVal;
                    }
                    else if (this.originCoords.y >
                        (this.boardBounds.maxY + 100) * this.zoomVal) {
                        this.originCoords.y = (this.boardBounds.maxY + 100) * this.zoomVal;
                    }
                };
                Board.prototype.moveCamera = function (xMod, yMod) {
                    this.originCoords.x -= xMod;
                    this.originCoords.y -= yMod;
                    this.bindCamera();
                };
                Board.prototype.sortLayers = function () {
                    this.boardLayers = this.boardLayers.sort(function (n1, n2) {
                        if (n1.zOrder > n2.zOrder) {
                            return 1;
                        }
                        if (n1.zOrder < n2.zOrder) {
                            return -1;
                        }
                        return 0;
                    });
                };
                Board.prototype.addLayer = function (newLayer) {
                    if (newLayer.id === undefined) {
                        return;
                    }
                    var currLayer = this.layerMap.get(newLayer.id);
                    if (currLayer) {
                        currLayer.updateVis(newLayer.playerVisible, newLayer.gmVisible);
                    }
                    else {
                        var toAdd = new boardLayer_ts_1.BoardLayer(newLayer.zOrder, newLayer.gmVisible, newLayer.playerVisible);
                        this.layerMap.set(newLayer.id, toAdd);
                        this.boardLayers.push(toAdd);
                        this.boardLayers.sort();
                    }
                };
                Board.prototype.getLayer = function (layerID) {
                    return this.layerMap.get(layerID);
                };
                Board.prototype.getObjectById = function (objectId) {
                    for (var _i = 0, _a = this.layerMap; _i < _a.length; _i++) {
                        var _b = _a[_i], key = _b[0], val = _b[1];
                        var obj = val.heldMap.get(objectId);
                        if (obj) {
                            return obj;
                        }
                    }
                    return null;
                };
                Board.prototype.removeLayer = function (removeID) {
                    var layer = this.layerMap.get(removeID);
                    if (!layer) {
                        return false;
                    }
                    var removeIndex = this.boardLayers.indexOf(layer);
                    if (!this.layerMap.delete(removeID)) {
                        return false;
                    }
                    this.boardLayers.splice(removeIndex, 1);
                    this.sortLayers();
                    return true;
                };
                Board.prototype.moveObject = function (objID, layerID, moveX, moveY) {
                    var layer = this.layerMap.get(layerID);
                    if (layer) {
                        layer.moveObject(objID, moveX, moveY);
                    }
                };
                Board.prototype.removeObject = function (objId, layerId) {
                    if (layerId === void 0) { layerId = -1; }
                    this.objectMap.delete(objId);
                    if (layerId === -1) {
                        for (var _i = 0, _a = this.boardLayers; _i < _a.length; _i++) {
                            var layer = _a[_i];
                            if (layer.removeObject(objId)) {
                                return true;
                            }
                        }
                        return false;
                    }
                    else {
                        var layer = this.layerMap.get(layerId);
                        if (layer) {
                            layer.removeObject(objId);
                        }
                        return true;
                    }
                };
                Board.prototype.addObject = function (layerId, newObject) {
                    var layer = this.layerMap.get(layerId);
                    this.objectMap.set(newObject.objectId, newObject);
                    if (layer) {
                        layer.addObject(newObject, newObject.objectId);
                    }
                };
                Board.prototype.moveLayer = function (moveID, moveX, moveY) {
                    var layer = this.layerMap.get(moveID);
                    if (layer) {
                        layer.shiftLayer({ x: moveX, y: moveY });
                    }
                };
                Board.prototype.selectObjects = function (targetType) {
                    if (targetType === void 0) { targetType = 'any'; }
                    var layer = this.layerMap.get(this.activeLayer);
                    if (layer) {
                        return layer.selectObjects(this.modeMan.getSelectCoords(), targetType);
                    }
                    return [];
                };
                Board.prototype.selectToken = function (fixedPoint) {
                    var layer = this.layerMap.get(this.activeLayer);
                    if (layer) {
                        var selected = layer.selectObjects(fixedPoint, objectEvents_ts_8.Shape.Token)[0];
                        if (selected instanceof boardObject_ts_3.Token) {
                            return selected;
                        }
                    }
                    return undefined;
                };
                Board.prototype.drawPointGrid = function (squareSize) {
                    var currX = this.originCoords.x;
                    while (currX + squareSize > 0) {
                        currX -= squareSize;
                    }
                    while (currX < can.width + 100) {
                        var currY = this.originCoords.y;
                        while (currY + squareSize > 0) {
                            currY -= squareSize;
                        }
                        while (currY < can.height + 100) {
                            if (currX <= this.originCoords.x &&
                                currX + squareSize >= this.originCoords.x) {
                                ctx.fillStyle = colours_ts_6.WHITE.toString();
                            }
                            else {
                                ctx.fillStyle = colours_ts_6.WHITE.toString();
                            }
                            ctx.fillRect(currX - 1, currY - 1, 2, 2);
                            currY += squareSize;
                        }
                        currX += squareSize;
                    }
                };
                Board.prototype.determineTile = function (x, y, vertex) {
                    var squareSize = 5 * this.zoomVal;
                    if (vertex) {
                        return {
                            x: Math.round((x - this.originCoords.x) / squareSize),
                            y: Math.round((y - this.originCoords.y) / squareSize),
                        };
                    }
                    else {
                        return {
                            x: Math.floor((x - this.originCoords.x) / squareSize),
                            y: Math.floor((y - this.originCoords.y) / squareSize),
                        };
                    }
                };
                Board.prototype.draw = function () {
                    var squareSize = 5 * this.zoomVal;
                    for (var _i = 0, _a = this.boardLayers.entries(); _i < _a.length; _i++) {
                        var _b = _a[_i], i = _b[0], layer = _b[1];
                        layer.drawLayer(ctx, squareSize, this.originCoords, this.modeMan.selectMan.thirdOffset);
                        if (i === this.activeLayer) {
                            var tempObj = this.modeMan.getObject(modeManager_ts_1.GetObjectReason.Draw);
                            if (tempObj) {
                                tempObj.draw(ctx, squareSize, this.originCoords);
                            }
                        }
                    }
                    this.drawPointGrid(squareSize);
                    this.drawMousePointer();
                    this.modeMan.step(ctx, squareSize, this.originCoords);
                };
                Board.prototype.step = function () {
                    if (can.width !== window.innerWidth) {
                        can.width = window.innerWidth;
                        can.height = window.innerHeight;
                    }
                    ctx.clearRect(0, 0, can.width, can.height);
                    this.draw();
                };
                Board.prototype.changeLayerZ = function (layerId, newVal) {
                    var layer = this.layerMap.get(layerId);
                    if (layer) {
                        layer.zOrder = newVal;
                    }
                    this.sortLayers();
                };
                return Board;
            }());
            exports_15("Board", Board);
        }
    };
});
System.register("leftBar/colourBox", ["color", "dom"], function (exports_16, context_16) {
    "use strict";
    var color_2, dom_ts_9, colourComponents, RGBSliders, RGBTexts, colorSquare, ColourBox;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (color_2_1) {
                color_2 = color_2_1;
            },
            function (dom_ts_9_1) {
                dom_ts_9 = dom_ts_9_1;
            }
        ],
        execute: function () {
            colourComponents = ['red', 'green', 'blue', 'alpha'];
            RGBSliders = {
                red: dom_ts_9.getRequiredElement('redColSlide', HTMLInputElement),
                green: dom_ts_9.getRequiredElement('greenColSlide', HTMLInputElement),
                blue: dom_ts_9.getRequiredElement('blueColSlide', HTMLInputElement),
                alpha: dom_ts_9.getRequiredElement('opacColSlide', HTMLInputElement),
            };
            RGBTexts = {
                red: dom_ts_9.getRequiredElement('redColText', HTMLInputElement),
                green: dom_ts_9.getRequiredElement('greenColText', HTMLInputElement),
                blue: dom_ts_9.getRequiredElement('blueColText', HTMLInputElement),
                alpha: dom_ts_9.getRequiredElement('opacColText', HTMLInputElement),
            };
            colorSquare = dom_ts_9.getRequiredElement('colourSquare', HTMLElement);
            ColourBox = (function () {
                function ColourBox() {
                    this.savedColours = [
                        color_2.default([255, 0, 0, 1]),
                        color_2.default([0, 255, 0, 1]),
                        color_2.default([0, 0, 255, 1]),
                        color_2.default([50, 50, 50, 1]),
                        color_2.default([150, 150, 150, 1]),
                        color_2.default([255, 255, 255, 1]),
                    ];
                    this.currColour = color_2.default([120, 120, 120, 1]);
                    this.currRGBString = "rgba(".concat(120, ", ").concat(120, ", ").concat(120, ", ").concat(1, ")");
                    this.mainBox = colorSquare;
                    this.adjBoxes = [];
                    this.can = colorSquare;
                    this.shiftIsPressed = false;
                    for (var _i = 0, _a = [0, 1, 2, 3, 4, 5]; _i < _a.length; _i++) {
                        var i = _a[_i];
                        this.adjBoxes.push(dom_ts_9.getRequiredElement("col".concat(i + 1), HTMLElement));
                        this.adjBoxes[i].style.left = "".concat(i * 40 + 10, "px");
                        this.adjBoxes[i].style.background = this.savedColours[i].toString();
                    }
                    this.addEventListeners();
                    this.changeCurrColour();
                }
                ColourBox.prototype.addEventListeners = function () {
                    var _this = this;
                    colourComponents.forEach(function (component) {
                        RGBSliders[component].addEventListener('input', function () {
                            var value = parseInt(RGBSliders[component].value, 10);
                            if (component === 'red') {
                                _this.currColour = _this.currColour.red(value);
                            }
                            else if (component === 'green') {
                                _this.currColour = _this.currColour.green(value);
                            }
                            else if (component === 'blue') {
                                _this.currColour = _this.currColour.blue(value);
                            }
                            else if (component === 'alpha') {
                                _this.currColour = _this.currColour.alpha(value / 100);
                            }
                            _this.changeCurrColour();
                        });
                        RGBTexts[component].addEventListener('input', function () {
                            var value = parseInt(RGBTexts[component].value, 10);
                            if (component === 'red') {
                                _this.currColour = _this.currColour.red(value);
                            }
                            else if (component === 'green') {
                                _this.currColour = _this.currColour.green(value);
                            }
                            else if (component === 'blue') {
                                _this.currColour = _this.currColour.blue(value);
                            }
                            else if (component === 'alpha') {
                                _this.currColour = _this.currColour.alpha(value / 100);
                            }
                            _this.changeCurrColour();
                        });
                    });
                    document.addEventListener('keydown', function (event) {
                        if (event.key === 'Shift') {
                            _this.shiftIsPressed = true;
                        }
                    });
                    document.addEventListener('keyup', function (event) {
                        if (event.key === 'Shift') {
                            _this.shiftIsPressed = false;
                        }
                    });
                    this.adjBoxes.forEach(function (box, i) {
                        box.addEventListener('click', function () {
                            if (_this.shiftIsPressed) {
                                _this.changeSubColour(i);
                            }
                            else {
                                _this.changeCurrColour(true, i);
                            }
                        });
                    });
                };
                ColourBox.prototype.changeCurrColour = function (swap, swapID) {
                    var _this = this;
                    if (swap === void 0) { swap = false; }
                    if (swapID === void 0) { swapID = -1; }
                    if (swap) {
                        this.currColour = this.savedColours[swapID];
                    }
                    this.mainBox.style.background = this.currColour.toString();
                    colourComponents.forEach(function (component) {
                        _this.matchInput(component);
                    });
                };
                ColourBox.prototype.matchInput = function (component) {
                    if (component === 'red') {
                        RGBSliders[component].value = this.currColour.red().toString();
                        RGBTexts[component].value = this.currColour.red().toString();
                    }
                    else if (component === 'green') {
                        RGBSliders[component].value = this.currColour.green().toString();
                        RGBTexts[component].value = this.currColour.green().toString();
                    }
                    else if (component === 'blue') {
                        RGBSliders[component].value = this.currColour.blue().toString();
                        RGBTexts[component].value = this.currColour.blue().toString();
                    }
                    else if (component === 'alpha') {
                        RGBSliders[component].value = (this.currColour.alpha() * 100).toString();
                        RGBTexts[component].value = (this.currColour.alpha() * 100).toString();
                    }
                };
                ColourBox.prototype.changeSubColour = function (swapID) {
                    if (swapID === void 0) { swapID = -1; }
                    this.savedColours[swapID] = this.currColour;
                    this.adjBoxes[swapID].style.background =
                        this.savedColours[swapID].toString();
                };
                return ColourBox;
            }());
            exports_16("ColourBox", ColourBox);
        }
    };
});
System.register("leftBar/leftBarMain", ["leftBar/colourBox"], function (exports_17, context_17) {
    "use strict";
    var colourBox_ts_1, LeftBarManager;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (colourBox_ts_1_1) {
                colourBox_ts_1 = colourBox_ts_1_1;
            }
        ],
        execute: function () {
            LeftBarManager = (function () {
                function LeftBarManager() {
                    this.colourPicker = new colourBox_ts_1.ColourBox();
                }
                return LeftBarManager;
            }());
            exports_17("LeftBarManager", LeftBarManager);
        }
    };
});
System.register("rightBar/characterBarMenu", [], function (exports_18, context_18) {
    "use strict";
    var CharacterMenu;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
            CharacterMenu = (function () {
                function CharacterMenu() {
                }
                return CharacterMenu;
            }());
            exports_18("CharacterMenu", CharacterMenu);
        }
    };
});
System.register("rightBar/tokenBarMenu", [], function (exports_19, context_19) {
    "use strict";
    var TokenMenu;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {
            TokenMenu = (function () {
                function TokenMenu() {
                }
                return TokenMenu;
            }());
            exports_19("TokenMenu", TokenMenu);
        }
    };
});
System.register("rightBar/rightBarMain", ["rightBar/characterBarMenu", "rightBar/layerBarMenu", "rightBar/rollBarMenu", "rightBar/tokenBarMenu", "dom"], function (exports_20, context_20) {
    "use strict";
    var characterBarMenu_ts_1, layerBarMenu_ts_1, rollBarMenu_ts_1, tokenBarMenu_ts_1, dom_ts_10, rightBar, rightPara, layerTab, tokenTab, rollTab, characterTab, RightBarTab, RightBarManager;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (characterBarMenu_ts_1_1) {
                characterBarMenu_ts_1 = characterBarMenu_ts_1_1;
            },
            function (layerBarMenu_ts_1_1) {
                layerBarMenu_ts_1 = layerBarMenu_ts_1_1;
            },
            function (rollBarMenu_ts_1_1) {
                rollBarMenu_ts_1 = rollBarMenu_ts_1_1;
            },
            function (tokenBarMenu_ts_1_1) {
                tokenBarMenu_ts_1 = tokenBarMenu_ts_1_1;
            },
            function (dom_ts_10_1) {
                dom_ts_10 = dom_ts_10_1;
            }
        ],
        execute: function () {
            rightBar = dom_ts_10.getRequiredElement('rightBar', HTMLElement);
            rightPara = dom_ts_10.getRequiredElement('rightPara', HTMLElement);
            layerTab = dom_ts_10.getRequiredElement('layerTab', HTMLElement);
            tokenTab = dom_ts_10.getRequiredElement('tokenTab', HTMLElement);
            rollTab = dom_ts_10.getRequiredElement('rollTab', HTMLElement);
            characterTab = dom_ts_10.getRequiredElement('characterTab', HTMLElement);
            (function (RightBarTab) {
                RightBarTab["None"] = "NONE";
                RightBarTab["Layer"] = "LAYER";
                RightBarTab["Token"] = "TOKEN";
                RightBarTab["Roll"] = "ROLL";
                RightBarTab["Character"] = "CHARACTER";
            })(RightBarTab || (exports_20("RightBarTab", RightBarTab = {})));
            RightBarManager = (function () {
                function RightBarManager(server) {
                    this.serveInter = server;
                    this.layerMan = new layerBarMenu_ts_1.LayerMenu(this.serveInter);
                    this.tokenMan = new tokenBarMenu_ts_1.TokenMenu();
                    this.characterMan = new characterBarMenu_ts_1.CharacterMenu();
                    this.rollMan = new rollBarMenu_ts_1.RollMenu(this.serveInter);
                    this.currActive = RightBarTab.Layer;
                    rightBar.style.width = '250px';
                    this.addEventListeners();
                    this.layerMan.toggleActive(true);
                    this.setText();
                }
                RightBarManager.prototype.addEventListeners = function () {
                    var _this = this;
                    layerTab.addEventListener('click', function () {
                        _this.layerMan.toggleActive(true);
                        _this.rollMan.toggleActive(false);
                        _this.currActive = RightBarTab.Layer;
                        _this.setText();
                    });
                    tokenTab.addEventListener('click', function () {
                        _this.layerMan.toggleActive(false);
                        _this.rollMan.toggleActive(false);
                        _this.currActive = RightBarTab.Token;
                        _this.setText();
                    });
                    rollTab.addEventListener('click', function () {
                        _this.layerMan.toggleActive(false);
                        _this.rollMan.toggleActive(true);
                        _this.currActive = RightBarTab.Roll;
                        _this.setText();
                    });
                    characterTab.addEventListener('click', function () {
                        _this.layerMan.toggleActive(false);
                        _this.rollMan.toggleActive(false);
                        _this.currActive = RightBarTab.Character;
                        _this.setText();
                    });
                };
                RightBarManager.prototype.step = function () {
                    rightBar.style.height = "".concat(window.innerHeight - 20, "px");
                    if (this.currActive === RightBarTab.Layer) {
                        this.layerMan.step();
                    }
                    else if (this.currActive === RightBarTab.Roll) {
                        this.rollMan.step();
                    }
                };
                RightBarManager.prototype.setText = function () {
                    if (this.currActive === RightBarTab.Layer) {
                        rightPara.innerText = '';
                    }
                    else if (this.currActive === RightBarTab.Roll) {
                        rightPara.innerText = '';
                    }
                    else {
                        rightPara.innerText = 'WIP';
                    }
                };
                RightBarManager.prototype.addLayer = function (newLayer) {
                    this.layerMan.addNewLayer(newLayer);
                };
                return RightBarManager;
            }());
            exports_20("RightBarManager", RightBarManager);
        }
    };
});
System.register("mainDriver", ["boardCanvas/localBoard", "leftBar/leftBarMain", "rightBar/rightBarMain", "boardCanvas/boardLayer", "objectEvents", "boardCanvas/boardObject", "serveInter"], function (exports_21, context_21) {
    "use strict";
    var localBoard_ts_1, leftBarMain_ts_1, rightBarMain_ts_1, boardLayer_ts_2, objectEvents_ts_9, boardObject_ts_4, serveInter_ts_1, serveInter, loadWall, board, rightMan, counter;
    var __moduleName = context_21 && context_21.id;
    function payloadToBoardObject(p) {
        var _a;
        switch (p.kind) {
            case objectEvents_ts_9.Shape.Circle:
                return new boardObject_ts_4.Circle(p.objectId, p.x, p.y, p.diameter, p.colour);
            case objectEvents_ts_9.Shape.Rect:
                return new boardObject_ts_4.Rect(p.objectId, p.x, p.y, p.width, p.height, p.colour);
            case objectEvents_ts_9.Shape.Token:
                return new boardObject_ts_4.Token(p.objectId, p.x, p.y, p.diameter, p.colour, (_a = p.name) !== null && _a !== void 0 ? _a : '');
            case objectEvents_ts_9.Shape.Poly:
                return new boardObject_ts_4.Polyline(p.objectId, p.x, p.y, p.points, p.colour);
            case objectEvents_ts_9.Shape.Line:
                return new boardObject_ts_4.Line(p.objectId, p.x, p.y, p.points, p.colour);
            default: {
                throw new Error('Unknown shape');
            }
        }
    }
    function runBoardStep() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                board.step();
                return [2];
            });
        });
    }
    function syncServer() {
        return __awaiter(this, void 0, void 0, function () {
            var checkList, _i, _a, _b, key, val, data, _c, data_1, val;
            return __generator(this, function (_d) {
                checkList = [];
                for (_i = 0, _a = board.objectMap; _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], val = _b[1];
                    checkList.push(val.payloadFromObject());
                }
                data = serveInter.compareObjects(checkList);
                if (data) {
                    for (_c = 0, data_1 = data; _c < data_1.length; _c++) {
                        val = data_1[_c];
                        if (val.action === objectEvents_ts_9.Action.Create) {
                            board.objectMap
                                .get(val.object.objectId)
                                .updateFromPayload(val.object);
                        }
                        else if (val.action === objectEvents_ts_9.Action.Destroy) {
                            board.removeObject(val.objectId);
                        }
                    }
                }
                getRecent();
                updateLayers();
                return [2];
            });
        });
    }
    function updateLayers() {
        return __awaiter(this, void 0, void 0, function () {
            var data, _i, data_2, _a, key, val;
            return __generator(this, function (_b) {
                data = serveInter.getLayers();
                if (data) {
                    rightMan.layerMan.handleNewLayers(data);
                    for (_i = 0, data_2 = data; _i < data_2.length; _i++) {
                        _a = data_2[_i], key = _a[0], val = _a[1];
                        board.addLayer(val);
                    }
                }
                return [2];
            });
        });
    }
    function getRecent() {
        return __awaiter(this, void 0, void 0, function () {
            var data, _i, data_3, obj;
            return __generator(this, function (_a) {
                data = serveInter.getNewObjects();
                if (data) {
                    for (_i = 0, data_3 = data; _i < data_3.length; _i++) {
                        obj = data_3[_i];
                        if (!board.objectMap.has(obj.objectId)) {
                            board.addObject(obj.layerId, payloadToBoardObject(obj));
                        }
                    }
                }
                return [2];
            });
        });
    }
    function setUpLayers() {
        return __awaiter(this, void 0, void 0, function () {
            var data, _i, data_4, _a, key, val;
            return __generator(this, function (_b) {
                data = serveInter.getLayers();
                if (data && data.size != 0) {
                    rightMan.layerMan.handleNewLayers(data);
                    for (_i = 0, data_4 = data; _i < data_4.length; _i++) {
                        _a = data_4[_i], key = _a[0], val = _a[1];
                        board.addLayer(val);
                    }
                }
                else {
                    rightMan.layerMan.createLayer();
                    board.addLayer(new boardLayer_ts_2.BoardLayer(0, true, true), 0);
                }
                return [2];
            });
        });
    }
    function setUpObjects() {
        return __awaiter(this, void 0, void 0, function () {
            var data, _i, data_5, _a, key, val;
            return __generator(this, function (_b) {
                data = serveInter.getObjects();
                if (data) {
                    for (_i = 0, data_5 = data; _i < data_5.length; _i++) {
                        _a = data_5[_i], key = _a[0], val = _a[1];
                        board.addObject(val.object.layerId, payloadToBoardObject(val.object));
                    }
                }
                return [2];
            });
        });
    }
    function setUp() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, setUpLayers()];
                    case 1:
                        _a.sent();
                        return [4, setUpObjects()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    }
    function updateActiveLayer() {
        board.activeLayer = rightMan.layerMan.currSelect;
    }
    function mainLoop() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (counter % 25 === 0) {
                    syncServer();
                    board.modeMan.clearTemp();
                }
                if (counter % 25 === 0) {
                    rightMan.step();
                    counter = 1;
                }
                updateActiveLayer();
                runBoardStep();
                counter++;
                if (counter === 2) {
                    loadWall.style.visibility = 'hidden';
                }
                requestAnimationFrame(mainLoop);
                return [2];
            });
        });
    }
    return {
        setters: [
            function (localBoard_ts_1_1) {
                localBoard_ts_1 = localBoard_ts_1_1;
            },
            function (leftBarMain_ts_1_1) {
                leftBarMain_ts_1 = leftBarMain_ts_1_1;
            },
            function (rightBarMain_ts_1_1) {
                rightBarMain_ts_1 = rightBarMain_ts_1_1;
            },
            function (boardLayer_ts_2_1) {
                boardLayer_ts_2 = boardLayer_ts_2_1;
            },
            function (objectEvents_ts_9_1) {
                objectEvents_ts_9 = objectEvents_ts_9_1;
            },
            function (boardObject_ts_4_1) {
                boardObject_ts_4 = boardObject_ts_4_1;
            },
            function (serveInter_ts_1_1) {
                serveInter_ts_1 = serveInter_ts_1_1;
            }
        ],
        execute: async function () {
            console.log("aaaa");
            serveInter = new serveInter_ts_1.tempStore();
            loadWall = document.getElementById('loadBlock');
            board = new localBoard_ts_1.Board(serveInter);
            new leftBarMain_ts_1.LeftBarManager();
            rightMan = new rightBarMain_ts_1.RightBarManager(serveInter);
            await setUp();
            counter = 0;
            requestAnimationFrame(mainLoop);
        }
    };
});
