import type { Board } from './boardCanvas/localBoard.ts';
import type { ModeManager } from './boardCanvas/modeManager.ts';
import type { RightBarManager } from './rightBar/rightBarMain.ts';
import type { LeftBarManager } from './leftBar/leftBarMain.ts';

let board: Board | null = null;
let modeManager: ModeManager | null = null;
let rightBarManager: RightBarManager | null = null;
let leftBarManager: LeftBarManager | null = null;

export function setBoard(value: Board) {
    board = value;
}

export function getBoard(): Board {
    if (!board) {
        throw new Error('Board not initialized');
    }
    return board;
}

export function setModeManager(value: ModeManager) {
    modeManager = value;
}

export function getModeManager(): ModeManager {
    if (!modeManager) {
        throw new Error('ModeManager not initialized');
    }
    return modeManager;
}

export function setRightBarManager(value: RightBarManager) {
    rightBarManager = value;
}

export function getRightBarManager(): RightBarManager {
    if (!rightBarManager) {
        throw new Error('RightBarManager not initialized');
    }
    return rightBarManager;
}

export function setLeftBarManager(value: LeftBarManager) {
    leftBarManager = value;
}

export function getLeftBarManager(): LeftBarManager {
    if (!leftBarManager) {
        throw new Error('LeftBarManager not initialized');
    }
    return leftBarManager;
}
