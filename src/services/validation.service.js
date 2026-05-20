/**
 * Validates the raw request body for an optimization problem.
 *
 * @param {object} body - Raw HTTP request body
 * @returns {string[]} Array of error messages (empty = valid)
 */
export function validateProblem(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object'];
  }

  const objectiveType = body.type ?? body.objective;
  const objectiveCoefficients =
    body.objectiveFunction ?? body.objectiveCoefficients;

  // objective
  if (!['max', 'min'].includes(objectiveType)) {
    errors.push('"type" must be "max" or "min"');
  }

  // objectiveFunction
  if (!Array.isArray(objectiveCoefficients) || objectiveCoefficients.length === 0) {
    errors.push('"objectiveFunction" must be a non-empty array of numbers');
  } else if (objectiveCoefficients.some((c) => !Number.isFinite(c))) {
    errors.push('"objectiveFunction" must contain only numeric values');
  }

  // constraints
  if (!Array.isArray(body.constraints) || body.constraints.length === 0) {
    errors.push('"constraints" must be a non-empty array');
  } else {
    const n = objectiveCoefficients?.length ?? 0;
    body.constraints.forEach((con, i) => {
      if (!Array.isArray(con.coefficients) || con.coefficients.length !== n) {
        errors.push(
          `constraints[${i}].coefficients must be an array of length ${n}`
        );
      }
      if (!['<=', '>=', '='].includes(con.operator)) {
        errors.push(`constraints[${i}].operator must be "<=", ">=" or "="`);
      }
      const value = con.value ?? con.rhs;
      if (!Number.isFinite(value)) {
        errors.push(`constraints[${i}].value must be a numeric value`);
      }
      if (
        Array.isArray(con.coefficients) &&
        con.coefficients.some((coefficient) => !Number.isFinite(coefficient))
      ) {
        errors.push(
          `constraints[${i}].coefficients must contain only numeric values`
        );
      }
    });
  }

  // variables (optional)
  if (body.variables !== undefined) {
    const n = objectiveCoefficients?.length ?? 0;
    if (!Array.isArray(body.variables) || body.variables.length !== n) {
      errors.push(`"variables" must be an array of length ${n}`);
    } else if (
      body.variables.some(
        (variable) => typeof variable !== 'string' || !variable.trim()
      )
    ) {
      errors.push('"variables" must contain non-empty strings');
    }
  }

  return errors;
}
