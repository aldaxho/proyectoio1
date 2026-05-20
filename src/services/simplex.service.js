/**
 * simplex.service.js
 * Implements a two-phase Primal Simplex Method for linear programs.
 */

import {
  calculateObjectiveValue,
  extractSolution,
  pivot,
  round,
  snapshotTableau,
  zeros,
} from '../utils/matrix.utils.js';

import { selectLeavingVariable } from '../utils/pivot.utils.js';

const MAX_ITERATIONS = 200;
const EPSILON = 1e-9;

function buildIteration({
  phase,
  iteration,
  tableau,
  pivotColumn = null,
  pivotRow = null,
  pivotElement = null,
  explanation,
}) {
  return {
    phase,
    iteration,
    tableau: snapshotTableau(tableau),
    pivotColumn,
    pivotRow,
    pivotElement,
    explanation,
  };
}

function normalizeConstraint(constraint) {
  if (constraint.rhs >= 0) return constraint;

  const flippedOperator =
    constraint.operator === '<='
      ? '>='
      : constraint.operator === '>='
        ? '<='
        : constraint.operator;

  return {
    coefficients: constraint.coefficients.map((value) => -value),
    operator: flippedOperator,
    rhs: -constraint.rhs,
  };
}

function selectEnteringVariable(tableau, objRow, allowedColumns) {
  let enteringCol = -1;
  let minValue = -EPSILON;

  for (const columnIndex of allowedColumns) {
    const value = tableau[objRow][columnIndex];
    if (value < minValue) {
      minValue = value;
      enteringCol = columnIndex;
    }
  }

  return enteringCol;
}

function buildGraphData(problem, solution) {
  const labels = problem.variables;
  const amounts = labels.map((label) => round(solution[label] ?? 0));

  return {
    chartType: 'bar',
    labels,
    series: [
      {
        name: 'Monto invertido',
        values: amounts,
      },
    ],
    summary: {
      totalInvestment: round(amounts.reduce((sum, value) => sum + value, 0)),
      totalReturn: calculateObjectiveValue(problem, solution),
    },
  };
}

function buildTwoPhaseTableau(problem) {
  const normalizedConstraints = problem.constraints.map(normalizeConstraint);
  const numVars = problem.objectiveCoefficients.length;
  const numConstraints = normalizedConstraints.length;

  const slackCount = normalizedConstraints.filter(
    (constraint) => constraint.operator === '<='
  ).length;
  const surplusCount = normalizedConstraints.filter(
    (constraint) => constraint.operator === '>='
  ).length;
  const artificialCount = normalizedConstraints.filter(
    (constraint) => constraint.operator === '>=' || constraint.operator === '='
  ).length;

  const totalCols =
    numVars + slackCount + surplusCount + artificialCount + 1;
  const tableau = zeros(numConstraints + 1, totalCols);
  const basicVars = new Array(numConstraints).fill(-1);
  const artificialColumns = [];

  let nextColumn = numVars;

  normalizedConstraints.forEach((constraint, rowIndex) => {
    constraint.coefficients.forEach((value, columnIndex) => {
      tableau[rowIndex][columnIndex] = value;
    });

    tableau[rowIndex][totalCols - 1] = constraint.rhs;

    if (constraint.operator === '<=') {
      const slackColumn = nextColumn++;
      tableau[rowIndex][slackColumn] = 1;
      basicVars[rowIndex] = slackColumn;
      return;
    }

    if (constraint.operator === '>=') {
      const surplusColumn = nextColumn++;
      const artificialColumn = nextColumn++;
      tableau[rowIndex][surplusColumn] = -1;
      tableau[rowIndex][artificialColumn] = 1;
      basicVars[rowIndex] = artificialColumn;
      artificialColumns.push(artificialColumn);
      return;
    }

    const artificialColumn = nextColumn++;
    tableau[rowIndex][artificialColumn] = 1;
    basicVars[rowIndex] = artificialColumn;
    artificialColumns.push(artificialColumn);
  });

  return {
    tableau,
    basicVars,
    numVars,
    numConstraints,
    artificialColumns,
  };
}

function buildObjectiveRow(tableau, basicVars, objectiveCoefficients, options) {
  const { numVars, totalCols, artificialColumns = [], phase } = options;
  const objRow = tableau.length - 1;

  tableau[objRow].fill(0);

  if (phase === 1) {
    artificialColumns.forEach((columnIndex) => {
      tableau[objRow][columnIndex] = 1;
    });
  } else {
    objectiveCoefficients.forEach((coefficient, columnIndex) => {
      tableau[objRow][columnIndex] = -coefficient;
    });
  }

  basicVars.forEach((basicColumn, rowIndex) => {
    if (basicColumn === -1) return;
    const coefficient = tableau[objRow][basicColumn];
    if (Math.abs(coefficient) < EPSILON) return;

    for (let columnIndex = 0; columnIndex < totalCols; columnIndex += 1) {
      tableau[objRow][columnIndex] -= coefficient * tableau[rowIndex][columnIndex];
    }
  });
}

