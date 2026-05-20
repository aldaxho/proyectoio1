/**
 * pivot.utils.js
 * Functions for selecting the entering and leaving variables
 * in both the Simplex and Dual-Simplex algorithms.
 */

const EPSILON = 1e-9; // tolerance for floating-point comparisons

// ─── Simplex (Primal) ────────────────────────────────────────────────────────

/**
 * Selects the ENTERING variable (most negative coefficient in the objective row).
 * Returns -1 if the solution is already optimal (no negatives).
 *
 * @param {number[][]} tableau
 * @param {number} objRow  - Index of the objective row
 * @param {number} numCols - Total number of columns (including RHS)
 * @returns {number} Column index of entering variable, or -1
 */
export function selectEnteringVariable(tableau, objRow, numCols) {
  let minVal = -EPSILON;
  let enteringCol = -1;

  for (let j = 0; j < numCols - 1; j++) {
    if (tableau[objRow][j] < minVal) {
      minVal = tableau[objRow][j];
      enteringCol = j;
    }
  }

  return enteringCol;
}

/**
 * Selects the LEAVING variable using the Minimum Ratio Test.
 * Returns -1 if the problem is UNBOUNDED (no positive entries in pivot column).
 *
 * @param {number[][]} tableau
 * @param {number} enteringCol
 * @param {number} numConstraints
 * @param {number} numCols
 * @returns {number} Row index of leaving variable, or -1
 */
export function selectLeavingVariable(
  tableau,
  enteringCol,
  numConstraints,
  numCols
) {
  let minRatio = Infinity;
  let leavingRow = -1;

  for (let i = 0; i < numConstraints; i++) {
    const entry = tableau[i][enteringCol];
    if (entry > EPSILON) {
      const ratio = tableau[i][numCols - 1] / entry;
      if (ratio < minRatio) {
        minRatio = ratio;
        leavingRow = i;
      }
    }
  }

  return leavingRow;
}

// ─── Dual Simplex ────────────────────────────────────────────────────────────

/**
 * Selects the LEAVING variable for the Dual Simplex:
 * the most negative RHS value (most infeasible row).
 * Returns -1 if all RHS values are non-negative (primal feasible → optimal).
 *
 * @param {number[][]} tableau
 * @param {number} numConstraints
 * @param {number} numCols
 * @returns {number} Row index, or -1
 */
export function dualSelectLeavingVariable(tableau, numConstraints, numCols) {
  let minRHS = -EPSILON;
  let leavingRow = -1;

  for (let i = 0; i < numConstraints; i++) {
    const rhs = tableau[i][numCols - 1];
    if (rhs < minRHS) {
      minRHS = rhs;
      leavingRow = i;
    }
  }

  return leavingRow;
}

/**
 * Selects the ENTERING variable for the Dual Simplex:
 * among negative entries in the leaving row, pick the one with the
 * smallest |obj_row / leaving_row| ratio (dual minimum ratio test).
 * Returns -1 if the problem is INFEASIBLE (no negative entries in leaving row).
 *
 * @param {number[][]} tableau
 * @param {number} leavingRow
 * @param {number} objRow
 * @param {number} numCols
 * @returns {number} Column index, or -1
 */
export function dualSelectEnteringVariable(
  tableau,
  leavingRow,
  objRow,
  numCols
) {
  let minRatio = Infinity;
  let enteringCol = -1;

  for (let j = 0; j < numCols - 1; j++) {
    const entry = tableau[leavingRow][j];
    if (entry < -EPSILON) {
      const ratio = Math.abs(tableau[objRow][j] / entry);
      if (ratio < minRatio) {
        minRatio = ratio;
        enteringCol = j;
      }
    }
  }

  return enteringCol;
}
