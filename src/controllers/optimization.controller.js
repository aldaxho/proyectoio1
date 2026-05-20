import { validateProblem } from '../services/validation.service.js';
import { createOptimizationProblem } from '../models/optimizationProblem.model.js';
import { simplexSolve } from '../services/simplex.service.js';
import { dualSimplexSolve } from '../services/dualSimplex.service.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

function handleControllerError(res, err) {
  const status = err.status ?? 500;
  const message = err.message ?? 'Error interno del servidor';
  return sendError(res, status, message);
}

// ─── Health ─────────────────────────────────────────────────────────────────

export function getHealth(_req, res) {
  return sendSuccess(res, {
    status: 'ok',
    message: 'Backend de optimización operativo.',
    timestamp: new Date().toISOString(),
  });
}

// ─── Simplex ────────────────────────────────────────────────────────────────

/**
 * POST /api/optimization/simplex
 */
export async function solveSimplex(req, res) {
  try {
    const errors = validateProblem(req.body);
    if (errors.length) return sendError(res, 400, errors.join('; '));

    const problem = createOptimizationProblem(req.body);
    const result = simplexSolve(problem);

    return sendSuccess(res, {
      method: 'simplex',
      problemType: problem.objective,
      optimalValue: result.optimalValue,
      solution: result.solution,
      iterations: result.iterations,
      graphData: result.graphData,
      message: result.message,
    });
  } catch (err) {
    console.error('[solveSimplex]', err.message);
    return handleControllerError(res, err);
  }
}

// ─── Dual Simplex ────────────────────────────────────────────────────────────

/**
 * POST /api/optimization/dual-simplex
 */
export async function solveDualSimplex(req, res) {
  try {
    const errors = validateProblem(req.body);
    if (errors.length) return sendError(res, 400, errors.join('; '));

    const problem = createOptimizationProblem(req.body);
    const result = dualSimplexSolve(problem);

    return sendSuccess(res, {
      method: 'dual-simplex',
      problemType: problem.objective,
      optimalValue: result.optimalValue,
      solution: result.solution,
      iterations: result.iterations,
      graphData: result.graphData,
      message: result.message,
    });
  } catch (err) {
    console.error('[solveDualSimplex]', err.message);
    return handleControllerError(res, err);
  }
}