function runSimplexPhase({
  tableau,
  basicVars,
  objRow,
  allowedColumns,
  phase,
  iterationHistory,
}) {
  const numConstraints = objRow;
  const numCols = tableau[0].length;
  let iterationCount = 0;

  while (iterationCount < MAX_ITERATIONS) {
    const enteringCol = selectEnteringVariable(
      tableau,
      objRow,
      allowedColumns
    );

    if (enteringCol === -1) {
      return;
    }

    const leavingRow = selectLeavingVariable(
      tableau,
      enteringCol,
      numConstraints,
      numCols
    );

    if (leavingRow === -1) {
      const error = new Error('Problema no acotado.');
      error.status = 422;
      throw error;
    }

    basicVars[leavingRow] = enteringCol;
    const pivotElement = round(tableau[leavingRow][enteringCol]);
    pivot(tableau, leavingRow, enteringCol);

    iterationCount += 1;
    iterationHistory.push(
      buildIteration({
        phase,
        iteration: iterationCount,
        tableau,
        pivotColumn: enteringCol,
        pivotRow: leavingRow,
        pivotElement,
        explanation:
          phase === 1
            ? 'Se ejecuta una iteración de la Fase I para eliminar variables artificiales.'
            : 'Se ejecuta una iteración de la Fase II para optimizar la función objetivo original.',
      })
    );
  }

  const error = new Error(
    phase === 1
      ? 'La Fase I no convergió dentro del máximo de iteraciones permitidas.'
      : 'La Fase II no convergió dentro del máximo de iteraciones permitidas.'
  );
  error.status = 422;
  throw error;
}

/**
 * Solves a linear programming problem using the two-phase Primal Simplex method.
 *
 * @param {import('../models/optimizationProblem.model.js').OptimizationProblem} problem
 * @returns {{
 *   status: 'optimal',
 *   optimalValue: number,
 *   solution: Record<string, number>,
 *   iterations: Array<object>,
 *   message: string,
 *   graphData: object
 * }}
 */
export function simplexSolve(problem) {
  const {
    tableau,
    basicVars,
    numVars,
    numConstraints,
    artificialColumns,
  } = buildTwoPhaseTableau(problem);

  const objRow = numConstraints;
  const totalCols = tableau[0].length;
  const iterationHistory = [
    buildIteration({
      phase: 1,
      iteration: 0,
      tableau,
      explanation: 'Tabla inicial de la Fase I del método Simplex.',
    }),
  ];

  buildObjectiveRow(tableau, basicVars, problem.objectiveCoefficients, {
    numVars,
    totalCols,
    artificialColumns,
    phase: 1,
  });

  const phaseOneAllowedColumns = Array.from(
    { length: totalCols - 1 },
    (_, index) => index
  );

  runSimplexPhase({
    tableau,
    basicVars,
    objRow,
    allowedColumns: phaseOneAllowedColumns,
    phase: 1,
    iterationHistory,
  });

  const phaseOneValue = tableau[objRow][totalCols - 1];
  if (Math.abs(phaseOneValue) > 1e-7) {
    const error = new Error('No existe solución factible para el problema.');
    error.status = 422;
    throw error;
  }

  buildObjectiveRow(tableau, basicVars, problem.objectiveCoefficients, {
    numVars,
    totalCols,
    artificialColumns,
    phase: 2,
  });

  const phaseTwoAllowedColumns = Array.from(
    { length: totalCols - 1 },
    (_, index) => index
  ).filter((columnIndex) => !artificialColumns.includes(columnIndex));

  runSimplexPhase({
    tableau,
    basicVars,
    objRow,
    allowedColumns: phaseTwoAllowedColumns,
    phase: 2,
    iterationHistory,
  });

  const { variables } = extractSolution(
    tableau,
    basicVars,
    numVars,
    numConstraints,
    problem.variables
  );

  const graphData = buildGraphData(problem, variables);

  return {
    status: 'optimal',
    optimalValue: calculateObjectiveValue(problem, variables),
    solution: variables,
    iterations: iterationHistory,
    message: 'Solución óptima encontrada.',
    graphData,
  };
}
