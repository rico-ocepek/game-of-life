export default class Game {
  rowCount: number;
  colCount: number;

  cellStates: boolean[][];

  constructor(rowCount: number, colCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;

    this.cellStates = [];

    this._initializeCells();
  }

  _initializeCells() {
    this.cellStates = [];

    for (let i = 0; i < this.rowCount; i++) {
      this.cellStates[i] = [];

      for (let j = 0; j < this.colCount; j++) {
        this.cellStates[i][j] = false;
      }
    }
  }

  _countActiveNeighbourCells(rowIndex: number, colIndex: number) {
    let activeNeighbours = 0;

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

  toggleCellState(rowIndex: number, colIndex: number) {
    this.cellStates[rowIndex][colIndex] = !this.cellStates[rowIndex][colIndex];
  }

  tick() {
    const neighbourCounts: number[][] = [];

    // count active neighbour cells for all cells first
    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      neighbourCounts[rowIndex] = [];

      for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
        neighbourCounts[rowIndex][colIndex] = this._countActiveNeighbourCells(
          rowIndex,
          colIndex
        );
      }
    }

    // calculate state for next tick
    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
        this.cellStates[rowIndex][colIndex] = this._calculateNewCellState(
          this.cellStates[rowIndex][colIndex],
          neighbourCounts[rowIndex][colIndex]
        );
      }
    }
  }
}
