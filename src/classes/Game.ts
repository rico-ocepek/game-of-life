import {
  Pentadecathlon,
  GliderGun,
  Glider,
  SymmetricalOscillator,
  Blinker,
  GliderArmy,
} from "../data/Presets.ts";

export type AvailablePresets =
  | "glider-gun"
  | "glider"
  | "glider-army"
  | "blinker"
  | "pentadecathlon"
  | "symmetrical-oscillator";

export type CellIdentifier = [number, number];

export default class Game {
  rowCount: number;
  colCount: number;

  cellStates: boolean[][] = [];

  _updatedCells: CellIdentifier[] = [];

  _historySize: number = 100;
  _historyCursorPosition: number = 0;

  _history: {
    cellStates: boolean[][];
    updatedCells: CellIdentifier[];
  }[] = [];

  constructor(rowCount: number, colCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;

    this._initializeCells();
  }

  _initializeCells() {
    this.cellStates = [];
    this._updatedCells = [];
    this._history = [];

    for (let i = 0; i < this.rowCount; i++) {
      this.cellStates[i] = [];

      for (let j = 0; j < this.colCount; j++) {
        this.cellStates[i][j] = false;
      }
    }
  }

  _calculateCellsToUpdate(): CellIdentifier[] {
    const cellsToUpdate: Set<string> = new Set();

    this._updatedCells.forEach((cell) => {
      // update the cell itself
      cellsToUpdate.add(cell[0] + "|" + cell[1]);

      // and all neighbouring cells
      const adjacentBandIndices = this._getAdjacentBandIndices(
        cell[0],
        cell[1]
      );

      cellsToUpdate.add(adjacentBandIndices.top + "|" + cell[1]);

      cellsToUpdate.add(
        adjacentBandIndices.top + "|" + adjacentBandIndices.right
      );

      cellsToUpdate.add(cell[0] + "|" + adjacentBandIndices.right);

      cellsToUpdate.add(
        adjacentBandIndices.bottom + "|" + adjacentBandIndices.right
      );

      cellsToUpdate.add(adjacentBandIndices.bottom + "|" + cell[1]);

      cellsToUpdate.add(
        adjacentBandIndices.bottom + "|" + adjacentBandIndices.left
      );

      cellsToUpdate.add(cell[0] + "|" + adjacentBandIndices.left);

      cellsToUpdate.add(
        adjacentBandIndices.top + "|" + adjacentBandIndices.left
      );
    });

    return [...cellsToUpdate].map((cellString) => {
      const cellCoordinates = cellString.split("|");

      return [parseInt(cellCoordinates[0]), parseInt(cellCoordinates[1])];
    });
  }

  _getAdjacentBandIndices(rowIndex: number, colIndex: number) {
    let adjacentBandIndices = {
      top: rowIndex - 1,
      bottom: rowIndex + 1,
      left: colIndex - 1,
      right: colIndex + 1,
    };

    if (rowIndex === 0) {
      adjacentBandIndices.top = this.rowCount - 1;
    } else if (rowIndex === this.rowCount - 1) {
      adjacentBandIndices.bottom = 0;
    }

    if (colIndex === 0) {
      adjacentBandIndices.left = this.colCount - 1;
    } else if (colIndex === this.colCount - 1) {
      adjacentBandIndices.right = 0;
    }

    return adjacentBandIndices;
  }

  _countActiveNeighbourCells(rowIndex: number, colIndex: number) {
    let activeNeighbours = 0;

    const adjacentBandIndices = this._getAdjacentBandIndices(
      rowIndex,
      colIndex
    );

    // check top neighbour
    if (this.cellStates[adjacentBandIndices.top][colIndex]) {
      activeNeighbours++;
    }

    // check top-right neighbour
    if (this.cellStates[adjacentBandIndices.top][adjacentBandIndices.right]) {
      activeNeighbours++;
    }

    // check right neighbour
    if (this.cellStates[rowIndex][adjacentBandIndices.right]) {
      activeNeighbours++;
    }

    // check bottom-right neighbour
    if (
      this.cellStates[adjacentBandIndices.bottom][adjacentBandIndices.right]
    ) {
      activeNeighbours++;
    }

    // check bottom neighbour
    if (this.cellStates[adjacentBandIndices.bottom][colIndex]) {
      activeNeighbours++;
    }

    // check bottom-left neighbour
    if (this.cellStates[adjacentBandIndices.bottom][adjacentBandIndices.left]) {
      activeNeighbours++;
    }

    // check left neighbour
    if (this.cellStates[rowIndex][adjacentBandIndices.left]) {
      activeNeighbours++;
    }

    // check top-left neighbour
    if (this.cellStates[adjacentBandIndices.top][adjacentBandIndices.left]) {
      activeNeighbours++;
    }

    return activeNeighbours;
  }

