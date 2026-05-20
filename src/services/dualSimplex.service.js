/**
 * dualSimplex.service.js
 * Implements the Dual Simplex Method for solving linear programs.
 */

import {
  buildTableau,
  calculateObjectiveValue,
  extractSolution,
  pivot,
  round,
  snapshotTableau,
} from '../utils/matrix.utils.js';

import {
  dualSelectLeavingVariable,
  dualSelectEnteringVariable,
} from '../utils/pivot.utils.js';

const MAX_ITERATIONS = 200;

function buildIteration({
  iteration,
  tableau,
  pivotColumn = null,
  pivotRow = null,
  pivotElement = null,
  explanation,
}) {
  return {
    iteration,
    tableau: snapshotTableau(tableau),
    pivotColumn,
    pivotRow,
    pivotElement,
    explanation,
  };
}

/**
 * Solves a linear programming problem using the Dual Simplex method.
 *
 * @param {import('../models/optimizationProblem.model.js').OptimizationProblem} problem
 * @returns {{
 *   status: 'optimal',
 *   optimalValue: number,
 *   solution: Record<string, number>,
 *   iterations: Array<object>,
 *   message: string
 * }}
 */
export function dualSimplexSolve(problem) {
  let { tableau, basicVars, numVars, numConstraints } = buildTableau(problem, {
    forDual: true,
  });

  const objRow = numConstraints;
  const numCols = tableau[0].length;
  const iterationHistory = [
    buildIteration({
      iteration: 0,
      tableau,
      explanation: 'Tabla inicial del método Simplex Dual.',
    }),
  ];

  const isDualFeasible = tableau[objRow]
    .slice(0, numCols - 1)
    .every((value) => value >= -1e-9);

  if (!isDualFeasible) {
    const error = new Error(
      'La tabla inicial no es dual-factible para aplicar Simplex Dual.'
    );
    error.status = 422;
    throw error;
  }

  let iterationCount = 0;

  while (iterationCount < MAX_ITERATIONS) {
    const leavingRow = dualSelectLeavingVariable(
      tableau,
      numConstraints,
      numCols
    );

    if (leavingRow === -1) {
      const { variables } = extractSolution(
        tableau,
        basicVars,
        numVars,
        numConstraints,
        problem.variables
      );

      return {
        status: 'optimal',
        optimalValue: calculateObjectiveValue(problem, variables),
        solution: variables,
        iterations: iterationHistory,
        message: 'Solución óptima encontrada.',
      };
    }

    const enteringCol = dualSelectEnteringVariable(
      tableau,
      leavingRow,
      objRow,
      numCols
    );

    if (enteringCol === -1) {
      const error = new Error('No existe solución factible para el problema.');
      error.status = 422;
      throw error;
    }

    basicVars[leavingRow] = enteringCol;
    const pivotElement = round(tableau[leavingRow][enteringCol]);
    pivot(tableau, leavingRow, enteringCol);

    iterationCount += 1;
    iterationHistory.push(
      buildIteration({
        iteration: iterationCount,
        tableau,
        pivotColumn: enteringCol,
        pivotRow: leavingRow,
        pivotElement,
        explanation:
          'Se selecciona la fila pivote con el término independiente más negativo y se actualiza la tabla.',
      })
    );
  }

  const error = new Error(
    'Simplex Dual no convergió dentro del máximo de iteraciones permitidas.'
  );
  error.status = 422;
  throw error;
}
