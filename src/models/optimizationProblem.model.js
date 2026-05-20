/**
 * @typedef {Object} Constraint
 * @property {number[]} coefficients  - LHS coefficients (one per variable)
 * @property {'<='|'>='|'='} operator - Constraint type
 * @property {number} rhs             - Right-hand side value
 */

/**
 * @typedef {Object} OptimizationProblem
 * @property {'max'|'min'}  objective             - Optimization direction
 * @property {number[]}     objectiveCoefficients - Objective function coefficients
 * @property {Constraint[]} constraints           - Array of constraints
 * @property {string[]}     [variables]           - Optional variable labels (x1, x2…)
 */

/**
 * Builds a validated OptimizationProblem object from raw request data.
 *
 * @param {object} data - Raw body from the HTTP request
 * @returns {OptimizationProblem}
 */
export function createOptimizationProblem(data) {
  const objective = data.type ?? data.objective;
  const objectiveCoefficients =
    data.objectiveFunction ?? data.objectiveCoefficients;

  return {
    objective,
    objectiveCoefficients,
    constraints: data.constraints.map((constraint) => ({
      coefficients: constraint.coefficients,
      operator: constraint.operator,
      rhs: constraint.value ?? constraint.rhs,
    })),
    variables:
      data.variables ??
      objectiveCoefficients.map((_, i) => `x${i + 1}`),
  };
}
