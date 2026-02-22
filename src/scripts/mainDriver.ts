import Color from 'color';

import * as BoardParams from './boardCanvas/localBoard.ts';
import { getRequiredElement } from './dom.ts';
import * as leftBar from './leftBar/leftBarMain.ts';
import type * as objectEvents from './objectEvents.ts';
import { Shape } from './objectEvents.ts';
import * as rightBar from './rightBar/rightBarMain.ts';
import * as ServerInterface from './serverInterface.ts';

const colorSquare = getRequiredElement('colourSquare', HTMLElement);

function checkDeletion() {
  const deletions = board.getDeletion();
  if (deletions !== undefined) {
    for (const obj of deletions) {
      serveInter.destroyObj(obj.ID);
    }
    board.modeMan.clearSelected();
  }
}

function runBoardStep() {
  if (board.modeMan.moveFlag) {
    const toChange = board.modeMan.getSelected();
    const valChange = board.determineTile(
      board.modeMan.selectMan.thirdOffset.x + board.originCoords.x,
      board.modeMan.selectMan.thirdOffset.y + board.originCoords.y,
      true,
    );
    for (const obj of toChange) {
      serveInter.moveObj(obj.ID, valChange.x, valChange.y);
    }
    board.modeMan.selectMan.piecesMoved();
  }
  if (board.modeMan.recolourFlag) {
    const toChange = board.modeMan.getSelected();
    for (const obj of toChange) {
      serveInter.changeObjColour(obj.ID, Color(colorSquare.style.background));
    }
  }

  const newObj = board.getModeManObject();
  if (newObj && newObj !== 1) {
    if (board.modeMan.drawMan.shape !== Shape.Rects) {
      serveInter.createObj(newObj as objectEvents.CreateObjectPayload, 0);
    }
  }
  const events = serveInter.getItems();
  for (const event of events) {
    serveInter.handleObjEvent(event);
  }
  serveInter.clearQueue();
  rightMan.step();
  board.step();
  checkDeletion();
}

const board: BoardParams.Board = new BoardParams.Board();
new leftBar.LeftBarManager(); // const leftMan = new leftBar.LeftBarManager();
const rightMan = new rightBar.RightBarManager();
const serveInter = new ServerInterface.ServerInterface(board);
serveInter.createLayer();

document.body.style.cursor = 'none';

function mainLoop() {
  runBoardStep();
  rightMan.step();

  requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