  _calculateNewCellState(
    currentCellState: boolean,
    activeNeighbourCount: number
  ) {
    // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
    if (currentCellState === true && activeNeighbourCount < 2) {
      return false;
    }

    // Any live cell with two or three live neighbours lives on to the next generation.
    else if (
      currentCellState === true &&
      (activeNeighbourCount === 2 || activeNeighbourCount === 3)
    ) {
      return true;
    }

    // Any live cell with more than three live neighbours dies, as if by overpopulation.
    else if (currentCellState === true && activeNeighbourCount > 3) {
      return false;
    }

    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    else if (currentCellState === false && activeNeighbourCount === 3) {
      return true;
    }

    return false;
  }

  _updateCellState(rowIndex: number, colIndex: number, newState: boolean) {
    const oldState = this.cellStates[rowIndex][colIndex];

    this.cellStates[rowIndex][colIndex] = newState;

    if (oldState === newState) {
      return;
    }

    this._updatedCells.push([rowIndex, colIndex]);
  }

  _persistHistory() {
    if (this._history.length >= this._historySize) {
      // if history is full, remove first entry
      this._history.splice(0, 1);
    }

    this._history.push({
      cellStates: structuredClone(this.cellStates),
      updatedCells: structuredClone(this._updatedCells),
    });
  }

  loadPreset(preset: AvailablePresets) {
    this._initializeCells();

    let template: CellIdentifier[] | null = null;

    switch (preset) {
      case "pentadecathlon":
        template = Pentadecathlon;
        break;

      case "glider-gun":
        template = GliderGun;
        break;

      case "symmetrical-oscillator":
        template = SymmetricalOscillator;
        break;

      case "glider":
        template = Glider;
        break;

      case "glider-army":
        template = GliderArmy;
        break;

      case "blinker":
        template = Blinker;
        break;
    }

    if (!template) {
      return;
    }

    template.forEach((cellIdentifier) => {
      this._updateCellState(cellIdentifier[0], cellIdentifier[1], true);
    });
  }

  toggleCellState(rowIndex: number, colIndex: number) {
    this._updateCellState(
      rowIndex,
      colIndex,
      !this.cellStates[rowIndex][colIndex]
    );
  }

  canUntick() {
    return (
      this._history.length > 0 &&
      this._history.length > Math.abs(this._historyCursorPosition)
    );
  }

  _restoreHistoryEntry(cursorDelta: number) {
    const historyIndex =
      this._history.length - 1 + this._historyCursorPosition + cursorDelta;

    if (historyIndex >= this._history.length) {
      console.warn("Selected history index to large");

      return false;
    } else if (historyIndex < 0) {
      console.warn("Selected history index < 0");

      return false;
    }

    const selectedHistoryEntry = this._history[historyIndex];

    if (!selectedHistoryEntry) {
      console.warn("No history entry found at index");

      return false;
    }

    this.cellStates = structuredClone(selectedHistoryEntry.cellStates);
    this._updatedCells = structuredClone(selectedHistoryEntry.updatedCells);

    this._historyCursorPosition += cursorDelta;

    return true;
  }

  untick() {
    if (!this.canUntick()) {
      console.info("No more history entries to undo");

      return;
    }

    this._restoreHistoryEntry(-1);
  }

  tick() {
    // if restoreHistoryEntry returns false it failed
    if (this._historyCursorPosition < 0 && this._restoreHistoryEntry(1)) {
      console.info("Using history, skipping calculations");

      return;
    }

    this._persistHistory();

    const neighbourCounts: number[][] = [];

    const cellsToUpdate = this._calculateCellsToUpdate();

    this._updatedCells = [];

    cellsToUpdate.forEach((cell) => {
      if (neighbourCounts[cell[0]] === undefined) {
        neighbourCounts[cell[0]] = [];
      }

      neighbourCounts[cell[0]][cell[1]] = this._countActiveNeighbourCells(
        cell[0],
        cell[1]
      );
    });

    // reset updated cells index
    this._updatedCells = [];

    // calculate state for next tick
    cellsToUpdate.forEach((cell) => {
      this._updateCellState(
        cell[0],
        cell[1],
        this._calculateNewCellState(
          this.cellStates[cell[0]][cell[1]],
          neighbourCounts[cell[0]][cell[1]]
        )
      );
    });
  }
}
