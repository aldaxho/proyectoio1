import { Router } from 'express';
import {
  getHealth,
  solveSimplex,
  solveDualSimplex,
} from '../controllers/optimization.controller.js';

export const optimizationRoutes = Router();

/**
 * GET /api/optimization/health
 */
optimizationRoutes.get('/health', getHealth);

/**
 * POST /api/optimization/simplex
 * Solves a linear programming problem using the Simplex method.
 */
optimizationRoutes.post('/simplex', solveSimplex);

/**
 * POST /api/optimization/dual-simplex
 * Solves a linear programming problem using the Dual Simplex method.
 */
optimizationRoutes.post('/dual-simplex', solveDualSimplex);

/**
 * Backward-compatible alias for older clients.
 */
optimizationRoutes.post('/dual', solveDualSimplex);
