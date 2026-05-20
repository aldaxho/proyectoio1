/**
 * matrix.utils.js
 * Pure utility functions for 2-D matrix operations used by both
 * Simplex and Dual-Simplex services.
 */

/**
 * Creates a zero-filled m×n matrix.
 * @param {number} rows
 * @param {number} cols
 * @returns {number[][]}
 */
export function zeros(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

/**
 * Deep-clones a 2-D array.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

/**
 * Builds the initial Simplex tableau from an OptimizationProblem.
 *
 * Layout per row:
 *   [ ...original vars | ...slack vars | RHS ]
 *
 * @param {import('../models/optimizationProblem.model.js').OptimizationProblem} problem
 * @returns {{ tableau: number[][], basicVars: number[], numVars: number, numConstraints: number }}
 */
export function buildTableau(problem, { forDual = false } = {}) {
  const { objective, objectiveCoefficients: c, constraints } = problem;
  const numVars = c.length;
  const numConstraints = constraints.length;
  // columns: original vars + slack vars + RHS
  const numCols = numVars + numConstraints + 1;
  const numRows = numConstraints + 1; // constraints + objective row

  const tableau = zeros(numRows, numCols);
  const basicVars = []; // index of the basic variable for each constraint row

  // ── Fill constraint rows ──────────────────────────────────────────────────
  constraints.forEach((con, i) => {
    // Original coefficients
    con.coefficients.forEach((coef, j) => {
      tableau[i][j] = coef;
    });

    // Slack variable column (identity block)
    const slackCol = numVars + i;
    if (con.operator === '<=') {
      tableau[i][slackCol] = 1;
      tableau[i][numCols - 1] = con.rhs;
    } else if (con.operator === '>=') {
      if (forDual) {
        // Flip row: -a x + s = -b  →  RHS negative, triggers dual iterations
        con.coefficients.forEach((coef, j) => { tableau[i][j] = -coef; });
        tableau[i][slackCol] = 1;
        tableau[i][numCols - 1] = -con.rhs;
      } else {
        tableau[i][slackCol] = -1; // surplus
        tableau[i][numCols - 1] = con.rhs;
      }
    } else {
      // '=' → no slack
      tableau[i][numCols - 1] = con.rhs;
    }

    // Slack is the initial basic variable for this row
    basicVars.push(con.operator === '=' ? -1 : slackCol);
  });

  // ── Objective row (last row) ──────────────────────────────────────────────
  const objRow = numConstraints;
  // Primal simplex works over a maximization tableau.
  // Dual simplex needs non-negative objective coefficients at the start.
  const sign = forDual ? (objective === 'max' ? 1 : -1) : -1;
  c.forEach((coef, j) => {
    tableau[objRow][j] = sign * coef;
  });

  return { tableau, basicVars, numVars, numConstraints };
}

/**
 * Performs a row-reduction pivot on `tableau` at (pivotRow, pivotCol).
 * Modifies the tableau IN PLACE.
 *
 * @param {number[][]} tableau
 * @param {number} pivotRow
 * @param {number} pivotCol
 */
export function pivot(tableau, pivotRow, pivotCol) {
  const pivotValue = tableau[pivotRow][pivotCol];

  // Normalize pivot row
  tableau[pivotRow] = tableau[pivotRow].map((v) => v / pivotValue);

  // Eliminate pivot column from all other rows
  tableau.forEach((row, i) => {
    if (i !== pivotRow) {
      const factor = row[pivotCol];
      row.forEach((_, j) => {
        tableau[i][j] -= factor * tableau[pivotRow][j];
      });
    }
  });
}

/**
 * Extracts the solution values from a solved tableau.
 *
 * @param {number[][]} tableau
 * @param {number[]} basicVars
 * @param {number} numVars
 * @param {number} numConstraints
 * @param {string[]} variableNames
 * @returns {{ variables: Record<string, number>, optimalValue: number }}
 */
export function extractSolution(
  tableau,
  basicVars,
  numVars,
  numConstraints,
  variableNames
) {
  const numCols = tableau[0].length;
  const variables = {};

  variableNames.forEach((name, j) => {
    // Find if this variable is basic
    const row = basicVars.indexOf(j);
    variables[name] = row !== -1 ? round(tableau[row][numCols - 1]) : 0;
  });

  const optimalValue = round(tableau[numConstraints][numCols - 1]);

  return { variables, optimalValue };
}

/**
 * Returns a rounded snapshot of a tableau for API responses.
 *
 * @param {number[][]} tableau
 * @returns {number[][]}
 */
export function snapshotTableau(tableau) {
  return tableau.map((row) => row.map((value) => round(value)));
}

/**
 * Calculates the objective value from a variable assignment.
 *
 * @param {import('../models/optimizationProblem.model.js').OptimizationProblem} problem
 * @param {Record<string, number>} solution
 * @returns {number}
 */
export function calculateObjectiveValue(problem, solution) {
  return round(
    problem.objectiveCoefficients.reduce((sum, coefficient, index) => {
      const variableName = problem.variables[index];
      return sum + coefficient * (solution[variableName] ?? 0);
    }, 0)
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Rounds a float to 6 decimal places to avoid floating-point noise.
 * @param {number} value
 * @returns {number}
 */
export function round(value) {
  return Math.round(value * 1e6) / 1e6;
}
