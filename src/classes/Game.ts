export type AvailablePresets =
  | "glider-gun"
  | "glider"
  | "blinker"
  | "pentadecathlon"
  | "symmetrical-oscillator";

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

  loadPreset(preset: AvailablePresets) {
    this._initializeCells();

    switch (preset) {
      case "pentadecathlon":
        this.cellStates[5][4] = true;

        this.cellStates[6][3] = true;
        this.cellStates[6][5] = true;

        this.cellStates[7][3] = true;
        this.cellStates[7][5] = true;

        this.cellStates[8][4] = true;

        this.cellStates[9][4] = true;

        this.cellStates[10][3] = true;
        this.cellStates[10][5] = true;

        this.cellStates[11][3] = true;
        this.cellStates[11][5] = true;

        this.cellStates[12][4] = true;
        break;

      case "glider-gun":
        this.cellStates[1][26] = true;

        this.cellStates[2][24] = true;
        this.cellStates[2][26] = true;

        this.cellStates[3][14] = true;
        this.cellStates[3][15] = true;
        this.cellStates[3][22] = true;
        this.cellStates[3][23] = true;
        this.cellStates[3][36] = true;
        this.cellStates[3][37] = true;

        this.cellStates[4][13] = true;
        this.cellStates[4][17] = true;
        this.cellStates[4][22] = true;
        this.cellStates[4][23] = true;
        this.cellStates[4][36] = true;
        this.cellStates[4][37] = true;

        this.cellStates[5][2] = true;
        this.cellStates[5][3] = true;
        this.cellStates[5][12] = true;
        this.cellStates[5][18] = true;
        this.cellStates[5][22] = true;
        this.cellStates[5][23] = true;

        this.cellStates[6][2] = true;
        this.cellStates[6][3] = true;
        this.cellStates[6][12] = true;
        this.cellStates[6][16] = true;
        this.cellStates[6][18] = true;
        this.cellStates[6][19] = true;
        this.cellStates[6][24] = true;
        this.cellStates[6][26] = true;

        this.cellStates[7][12] = true;
        this.cellStates[7][18] = true;
        this.cellStates[7][26] = true;

        this.cellStates[8][13] = true;
        this.cellStates[8][17] = true;

        this.cellStates[9][14] = true;
        this.cellStates[9][15] = true;
        break;

      case "symmetrical-oscillator":
        this.cellStates[2][4] = true;
        this.cellStates[2][5] = true;
        this.cellStates[2][6] = true;
        this.cellStates[2][10] = true;
        this.cellStates[2][11] = true;
        this.cellStates[2][12] = true;

        this.cellStates[4][2] = true;
        this.cellStates[4][7] = true;
        this.cellStates[4][9] = true;
        this.cellStates[4][14] = true;

        this.cellStates[5][2] = true;
        this.cellStates[5][7] = true;
        this.cellStates[5][9] = true;
        this.cellStates[5][14] = true;

        this.cellStates[6][2] = true;
        this.cellStates[6][7] = true;
        this.cellStates[6][9] = true;
        this.cellStates[6][14] = true;

        this.cellStates[7][4] = true;
        this.cellStates[7][5] = true;
        this.cellStates[7][6] = true;
        this.cellStates[7][10] = true;
        this.cellStates[7][11] = true;
        this.cellStates[7][12] = true;

        this.cellStates[9][4] = true;
        this.cellStates[9][5] = true;
        this.cellStates[9][6] = true;
        this.cellStates[9][10] = true;
        this.cellStates[9][11] = true;
        this.cellStates[9][12] = true;

        this.cellStates[10][2] = true;
        this.cellStates[10][7] = true;
        this.cellStates[10][9] = true;
        this.cellStates[10][14] = true;

        this.cellStates[11][2] = true;
        this.cellStates[11][7] = true;
        this.cellStates[11][9] = true;
        this.cellStates[11][14] = true;

        this.cellStates[12][2] = true;
        this.cellStates[12][7] = true;
        this.cellStates[12][9] = true;
        this.cellStates[12][14] = true;

        this.cellStates[14][4] = true;
        this.cellStates[14][5] = true;
        this.cellStates[14][6] = true;
        this.cellStates[14][10] = true;
        this.cellStates[14][11] = true;
        this.cellStates[14][12] = true;
        break;

      case "glider":
        this.cellStates[1][2] = true;
        this.cellStates[2][3] = true;
        this.cellStates[3][1] = true;
        this.cellStates[3][2] = true;
        this.cellStates[3][3] = true;
        break;

      case "blinker":
        this.cellStates[1][2] = true;
        this.cellStates[2][2] = true;
        this.cellStates[3][2] = true;
        break;
    }
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
