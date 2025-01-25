export type AvailablePresets =
  | "glider-gun"
  | "glider"
  | "blinker"
  | "pentadecathlon"
  | "symmetrical-oscillator";

export type CellIdentifier = {
  rowIndex: number;
  colIndex: number;
};

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
      cellsToUpdate.add(cell.rowIndex + "|" + cell.colIndex);

      // and all neighbouring cells
      const adjacentBandIndices = this._getAdjacentBandIndices(
        cell.rowIndex,
        cell.colIndex
      );

      cellsToUpdate.add(adjacentBandIndices.top + "|" + cell.colIndex);

      cellsToUpdate.add(
        adjacentBandIndices.top + "|" + adjacentBandIndices.right
      );

      cellsToUpdate.add(cell.rowIndex + "|" + adjacentBandIndices.right);

      cellsToUpdate.add(
        adjacentBandIndices.bottom + "|" + adjacentBandIndices.right
      );

      cellsToUpdate.add(adjacentBandIndices.bottom + "|" + cell.colIndex);

      cellsToUpdate.add(
        adjacentBandIndices.bottom + "|" + adjacentBandIndices.left
      );

      cellsToUpdate.add(cell.rowIndex + "|" + adjacentBandIndices.left);

      cellsToUpdate.add(
        adjacentBandIndices.top + "|" + adjacentBandIndices.left
      );
    });

    return [...cellsToUpdate].map((cellString) => {
      const cellCoordinates = cellString.split("|");

      return {
        rowIndex: parseInt(cellCoordinates[0]),
        colIndex: parseInt(cellCoordinates[1]),
      };
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

    this._updatedCells.push({
      rowIndex,
      colIndex,
    });
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

    switch (preset) {
      case "pentadecathlon":
        this._updateCellState(5, 4, true);

        this._updateCellState(6, 3, true);
        this._updateCellState(6, 5, true);

        this._updateCellState(7, 3, true);
        this._updateCellState(7, 5, true);

        this._updateCellState(8, 4, true);

        this._updateCellState(9, 4, true);

        this._updateCellState(10, 3, true);
        this._updateCellState(10, 5, true);

        this._updateCellState(11, 3, true);
        this._updateCellState(11, 5, true);

        this._updateCellState(12, 4, true);
        break;

      case "glider-gun":
        this._updateCellState(1, 26, true);

        this._updateCellState(2, 24, true);
        this._updateCellState(2, 26, true);

        this._updateCellState(3, 14, true);
        this._updateCellState(3, 15, true);
        this._updateCellState(3, 22, true);
        this._updateCellState(3, 23, true);
        this._updateCellState(3, 36, true);
        this._updateCellState(3, 37, true);

        this._updateCellState(4, 13, true);
        this._updateCellState(4, 17, true);
        this._updateCellState(4, 22, true);
        this._updateCellState(4, 23, true);
        this._updateCellState(4, 36, true);
        this._updateCellState(4, 37, true);

        this._updateCellState(5, 2, true);
        this._updateCellState(5, 3, true);
        this._updateCellState(5, 12, true);
        this._updateCellState(5, 18, true);
        this._updateCellState(5, 22, true);
        this._updateCellState(5, 23, true);

        this._updateCellState(6, 2, true);
        this._updateCellState(6, 3, true);
        this._updateCellState(6, 12, true);
        this._updateCellState(6, 16, true);
        this._updateCellState(6, 18, true);
        this._updateCellState(6, 19, true);
        this._updateCellState(6, 24, true);
        this._updateCellState(6, 26, true);

        this._updateCellState(7, 12, true);
        this._updateCellState(7, 18, true);
        this._updateCellState(7, 26, true);

        this._updateCellState(8, 13, true);
        this._updateCellState(8, 17, true);

        this._updateCellState(9, 14, true);
        this._updateCellState(9, 15, true);
        break;

      case "symmetrical-oscillator":
        this._updateCellState(2, 4, true);
        this._updateCellState(2, 5, true);
        this._updateCellState(2, 6, true);
        this._updateCellState(2, 10, true);
        this._updateCellState(2, 11, true);
        this._updateCellState(2, 12, true);

        this._updateCellState(4, 2, true);
        this._updateCellState(4, 7, true);
        this._updateCellState(4, 9, true);
        this._updateCellState(4, 14, true);

        this._updateCellState(5, 2, true);
        this._updateCellState(5, 7, true);
        this._updateCellState(5, 9, true);
        this._updateCellState(5, 14, true);

        this._updateCellState(6, 2, true);
        this._updateCellState(6, 7, true);
        this._updateCellState(6, 9, true);
        this._updateCellState(6, 14, true);

        this._updateCellState(7, 4, true);
        this._updateCellState(7, 5, true);
        this._updateCellState(7, 6, true);
        this._updateCellState(7, 10, true);
        this._updateCellState(7, 11, true);
        this._updateCellState(7, 12, true);

        this._updateCellState(9, 4, true);
        this._updateCellState(9, 5, true);
        this._updateCellState(9, 6, true);
        this._updateCellState(9, 10, true);
        this._updateCellState(9, 11, true);
        this._updateCellState(9, 12, true);

        this._updateCellState(10, 2, true);
        this._updateCellState(10, 7, true);
        this._updateCellState(10, 9, true);
        this._updateCellState(10, 14, true);

        this._updateCellState(11, 2, true);
        this._updateCellState(11, 7, true);
        this._updateCellState(11, 9, true);
        this._updateCellState(11, 14, true);

        this._updateCellState(12, 2, true);
        this._updateCellState(12, 7, true);
        this._updateCellState(12, 9, true);
        this._updateCellState(12, 14, true);

        this._updateCellState(14, 4, true);
        this._updateCellState(14, 5, true);
        this._updateCellState(14, 6, true);
        this._updateCellState(14, 10, true);
        this._updateCellState(14, 11, true);
        this._updateCellState(14, 12, true);
        break;

      case "glider":
        this._updateCellState(1, 2, true);
        this._updateCellState(2, 3, true);
        this._updateCellState(3, 1, true);
        this._updateCellState(3, 2, true);
        this._updateCellState(3, 3, true);
        break;

      case "blinker":
        this._updateCellState(1, 2, true);
        this._updateCellState(2, 2, true);
        this._updateCellState(3, 2, true);
        break;
    }
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
      if (neighbourCounts[cell.rowIndex] === undefined) {
        neighbourCounts[cell.rowIndex] = [];
      }

      neighbourCounts[cell.rowIndex][cell.colIndex] =
        this._countActiveNeighbourCells(cell.rowIndex, cell.colIndex);
    });

    // reset updated cells index
    this._updatedCells = [];

    // calculate state for next tick
    cellsToUpdate.forEach((cell) => {
      this._updateCellState(
        cell.rowIndex,
        cell.colIndex,
        this._calculateNewCellState(
          this.cellStates[cell.rowIndex][cell.colIndex],
          neighbourCounts[cell.rowIndex][cell.colIndex]
        )
      );
    });
  }
}
